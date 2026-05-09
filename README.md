# Close Companion

**An AI Month-End Close Copilot.**
A senior AI controller that quietly watches your books, flags the risks that will actually delay close, and tells you the smallest next action that resolves each one — two business days *before* close week begins.

This repo is a working demo of a feature an AI-native ERP could plausibly ship in months — built end-to-end in a weekend as a proof-of-work for the AI Product Manager role at DualEntry.

---<img width="960" height="472" alt="Screenshot 2026-05-09 134613" src="https://github.com/user-attachments/assets/7f0c3ca4-fd46-4575-8a92-75bfb3eb2424" />


## Why this exists

The core insight DualEntry is built on — that month-end close is collapsing into a continuous, real-time process — has a missing piece. The plumbing can be real-time, but the *thinking* is still concentrated in the controller's head, and it only really happens during close week. That's where the delays come from. Close Companion is the proactive intelligence layer that runs *between* closes:

- **Continuously scans** trial balance, subledger feeds, intercompany pairs, FX exposure, accruals, journal entries, and close-task dependencies.
- **Surfaces 4–7 findings** ordered by severity and dollar exposure — not 200 alerts.
- **Reasons like an operator** — every finding cites the actual JE ID, account, or reconciliation line, names a root-cause hypothesis, and ships with a 5–25 minute next action and an owner.
- **Outputs a single Close Risk Score** with an estimated delay in days. The "are we good for Friday?" question, answered.

The UX is intentionally adjacent to Linear / Vercel / Ramp — fast, dark, monospace where it matters, no accent colors that haven't earned their place.


<img width="959" height="469" alt="Screenshot 2026-05-09 125055" src="https://github.com/user-attachments/assets/ff41f149-b97a-4acf-b2e6-03445fc9d4da" />

---

## Architecture

```
src/
├─ app/
│  ├─ layout.tsx                   # Root layout, theme, fonts
│  ├─ page.tsx                     # Landing page (hero + thesis)
│  ├─ globals.css                  # Theme tokens, glass utilities
│  ├─ dashboard/page.tsx           # Live demo dashboard
│  └─ api/analyze/route.ts         # POST /api/analyze (Claude)
│
├─ components/
│  ├─ ui/                          # ShadCN-style primitives
│  └─ close-companion/             # Product surface
│     ├─ app-shell.tsx
│     ├─ landing-hero.tsx
│     ├─ dashboard.tsx             # Composition root for the demo
│     ├─ analysis-running-overlay.tsx
│     ├─ risk-score.tsx            # Animated risk dial
│     ├─ next-actions-panel.tsx    # Controller summary + top 3 actions
│     ├─ findings-list.tsx         # Expandable finding cards
│     ├─ ledger-overview.tsx       # Trial balance + JE feed
│     ├─ reconciliations-table.tsx
│     └─ tasks-board.tsx
│
└─ lib/
   ├─ types.ts                     # Domain model
   ├─ utils.ts                     # cn(), formatters, date helpers
   ├─ mock-data.ts                 # Realistic SaaS finance dataset
   ├─ prompts.ts                   # System prompt + JSON schema + coercer
   ├─ claude.ts                    # Anthropic SDK wrapper
   └─ fallback-analysis.ts         # Deterministic analyzer (no-key demo)
```

### Data flow

```
[Sample SaaS snapshot]
        │
        ▼
POST /api/analyze
        │
        ├─► If ANTHROPIC_API_KEY set → Claude (structured JSON output)
        │
        └─► Else → fallback-analysis.ts (rules over the same data)
        │
        ▼
[CloseAnalysis JSON]
        │
        ▼
Dashboard renders:
  · Risk dial         · Controller summary
  · Top 3 next steps  · Findings (severity + exposure sorted)
  · Trial balance     · Reconciliations
  · Journal feed      · Close-task board
```

### Why the fallback exists

