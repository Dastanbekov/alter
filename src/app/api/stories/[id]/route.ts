import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { StoryNode } from "@/types";

// GET /api/stories/[id] — get single story
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const story = await prisma.story.findFirst({
      where: {
        id,
        workspace: { userId: session.user.id },
      },
      include: { workspace: { select: { id: true, name: true } } },
    });

    if (!story) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...story,
      platforms: JSON.parse(story.platforms),
      nodes: JSON.parse(story.nodes) as StoryNode[],
    });
  } catch (error) {
    console.error("[GET_STORY]", error);
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
  }
}

// PATCH /api/stories/[id] — approve story + schedule all its posts
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const story = await prisma.story.findFirst({
      where: {
        id,
        workspace: { userId: session.user.id },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { nodes: updatedNodes, action = "approve" } = await req.json();
    const nodes: StoryNode[] = updatedNodes ?? JSON.parse(story.nodes);

    if (action === "save") {
      const updated = await prisma.story.update({
        where: { id },
        data: { nodes: JSON.stringify(nodes) },
      });
      return NextResponse.json({
        ...updated,
        platforms: JSON.parse(updated.platforms),
        nodes: JSON.parse(updated.nodes) as StoryNode[],
      });
    }

    // Save all nodes as scheduled posts in DB
    await prisma.$transaction(
      nodes.map((node) =>
        prisma.post.create({
          data: {
            workspaceId: story.workspaceId,
            platform: node.platform,
            content: node.content,
            mediaUrls: node.mediaUrls || [],
            status: "scheduled",
            scheduledAt: new Date(node.scheduledAt),
          },
        })
      )
    );

    // Mark story as approved and persist any node edits
    const updated = await prisma.story.update({
      where: { id },
      data: {
        status: "approved",
        nodes: JSON.stringify(nodes),
      },
    });

    return NextResponse.json({
      ...updated,
      platforms: JSON.parse(updated.platforms),
      nodes: JSON.parse(updated.nodes) as StoryNode[],
    });
  } catch (error) {
    console.error("[APPROVE_STORY]", error);
    return NextResponse.json({ error: "Failed to approve story" }, { status: 500 });
  }
}
