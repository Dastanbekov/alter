import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { messages, workspaceName, workspacePurpose } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are an AI assistant helping a user create social media posts for a workspace named "${workspaceName}" (Purpose: ${workspacePurpose}). 
Your goal is strictly to gather the minimum necessary information to generate social media posts. Do NOT engage in idle chat.
When the user shares news or an event, evaluate what basic info is missing (e.g. project name, target audience).
If information is missing, you MUST output a questionnaire for the user to fill out. 
Format your questionnaire EXACTLY like this JSON block on a new line (max 3-4 questions):
[QUESTIONNAIRE: [{"id": "q1", "label": "Project name?"}, {"id": "q2", "label": "Key achievement?"}]]

CRITICAL RULE 1: You are only allowed to ask ONE questionnaire per session. 
CRITICAL RULE 2: Once the user provides answers to your questionnaire, you MUST NOT ask any more questions or generate another questionnaire. You must accept whatever they answered.
CRITICAL RULE 3: If you have received the answers to your questionnaire, or if the initial prompt already contains enough information to make a post, you MUST immediately output EXACTLY the following text and nothing else:
[REQUEST_GENERATE_POSTS]

Remember: your only job is to guide the user to fill out ONE questionnaire and then immediately output [REQUEST_GENERATE_POSTS].`
    });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[AI_CHAT]", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
