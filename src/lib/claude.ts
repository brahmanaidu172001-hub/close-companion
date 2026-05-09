import Anthropic from "@anthropic-ai/sdk";
import type { CloseAnalysis, CompanySnapshot } from "./types";
import { snapshotToBriefing } from "./mock-data";
import { SYSTEM_PROMPT, buildUserPrompt, coerceAnalysis } from "./prompts";
import { fallbackAnalysis } from "./fallback-analysis";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export interface AnalyzeResult {
  analysis: CloseAnalysis;
  source: "claude" | "fallback";
  latencyMs: number;
}

/**
 * Run a pre-close risk analysis. Falls back gracefully if no API key is
 * configured or the model returns malformed output — the demo never breaks.
 */
export async function analyzeClose(snapshot: CompanySnapshot): Promise<AnalyzeResult> {
  const t0 = Date.now();

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      analysis: fallbackAnalysis(snapshot),
      source: "fallback",
      latencyMs: Date.now() - t0,
    };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const briefing = snapshotToBriefing(snapshot);
    const message = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 3000,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(briefing) }],
    });

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    const json = extractJson(text);
    const analysis = coerceAnalysis(json, message.model);

    return {
      analysis,
      source: "claude",
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    // Any failure → graceful fallback. We log but never crash the route.
    console.error("[close-companion] Claude call failed, using fallback:", err);
    return {
      analysis: fallbackAnalysis(snapshot),
      source: "fallback",
      latencyMs: Date.now() - t0,
    };
  }
}

/**
 * The model is instructed to return only JSON, but be defensive — it
 * occasionally wraps in code fences or adds a leading sentence.
 */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* fall through */
    }
  }
  // Code-fenced
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      /* fall through */
    }
  }
  // Best effort — first { ... last }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(trimmed.slice(first, last + 1));
    } catch {
      /* fall through */
    }
  }
  throw new Error("Model did not return valid JSON.");
}