The demo *cannot* break in front of a hiring panel. If the API key is missing, rate limited, or the model returns malformed JSON, the route silently switches to a deterministic analyzer over the same dataset. The shape of the response is identical — the UI never knows the difference.

---

## Stack

- **Next.js 14** (app router, RSC, Edge-compatible)
- **TypeScript** end to end
- **TailwindCSS** + custom CSS variables for theming
- **ShadCN UI** primitives (only the ones we use, no bloat)
- **Framer Motion** for the dial, list reveals, and overlay animation
- **Anthropic SDK** with `claude-sonnet-4-6` by default
- **Vercel** deployment-ready (`vercel.json`, max duration set, no edge-only deps)

---

## Run locally

```bash
git clone <this repo>
cd close-companion
npm install
cp .env.example .env.local   # add your Anthropic key (optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The dashboard works without an API key — it'll just use the local heuristic analyzer. Add a key to see the live model.

---

## Deploy to Vercel

```bash
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel --prod
```

Or click "Import" on Vercel and point at this repo. The only env var that matters is `ANTHROPIC_API_KEY`.

---

## Product decisions worth calling out

A few choices that I'd defend in an interview:

**1. The risk score is one number.** A controller staring down a Friday close doesn't want a heatmap. They want to know if they're going to make the deadline. Score, trend, estimated delay, total exposure. That's the top of the page.

**2. Findings are bounded at 4–7.** The model is told this in the prompt. More than that and the surface becomes a worklog, not a triage tool. The job of the AI here is to be opinionated.

**3. Every finding has an owner and an estimate.** Findings without an action are just anxiety. The recommended actions are short, named, and time-boxed — designed to fit into the slack a controller actually has on a Tuesday afternoon.

**4. The fallback analyzer was built first.** I wrote the deterministic rules-based analyzer before the Claude path. That forced me to define the data shape and the right *kind* of intelligence the model should produce, instead of letting Claude wander. The model is now constrained to that schema, which is why the output reads operationally rather than like a chatbot.

**5. No file upload in v0.** A real PM-engineer demo with 24 hours of build time and no real customer data would be lying to you with a fake CSV upload. Instead the dataset is a believable SaaS company at scale (5 entities, intercompany pair, FX exposure, multi-year deferred revenue) and the focus stays on the AI behavior, not on plumbing CSV parsing.

**6. The "Auto-resolve top finding" button is intentionally disabled.** This is the next product step — closed-loop remediation. Showing the affordance without faking the action signals where the product goes without overpromising. (DualEntry's bet on AI-native workflows is exactly the right substrate for this; a human-in-the-loop "resolve and post" would be a credible Q+1 feature.)

---

## What I'd ship next (90-day plan)

- **Closed-loop remediation.** "Re-book IC settlement at Apr 30 spot rate on both sides" → one click → drafts the JE pair, attaches the FX rate memo, queues for human review, then posts. This is where AI-native ERP wins.
- **Continuous (not pre-close) mode.** Run on every JE post, not on demand. Slack/email digest each morning. The score becomes a leading indicator the CFO checks at 8am.
- **Multi-period anomaly model.** Replace heuristic variance thresholds with a learned baseline per account per entity — flags shifts that look anomalous against the *company's* history, not generic rules.
- **Audit memo writer.** Each finding already carries evidence + root-cause + actions taken. Turn "Close Risk Findings — April 2026" into a footnote-ready memo with one click. This is the auditor-readable byproduct of the same data.
- **Connector layer.** Read directly from NetSuite / DualEntry / Stripe / Brex via a thin sync layer. The current snapshot type (`CompanySnapshot`) is intentionally shaped to be the projection a connector would emit.

---

## A note on demo polish

The hero panel on the landing page is rendered from primitives, not screenshots — change the dataset and the hero updates. The "Pre-close scan running" pill in the top-left is real (it reads from the live snapshot). Every dollar figure in the demo traces back to a single source-of-truth dataset in `src/lib/mock-data.ts`.

That's the bar.

— Built by Brahma · for DualEntry · May 2026
