import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Gauge,
  Network,
  Workflow,
  Brain,
} from "lucide-react";
import { AppShell } from "@/components/close-companion/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingHero } from "@/components/close-companion/landing-hero";

export default function LandingPage() {
  return (
    <AppShell>
      <LandingHero />

      <Section
        eyebrow="The problem"
        title="Close week is firefighting, not finance."
        body="Controllers spend the first five business days of every month chasing reconciliations, hunting cut-off issues, and reverse-engineering what the books are trying to say. By the time anyone looks at the numbers, the close is already late."
      />

      <Section
        eyebrow="The shift"
        title="An AI controller, always on, two days early."
        body="Close Companion runs continuously against the same data your team works in — subledgers, journals, intercompany, FX, accruals — and surfaces the few risks that will actually delay the close. With reasoning. With dollar exposure. With the next concrete action."
      >
        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          <FeatureCard
            icon={<Brain className="h-4 w-4" />}
            title="Proactive risk detection"
            body="Anomaly + accounting-aware checks across rev rec, accruals, intercompany, FX, and audit prep — not just rules."
          />
          <FeatureCard
            icon={<Gauge className="h-4 w-4" />}
            title="A single risk score"
            body="One number, one trend, one estimated delay. The CFO question — 'are we good for Friday?' — answered."
          />
          <FeatureCard
            icon={<Workflow className="h-4 w-4" />}
            title="Operational, not advisory"
            body="Each finding ships with an owner, a 5–25 minute next action, and the dollar exposure if you skip it."
          />
          <FeatureCard
            icon={<Network className="h-4 w-4" />}
            title="Multi-entity native"
            body="Built for SaaS companies running US, EU, UK, APAC books with intercompany pairs and FX remeasurement."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Audit-ready by default"
            body="Each flag carries evidence, root-cause hypothesis, and a confidence score. Your audit memo writes itself."
          />
          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Built on Claude"
            body="Reasoning is structured, not hallucinated. Every claim cites the journal, account, or reconciliation line that backs it."
          />
        </div>
      </Section>

      <Section
        eyebrow="The bet"
        title="Real-time close needs real-time risk."
        body="If month-end is collapsing into a continuous close, the controller's brain has to as well. Close Companion is the proactive intelligence layer for AI-native ERP — not another dashboard, not another assistant. A second pair of eyes that never blinks."
      >
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Open the live demo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Badge variant="outline" className="text-muted-foreground">
            Live data · Live AI · No login required
          </Badge>
        </div>
      </Section>
    </AppShell>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
          {eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
      </div>
      {children}
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]">
      <div className="flex items-center gap-2 text-cc-300">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-cc-500/10 text-cc-300 ring-1 ring-cc-500/20">
          {icon}
        </span>
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
