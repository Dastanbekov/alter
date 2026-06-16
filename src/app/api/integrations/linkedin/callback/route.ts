import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("[LINKEDIN_OAUTH_ERROR]", error, searchParams.get("error_description"));
    return NextResponse.redirect(new URL("/settings?error=linkedin_oauth_failed", req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings?error=missing_params", req.url));
  }

  let stateData: { workspaceId: string; userId: string };
  try {
    stateData = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
  } catch (e) {
    return NextResponse.redirect(new URL("/settings?error=invalid_state", req.url));
  }

  const { workspaceId, userId } = stateData;
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL!;

  try {
    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("[LINKEDIN_TOKEN_ERROR]", tokenData);
      throw new Error("Failed to get access token");
    }

    const { access_token, expires_in } = tokenData;

    // 2. Get user profile details
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    const profileData = await profileRes.json();
    if (!profileRes.ok) {
      console.error("[LINKEDIN_PROFILE_ERROR]", profileData);
      throw new Error("Failed to fetch profile");
    }

    const name = profileData.name || `${profileData.given_name} ${profileData.family_name}`;
    const urn = profileData.sub; // This is the person URN identifier for UGC Posts
    
    const metadata = JSON.stringify({
      name: name,
      urn: `urn:li:person:${urn}`,
      picture: profileData.picture,
    });

    const encryptedToken = encrypt(access_token);
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // 3. Save to database
    await prisma.integration.upsert({
      where: { workspaceId_platform: { workspaceId, platform: "linkedin" } },
      create: {
        workspaceId,
        platform: "linkedin",
        accessToken: encryptedToken,
        metadata,
        expiresAt,
      },
      update: {
        accessToken: encryptedToken,
        metadata,
        expiresAt,
      },
    });

    // 4. Redirect to platform settings
    return NextResponse.redirect(new URL("/settings?success=linkedin_connected", req.url));
  } catch (error) {
    console.error("[LINKEDIN_CALLBACK_ERROR]", error);
    return NextResponse.redirect(new URL("/settings?error=linkedin_integration_failed", req.url));
  }
}
