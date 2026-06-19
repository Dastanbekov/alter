import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "LinkedIn OAuth is not configured. Missing Client ID or Callback URL." },
      { status: 500 }
    );
  }

  const state = JSON.stringify({ workspaceId, userId: session.user.id });
  const encodedState = Buffer.from(state).toString("base64");

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", encodedState);
  authUrl.searchParams.set("scope", "w_member_social openid profile email");

  return NextResponse.redirect(authUrl.toString());
}
