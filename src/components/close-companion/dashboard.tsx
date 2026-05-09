"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Building2,
  CalendarDays,
  Users,
  RefreshCw,
  Loader2,
  Zap,
} from "lucide-react";
import type { CloseAnalysis, CompanySnapshot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RiskScore } from "./risk-score";
import { FindingsList } from "./findings-list";
import { NextActionsPanel } from "./next-actions-panel";
import { LedgerOverview } from "./ledger-overview";
import { ReconciliationsTable } from "./reconciliations-table";
import { TasksBoard } from "./tasks-board";
import { AnalysisRunningOverlay } from "./analysis-running-overlay";

interface AnalyzeResponse {
  ok: true;
  source: "claude" | "fallback";
  latencyMs: number;
  analysis: CloseAnalysis;
}

interface DashboardProps {
  snapshot: CompanySnapshot;
}

export function Dashboard({ snapshot }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<CloseAnalysis | null>(null);
  const [source, setSource] = useState<"claude" | "fallback" | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot }),
      });
      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);
      const data = (await res.json()) as AnalyzeResponse;
      setAnalysis(data.analysis);
      setSource(data.source);
      setLatency(data.latencyMs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <DashboardHeader
          snapshot={snapshot}
          source={source}
          latency={latency}
          loading={loading}
          onRefresh={runAnalysis}
        />

        <AnimatePresence>
          {loading && !analysis && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10"
            >
              <AnalysisRunningOverlay />
            </motion.div>
          )}
        </AnimatePresence>

        {analysis && <DashboardBody snapshot={snapshot} analysis={analysis} loading={loading} />}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function DashboardHeader({
  snapshot,
  source,
  latency,
  loading,
  onRefresh,
}: {
  snapshot: CompanySnapshot;
  source: "claude" | "fallback" | null;
  latency: number | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>{snapshot.company}</span>
          <span>·</span>
          <span>{snapshot.industry}</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Pre-close scan · <span className="text-gradient">{snapshot.closePeriod}</span>
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Close starts in {snapshot.closeStartsIn} business days
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {snapshot.headcount} employees · ARR $
            {(snapshot.arr / 1_000_000).toFixed(1)}M
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> {snapshot.entities.length} entities
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {source && (
          <Badge variant={source === "claude" ? "info" : "outline"}>
            <Sparkles className="h-3 w-3" />
            {source === "claude" ? "Claude analysis" : "Local heuristic analysis"}
            {latency != null && (
              <span className="ml-1 text-muted-foreground">· {Math.round(latency)}ms</span>
            )}
          </Badge>
        )}
        <Button onClick={onRefresh} disabled={loading} variant="outline" size="sm">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Re-run scan
        </Button>
        <Button size="sm" disabled>
          <Zap className="h-3.5 w-3.5" /> Auto-resolve top finding
        </Button>
      </div>
    </div>
  );
}

function DashboardBody({
  snapshot,
  analysis,
  loading,
}: {
  snapshot: CompanySnapshot;
  analysis: CloseAnalysis;
  loading: boolean;
}) {
  // Memoize entity lookup so badges read nicely
  const entitiesByCode = useMemo(
    () => Object.fromEntries(snapshot.entities.map((e) => [e.code, e])),
    [snapshot.entities],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <div className="lg:col-span-1">
        <RiskScore analysis={analysis} loading={loading} />
      </div>

      <div className="lg:col-span-2">
        <NextActionsPanel actions={analysis.nextActions} headline={analysis.headline} summary={analysis.summary} />
      </div>

      <div className="lg:col-span-3">
        <Tabs defaultValue="findings">
          <TabsList>
            <TabsTrigger value="findings">
              Findings ({analysis.findings.length})
            </TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
            <TabsTrigger value="recs">Reconciliations</TabsTrigger>
            <TabsTrigger value="tasks">Close tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="findings">
            <FindingsList analysis={analysis} entitiesByCode={entitiesByCode} />
          </TabsContent>

          <TabsContent value="ledger">
            <LedgerOverview snapshot={snapshot} />
          </TabsContent>

          <TabsContent value="recs">
            <ReconciliationsTable snapshot={snapshot} />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksBoard snapshot={snapshot} />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
