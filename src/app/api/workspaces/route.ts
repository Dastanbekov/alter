import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/workspaces - list user workspaces
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: session.user.id },
    include: { socials: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(workspaces);
}

// POST /api/workspaces - create workspace (used in onboarding)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      name, purpose, details, platforms, 
      website, services, logoUrl, colors, fonts, toneOfVoice, targetAudience, brandStyle, tagline, angle, strategyChecklist 
    } = body;

    if (!name || !purpose) {
      return NextResponse.json({ error: "Name and purpose are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isPro) {
      const count = await prisma.workspace.count({
        where: { userId: session.user.id }
      });
      if (count >= 1) {
        return NextResponse.json(
          { error: "Free plan allows only 1 workspace. Upgrade to PRO to create more." },
          { status: 403 }
        );
      }
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        purpose: purpose || "other",
        details: details?.trim() || null,
        website,
        services: services || [],
        logoUrl,
        colors: colors || [],
        fonts: fonts || [],
        toneOfVoice,
        targetAudience,
        brandStyle: brandStyle || [],
        tagline,
        angle,
        strategyChecklist: strategyChecklist || null,
        userId: session.user.id,
        socials: {
          create: (platforms || []).map((platform: string) => ({ platform })),
        },
      },
      include: { socials: true },
    });

    // Mark user as onboarded
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboarded: true },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("[CREATE_WORKSPACE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/workspaces?id=xxx - delete a workspace
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id },
  });

  if (!workspace || workspace.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.workspace.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_WORKSPACE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/workspaces - update a workspace
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name } = await req.json();

    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace || workspace.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[UPDATE_WORKSPACE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
