import { generateObject } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
dotenv.config();

async function run() {
  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      prompt: "Extract the name from this text: Apple Inc.",
      schema: z.object({
        name: z.string()
      }),
    });
    console.log("Success:", object);
  } catch (error: any) {
    console.error("Error:", error?.message || error);
  }
}

run();
