import { NextResponse } from "next/server";
import { analyzeClose } from "@/lib/claude";
import { sampleSnapshot } from "@/lib/mock-data";
import type { CompanySnapshot } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze
 *
 * Body: { snapshot?: CompanySnapshot }
 * Returns the typed CloseAnalysis plus metadata about how it was generated.
 *
 * If no body is supplied, we run against the bundled sample snapshot.
 */
export async function POST(req: Request) {
  let snapshot: CompanySnapshot = sampleSnapshot;

  try {
    if (req.headers.get("content-length") && req.headers.get("content-length") !== "0") {
      const body = await req.json();
      if (body && typeof body === "object" && body.snapshot) {
        snapshot = body.snapshot as CompanySnapshot;
      }
    }
  } catch {
    // If body parsing fails, fall back to sample. Demo must never break.
  }

  const result = await analyzeClose(snapshot);

  return NextResponse.json({
    ok: true,
    source: result.source,
    latencyMs: result.latencyMs,
    analysis: result.analysis,
  });
}

/** Convenience GET so visiting the URL in a browser still works. */
export async function GET() {
  const result = await analyzeClose(sampleSnapshot);
  return NextResponse.json({
    ok: true,
    source: result.source,
    latencyMs: result.latencyMs,
    analysis: result.analysis,
  });
}
