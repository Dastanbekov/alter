import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.RECRAFT_API_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ error: "RECRAFT_API_TOKEN is not configured" }, { status: 500 });
    }

    const response = await fetch("https://external.api.recraft.ai/v1/images/generations", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        model: "recraftv4",
        response_format: "b64_json",
        size: "1024x1024"
      }),
    });

    const dataText = await response.text();
    let data;
    try {
      data = JSON.parse(dataText);
    } catch {
      return NextResponse.json({ error: dataText || "Failed to generate image" }, { status: response.status });
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || data.message || "Failed to generate image" }, { status: response.status });
    }

    const base64Image = data?.data?.[0]?.b64_json;

    if (!base64Image) {
      const imageUrl = data?.data?.[0]?.url;
      if (imageUrl) {
        const imageRes = await fetch(imageUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const b64 = buffer.toString('base64');
        return NextResponse.json({ imageBase64: b64 });
      }
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    // Return the base64 string
    return NextResponse.json({ imageBase64: base64Image });

  } catch (error: any) {
    console.error("Error generating image:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
