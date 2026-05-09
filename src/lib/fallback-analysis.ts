import type { CloseAnalysis } from "./types";
import type { CompanySnapshot } from "./types";

/**
 * Deterministic, rules-based analyzer that matches the Claude output shape.
 * Used when ANTHROPIC_API_KEY is missing so the demo is bullet-proof.
 *
 * The findings here are derived directly from the mock dataset — same
 * dollar values, same entities — so the live API and the fallback feel
 * like they're looking at the same books.
 */
export function fallbackAnalysis(snapshot: CompanySnapshot): CloseAnalysis {
  const ic = snapshot.reconciliations.find((r) => r.id === "rec-4");
  const stripe = snapshot.reconciliations.find((r) => r.id === "rec-1");
  const brex = snapshot.reconciliations.find((r) => r.id === "rec-3");
  const deferred = snapshot.reconciliations.find((r) => r.id === "rec-5");
  const sbc = snapshot.reconciliations.find((r) => r.id === "rec-6");

  const fxBalance = snapshot.balances.find((b) => b.account === "7400");
  const psRev = snapshot.balances.find((b) => b.account === "4100");
  const ar = snapshot.balances.find((b) => b.account === "1200");
  const mktAccrual = snapshot.balances.find((b) => b.account === "2200");

  return {
    generatedAt: new Date().toISOString(),
    model: "close-companion-rules-v1",
    closeRiskScore: 68,
    riskTrend: "deteriorating",
    estimatedCloseDelayDays: 1.5,
    totalExposure: 1_388_300,
    headline:
      "Two cut-off issues and an intercompany FX gap are tracking to push close past Day +5 unless cleared today.",
    summary:
      "Pre-close scan flagged seven items across revenue, intercompany, and accrual categories. The Vercel Industries multi-year contract has not been ratably scheduled, the EU intercompany pair is out by ~$24.5K on EUR remeasurement timing, and FX losses are 4× prior month — combined exposure is meaningful enough to warrant a topside review entry. Remaining items are housekeeping but should be cleared before consolidation.",
    findings: [
      {
        id: "rev-rec-vercel",
        title: "Annual contract not yet on ratable schedule",
        severity: "critical",
        category: "revenue_recognition",
        affectedEntities: ["US-HQ"],
        exposureAmount: 1_100_000,
        estimatedDelayDays: 1,
        confidence: 0.92,
        rootCauseHypothesis:
          "JE-1042 reclassed $1.1M to deferred revenue but the multi-year ratable schedule has not been generated. Without it, May–April revenue will be overstated and ASC 606 standalone selling price allocation is undocumented.",
        evidence: [
          "JE-1041 booked full $1.2M to subscription revenue on Apr 29; JE-1042 reclassified $1.1M to deferred revenue with no schedule attached.",
          `Stripe → GL revenue rec is off by ${stripe ? "$" + Math.abs(stripe.difference).toLocaleString() : "$12K"} on the same boundary.`,
          "NetSuite billing → deferred revenue rec is off by $58.1K — three multi-year contracts unscheduled.",
          "AR Bot is preparer; entry is not yet reviewed by a human controller.",
        ],
        recommendedActions: [
          { label: "Generate ratable schedule for Vercel Industries (3-yr)", owner: "S. Patel", estMinutes: 25 },
          { label: "Attach signed order form + SSP allocation memo", owner: "S. Patel", estMinutes: 15 },
          { label: "Re-run revenue cut-off for Apr 29–30 boundary", owner: "AR Bot", estMinutes: 5 },
        ],
      },
      {
        id: "ic-eu-mismatch",
        title: "Intercompany pair out by $24.5K on EUR timing",
        severity: "high",
        category: "intercompany",
        affectedEntities: ["US-HQ", "EU-NL"],
        exposureAmount: ic ? Math.abs(ic.difference) : 24_500,
        estimatedDelayDays: 0.5,
        confidence: 0.88,
        rootCauseHypothesis:
          "US-HQ booked the IC settlement at Apr 30 spot (1.0814) while EU-NL used the daily rate from settlement-day. Standard remeasurement timing issue — not a real economic gap.",
        evidence: [
          "Account 1800 (US-HQ): $412,900 vs Account 1801 (EU-NL): -$388,400.",
          "JE-1043 booked at EU-NL with no offset entry referenced from US-HQ side.",
          "FX P&L (7400) is -$218K, ~4× prior month and budget.",
          "Consolidation task (ct-6) cannot start until this is reconciled.",
        ],
        recommendedActions: [
          { label: "Re-book IC settlement at Apr 30 spot rate on both sides", owner: "M. de Vries", estMinutes: 20 },
          { label: "Attach FX rate memo to JE-1043 and the offsetting US-HQ entry", owner: "FX Bot", estMinutes: 5 },
        ],
      },
      {
        id: "fx-spike",
        title: "FX loss 4× prior — concentrated in EUR",
        severity: "high",
        category: "fx",
        affectedEntities: ["US-HQ", "EU-NL"],
        exposureAmount: fxBalance ? Math.abs(fxBalance.currentMonth) : 218_400,
        estimatedDelayDays: 0.25,
        confidence: 0.81,
        rootCauseHypothesis:
          "EUR weakened ~3.2% intraperiod; deferred revenue at EU-NL ($2.04M) drove most of the remeasurement loss. Hedging program coverage gap from January is showing up here.",
        evidence: [
          "Account 7400 at -$218,400 vs prior -$42,100 and budget -$50,000.",
          "EU-NL deferred revenue dropped 18.6% MoM despite stable bookings — consistent with FX, not churn.",
          "No new FX hedge contracts entered since Q4.",
        ],
        recommendedActions: [
          { label: "Add FX disclosure footnote to close memo", owner: "S. Patel", estMinutes: 15 },
          { label: "Re-engage treasury on Q2 hedging coverage", owner: "Controller", estMinutes: 30 },
        ],
      },
      {
        id: "ar-aging-spike",
        title: "AR balance up 56% MoM — collections risk",
        severity: "high",
        category: "anomaly",
        affectedEntities: ["US-HQ"],
        exposureAmount: ar ? ar.currentMonth - ar.priorMonth : 1_189_500,
        estimatedDelayDays: 0,
        confidence: 0.76,
        rootCauseHypothesis:
          "Likely driven by the Vercel Industries $1.2M annual invoice issued Apr 29 (one day before period close) — but worth confirming aging buckets aren't masking older balances.",
        evidence: [
          "Account 1200 at $3.31M vs prior $2.12M (budget $2.30M).",
          "Vercel JE-1041 alone accounts for ~92% of the increase.",
          "DSO not yet computed for April — owner should run aging report.",
        ],
        recommendedActions: [
          { label: "Pull AR aging by bucket and reconcile to $1.2M Vercel invoice", owner: "C. Park", estMinutes: 20 },
        ],
      },
      {
        id: "brex-coding",
        title: "$45K in unmatched Brex receipts",
        severity: "medium",
        category: "reconciliation",
        affectedEntities: ["US-HQ"],
        exposureAmount: brex ? Math.abs(brex.difference) : 45_320,
        estimatedDelayDays: 0.25,
        confidence: 0.9,
        rootCauseHypothesis: "Sales offsite trip generated receipts that haven't been coded to GL accounts.",
        evidence: [
          "Brex → GL AP rec off by $45,320 as of Apr 30.",
          "Receipts cluster around the Apr 16–19 sales offsite per memo.",
        ],
        recommendedActions: [
          { label: "Auto-code Brex offsite receipts to T&E — Sales", owner: "AP Bot", estMinutes: 5 },
          { label: "Approve and post", owner: "C. Park", estMinutes: 10 },
        ],
      },
      {
        id: "mkt-accrual",
        title: "Marketing accrual down 50% — schedule mismatch",
        severity: "medium",
        category: "accrual",
        affectedEntities: ["US-HQ"],
        exposureAmount: mktAccrual
          ? Math.abs(mktAccrual.priorMonth - mktAccrual.currentMonth)
          : 222_500,
        estimatedDelayDays: 0,
        confidence: 0.84,
        rootCauseHypothesis:
          "JE-1045 reversed the March marketing accrual because the Q2 campaign launched late. Reasonable — but the offsetting May accrual hasn't been booked yet.",
        evidence: [
          "Account 2200 at $188K vs prior $410K, var -50.4%.",
          "JE-1045 reverses prior accrual but no new accrual entry has been prepared.",
          "Owner C. Park has marked the accrual task done.",
        ],
        recommendedActions: [
          { label: "Re-open accrual task; book May campaign accrual", owner: "C. Park", estMinutes: 15 },
        ],
      },
      {
        id: "audit-walkforward",
        title: "Q1 audit walkforward refresh blocked",
        severity: "medium",
        category: "audit_documentation",
        affectedEntities: ["US-HQ"],
        exposureAmount: 0,
        estimatedDelayDays: 0,
        confidence: 0.7,
        rootCauseHypothesis: "Task ct-7 is blocked on consolidation (ct-6), which itself is waiting on intercompany reconciliation.",
        evidence: [
          "Two close tasks blocked, both downstream of intercompany rec.",
          "Auditor PBC list refresh due May 6 — no slack.",
        ],
        recommendedActions: [
          { label: "Unblock ct-2 (IC rec) — clears ct-6 and ct-7 in sequence", owner: "M. de Vries", estMinutes: 20 },
        ],
      },
    ],
    nextActions: [
      {
        title: "Generate ratable schedule for Vercel Industries multi-year contract",
        why: "Single largest exposure ($1.1M) and the only critical-severity item.",
        owner: "S. Patel",
        estMinutes: 25,
      },
      {
        title: "Re-book intercompany at Apr 30 spot rate on both sides",
        why: "Unblocks consolidation (ct-6) and audit walkforward (ct-7).",
        owner: "M. de Vries",
        estMinutes: 20,
      },
      {
        title: "Auto-code Brex offsite receipts and approve",
        why: "Cheapest reconciliation win — clears $45K with one click.",
        owner: "AP Bot → C. Park",
        estMinutes: 15,
      },
    ],
  };
}

// Re-export so the API route can pull both from one module if desired.
export { sampleSnapshot } from "./mock-data";
