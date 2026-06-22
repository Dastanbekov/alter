import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

  try {
    const sessions = await prisma.chatSession.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    return NextResponse.json(sessions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
