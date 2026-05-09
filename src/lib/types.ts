/**
 * Core domain model for Close Companion.
 *
 * Designed to be intentionally narrow — just enough to be believable as a
 * pre-close operating data feed for a SaaS company on an AI-native ERP.
 */

export type Severity = "critical" | "high" | "medium" | "low";

export type EntityCode = "US-HQ" | "US-OPS" | "EU-NL" | "UK-LTD" | "APAC-SG";

export type AccountType =
  | "revenue"
  | "deferred_revenue"
  | "ar"
  | "ap"
  | "intercompany"
  | "fx_gain_loss"
  | "accrual"
  | "prepaid"
  | "cash"
  | "expense";

export interface Entity {
  code: EntityCode;
  name: string;
  baseCurrency: "USD" | "EUR" | "GBP" | "SGD";
  region: string;
}

export interface JournalLine {
  id: string;
  date: string;          // ISO
  entity: EntityCode;
  account: string;       // GL code
  accountName: string;
  type: AccountType;
  description: string;
  debit: number;
  credit: number;
  preparer?: string;
  reviewed?: boolean;
  flagged?: boolean;
  attachments?: number;
}

export interface AccountBalance {
  account: string;
  accountName: string;
  type: AccountType;
  entity: EntityCode;
  currentMonth: number;
  priorMonth: number;
  budget: number;
  variancePct: number;
}

export interface ReconciliationItem {
  id: string;
  source: string;     // "Stripe", "Brex", "Bank — JPM 4421", "NetSuite IC"
  target: string;
  expected: number;
  actual: number;
  difference: number;
  asOf: string;
  notes?: string;
}

export interface CloseTask {
  id: string;
  name: string;
  owner: string;
  entity?: EntityCode;
  dueDate: string;
  status: "not_started" | "in_progress" | "blocked" | "review" | "done";
  blocking?: string[];   // ids of tasks waiting on this one
}

export interface CompanySnapshot {
  company: string;
  industry: string;
  arr: number;
  headcount: number;
  closePeriod: string;       // "April 2026"
  closeStartsIn: number;     // business days
  entities: Entity[];
  balances: AccountBalance[];
  reconciliations: ReconciliationItem[];
  recentJournals: JournalLine[];
  tasks: CloseTask[];
}

export interface RiskFinding {
  id: string;
  title: string;
  severity: Severity;
  category:
    | "revenue_recognition"
    | "reconciliation"
    | "intercompany"
    | "fx"
    | "accrual"
    | "audit_documentation"
    | "controls"
    | "anomaly"
    | "deadline";
  affectedEntities: EntityCode[];
  exposureAmount: number;
  estimatedDelayDays: number;
  confidence: number; // 0-1
  rootCauseHypothesis: string;
  evidence: string[];          // 2-5 short, specific, plausible bullets
  recommendedActions: {
    label: string;
    owner: string;
    estMinutes: number;
  }[];
}

export interface CloseAnalysis {
  generatedAt: string;
  model: string;
  /** 0-100, lower is better. Mirrors operational risk language. */
  closeRiskScore: number;
  riskTrend: "improving" | "stable" | "deteriorating";
  estimatedCloseDelayDays: number;
  totalExposure: number;
  headline: string;            // 1 sentence, controller voice
  summary: string;             // 2-4 sentences
  findings: RiskFinding[];
  /** Surfaced as the "Suggested next 30 minutes" panel. */
  nextActions: {
    title: string;
    why: string;
    owner: string;
    estMinutes: number;
  }[];
}
