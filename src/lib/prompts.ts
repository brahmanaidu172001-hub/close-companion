import type { CloseAnalysis } from "./types";

/**
 * The system prompt is intentionally written as if onboarding a new senior
 * AI controller. The tone matters — it's how we get an analysis that
 * reads like an operator, not a chatbot.
 */
export const SYSTEM_PROMPT = `You are Close Companion — an AI Month-End Close Copilot embedded inside an AI-native ERP.
You think like a senior controller at a fast-growing SaaS company who has run hundreds of closes.

Your job each pre-close cycle is simple:
- Continuously scan the books, subledgers, and operational data the controller has wired into the system.
- Surface the few risks that will actually slow the close, expose the company at audit, or distort the numbers.
- For each risk, name the most likely root cause, the exposure dollar amount, and the smallest next action that resolves it.

You are NOT a generic AI assistant. You write like an operator:
- Plain, specific, decisive. No filler. No hedging unless the data warrants it.
- Quote actual account names, JE IDs, entity codes, and dollar figures from the briefing.
- Prefer 2-5 short, concrete evidence bullets over a long paragraph.
- Confidence reflects how strongly the evidence supports the hypothesis (0.0 - 1.0).

Severity scale:
- critical: will block the close OR creates audit/material-misstatement exposure.
- high: will delay close by 1-2 days OR is a recurring control weakness.
- medium: needs explanation in the close memo; not yet blocking.
- low: housekeeping; nice to fix this cycle.

You always return a single, valid JSON object matching the requested schema. No prose outside the JSON.`;

export const ANALYSIS_SCHEMA_PROMPT = `Return ONE JSON object, and nothing else, with this exact shape:

{
  "closeRiskScore": number,            // 0-100, lower is healthier
  "riskTrend": "improving" | "stable" | "deteriorating",
  "estimatedCloseDelayDays": number,   // realistic, decimals OK
  "totalExposure": number,             // sum of $ exposure across findings, USD
  "headline": string,                  // ONE sentence, controller voice
  "summary": string,                   // 2-4 sentences, plain English
  "findings": [
    {
      "id": string,                    // short slug, e.g. "ic-eu-mismatch"
      "title": string,                 // 4-9 words, specific
      "severity": "critical" | "high" | "medium" | "low",
      "category": "revenue_recognition" | "reconciliation" | "intercompany" | "fx" | "accrual" | "audit_documentation" | "controls" | "anomaly" | "deadline",
      "affectedEntities": string[],    // entity codes from the briefing
      "exposureAmount": number,        // USD
      "estimatedDelayDays": number,
      "confidence": number,            // 0-1
      "rootCauseHypothesis": string,   // 1-2 sentences, plausible
      "evidence": string[],            // 2-5 short, specific bullets
      "recommendedActions": [
        { "label": string, "owner": string, "estMinutes": number }
      ]
    }
  ],
  "nextActions": [
    { "title": string, "why": string, "owner": string, "estMinutes": number }
  ]
}

Aim for 4-7 findings. Order findings by severity desc, then exposureAmount desc.`;

export function buildUserPrompt(briefing: string): string {
  return `Pre-close briefing for the current period:\n\n${briefing}\n\n${ANALYSIS_SCHEMA_PROMPT}`;
}

/**
 * Type guard / sanitizer for whatever Claude returns. We are deliberately
 * lenient — if a field is missing we patch a sensible default so the UI
 * never crashes mid-demo.
 */
export function coerceAnalysis(raw: unknown, model: string): CloseAnalysis {
  const r = (raw ?? {}) as Record<string, unknown>;
  const findings = Array.isArray(r.findings) ? (r.findings as Record<string, unknown>[]) : [];

  return {
    generatedAt: new Date().toISOString(),
    model,
    closeRiskScore: clampNum(r.closeRiskScore, 0, 100, 50),
    riskTrend: ["improving", "stable", "deteriorating"].includes(r.riskTrend as string)
      ? (r.riskTrend as CloseAnalysis["riskTrend"])
      : "stable",
    estimatedCloseDelayDays: clampNum(r.estimatedCloseDelayDays, 0, 30, 0),
    totalExposure: typeof r.totalExposure === "number" ? r.totalExposure : 0,
    headline: typeof r.headline === "string" ? r.headline : "Pre-close scan complete.",
    summary: typeof r.summary === "string" ? r.summary : "",
    findings: findings.map((f, i) => ({
      id: typeof f.id === "string" ? f.id : `finding-${i}`,
      title: typeof f.title === "string" ? f.title : "Untitled finding",
      severity: (["critical", "high", "medium", "low"].includes(f.severity as string)
        ? f.severity
        : "medium") as CloseAnalysis["findings"][number]["severity"],
      category: (typeof f.category === "string"
        ? f.category
        : "anomaly") as CloseAnalysis["findings"][number]["category"],
      affectedEntities: Array.isArray(f.affectedEntities)
        ? (f.affectedEntities as string[]).filter(Boolean) as CloseAnalysis["findings"][number]["affectedEntities"]
        : [],
      exposureAmount: typeof f.exposureAmount === "number" ? f.exposureAmount : 0,
      estimatedDelayDays: typeof f.estimatedDelayDays === "number" ? f.estimatedDelayDays : 0,
      confidence: clampNum(f.confidence, 0, 1, 0.7),
      rootCauseHypothesis: typeof f.rootCauseHypothesis === "string" ? f.rootCauseHypothesis : "",
      evidence: Array.isArray(f.evidence) ? (f.evidence as string[]).filter(Boolean) : [],
      recommendedActions: Array.isArray(f.recommendedActions)
        ? (f.recommendedActions as Record<string, unknown>[]).map((a) => ({
            label: typeof a.label === "string" ? a.label : "Action",
            owner: typeof a.owner === "string" ? a.owner : "Controller",
            estMinutes: typeof a.estMinutes === "number" ? a.estMinutes : 15,
          }))
        : [],
    })),
    nextActions: Array.isArray(r.nextActions)
      ? (r.nextActions as Record<string, unknown>[]).map((a) => ({
          title: typeof a.title === "string" ? a.title : "",
          why: typeof a.why === "string" ? a.why : "",
          owner: typeof a.owner === "string" ? a.owner : "Controller",
          estMinutes: typeof a.estMinutes === "number" ? a.estMinutes : 15,
        }))
      : [],
  };
}

function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}
