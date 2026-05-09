"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CloseAnalysis } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface RiskScoreProps {
  analysis: CloseAnalysis;
  loading?: boolean;
}

export function RiskScore({ analysis }: RiskScoreProps) {
  const score = analysis.closeRiskScore;
  const tone =
    score >= 75 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";

  const toneLabel =
    tone === "critical"
      ? "Critical"
      : tone === "high"
        ? "Elevated"
        : tone === "medium"
          ? "Watching"
          : "Healthy";

  const toneColor = {
    critical: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-emerald-400",
  }[tone];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Close Risk Score</CardTitle>
          <TrendBadge trend={analysis.riskTrend} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ScoreDial score={score} tone={tone} />

        <div className="flex items-center justify-between">
          <div className={`text-xs font-medium uppercase tracking-wider ${toneColor}`}>
            {toneLabel}
          </div>
          <div className="text-xs text-muted-foreground">
            {analysis.findings.length} findings
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Metric
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Est. close delay"
            value={`${analysis.estimatedCloseDelayDays.toFixed(1)}d`}
          />
          <Metric
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Total exposure"
            value={formatCurrency(analysis.totalExposure)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreDial({
  score,
  tone,
}: {
  score: number;
  tone: "critical" | "high" | "medium" | "low";
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const stroke = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#22c55e",
  }[tone];

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden>
        <defs>
          <linearGradient id={`grad-${tone}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.9" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={`url(#grad-${tone})`}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-semibold tracking-tight text-white tabular-nums"
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ 100 risk</span>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-base font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: "improving" | "stable" | "deteriorating" }) {
  const map = {
    improving: { v: "success" as const, icon: <ArrowDown className="h-3 w-3" />, label: "Improving" },
    stable: { v: "outline" as const, icon: <Minus className="h-3 w-3" />, label: "Stable" },
    deteriorating: { v: "high" as const, icon: <ArrowUp className="h-3 w-3" />, label: "Worsening" },
  }[trend];
  return (
    <Badge variant={map.v}>
      {map.icon} {map.label}
    </Badge>
  );
}
