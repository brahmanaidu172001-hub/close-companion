"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanySnapshot, JournalLine } from "@/lib/types";
import { cn, formatCurrency, shortDate } from "@/lib/utils";
import { Flag, ScrollText } from "lucide-react";

export function LedgerOverview({ snapshot }: { snapshot: CompanySnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="p-0">
          <SectionTitle icon={<ScrollText className="h-3.5 w-3.5" />}>
            Trial balance · current period
          </SectionTitle>
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2 text-left font-medium">Account</th>
                  <th className="px-2 py-2 text-right font-medium">Current</th>
                  <th className="px-2 py-2 text-right font-medium">Prior</th>
                  <th className="px-5 py-2 text-right font-medium">Var %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {snapshot.balances.map((b) => {
                  const tone =
                    Math.abs(b.variancePct) >= 30
                      ? "text-orange-400"
                      : Math.abs(b.variancePct) >= 15
                        ? "text-yellow-400"
                        : "text-muted-foreground";
                  return (
                    <tr key={`${b.entity}-${b.account}`} className="hover:bg-white/[0.015]">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {b.entity}
                          </Badge>
                          <div className="min-w-0">
                            <div className="text-sm text-white">{b.accountName}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {b.account}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-white">
                        {formatCurrency(b.currentMonth)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(b.priorMonth)}
                      </td>
                      <td className={cn("px-5 py-2.5 text-right tabular-nums", tone)}>
                        {b.variancePct > 0 ? "+" : ""}
                        {b.variancePct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <SectionTitle icon={<ScrollText className="h-3.5 w-3.5" />}>
            Recent journal entries
          </SectionTitle>
          <ul className="divide-y divide-white/[0.04]">
            {snapshot.recentJournals.map((j) => (
              <JournalRow key={j.id} j={j} />
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function JournalRow({ j }: { j: JournalLine }) {
  return (
    <li className="flex items-start gap-3 px-5 py-3">
      <div className="font-mono text-[11px] text-muted-foreground w-12 shrink-0">{j.id}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-white">{j.description}</span>
          {j.flagged && (
            <Badge variant="critical">
              <Flag className="h-3 w-3" /> Flagged
            </Badge>
          )}
          {!j.reviewed && !j.flagged && (
            <Badge variant="outline" className="text-muted-foreground">
              Pending review
            </Badge>
          )}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {shortDate(j.date)} · {j.entity} · {j.account} {j.accountName} · prepared by{" "}
          {j.preparer ?? "—"}
        </div>
      </div>
      <div className="text-right text-sm tabular-nums">
        {j.debit > 0 && <div className="text-white">Dr {formatCurrency(j.debit)}</div>}
        {j.credit > 0 && (
          <div className="text-muted-foreground">Cr {formatCurrency(j.credit)}</div>
        )}
      </div>
    </li>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {icon}
      {children}
    </div>
  );
}
