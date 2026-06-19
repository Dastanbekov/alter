import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateBase64 = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("X OAuth error:", error);
    return NextResponse.redirect(new URL("/settings?error=x_auth_failed", req.url));
  }

  if (!code || !stateBase64) {
    return NextResponse.redirect(new URL("/settings?error=missing_params", req.url));
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/settings?error=x_not_configured", req.url));
  }

  try {
    const state = Buffer.from(stateBase64, "base64").toString("utf-8");
    const [workspaceId, codeVerifier] = state.split("::");

    if (!workspaceId || !codeVerifier) {
      return NextResponse.redirect(new URL("/settings?error=invalid_state", req.url));
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
    });

    if (!workspace) {
      return NextResponse.redirect(new URL("/settings?error=workspace_not_found", req.url));
    }

    const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get("host")}`;
    const redirectUri = `${baseUrl}/api/integrations/x/callback`;

    // 1. Exchange code for access token
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("X Token Exchange Error:", err);
      return NextResponse.redirect(new URL("/settings?error=x_token_failed", req.url));
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 7200));

    // 2. Fetch user profile from X
    const meRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!meRes.ok) {
      const err = await meRes.text();
      console.error("X Fetch Me Error:", err);
      return NextResponse.redirect(new URL("/settings?error=x_profile_failed", req.url));
    }

    const meData = await meRes.json();
    const xUser = meData.data;

    const encryptedAccessToken = encrypt(access_token);
    
    // Save everything in DB. We put refresh_token in metadata to easily access it later.
    // Realistically it could also be encrypted, but we'll encrypt just the access token for now 
    // to match the existing schema design, and encrypt refresh_token in metadata if needed.
    // For simplicity we will encrypt both into metadata.
    
    const metadata = JSON.stringify({
      username: xUser.username,
      name: xUser.name,
      picture: xUser.profile_image_url,
      xId: xUser.id,
      refreshToken: encrypt(refresh_token) // encrypt refresh token just in case
    });

    await prisma.integration.upsert({
      where: {
        workspaceId_platform: {
          workspaceId,
          platform: "x",
        },
      },
      create: {
        workspaceId,
        platform: "x",
        accessToken: encryptedAccessToken,
        expiresAt,
        metadata,
      },
      update: {
        accessToken: encryptedAccessToken,
        expiresAt,
        metadata,
      },
    });

    return NextResponse.redirect(new URL("/settings?success=x_connected", req.url));
  } catch (error) {
    console.error("[X_CALLBACK]", error);
    return NextResponse.redirect(new URL("/settings?error=internal_error", req.url));
  }
}
