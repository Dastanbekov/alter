import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const maxDuration = 60; // Allow more time for scraping and generating

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { websiteUrl, description } = await req.json();

  let contextText = description || "";

  if (websiteUrl) {
    try {
      // Use Jina AI Reader API
      // We don't necessarily need a bearer token for basic usage, but it helps.
      const jinaUrl = `https://r.jina.ai/${websiteUrl}`;
      const headers: Record<string, string> = { "Accept": "text/plain" };
      if (process.env.JINA_API_KEY) {
        headers["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
      }

      const res = await fetch(jinaUrl, { headers });
      if (res.ok) {
        const text = await res.text();
        contextText += "\n\nWebsite Content:\n" + text;
      } else {
        console.warn("Jina AI returned non-ok status:", res.status);
      }
    } catch (e) {
      console.error("Failed to scrape website", e);
    }
  }

  if (!contextText.trim()) {
    return NextResponse.json({ error: "No context provided" }, { status: 400 });
  }

  // Truncate to avoid massive payloads (Gemini has 1M token context, but just to be safe)
  if (contextText.length > 100000) {
    contextText = contextText.slice(0, 100000);
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      system: `You are an expert brand analyst. Given the content of a company's website or a description, extract and infer their brand identity.
If some information is missing, use your best judgment to infer it based on the industry and description. For example, if colors aren't explicitly mentioned in the text, suggest appropriate colors for the industry.`,
      prompt: `Analyze the following business context:\n\n${contextText}\n\nExtract or infer the following details: Business Name, Description, Services offered, Brand Colors (hex codes or names), Fonts used (if mentioned or typical for the industry), Tone of Voice (e.g., 'professional, inspiring'), Target Audience, Brand Style keywords, and Tagline.`,
      schema: z.object({
        name: z.string().describe("The name of the business or project"),
        description: z.string().describe("A 1-3 sentence description of what they do"),
        services: z.array(z.string()).describe("List of core services or products offered"),
        colors: z.array(z.string()).describe("Array of colors (hex codes preferred, e.g. '#1A7352')"),
        fonts: z.array(z.string()).describe("Array of font families (e.g. 'Inter', 'Roboto')"),
        toneOfVoice: z.string().describe("Description of their communication tone"),
        targetAudience: z.string().describe("Who they sell to or speak to"),
        brandStyle: z.array(z.string()).describe("Keywords describing their visual and verbal style"),
        tagline: z.string().describe("Their main slogan or tagline if any (or generate one)"),
      }),
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Brand extraction error:", error);
    return NextResponse.json({ error: "Failed to extract brand details" }, { status: 500 });
  }
}
