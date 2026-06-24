import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ScanButton from "@/components/scan-button";
import ScoreBadge from "@/components/score-badge";

export default async function SitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const site = await prisma.site.findFirst({
    where: { id: siteId, agencyId: user.id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          score: true,
          status: true,
          violationsCount: true,
          createdAt: true,
        },
      },
    },
  });
  if (!site) notFound();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Mes sites
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{site.name}</h1>
          <p className="text-sm text-muted-foreground">{site.url}</p>
        </div>
        <ScanButton siteId={site.id} />
      </div>

      <h2 className="mb-3 text-lg font-medium">Historique des scans</h2>

      {site.scans.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun scan pour ce site. Lancez votre premier scan.
        </p>
      ) : (
        <div className="space-y-2">
          {site.scans.map((scan) => (
            <Link key={scan.id} href={`/scans/${scan.id}`} className="block">
              <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50">
                <ScoreBadge score={scan.score} />
                <span className="text-sm text-muted-foreground">
                  {scan.violationsCount} violation
                  {scan.violationsCount !== 1 ? "s" : ""}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(scan.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
