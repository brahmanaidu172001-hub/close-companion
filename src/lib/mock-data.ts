import type {
  AccountBalance,
  CloseTask,
  CompanySnapshot,
  Entity,
  JournalLine,
  ReconciliationItem,
} from "./types";

/**
 * Realistic-feeling SaaS finance dataset for a Series B-ish company.
 * Numbers are crafted so the AI has plausible signals to flag without
 * needing to invent anything — variances are real, recs really mismatch.
 */

const entities: Entity[] = [
  { code: "US-HQ", name: "Lattice Cloud, Inc.", baseCurrency: "USD", region: "North America" },
  { code: "US-OPS", name: "Lattice Operations LLC", baseCurrency: "USD", region: "North America" },
  { code: "EU-NL", name: "Lattice Cloud B.V.", baseCurrency: "EUR", region: "EMEA" },
  { code: "UK-LTD", name: "Lattice Cloud UK Ltd", baseCurrency: "GBP", region: "EMEA" },
  { code: "APAC-SG", name: "Lattice Cloud Pte Ltd", baseCurrency: "SGD", region: "APAC" },
];

const balances: AccountBalance[] = [
  {
    account: "4000",
    accountName: "Subscription Revenue — Annual",
    type: "revenue",
    entity: "US-HQ",
    currentMonth: 4_812_400,
    priorMonth: 4_410_900,
    budget: 4_650_000,
    variancePct: 9.1,
  },
  {
    account: "4010",
    accountName: "Subscription Revenue — Monthly",
    type: "revenue",
    entity: "US-HQ",
    currentMonth: 612_300,
    priorMonth: 588_120,
    budget: 600_000,
    variancePct: 4.1,
  },
  {
    account: "4100",
    accountName: "Professional Services Revenue",
    type: "revenue",
    entity: "US-HQ",
    currentMonth: 184_220,
    priorMonth: 248_700,
    budget: 240_000,
    variancePct: -25.9,
  },
  {
    account: "2300",
    accountName: "Deferred Revenue — Long Term",
    type: "deferred_revenue",
    entity: "US-HQ",
    currentMonth: 12_842_300,
    priorMonth: 11_910_800,
    budget: 12_400_000,
    variancePct: 7.8,
  },
  {
    account: "2310",
    accountName: "Deferred Revenue — Short Term",
    type: "deferred_revenue",
    entity: "EU-NL",
    currentMonth: 2_044_120,
    priorMonth: 2_510_400,
    budget: 2_460_000,
    variancePct: -18.6,
  },
  {
    account: "1200",
    accountName: "Accounts Receivable",
    type: "ar",
    entity: "US-HQ",
    currentMonth: 3_310_400,
    priorMonth: 2_120_900,
    budget: 2_300_000,
    variancePct: 56.0,
  },
  {
    account: "2100",
    accountName: "Accounts Payable",
    type: "ap",
    entity: "US-HQ",
    currentMonth: 1_120_800,
    priorMonth: 980_440,
    budget: 1_050_000,
    variancePct: 14.3,
  },
  {
    account: "1800",
    accountName: "Intercompany Receivable — EU-NL",
    type: "intercompany",
    entity: "US-HQ",
    currentMonth: 412_900,
    priorMonth: 360_000,
    budget: 380_000,
    variancePct: 14.7,
  },
  {
    account: "1801",
    accountName: "Intercompany Payable — US-HQ",
    type: "intercompany",
    entity: "EU-NL",
    currentMonth: -388_400, // Should mirror 1800 — gap of ~$24.5k
    priorMonth: -360_000,
    budget: -380_000,
    variancePct: 7.9,
  },
  {
    account: "7400",
    accountName: "FX Gain / (Loss)",
    type: "fx_gain_loss",
    entity: "US-HQ",
    currentMonth: -218_400,
    priorMonth: -42_100,
    budget: -50_000,
    variancePct: 418.8,
  },
  {
    account: "2200",
    accountName: "Accrued Expenses — Marketing",
    type: "accrual",
    entity: "US-HQ",
    currentMonth: 188_400,
    priorMonth: 410_900,
    budget: 380_000,
    variancePct: -50.4,
  },
  {
    account: "2210",
    accountName: "Accrued Expenses — Cloud Infra",
    type: "accrual",
    entity: "US-HQ",
    currentMonth: 612_400,
    priorMonth: 590_100,
    budget: 600_000,
    variancePct: 2.0,
  },
  {
    account: "1400",
    accountName: "Prepaid SaaS Tools",
    type: "prepaid",
    entity: "US-HQ",
    currentMonth: 488_200,
    priorMonth: 322_400,
    budget: 350_000,
    variancePct: 39.5,
  },
];

