import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorMessage = searchParams.get("error_message");

  if (error) {
    return NextResponse.json({ error: errorMessage || error }, { status: 400 });
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const workspaceId = Buffer.from(state, 'base64url').toString('utf-8');

  // Verify workspace access
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId, userId: session.user.id },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const clientId = process.env.THREADS_CLIENT_ID;
  const clientSecret = process.env.THREADS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Threads API not configured" }, { status: 500 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get("host")}`;
  const redirectUri = `${baseUrl}/api/integrations/threads/callback`;

  try {
    // 1. Exchange code for short-lived token
    const tokenRes = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_message || "Failed to get token");
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // 2. Exchange for long-lived token
    const longLivedRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`);
    const longLivedData = await longLivedRes.json();
    if (!longLivedRes.ok) {
      throw new Error("Failed to get long-lived token");
    }

    const accessToken = longLivedData.access_token;
    // expires_in is usually 60 days in seconds
    const expiresIn = longLivedData.expires_in;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    // 3. Save to database
    await prisma.integration.upsert({
      where: {
        workspaceId_platform: {
          workspaceId: workspace.id,
          platform: "threads",
        },
      },
      create: {
        workspaceId: workspace.id,
        platform: "threads",
        accessToken: accessToken,
        metadata: JSON.stringify({ userId }),
        expiresAt,
      },
      update: {
        accessToken: accessToken,
        metadata: JSON.stringify({ userId }),
        expiresAt,
      },
    });

    // Optionally fetch user profile info, but we can do that later when needed.
    // Right now, just redirect back to the app.

    return NextResponse.redirect(`${baseUrl}/dashboard/${workspace.id}/settings?integration=success`);
  } catch (error: any) {
    console.error("Threads integration error:", error);
    return NextResponse.redirect(`${baseUrl}/dashboard/${workspace.id}/settings?integration=error&message=${encodeURIComponent(error.message)}`);
  }
}
