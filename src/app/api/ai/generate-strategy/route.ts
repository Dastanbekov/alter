import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const maxDuration = 60; // Allow more time for generation

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandData = await req.json();

  if (!brandData || !brandData.name) {
    return NextResponse.json({ error: "No brand data provided" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      system: `You are an expert marketing strategist. Based on the provided brand identity, your goal is to formulate a powerful marketing angle and a concrete, actionable to-do list (strategy checklist) that the brand should follow to achieve growth. You must return the output as a JSON object matching the requested schema.`,
      prompt: `Here is the brand data:\n${JSON.stringify(brandData, null, 2)}
      
Generate the following:
1. "angle": A 1-2 sentence compelling marketing angle. E.g. "AlaySoft should appear in Instagram as a team of engineers who build complex systems and are not afraid to talk about it..."
2. "checklist": A list of 4-6 highly actionable tasks/strategies. For each task, provide:
   - "title": A short action-oriented title (e.g. "Write a launch post", "Create a technical deep-dive thread").
   - "description": Why this is important and what to include.
   - "suggestedPrompt": A ready-to-use prompt that the user can send to an AI to execute this task. E.g. "Write a Twitter thread about our new highly scalable backend architecture, focusing on the engineering challenges we solved."`,
      schema: z.object({
        angle: z.string().describe("The marketing angle or positioning statement"),
        checklist: z.array(z.object({
          id: z.string().describe("A unique slug or id for this task (e.g. 'launch-post')"),
          title: z.string().describe("Actionable title"),
          description: z.string().describe("Brief explanation"),
          suggestedPrompt: z.string().describe("The AI prompt to execute this task"),
        })).describe("List of strategy tasks"),
      }),
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Strategy generation error:", error);
    return NextResponse.json({ 
      error: "Failed to generate strategy",
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
