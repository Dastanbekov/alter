import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export interface GeneratePostsInput {
  platform: "x" | "linkedin" | "telegram";
  context: string; // what happened / what to post about
  workspacePurpose: string; // "project" | "blog" | "other"
  workspaceDetails: string; // project name or pseudonym
  existingPosts?: string[]; // for context on their style
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
  
  linkedin: `Write a LinkedIn post. Rules:
- Professional but human tone
- 150-300 words ideal
- Start with a hook (first line should grab attention)
- Add value: insight, lesson, or story
- End with a question or call to action
- Use line breaks for readability
- 3-5 relevant hashtags at the end`,
  
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
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    safetySettings,
  });

  const results: GeneratedPost[] = [];

  for (const item of input) {
    const platformInstructions = PLATFORM_INSTRUCTIONS[item.platform];
    
    const prompt = `You are a social media content expert writing for ${item.workspacePurpose === "blog" ? `a personal blog by "${item.workspaceDetails}"` : `a project called "${item.workspaceDetails}"`}.

The user wants to post about:
"${item.context}"

${platformInstructions}

Write ONLY the post content. No explanations, no "Here's your post:", just the raw post text.`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
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
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    safetySettings,
  });

  const prompt = `You are editing a ${platform} post.

Original post:
"${originalContent}"

User instruction: "${instruction}"

Apply the changes and return ONLY the updated post. No explanations.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
