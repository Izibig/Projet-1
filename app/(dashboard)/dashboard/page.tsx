import { redirect } from "next/navigation";
import { Globe, AlertTriangle, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import SiteCard from "@/components/site-card";
import AddSiteDialog from "./add-site-dialog";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sites = await prisma.site.findMany({
    where: { agencyId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { score: true, violationsCount: true },
      },
    },
  });

  const data = sites.map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    lastScan: s.scans[0] ?? null,
  }));

  // Métriques
  const scoresWithValues = data.filter((s) => s.lastScan?.score != null);
  const avgScore =
    scoresWithValues.length > 0
      ? Math.round(
          scoresWithValues.reduce(
            (sum, s) => sum + (s.lastScan!.score ?? 0),
            0
          ) / scoresWithValues.length
        )
      : null;

  const totalViolations = data.reduce(
    (sum, s) => sum + (s.lastScan?.violationsCount ?? 0),
    0
  );

  const metrics = [
    {
      label: "Sites suivis",
      value: String(data.length),
      icon: <Globe className="h-4 w-4" />,
      color: "text-[#4F46E5]",
      bg: "bg-[#EEF2FF]",
    },
    {
      label: "Score moyen",
      value: avgScore !== null ? `${avgScore}/100` : "—",
      icon: <BarChart2 className="h-4 w-4" />,
      color:
        avgScore == null
          ? "text-[#9CA3AF]"
          : avgScore >= 90
            ? "text-[#10B981]"
            : avgScore >= 60
              ? "text-[#F59E0B]"
              : "text-[#EF4444]",
      bg:
        avgScore == null
          ? "bg-[#F3F4F6]"
          : avgScore >= 90
            ? "bg-[#D1FAE5]"
            : avgScore >= 60
              ? "bg-[#FEF3C7]"
              : "bg-[#FEE2E2]",
    },
    {
      label: "Violations totales",
      value: String(totalViolations),
      icon: <AlertTriangle className="h-4 w-4" />,
      color: totalViolations > 0 ? "text-[#EF4444]" : "text-[#10B981]",
      bg: totalViolations > 0 ? "bg-[#FEE2E2]" : "bg-[#D1FAE5]",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Tableau de bord</h1>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Vue d&apos;ensemble de votre parc de sites
          </p>
        </div>
        <AddSiteDialog />
      </div>

      {/* Métriques */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">{m.label}</p>
              <div className={`rounded-lg p-2 ${m.bg} ${m.color}`}>
                {m.icon}
              </div>
            </div>
            <p className={`mt-3 text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Sites */}
      <h2 className="mb-4 text-base font-semibold text-[#111827]">Mes sites</h2>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#D1D5DB] bg-white py-24 text-center">
          <Globe className="h-8 w-8 text-[#D1D5DB]" />
          <p className="font-medium text-[#111827]">Aucun site pour l&apos;instant</p>
          <p className="text-sm text-[#6B7280]">
            Ajoutez votre premier site pour lancer un scan.
          </p>
          <AddSiteDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
