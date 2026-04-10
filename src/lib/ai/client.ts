import { SYSTEM_PROMPT, buildUserMessage } from "./prompts";
import type { StructuredPlan } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function processBrainDump(rawInput: string): Promise<StructuredPlan> {
  const apiKey = process.env.OPENROUTER_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_KEY is not set");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(rawInput) },
      ],
      max_tokens: 4096,
      route: "fallback",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenRouter error:", err);
    throw new Error("Failed to get AI response");
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  if (!text) {
    throw new Error("Empty response from AI");
  }

  // Strip markdown code fences if the model wraps output
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  return JSON.parse(cleaned) as StructuredPlan;
}
