import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePostsForPlatforms, refinePost } from "@/lib/ai";
import type { SocialPlatform } from "@/types";

// POST /api/ai/generate - generate posts for connected platforms
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { context, workspaceId, platforms, isTourGeneration } = await req.json();

    if (!context?.trim()) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
      include: { socials: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Credit Check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let { freePostsUsed, freePostsResetAt, paidCredits } = user;
    const now = new Date();

    if (freePostsResetAt && now > freePostsResetAt) {
      freePostsUsed = 0;
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { freePostsUsed: 0, freePostsResetAt: tomorrow }
      });
    } else if (!freePostsResetAt) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { freePostsResetAt: tomorrow }
      });
    }

    const availableFree = Math.max(0, 1 - freePostsUsed);
    const totalAvailable = availableFree + paidCredits;

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: "No platforms selected" }, { status: 400 });
    }

    // Tour generation: first-time free generation, skip credit check
    const isFreeFirstGeneration = isTourGeneration === true && !user.tourCompleted;

    if (!isFreeFirstGeneration && platforms.length > totalAvailable) {
      return NextResponse.json({ error: "insufficient_credits", totalAvailable }, { status: 403 });
    }

    // Check which platforms are actually integrated (have tokens)
    const integrations = await prisma.integration.findMany({
      where: { workspaceId },
      select: { platform: true, toneOfVoice: true },
    });

    // Generate posts
    const inputs = platforms.map((platform: string) => {
      const integration = integrations.find((i) => i.platform === platform);
      
      // Construct a rich details string using all available workspace data
      const richDetails = [
        workspace.details || workspace.name,
        workspace.website ? `Website: ${workspace.website}` : "",
        workspace.services && workspace.services.length > 0 ? `Services/Products: ${workspace.services.join(", ")}` : "",
        workspace.targetAudience ? `Target Audience: ${workspace.targetAudience}` : "",
        workspace.brandStyle && workspace.brandStyle.length > 0 ? `Brand Style: ${workspace.brandStyle.join(", ")}` : "",
        workspace.angle ? `Marketing Angle: ${workspace.angle}` : "",
      ].filter(Boolean).join("\n");

      return {
        platform: platform as SocialPlatform,
        context: context.trim(),
        workspacePurpose: workspace.purpose,
        workspaceDetails: richDetails,
        toneOfVoice: integration?.toneOfVoice || workspace.toneOfVoice || undefined,
      };
    });

    const generated = await generatePostsForPlatforms(inputs);

    // Save chat message
    await prisma.chatMessage.create({
      data: {
        workspaceId,
        role: "user",
        content: context.trim(),
      },
    });

    // Deduct credits (skip if this is the free tour generation)
    const postsCount = inputs.length;
    if (postsCount > 0 && !isFreeFirstGeneration) {
      let newFreeUsed = freePostsUsed;
      let newPaid = paidCredits;

      let remainingToDeduct = postsCount;
      const availableFreeToUse = Math.max(0, 1 - freePostsUsed);
      
      if (availableFreeToUse >= remainingToDeduct) {
        newFreeUsed += remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        newFreeUsed = 1;
        remainingToDeduct -= availableFreeToUse;
        newPaid -= remainingToDeduct;
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          freePostsUsed: newFreeUsed,
          paidCredits: newPaid
        }
      });
    }

    return NextResponse.json({ posts: generated, activePlatforms: platforms });
  } catch (error) {
    console.error("[AI_GENERATE]", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

// PATCH /api/ai/generate - refine a single post
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, platform, instruction } = await req.json();

    if (!content || !platform || !instruction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const refined = await refinePost(content, platform, instruction);
    return NextResponse.json({ content: refined });
  } catch (error) {
    console.error("[AI_REFINE]", error);
    return NextResponse.json({ error: "Refinement failed" }, { status: 500 });
  }
}
