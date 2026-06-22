import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { workspaceId, sessionId, title, messages } = body;

    let chatSessionId = sessionId;

    if (!chatSessionId) {
      const chatSession = await prisma.chatSession.create({
        data: {
          workspaceId,
          title: title || "New Chat",
        }
      });
      chatSessionId = chatSession.id;
    } else {
      if (title) {
        await prisma.chatSession.update({
          where: { id: chatSessionId },
          data: { title }
        });
      }
    }

    if (messages && messages.length > 0) {
      // Delete existing messages to perform a full sync
      await prisma.chatMessage.deleteMany({
        where: { sessionId: chatSessionId }
      });

      await prisma.chatMessage.createMany({
        data: messages.map((m: any) => ({
          workspaceId,
          sessionId: chatSessionId,
          role: m.role,
          content: JSON.stringify(m),
        }))
      });
    }

    return NextResponse.json({ sessionId: chatSessionId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to sync chat" }, { status: 500 });
  }
}
