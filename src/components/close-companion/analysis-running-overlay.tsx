"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Pulling subledger snapshots...",
  "Reconciling Stripe → GL revenue boundary...",
  "Checking intercompany pair balances (US-HQ ↔ EU-NL)...",
  "Remeasuring EUR / GBP / SGD exposures...",
  "Scanning unposted journals for cut-off risks...",
  "Composing controller summary...",
];

export function AnalysisRunningOverlay() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-cc-500/30"
          />
          <Sparkles className="relative h-5 w-5 text-cc-300" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">Close Companion is scanning your books</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Running pre-close risk model · usually 2-6 seconds
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-2 font-mono text-xs text-muted-foreground">
        {STEPS.map((s, i) => (
          <motion.li
            key={s}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.45, duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-cc-300/70" />
            {s}
          </motion.li>
        ))}
      </ul>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-cc-400/60 to-transparent"
        />
      </div>
    </div>
  );
}
