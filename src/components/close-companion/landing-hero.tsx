"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            Pre-close scan running on Lattice Cloud · April 2026
            <Sparkles className="h-3 w-3 text-cc-300" />
          </div>

          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            <span className="text-gradient">Close the books</span>
            <br />
            before the books close you.
          </h1>

          <p className="mt-6 text-balance text-lg leading-relaxed text-muted-foreground">
            Close Companion is an AI controller that quietly watches your
            ledger, flags the risks that will actually delay close, and tells
            you the smallest next action that resolves each one — two days
            before close week begins.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                See the live close <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="#how">Read the thinking</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <HeroPanel />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Mini "fake screenshot" panel that telegraphs the product without
 * the user clicking through. Built from primitives — no images.
 */
function HeroPanel() {
  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-cc-950/80 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)_inset]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-red-500/60" />
          <span className="h-2 w-2 rounded-full bg-yellow-500/60" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
          <span className="ml-3 font-mono text-[11px]">close-companion · /dashboard</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
          April 2026 · 2 business days to close
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        {/* Risk score */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Close Risk Score
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight text-white">68</span>
            <span className="mb-1 text-xs text-orange-400">/ 100 · Elevated</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-orange-500" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Trending <span className="text-orange-400">deteriorating</span> · est. +1.5d delay
          </div>
        </div>

        {/* Findings */}
        <div className="md:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Top findings
            </span>
            <span className="text-[10px] text-muted-foreground">7 flagged · ordered by severity</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <FindingRow
              tone="critical"
              title="Annual contract not yet on ratable schedule"
              meta="$1.1M · US-HQ · ASC 606"
            />
            <FindingRow
              tone="high"
              title="Intercompany pair out by $24.5K on EUR timing"
              meta="US-HQ ↔ EU-NL · blocks consolidation"
            />
            <FindingRow
              tone="high"
              title="FX loss 4× prior — concentrated in EUR"
              meta="$218K · hedging gap from Q1"
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

function FindingRow({
  tone,
  title,
  meta,
}: {
  tone: "critical" | "high" | "medium";
  title: string;
  meta: string;
}) {
  const dot =
    tone === "critical"
      ? "bg-red-500"
      : tone === "high"
        ? "bg-orange-500"
        : "bg-yellow-500";
  return (
    <li className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
      </div>
    </li>
  );
}
