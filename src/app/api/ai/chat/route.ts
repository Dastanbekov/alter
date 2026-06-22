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
2. If the user's input lacks basic context (e.g., they just said "my project is Alter" but didn't explain what Alter actually does, or said "write a post" without specifying the topic), this is NOT enough information. You MUST ask them for details. To do so, output a questionnaire in EXACTLY this JSON format on a new line:
[QUESTIONNAIRE: [{"id": "q1", "label": "What does your project do?"}, {"id": "q2", "label": "What is the key message of the post?"}]]
Make sure to include the closing ]] at the end!
3. If the user has provided enough information to write decent posts (they explained what the product/project does AND what the post is about), or if they have ALREADY answered a previous questionnaire, you MUST output EXACTLY the following text and nothing else:
[REQUEST_GENERATE_POSTS]

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
