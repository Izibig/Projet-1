import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { type Impact } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ScoreBadge from "@/components/score-badge";
import ViolationItem from "@/components/violation-item";

const IMPACT_ORDER: Record<Impact, number> = {
  CRITICAL: 0,
  SERIOUS: 1,
  MODERATE: 2,
  MINOR: 3,
};

export default async function ScanPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scan = await prisma.scan.findFirst({
    where: { id: scanId, site: { agencyId: user.id } },
    include: {
      site: { select: { id: true, name: true } },
      violations: true,
    },
  });
  if (!scan) notFound();

  const violations = [...scan.violations].sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/sites/${scan.site.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {scan.site.name}
        </Link>
        <div className="mt-1 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold">Résultats du scan</h1>
          <ScoreBadge score={scan.score} />
          <Link
            href={`/report/${scanId}`}
            target="_blank"
            className="ml-auto text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Voir le rapport client →
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          {scan.violationsCount} violation{scan.violationsCount !== 1 ? "s" : ""} détectée
          {scan.violationsCount !== 1 ? "s" : ""}
        </p>
      </div>

      {violations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune violation détectée. Excellent score !
        </p>
      ) : (
        <div className="space-y-4">
          {violations.map((v) => (
            <ViolationItem key={v.id} violation={v} />
          ))}
        </div>
      )}
    </div>
  );
}
