import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const PLATFORM_BEST_TIMES: Record<string, string> = {
  linkedin: "Optimal LinkedIn times: Tuesday–Thursday 9–11 AM local time",
  x: "Optimal X/Twitter times: Monday–Friday 8–10 AM or 6–9 PM local time",
  telegram: "Telegram: evenings 7–10 PM local time work well",
};

// POST /api/ai/story-plan
// body: { workspaceId, brief, answers?, platforms? }
// If answers is absent → returns clarifying questions JSON
// If answers is present → returns full campaign plan JSON
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, brief, answers, platforms } = await req.json();

    if (!workspaceId || !brief) {
      return NextResponse.json({ error: "workspaceId and brief are required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Credit check (same as regular generation — each node costs 1 credit)
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // ─── PHASE A: Generate clarifying questions ────────────────────────────────
    if (!answers) {
      const questionPrompt = `You are a strategic social media campaign planner.
A user wants to launch a content campaign. Their brief:
"${brief}"

Workspace: "${workspace.name}" (${workspace.purpose})

Your task: generate EXACTLY 3-4 clarifying questions to understand their campaign better.
IMPORTANT: Always include one question asking which platforms they want to use (LinkedIn, X/Twitter, Telegram).
Also ask about timeline/duration, and their target audience or geographic region (for choosing optimal posting times).

Return ONLY valid JSON in this exact format, no extra text:
{
  "questions": [
    { "id": "q1", "label": "Which platforms should we publish on? (LinkedIn, X/Twitter, Telegram)", "type": "multiselect", "options": ["linkedin", "x", "telegram"] },
    { "id": "q2", "label": "How long is your campaign timeline? (e.g. 1 week, 2 weeks, 1 month)", "type": "text" },
    { "id": "q3", "label": "Who is your target audience and their timezone/region?", "type": "text" },
    { "id": "q4", "label": "What is the main goal? (e.g. raise awareness, get signups, drive traffic)", "type": "text" }
  ]
}`;

      const result = await model.generateContent(questionPrompt);
      let raw = result.response.text().trim();

      // Strip markdown code fences if present
      raw = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

      try {
        const parsed = JSON.parse(raw);
        return NextResponse.json({ phase: "questions", data: parsed });
      } catch {
        return NextResponse.json(
          { error: "Failed to parse AI questions response" },
          { status: 500 }
        );
      }
    }

    // ─── PHASE B: Generate full campaign plan ─────────────────────────────────
    const selectedPlatforms: string[] = platforms || ["linkedin"];
    const platformHints = selectedPlatforms.map((p: string) => PLATFORM_BEST_TIMES[p] || "").join("\n");

    const planPrompt = `You are an expert social media campaign strategist.

Campaign brief: "${brief}"
Workspace: "${workspace.name}" (${workspace.purpose})
Platforms: ${selectedPlatforms.join(", ")}
User answers to clarifying questions:
${JSON.stringify(answers, null, 2)}

${platformHints}

Create a content campaign with 3-5 posts. Each post should tell one part of a narrative arc:
- Post 1: Hook / The Problem / The Context
- Post 2: The Journey / Insight / Challenge
- Post 3: The Turning Point / Solution  
- Post 4 (optional): The Result / Lesson
- Post 5 (optional): The Call to Action / Next Step

Rules:
1. Spread posts over the campaign timeline the user mentioned.
2. Assign realistic posting datetimes based on the user's timezone/region and platform best practices.
3. Alternate platforms if multiple are selected (one post per platform).
4. Write FULL post content for each node (ready to publish — don't use placeholders).
5. For X/Twitter: max 280 chars, punchy, 1-3 hashtags.
6. For LinkedIn: 150-300 words, professional hook, line breaks, 3-5 hashtags.
7. For Telegram: conversational, bold markdown, no hashtags.

Return ONLY valid JSON in this exact format:
{
  "title": "Short campaign title",
  "nodes": [
    {
      "id": "n1",
      "label": "The Challenge",
      "day": 1,
      "scheduledAt": "2024-06-20T09:00:00.000Z",
      "platform": "linkedin",
      "content": "Full post content here..."
    }
  ]
}`;

    const planResult = await model.generateContent(planPrompt);
    let rawPlan = planResult.response.text().trim();
    rawPlan = rawPlan.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    try {
      const parsed = JSON.parse(rawPlan);

      // Deduct credits (1 per node)
      const nodeCount = parsed.nodes?.length || 0;
      if (nodeCount > 0) {
        let { freePostsUsed, paidCredits, freePostsResetAt } = user;
        const now = new Date();

        if (freePostsResetAt && now > freePostsResetAt) {
          freePostsUsed = 0;
        }

        const availableFree = Math.max(0, 1 - freePostsUsed);
        const totalAvailable = availableFree + paidCredits;

        if (nodeCount > totalAvailable) {
          return NextResponse.json(
            { error: "insufficient_credits", totalAvailable },
            { status: 403 }
          );
        }

        let remaining = nodeCount;
        let newFreeUsed = freePostsUsed;
        let newPaid = paidCredits;
        const freeToUse = Math.min(availableFree, remaining);
        newFreeUsed += freeToUse;
        remaining -= freeToUse;
        newPaid -= remaining;

        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            freePostsUsed: newFreeUsed,
            paidCredits: newPaid,
            freePostsResetAt: freePostsResetAt ?? tomorrow,
          },
        });
      }

      return NextResponse.json({ phase: "plan", data: parsed });
    } catch {
      console.error("Failed to parse plan:", rawPlan);
      return NextResponse.json(
        { error: "Failed to parse AI campaign plan" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[AI_STORY_PLAN]", error);
    return NextResponse.json({ error: "Story plan generation failed" }, { status: 500 });
  }
}
