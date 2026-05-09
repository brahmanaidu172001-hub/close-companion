"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Building2,
  Clock,
  DollarSign,
  Target,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CloseAnalysis, Entity, EntityCode, RiskFinding } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

interface FindingsListProps {
  analysis: CloseAnalysis;
  entitiesByCode: Record<string, Entity>;
}

const CATEGORY_LABELS: Record<RiskFinding["category"], string> = {
  revenue_recognition: "Revenue recognition",
  reconciliation: "Reconciliation",
  intercompany: "Intercompany",
  fx: "FX",
  accrual: "Accrual",
  audit_documentation: "Audit doc",
  controls: "Controls",
  anomaly: "Anomaly",
  deadline: "Deadline",
};

export function FindingsList({ analysis, entitiesByCode }: FindingsListProps) {
  // Sort by severity desc, then exposure desc
  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const findings = [...analysis.findings].sort((a, b) => {
    const s = sevOrder[a.severity] - sevOrder[b.severity];
    if (s !== 0) return s;
    return b.exposureAmount - a.exposureAmount;
  });

  const [openId, setOpenId] = useState<string | null>(findings[0]?.id ?? null);

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-white/[0.05]">
          {findings.map((f, idx) => (
            <FindingRow
              key={f.id}
              finding={f}
              entitiesByCode={entitiesByCode}
              isOpen={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              index={idx}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function FindingRow({
  finding,
  entitiesByCode,
  isOpen,
  onToggle,
  index,
}: {
  finding: RiskFinding;
  entitiesByCode: Record<string, Entity>;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <li>
      <motion.button
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4 }}
        onClick={onToggle}
        className={cn(
          "flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]",
          isOpen && "bg-white/[0.02]",
        )}
      >
        <SeverityChip severity={finding.severity} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">{finding.title}</span>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {CATEGORY_LABELS[finding.category]}
            </Badge>
            {finding.affectedEntities.map((c) => (
              <Badge key={c} variant="secondary" className="font-normal">
                <Building2 className="h-3 w-3" />
                {entitiesByCode[c]?.code ?? c}
              </Badge>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(finding.exposureAmount)} exposure
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {finding.estimatedDelayDays === 0
                ? "no delay"
                : `${finding.estimatedDelayDays.toFixed(2).replace(/\.?0+$/, "")}d delay`}
            </span>
            <ConfidenceBar confidence={finding.confidence} />
          </div>
        </div>
        <ChevronRight
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-90 text-white",
          )}
        />
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-5 px-5 pb-5 md:grid-cols-2">
              <div>
                <SectionHeader icon={<Target className="h-3.5 w-3.5" />} label="Root cause hypothesis" />
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {finding.rootCauseHypothesis}
                </p>

                {finding.evidence.length > 0 && (
                  <>
                    <SectionHeader
                      className="mt-5"
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      label="Evidence"
                    />
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {finding.evidence.map((e, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-cc-300/60" />
                          <span className="leading-relaxed">{e}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div>
                <SectionHeader
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Recommended actions"
                />
                <ol className="mt-2 space-y-2">
                  {finding.recommendedActions.map((a, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-medium text-white">{a.label}</div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          ~{a.estMinutes}m
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">Owner: {a.owner}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function SeverityChip({ severity }: { severity: RiskFinding["severity"] }) {
  const colors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-emerald-500",
  };
  const ring = {
    critical: "ring-red-500/25",
    high: "ring-orange-500/25",
    medium: "ring-yellow-500/25",
    low: "ring-emerald-500/25",
  };
  return (
    <span
      className={cn(
        "mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ring-4",
        colors[severity],
        ring[severity],
      )}
    />
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]">
      <span className="relative inline-block h-1 w-12 overflow-hidden rounded-full bg-white/[0.08]">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-cc-300/80"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="tabular-nums text-muted-foreground">{pct}%</span>
    </span>
  );
}

function SectionHeader({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {icon}
      {label}
    </div>
  );
}

// Re-export for type safety in dashboard
export type { EntityCode };
