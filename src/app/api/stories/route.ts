import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { StoryNode } from "@/types";

// GET /api/stories — list all stories for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stories = await prisma.story.findMany({
      where: {
        workspace: { userId: session.user.id },
      },
      include: { workspace: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const parsed = stories.map((s) => ({
      ...s,
      platforms: JSON.parse(s.platforms),
      nodes: JSON.parse(s.nodes) as StoryNode[],
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[GET_STORIES]", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}

// POST /api/stories — create a new story from campaign plan
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, title, brief, platforms, nodes } = await req.json();

    if (!workspaceId || !title || !brief || !platforms || !nodes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const story = await prisma.story.create({
      data: {
        workspaceId,
        title,
        brief,
        platforms: JSON.stringify(platforms),
        nodes: JSON.stringify(nodes),
        status: "draft",
      },
    });

    return NextResponse.json(
      {
        ...story,
        platforms: JSON.parse(story.platforms),
        nodes: JSON.parse(story.nodes) as StoryNode[],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CREATE_STORY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
