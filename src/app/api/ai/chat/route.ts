import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy",
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { messages, workspaceName, workspacePurpose } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const systemInstruction = `You are an AI assistant helping a user plan social media posts for a workspace named "${workspaceName}" (Purpose: ${workspacePurpose}). 
Your goal is strictly to gather the minimum necessary information to generate social media posts.

EVALUATION LOGIC:
1. Review the conversation history.
2. If the user has provided enough information to write decent posts (e.g. they provided the core topic, what happened, or key details), or if they have ALREADY answered a previous questionnaire, you MUST output EXACTLY the following text and nothing else:
[REQUEST_GENERATE_POSTS]
3. If the user's input is too brief or lacks basic context (e.g., they just said "write a post about AI" but didn't specify what about AI), you should ask them for more details. To do so, output a questionnaire in EXACTLY this JSON format on a new line:
[QUESTIONNAIRE: [{"id": "q1", "label": "Project name?"}, {"id": "q2", "label": "Target audience?"}]]

CRITICAL RULES:
- If the last user message contains their answers (e.g. it includes "Goal: " or answers to your questions), DO NOT ask again. Immediately output [REQUEST_GENERATE_POSTS].
- Do not engage in normal conversation. Your output must be EITHER a [QUESTIONNAIRE: ...] OR [REQUEST_GENERATE_POSTS].`;

    const openAiMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: openAiMessages as any,
    });
    
    const text = response.choices[0]?.message?.content?.trim() || "";

    let chatTitle = null;
    if (messages.length === 1) {
      try {
        const titleRes = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a helpful AI. Given the following user message, generate a short, 3-5 word title for the chat. ONLY output the title, no quotes or explanation." },
            { role: "user", content: messages[0].content }
          ]
        });
        chatTitle = titleRes.choices[0]?.message?.content?.trim() || "New Chat";
      } catch (e) {
        chatTitle = "New Chat";
      }
    }

    return NextResponse.json({ text, chatTitle });
  } catch (error) {
    console.error("[AI_CHAT]", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