const reconciliations: ReconciliationItem[] = [
  {
    id: "rec-1",
    source: "Stripe Subscriptions",
    target: "GL — 4000/4010 Revenue",
    expected: 5_424_700,
    actual: 5_412_300,
    difference: -12_400,
    asOf: "2026-04-30",
    notes: "Two failed-then-recovered charges; timing mismatch around month boundary.",
  },
  {
    id: "rec-2",
    source: "JPM Op Acct 4421",
    target: "GL — 1010 Cash",
    expected: 8_212_400,
    actual: 8_212_400,
    difference: 0,
    asOf: "2026-04-30",
  },
  {
    id: "rec-3",
    source: "Brex Corp Cards",
    target: "GL — 2100 AP",
    expected: 142_900,
    actual: 188_220,
    difference: 45_320,
    asOf: "2026-04-30",
    notes: "Unmatched receipts from sales offsite trip — coding incomplete.",
  },
  {
    id: "rec-4",
    source: "Intercompany — EU-NL ↔ US-HQ",
    target: "GL — 1800 / 1801",
    expected: 412_900,
    actual: 388_400,
    difference: -24_500,
    asOf: "2026-04-30",
    notes: "EUR remeasurement timing — booked at different daily rates.",
  },
  {
    id: "rec-5",
    source: "NetSuite Billing — Annual contracts",
    target: "GL — 2300 Deferred Revenue",
    expected: 12_900_400,
    actual: 12_842_300,
    difference: -58_100,
    asOf: "2026-04-30",
    notes: "Three multi-year contracts not yet ratably scheduled.",
  },
  {
    id: "rec-6",
    source: "Carta — Stock-based comp",
    target: "GL — 6800 SBC",
    expected: 412_000,
    actual: 388_400,
    difference: -23_600,
    asOf: "2026-04-30",
    notes: "April grants not yet processed in payroll feed.",
  },
];

const recentJournals: JournalLine[] = [
  {
    id: "je-1041",
    date: "2026-04-29",
    entity: "US-HQ",
    account: "4000",
    accountName: "Subscription Revenue — Annual",
    type: "revenue",
    description: "Annual contract — Vercel Industries (3-yr, $1.2M TCV)",
    debit: 0,
    credit: 1_200_000,
    preparer: "AR Bot",
    reviewed: false,
    flagged: true,
    attachments: 1,
  },
  {
    id: "je-1042",
    date: "2026-04-30",
    entity: "US-HQ",
    account: "2300",
    accountName: "Deferred Revenue — Long Term",
    type: "deferred_revenue",
    description: "Reclassify Vercel Industries — multi-year ratable schedule pending",
    debit: 1_100_000,
    credit: 0,
    preparer: "AR Bot",
    reviewed: false,
    flagged: true,
    attachments: 0,
  },
  {
    id: "je-1043",
    date: "2026-04-30",
    entity: "EU-NL",
    account: "1801",
    accountName: "Intercompany Payable — US-HQ",
    type: "intercompany",
    description: "Monthly IC settlement — services & cost share (April 2026)",
    debit: 388_400,
    credit: 0,
    preparer: "M. de Vries",
    reviewed: false,
    attachments: 1,
  },
  {
    id: "je-1044",
    date: "2026-04-30",
    entity: "US-HQ",
    account: "7400",
    accountName: "FX Gain / (Loss)",
    type: "fx_gain_loss",
    description: "EUR remeasurement — month-end spot 1.0814",
    debit: 0,
    credit: 168_400,
    preparer: "FX Bot",
    reviewed: false,
    attachments: 0,
  },
  {
    id: "je-1045",
    date: "2026-04-30",
    entity: "US-HQ",
    account: "2200",
    accountName: "Accrued Expenses — Marketing",
    type: "accrual",
    description: "Reverse March accrual — Q2 campaign launched late",
    debit: 222_500,
    credit: 0,
    preparer: "C. Park",
    reviewed: true,
    attachments: 2,
  },
];

