import { NextResponse } from "next/server";
import { type Impact } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { runScan } from "@/lib/scanner";
import { computeScore } from "@/lib/score";

export const runtime = "nodejs";
export const maxDuration = 60;

const IMPACT_MAP: Record<string, Impact> = {
  critical: "CRITICAL",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await request.json();

  const site = await prisma.site.findFirst({
    where: { id: siteId, agencyId: user.id },
  });
  if (!site) return NextResponse.json({ error: "Site introuvable" }, { status: 404 });

  const scan = await prisma.scan.create({
    data: { siteId: site.id, status: "RUNNING" },
  });

  try {
    const results = await runScan(site.url);

    const violationsData = results.violations.flatMap((v) => {
      const impact = v.impact ? IMPACT_MAP[v.impact] : null;
      if (!impact) return [];
      return v.nodes.map((node) => ({
        scanId: scan.id,
        ruleId: v.id,
        impact,
        description: v.help,
        helpUrl: v.helpUrl,
        htmlSnippet: node.html,
        target: node.target
          .map((t) => (Array.isArray(t) ? t.join(" ") : t))
          .join(", "),
      }));
    });

    await prisma.violation.createMany({ data: violationsData });

    const score = computeScore(violationsData);

    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "DONE",
        score,
        violationsCount: violationsData.length,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      scanId: scan.id,
      score,
      violationsCount: violationsData.length,
    });
  } catch (error) {
    await prisma.scan.update({
      where: { id: scan.id },
      data: { status: "ERROR" },
    });
    const message = error instanceof Error ? error.message : String(error);
    console.error("[scans] Scan error:", message, error);
    return NextResponse.json({ error: "Scan échoué", detail: message }, { status: 500 });
  }
}
