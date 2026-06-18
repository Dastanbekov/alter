import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy",
});
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const integration = await prisma.integration.findUnique({
      where: { workspaceId_platform: { workspaceId, platform: "linkedin" } }
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json({ error: "LinkedIn not connected" }, { status: 400 });
    }

    let urn = "";
    try {
      const meta = JSON.parse(integration.metadata || "{}");
      urn = meta.id || ""; // The user ID urn
    } catch {}

    if (!urn) {
      // Try to fetch profile to get urn if missing
      const meRes = await fetch("https://api.linkedin.com/v2/me", {
        headers: { Authorization: `Bearer ${integration.accessToken}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        urn = meData.id;
        // save it
        const meta = JSON.parse(integration.metadata || "{}");
        meta.id = urn;
        await prisma.integration.update({
          where: { id: integration.id },
          data: { metadata: JSON.stringify(meta) }
        });
      } else {
        return NextResponse.json({ error: "Failed to fetch LinkedIn profile. Reconnect integration." }, { status: 400 });
      }
    }

    // Fetch posts
    const postsRes = await fetch(`https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aperson%3A${urn}&q=author&count=10`, {
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        "LinkedIn-Version": "202401", // Using a recent version
        "X-Restli-Protocol-Version": "2.0.0",
      }
    });

    // Fallback to ugcPosts if the rest API fails due to permission / versioning
    let texts: string[] = [];
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      texts = (postsData.elements || []).map((p: any) => {
        // extract text from post body
        return p.commentary || p.text?.text || "";
      }).filter((t: string) => t.length > 20);
    } else {
      console.log("Failed rest/posts, trying v2/ugcPosts...", await postsRes.text());
      const ugcRes = await fetch(`https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aperson%3A${urn})&count=10`, {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        }
      });
      if (ugcRes.ok) {
        const ugcData = await ugcRes.json();
        texts = (ugcData.elements || []).map((p: any) => {
          return p.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text || "";
        }).filter((t: string) => t.length > 20);
      } else {
        console.error("Failed both post fetch methods", await ugcRes.text());
        return NextResponse.json({ error: "Failed to fetch posts from LinkedIn. Make sure you have the correct permissions." }, { status: 400 });
      }
    }

    if (texts.length === 0) {
      return NextResponse.json({ error: "No posts found on LinkedIn to analyze." }, { status: 400 });
    }

    // Pass to Gemini
    const prompt = `Analyze the following LinkedIn posts written by a user.
Extract a detailed "Tone of Voice" summary that can be used to instruct an AI to write exactly like them in the future.
Focus on:
- Formatting (do they use emojis, line breaks, bullet points?)
- Tone (formal, casual, sarcastic, enthusiastic?)
- Structure (how do they start hooks, how do they end?)
- Favorite words or phrases

Posts:
${texts.map((t, i) => `--- Post ${i + 1} ---\n${t}\n`).join("\n")}

Return ONLY the Tone of Voice instructions, written as a direct prompt to an AI (e.g., "Write with a casual tone, use short sentences...").`;

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
    });
    const toneOfVoice = response.choices[0]?.message?.content?.trim() || "";

    // Save
    await prisma.integration.update({
      where: { id: integration.id },
      data: { toneOfVoice }
    });

    return NextResponse.json({ toneOfVoice });
  } catch (error) {
    console.error("ToV Generate Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Determine platform from URL
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const platform = parts[parts.length - 2]; // /api/integrations/[platform]/tov

    const { workspaceId, toneOfVoice } = await req.json();
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    await prisma.integration.update({
      where: { workspaceId_platform: { workspaceId, platform } },
      data: { toneOfVoice }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ToV Patch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
