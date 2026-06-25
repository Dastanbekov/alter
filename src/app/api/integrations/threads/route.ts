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

  const clientId = process.env.THREADS_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Threads API not configured" }, { status: 500 });
  }

  // Ensure absolute URL
  const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get("host")}`;
  const redirectUri = `${baseUrl}/api/integrations/threads/callback`;

  const state = Buffer.from(`${workspaceId}`).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "threads_basic,threads_content_publish",
    state: state,
  });

  const authUrl = `https://threads.net/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