const tasks: CloseTask[] = [
  {
    id: "ct-1",
    name: "Lock subledgers (AR, AP, FA)",
    owner: "C. Park",
    dueDate: "2026-05-04",
    status: "in_progress",
  },
  {
    id: "ct-2",
    name: "Reconcile intercompany — EU-NL ↔ US-HQ",
    owner: "M. de Vries",
    entity: "EU-NL",
    dueDate: "2026-05-04",
    status: "blocked",
    blocking: ["ct-6"],
  },
  {
    id: "ct-3",
    name: "Revenue cut-off review (annual contracts)",
    owner: "S. Patel",
    dueDate: "2026-05-05",
    status: "in_progress",
  },
  {
    id: "ct-4",
    name: "FX remeasurement — EUR/GBP/SGD",
    owner: "FX Bot",
    dueDate: "2026-05-04",
    status: "review",
  },
  {
    id: "ct-5",
    name: "Marketing accrual schedule",
    owner: "C. Park",
    dueDate: "2026-05-05",
    status: "done",
  },
  {
    id: "ct-6",
    name: "Consolidation + topside entries",
    owner: "S. Patel",
    dueDate: "2026-05-06",
    status: "not_started",
  },
  {
    id: "ct-7",
    name: "Audit PBC — Q1 walkforward refresh",
    owner: "A. Nguyen",
    dueDate: "2026-05-06",
    status: "blocked",
  },
];

export const sampleSnapshot: CompanySnapshot = {
  company: "Lattice Cloud",
  industry: "B2B SaaS — DevOps observability",
  arr: 64_200_000,
  headcount: 312,
  closePeriod: "April 2026",
  closeStartsIn: 2,
  entities,
  balances,
  reconciliations,
  recentJournals,
  tasks,
};

/**
 * Light summary the AI is given so it has a believable handle on the
 * business without us pretending to ship a real ERP.
 */
export function snapshotToBriefing(s: CompanySnapshot): string {
  const recOpen = s.reconciliations.filter((r) => Math.abs(r.difference) > 0);
  const blockedTasks = s.tasks.filter((t) => t.status === "blocked");
  const flaggedJEs = s.recentJournals.filter((j) => j.flagged);

  const lines: string[] = [];
  lines.push(`Company: ${s.company} — ${s.industry}`);
  lines.push(`ARR: $${(s.arr / 1_000_000).toFixed(1)}M | Headcount: ${s.headcount}`);
  lines.push(`Period: ${s.closePeriod} | Close starts in ${s.closeStartsIn} business days`);
  lines.push(`Entities: ${s.entities.map((e) => `${e.code} (${e.baseCurrency})`).join(", ")}`);
  lines.push("");
  lines.push("Trial balance highlights (current vs prior month, % var, vs budget):");
  for (const b of s.balances) {
    lines.push(
      `  • ${b.entity} ${b.account} ${b.accountName} — $${b.currentMonth.toLocaleString()} ` +
        `(prior $${b.priorMonth.toLocaleString()}, var ${b.variancePct.toFixed(1)}%, budget $${b.budget.toLocaleString()})`,
    );
  }
  lines.push("");
  lines.push(`Open reconciliations (${recOpen.length}):`);
  for (const r of recOpen) {
    lines.push(
      `  • ${r.source} → ${r.target}: expected $${r.expected.toLocaleString()}, actual $${r.actual.toLocaleString()}, ` +
        `diff $${r.difference.toLocaleString()}${r.notes ? ` — ${r.notes}` : ""}`,
    );
  }
  lines.push("");
  lines.push(`Flagged journal entries (${flaggedJEs.length}):`);
  for (const j of flaggedJEs) {
    lines.push(
      `  • ${j.id} ${j.date} ${j.entity} ${j.account} ${j.accountName}: ${j.description} ` +
        `(Dr ${j.debit.toLocaleString()} / Cr ${j.credit.toLocaleString()}, reviewed=${!!j.reviewed})`,
    );
  }
  lines.push("");
  lines.push(`Close tasks status: ${s.tasks.length} total, ${blockedTasks.length} blocked.`);
  for (const t of s.tasks) {
    lines.push(`  • ${t.id} ${t.name} — owner ${t.owner}, due ${t.dueDate}, status ${t.status}`);
  }
  return lines.join("\n");
}
