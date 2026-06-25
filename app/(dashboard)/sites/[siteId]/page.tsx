import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ScanLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ScanButton from "@/components/scan-button";

function ScorePill({ score }: { score: number | null }) {
  if (score === null)
    return (
      <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
        —
      </span>
    );
  const color =
    score >= 90
      ? "bg-[#D1FAE5] text-[#065F46]"
      : score >= 60
        ? "bg-[#FEF3C7] text-[#92400E]"
        : "bg-[#FEE2E2] text-[#991B1B]";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

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
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="mb-4 flex w-fit items-center gap-1 text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
      >
        <ChevronLeft className="h-4 w-4" />
        Mes sites
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{site.name}</h1>
          <p className="mt-0.5 text-sm text-[#6B7280]">{site.url}</p>
        </div>
        <ScanButton siteId={site.id} />
      </div>

      {/* Scan history */}
      <h2 className="mb-3 text-base font-semibold text-[#111827]">
        Historique des scans
      </h2>

      {site.scans.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#D1D5DB] bg-white py-16 text-center">
          <ScanLine className="h-7 w-7 text-[#D1D5DB]" />
          <p className="text-sm text-[#6B7280]">
            Aucun scan pour ce site. Lancez votre premier scan.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          {site.scans.map((scan, i) => (
            <Link key={scan.id} href={`/scans/${scan.id}`} className="group block">
              <div
                className={`flex items-center gap-4 px-5 py-4 transition-colors group-hover:bg-[#F9FAFB] ${
                  i !== 0 ? "border-t border-[#E5E7EB]" : ""
                }`}
              >
                <ScorePill score={scan.score} />
                <span className="text-sm text-[#374151]">
                  {scan.violationsCount} violation
                  {scan.violationsCount !== 1 ? "s" : ""}
                </span>
                <span className="ml-auto text-xs text-[#9CA3AF]">
                  {new Date(scan.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <ChevronLeft className="h-4 w-4 rotate-180 text-[#D1D5DB] transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
