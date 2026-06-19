import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

// POST /api/posts - save and optionally publish/schedule a post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, platform, content, scheduledAt, images } = await req.json();

    if (!workspaceId || !platform || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const status = scheduledAt ? "scheduled" : "draft";

    const post = await prisma.post.create({
      data: {
        workspaceId,
        platform,
        content,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    // If it's an immediate publish, send it now
    if (!scheduledAt) {
      const integration = await prisma.integration.findUnique({
        where: { workspaceId_platform: { workspaceId, platform } },
      });

      if (integration && integration.accessToken && integration.metadata) {
        const token = decrypt(integration.accessToken);
        const metadata = JSON.parse(integration.metadata);

        try {
          let success = false;
          let errorMsg = "Failed to publish";

          if (platform === "telegram") {
            const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: metadata.channelUsername,
                text: content,
              }),
            });
            if (tgRes.ok) success = true;
            else {
              const err = await tgRes.json();
              errorMsg = err.description || "Telegram API Error";
              console.error("Telegram API Error:", err);
            }
          } else if (platform === "linkedin") {
            const authorUrn = metadata.urn;
            const liHeaders = {
              "Authorization": `Bearer ${token}`,
              "X-Restli-Protocol-Version": "2.0.0",
              "Content-Type": "application/json",
            };

            let mediaAssets: any[] = [];
            
            // Handle image uploads if present
            if (images && images.length > 0) {
              for (const base64Image of images) {
                // 1. Register Upload
                const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
                  method: "POST",
                  headers: liHeaders,
                  body: JSON.stringify({
                    registerUploadRequest: {
                      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                      owner: authorUrn,
                      serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }]
                    }
                  })
                });
                
                if (registerRes.ok) {
                  const registerData = await registerRes.json();
                  const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                  const assetUrn = registerData.value.asset;
                  
                  // Extract binary data from base64 (e.g. data:image/jpeg;base64,...)
                  const base64Data = base64Image.split(",")[1];
                  const buffer = Buffer.from(base64Data, 'base64');
                  
                  // 2. Upload the image binary
                  const uploadRes = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: {
                      "Authorization": `Bearer ${token}` // Sometimes required, sometimes not, but safe to include
                    },
                    body: buffer
                  });
                  
                  if (uploadRes.ok || uploadRes.status === 201) {
                    mediaAssets.push({
                      status: "READY",
                      media: assetUrn
                    });
                  } else {
                    console.error("Failed to upload image binary to LinkedIn:", await uploadRes.text());
                  }
                } else {
                  console.error("Failed to register image upload:", await registerRes.text());
                }
              }
            }

            const postBody: any = {
              author: authorUrn,
              lifecycleState: "PUBLISHED",
              specificContent: {
                "com.linkedin.ugc.ShareContent": {
                  shareCommentary: { text: content },
                  shareMediaCategory: mediaAssets.length > 0 ? "IMAGE" : "NONE",
                }
              },
              visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
              }
            };

            if (mediaAssets.length > 0) {
              postBody.specificContent["com.linkedin.ugc.ShareContent"].media = mediaAssets;
            }

            const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
              method: "POST",
              headers: liHeaders,
              body: JSON.stringify(postBody)
            });
            if (liRes.ok) success = true;
            else {
              const err = await liRes.json();
              errorMsg = err.message || "LinkedIn API Error";
              console.error("LinkedIn API Error:", err);
            }
          } else if (platform === "x") {
            let activeToken = token;
            
            // Check expiration (refresh if expired or expires in < 1 minute)
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
                text: content,
              }),
            });
            
            if (xRes.ok) success = true;
            else {
              const err = await xRes.json();
              errorMsg = err.detail || "X API Error";
              console.error("X API Error:", err);
            }
          }

          if (success) {
            await prisma.post.update({
              where: { id: post.id },
              data: { status: "published", publishedAt: new Date() },
            });
          } else {
            await prisma.post.update({
              where: { id: post.id },
              data: { status: "failed", errorMsg },
            });
          }
        } catch (e) {
          console.error(`Failed to publish to ${platform}:`, e);
          await prisma.post.update({
            where: { id: post.id },
            data: { status: "failed", errorMsg: "Network error during publish" },
          });
        }
      } else {
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "failed", errorMsg: "Integration not configured" },
        });
      }
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[CREATE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/posts?workspaceId=xxx - get posts for a workspace
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const posts = await prisma.post.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

// DELETE /api/posts?id=xxx - delete a post
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { workspace: true },
  });

  if (!post || post.workspace.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
