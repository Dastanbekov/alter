import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

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
        } else if (post.platform === "x") {
          let activeToken = token;
          
          if (integration.expiresAt && new Date(integration.expiresAt).getTime() < Date.now() + 60000) {
            const refreshTokenEnc = metadata.refreshToken;
            if (refreshTokenEnc) {
              const refreshToken = decrypt(refreshTokenEnc);
              const clientId = process.env.X_CLIENT_ID;
              const clientSecret = process.env.X_CLIENT_SECRET;
              const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
              
              const refreshRes = await fetch("https://api.twitter.com/2/oauth2/token", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Authorization: `Basic ${basicAuth}`,
                },
                body: new URLSearchParams({
                  grant_type: "refresh_token",
                  refresh_token: refreshToken,
                  client_id: clientId as string,
                }),
              });
              
              if (refreshRes.ok) {
                const data = await refreshRes.json();
                activeToken = data.access_token;
                
                const expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 7200));
                
                metadata.refreshToken = encrypt(data.refresh_token);
                
                await prisma.integration.update({
                  where: { id: integration.id },
                  data: {
                    accessToken: encrypt(activeToken),
                    expiresAt,
                    metadata: JSON.stringify(metadata)
                  }
                });
              } else {
                console.error("X token refresh failed:", await refreshRes.text());
              }
            }
          }

          const xRes = await fetch("https://api.twitter.com/2/tweets", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${activeToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: post.content,
            }),
          });
          
          if (xRes.ok) success = true;
          else {
            const err = await xRes.json();
            errorMsg = err.detail || "X API Error";
          }
        }
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
