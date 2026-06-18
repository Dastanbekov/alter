import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

// This endpoint is triggered by Vercel Cron every minute.
// It finds all posts with status="scheduled" and scheduledAt <= now,
// and publishes them to their respective platforms.
export async function GET() {
  // Verify this is a legitimate cron call (Vercel sets this header)
  // In production, Vercel passes the Authorization header with CRON_SECRET
  const now = new Date();

  try {
    const duePosts = await prisma.post.findMany({
      where: {
        status: "scheduled",
        scheduledAt: { lte: now },
      },
      include: { workspace: true },
    });

    if (duePosts.length === 0) {
      return NextResponse.json({ published: 0 });
    }

    let published = 0;
    let failed = 0;

    for (const post of duePosts) {
      const integration = await prisma.integration.findUnique({
        where: {
          workspaceId_platform: {
            workspaceId: post.workspaceId,
            platform: post.platform,
          },
        },
      });

      if (!integration?.accessToken || !integration?.metadata) {
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "failed", errorMsg: "Integration not configured" },
        });
        failed++;
        continue;
      }

      const token = decrypt(integration.accessToken);
      const metadata = JSON.parse(integration.metadata);
      let success = false;
      let errorMsg = "Unknown error";

      try {
        if (post.platform === "telegram") {
          const tgRes = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: metadata.channelUsername,
                text: post.content,
              }),
            }
          );
          if (tgRes.ok) success = true;
          else {
            const err = await tgRes.json();
            errorMsg = err.description || "Telegram API Error";
          }
        } else if (post.platform === "linkedin") {
          const authorUrn = metadata.urn;
          const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Restli-Protocol-Version": "2.0.0",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              author: authorUrn,
              lifecycleState: "PUBLISHED",
              specificContent: {
                "com.linkedin.ugc.ShareContent": {
                  shareCommentary: { text: post.content },
                  shareMediaCategory: "NONE",
                },
              },
              visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
              },
            }),
          });
          if (liRes.ok) success = true;
          else {
            const err = await liRes.json();
            errorMsg = err.message || "LinkedIn API Error";
          }
        }
        // X publishing can be added here when OAuth is available
      } catch (e) {
        errorMsg = "Network error during publish";
        console.error(`[CRON_PUBLISH] ${post.platform} error:`, e);
      }

      await prisma.post.update({
        where: { id: post.id },
        data: success
          ? { status: "published", publishedAt: now }
          : { status: "failed", errorMsg },
      });

      if (success) published++;
      else failed++;
    }

    console.log(`[CRON] Published: ${published}, Failed: ${failed}`);
    return NextResponse.json({ published, failed });
  } catch (error) {
    console.error("[CRON_PUBLISH]", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
