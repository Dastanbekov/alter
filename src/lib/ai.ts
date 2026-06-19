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
  imageRecommendations?: string[];
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  x: `Write a post for X (Twitter). STRICT RULES:
- Format: You should write a detailed Thread (a chain of connected posts). Do NOT write just a single short post.
- Structure: Start the first post with a powerful Hook (provocative question, bold opinion, value promise). Then write several more posts continuing the story. Each individual post must be under 280 characters, but the overall thread should tell the full story.
- Output Format: You MUST separate each tweet in the thread with exactly this text on a new line: [TWEET_BREAK]
Example:
This is the first tweet.
[TWEET_BREAK]
This is the second tweet.
[TWEET_BREAK]
This is the third tweet.
- Do NOT use labels like "Post 1:" or "Post 2:". Just use the delimiter.
- Hashtags: DO NOT use hashtags. The algorithm understands context without them.
- Tone/Culture: Informal, sincere, self-ironic. NO complex literary language or "glossy" corporate speak. Embrace shitposting/meme culture if appropriate. Make it conversational.`,
  
  linkedin: `Write a LinkedIn post. STRICT RULES:
- ZERO hashtags. Do NOT use any hashtags.
- The first 150 characters are the hook (before the "See more" button) — they MUST be extremely engaging or the post will fail.
- Authentic, grounded tone. AVOID cliché LinkedIn tropes (no "I am thrilled to announce", no "I've spent years...", no fake inspirational fluff). Be direct, raw, and realistic. Speak like a real founder talking to peers.
- The post must be completely self-sufficient and valuable on its own.
- Use line breaks for readability. 150-300 words.
- DO NOT use [TWEET_BREAK] or any other delimiter. Just write one continuous post.`,
  
  telegram: `Write a Telegram channel post. Rules:
- Conversational tone, use bold markdown for emphasis.
- No hashtags. No [TWEET_BREAK]. Just write one single message.
- Can be longer than Twitter but concise
- Can use emoji
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

FORMATTING STRICT RULES:
- DO NOT use markdown bold formatting (no **text**).
- DO NOT use long em-dashes (—). Use regular hyphens if needed.
- DO NOT break every single sentence into a new paragraph. Group text logically into cohesive paragraphs.
- The Hook (first sentence) should be separated by a blank line, but keep the rest of the text grouped by meaning to avoid excessive spacing.

Write your response in STRICT JSON format. Ensure the JSON is valid and can be parsed.
Structure:
{
  "content": "The actual post text.",
  "imageRecommendations": [
    "Description of an image the user should attach (e.g., 'A sleek screenshot of the new dashboard'). Provide 0, 1, or more suggestions depending on what is optimal for this post."
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      });
      const text = response.choices[0]?.message?.content?.trim() || "{}";
      
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        // Fallback if AI fails to return JSON
        parsed = { content: text, imageRecommendations: [] };
      }

      results.push({ 
        platform: item.platform, 
        content: parsed.content || text,
        imageRecommendations: parsed.imageRecommendations || []
      });
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
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}
