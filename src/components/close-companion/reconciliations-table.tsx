"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanySnapshot } from "@/lib/types";
import { cn, formatCurrency, shortDate } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function ReconciliationsTable({ snapshot }: { snapshot: CompanySnapshot }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b border-white/[0.06] px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Reconciliations · {snapshot.reconciliations.length} sources
        </div>
        <ul className="divide-y divide-white/[0.04]">
          {snapshot.reconciliations.map((r) => {
            const matched = r.difference === 0;
            return (
              <li key={r.id} className="flex items-start gap-4 px-5 py-4">
                <span
                  className={cn(
                    "mt-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md ring-1",
                    matched
                      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                      : "bg-orange-500/10 text-orange-400 ring-orange-500/20",
                  )}
                >
                  {matched ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-white">{r.source}</span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-sm text-muted-foreground">{r.target}</span>
                    {!matched && (
                      <Badge variant="high">
                        Δ {formatCurrency(Math.abs(r.difference))}
                      </Badge>
                    )}
                  </div>
                  {r.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>Expected: {formatCurrency(r.expected)}</span>
                    <span>Actual: {formatCurrency(r.actual)}</span>
                    <span>As of {shortDate(r.asOf)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
