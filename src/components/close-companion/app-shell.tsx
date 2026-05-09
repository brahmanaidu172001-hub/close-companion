"use client";

import Link from "next/link";
import { Sparkles, Activity, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn("flex-1", className)}>{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-cc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-sm font-semibold tracking-tight text-white">
            Close Companion
          </span>
          <span className="hidden md:inline text-xs text-muted-foreground border-l border-white/[0.08] pl-2.5 ml-1">
            AI Month-End Close Copilot
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" /> Overview
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <Activity className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span className="ml-2 hidden sm:inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            Live demo
          </span>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] mt-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Logo size={14} />
          <span>Close Companion · A demo proof-of-work for AI-native ERP.</span>
          <span className="text-muted-foreground/70">· Built by B Naidu</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Powered by Claude
          </span>
          <span>·</span>
          <span>Built with Next.js, Tailwind, ShadCN, Framer Motion</span>
        </div>
      </div>
    </footer>
  );
}

export function Logo({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="cc-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9bb9d8" />
          <stop offset="1" stopColor="#345e8d" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#cc-grad)" strokeWidth="1.5" />
      <path
        d="M7 12.5L10.5 16L17 9"
        stroke="url(#cc-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
