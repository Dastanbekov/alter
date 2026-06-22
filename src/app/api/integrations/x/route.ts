import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

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

  const clientId = process.env.X_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "X API not configured" }, { status: 500 });
  }

  // Ensure absolute URL
  const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get("host")}`;
  const redirectUri = `${baseUrl}/api/integrations/x/callback`;

  // Generate PKCE code verifier
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  
  // Pack workspaceId and codeVerifier into state
  const state = Buffer.from(`${workspaceId}::${codeVerifier}`).toString('base64url');

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read tweet.write users.read offline.access",
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "s256"
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
