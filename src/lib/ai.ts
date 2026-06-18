import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy",
});

export interface GeneratePostsInput {
  platform: "x" | "linkedin" | "telegram";
  context: string; // what happened / what to post about
  workspacePurpose: string; // "project" | "blog" | "other"
  workspaceDetails: string; // project name or pseudonym
  existingPosts?: string[]; // for context on their style
  toneOfVoice?: string; // AI generated summary of their style
}

export interface GeneratedPost {
  platform: "x" | "linkedin" | "telegram";
  content: string;
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  x: `Write a tweet for X (Twitter). Rules:
- Max 280 characters
- Engaging, punchy, conversational tone
- Use 1-3 relevant hashtags
- No corporate speak
- Can use emojis sparingly`,
  
  linkedin: `Write a LinkedIn post. STRICT RULES:
- ZERO hashtags. Do NOT use any hashtags.
- The first 150 characters are the hook (before the "See more" button) — they MUST be extremely engaging or the post will fail.
- The post must be completely self-sufficient and valuable on its own, without relying on external links.
- Professional but human tone. Add value: insight, lesson, or story.
- Use line breaks for readability. 150-300 words.`,
  
  telegram: `Write a Telegram channel post. Rules:
- Conversational and direct
- Can be longer than Twitter but concise
- Use **bold** for emphasis (Markdown)
- Can use emoji
- No hashtags needed
- Feels like talking to subscribers directly`,
};

export async function generatePostsForPlatforms(
  input: GeneratePostsInput[]
): Promise<GeneratedPost[]> {
  const results: GeneratedPost[] = [];

  for (const item of input) {
    const platformInstructions = PLATFORM_INSTRUCTIONS[item.platform];
    
    const tovInstruction = item.toneOfVoice 
      ? `\n\nCRITICAL - TONE OF VOICE TO EMULATE:\n${item.toneOfVoice}\nYou MUST write the post exactly matching this tone of voice and style.`
      : "";

    const prompt = `You are a social media content expert writing for ${item.workspacePurpose === "blog" ? `a personal blog by "${item.workspaceDetails}"` : `a project called "${item.workspaceDetails}"`}.

The user wants to post about:
"${item.context}"

${platformInstructions}${tovInstruction}

Write ONLY the post content. No explanations, no "Here's your post:", just the raw post text.`;

    try {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
      });
      const text = response.choices[0]?.message?.content?.trim() || "";
      results.push({ platform: item.platform, content: text });
    } catch (error) {
      console.error(`Error generating post for ${item.platform}:`, error);
      results.push({
        platform: item.platform,
        content: `Failed to generate content for ${item.platform}. Please try again.`,
      });
    }
  }

  return results;
}

export async function refinePost(
  originalContent: string,
  platform: string,
  instruction: string
): Promise<string> {
  const prompt = `You are editing a ${platform} post.

Original post:
"${originalContent}"

User instruction: "${instruction}"

Apply the changes and return ONLY the updated post. No explanations.`;

  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content?.trim() || "";
}
