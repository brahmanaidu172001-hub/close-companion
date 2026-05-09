"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CloseTask, CompanySnapshot } from "@/lib/types";
import { cn, shortDate } from "@/lib/utils";

const COLUMNS: { status: CloseTask["status"]; label: string }[] = [
  { status: "not_started", label: "Not started" },
  { status: "in_progress", label: "In progress" },
  { status: "blocked", label: "Blocked" },
  { status: "review", label: "In review" },
  { status: "done", label: "Done" },
];

export function TasksBoard({ snapshot }: { snapshot: CompanySnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {COLUMNS.map((col) => {
        const tasks = snapshot.tasks.filter((t) => t.status === col.status);
        return (
          <Card key={col.status} className="min-h-[180px]">
            <CardContent className="p-3">
              <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ColumnDot status={col.status} />
                  {col.label}
                </span>
                <span>{tasks.length}</span>
              </div>
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TaskCard({ task }: { task: CloseTask }) {
  return (
    <li className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="text-sm text-white">{task.name}</div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{task.owner}</span>
        <span>{shortDate(task.dueDate)}</span>
      </div>
      {task.entity && (
        <Badge variant="secondary" className="mt-2 font-mono text-[10px]">
          {task.entity}
        </Badge>
      )}
    </li>
  );
}

function ColumnDot({ status }: { status: CloseTask["status"] }) {
  const map = {
    not_started: "bg-white/30",
    in_progress: "bg-cc-300",
    blocked: "bg-red-400",
    review: "bg-yellow-400",
    done: "bg-emerald-400",
  };
  return <span className={cn("h-1.5 w-1.5 rounded-full", map[status])} />;
}
