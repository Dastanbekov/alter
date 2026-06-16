import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

// GET /api/integrations?workspaceId=xxx
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

  // Ensure workspace belongs to user
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const integrations = await prisma.integration.findMany({
    where: { workspaceId },
    select: {
      id: true,
      platform: true,
      metadata: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Parse metadata JSON
  const parsed = integrations.map((i) => ({
    ...i,
    metadata: i.metadata ? JSON.parse(i.metadata) : null,
  }));

  return NextResponse.json(parsed);
}

// POST /api/integrations
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { platform, botToken, channelUsername, workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (platform !== "telegram") {
      return NextResponse.json(
        { error: "Use OAuth flow for X and LinkedIn" },
        { status: 400 }
      );
    }

    if (!botToken || !channelUsername) {
      return NextResponse.json(
        { error: "Bot token and channel username are required" },
        { status: 400 }
      );
    }

    // Verify bot token by calling Telegram API
    const verifyRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    );
    const verifyData = await verifyRes.json();

    if (!verifyData.ok) {
      return NextResponse.json({ error: "Invalid bot token" }, { status: 400 });
    }

    // Test sending to channel
    const channelId = channelUsername.startsWith("@")
      ? channelUsername
      : `@${channelUsername}`;

    const encryptedToken = encrypt(botToken);
    const metadata = JSON.stringify({
      channelUsername: channelId,
      botUsername: verifyData.result.username,
    });

    await prisma.integration.upsert({
      where: { workspaceId_platform: { workspaceId, platform: "telegram" } },
      create: {
        workspaceId,
        platform: "telegram",
        accessToken: encryptedToken,
        metadata,
      },
      update: {
        accessToken: encryptedToken,
        metadata,
      },
    });

    return NextResponse.json({ success: true, botUsername: verifyData.result.username });
  } catch (error) {
    console.error("[INTEGRATION_TELEGRAM]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/integrations?platform=xxx&workspaceId=xxx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const workspaceId = searchParams.get("workspaceId");

  if (!platform || !workspaceId) {
    return NextResponse.json({ error: "Platform and workspaceId required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  await prisma.integration.deleteMany({
    where: { workspaceId, platform },
  });

  return NextResponse.json({ success: true });
}
