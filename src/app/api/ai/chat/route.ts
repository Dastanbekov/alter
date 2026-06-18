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

    const systemInstruction = `You are an AI assistant helping a user create social media posts for a workspace named "${workspaceName}" (Purpose: ${workspacePurpose}). 
Your goal is strictly to gather the minimum necessary information to generate social media posts. Do NOT engage in idle chat.
When the user shares news or an event, evaluate what basic info is missing (e.g. project name, target audience).
If information is missing, you MUST output a questionnaire for the user to fill out. 
Format your questionnaire EXACTLY like this JSON block on a new line (max 3-4 questions):
[QUESTIONNAIRE: [{"id": "q1", "label": "Project name?"}, {"id": "q2", "label": "Key achievement?"}]]

CRITICAL RULE 1: You are only allowed to ask ONE questionnaire per session. 
CRITICAL RULE 2: Once the user provides answers to your questionnaire, you MUST NOT ask any more questions or generate another questionnaire. You must accept whatever they answered.
CRITICAL RULE 3: If you have received the answers to your questionnaire, or if the initial prompt already contains enough information to make a post, you MUST immediately output EXACTLY the following text and nothing else:
[REQUEST_GENERATE_POSTS]

Remember: your only job is to guide the user to fill out ONE questionnaire and then immediately output [REQUEST_GENERATE_POSTS].`;

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
