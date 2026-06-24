import { notFound } from "next/navigation";
import { type Impact, type ViolationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const IMPACT_ORDER: Record<Impact, number> = {
  CRITICAL: 0,
  SERIOUS: 1,
  MODERATE: 2,
  MINOR: 3,
};

const IMPACT_LABELS: Record<Impact, string> = {
  CRITICAL: "Critique",
  SERIOUS: "Sérieux",
  MODERATE: "Modéré",
  MINOR: "Mineur",
};

const IMPACT_COLORS: Record<Impact, string> = {
  CRITICAL: "#dc2626",
  SERIOUS: "#ea580c",
  MODERATE: "#d97706",
  MINOR: "#2563eb",
};

const STATUS_LABELS: Record<ViolationStatus, string> = {
  OPEN: "Ouvert",
  FIXED: "Corrigé",
  IGNORED: "Ignoré",
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      violations: true,
      site: {
        include: {
          agency: {
            select: { name: true, logoUrl: true, brandColor: true },
          },
        },
      },
    },
  });

  if (!scan) notFound();

  const { agency } = scan.site;
  const violations = [...scan.violations].sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );

  const counts = violations.reduce(
    (acc, v) => { acc[v.impact] = (acc[v.impact] ?? 0) + 1; return acc; },
    {} as Partial<Record<Impact, number>>
  );

  const scanDate = new Date(scan.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* En-tête marque blanche */}
      <header
        style={{ backgroundColor: agency.brandColor }}
        className="px-8 py-6 text-white print:px-6 print:py-4"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          {agency.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agency.logoUrl}
              alt={agency.name}
              className="h-12 w-auto object-contain"
            />
          )}
          <div>
            <p className="text-lg font-bold">{agency.name}</p>
            <p className="text-sm opacity-80">Rapport d&apos;accessibilité web</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-8 print:px-6">
        {/* Résumé */}
        <section className="mb-8">
          <h1 className="mb-1 text-2xl font-bold">{scan.site.name}</h1>
          <p className="mb-4 text-sm text-gray-500">
            Scan du {scanDate} · {scan.site.url}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: agency.brandColor }}>
                {scan.score ?? "—"}
                <span className="text-lg font-normal text-gray-400">/100</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">Score global</p>
            </div>

            {(["CRITICAL", "SERIOUS", "MODERATE", "MINOR"] as Impact[])
              .filter((imp) => counts[imp])
              .map((imp) => (
                <div key={imp} className="rounded-lg border p-4 text-center">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: IMPACT_COLORS[imp] }}
                  >
                    {counts[imp]}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{IMPACT_LABELS[imp]}</p>
                </div>
              ))}
          </div>
        </section>

        {/* Tableau des violations */}
        {violations.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune violation détectée. Excellent travail !</p>
        ) : (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Violations détectées</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4">Impact</th>
                  <th className="pb-2 pr-4">Règle</th>
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4">Cible CSS</th>
                  <th className="pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {violations.map((v) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <span
                        className="rounded px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: IMPACT_COLORS[v.impact] }}
                      >
                        {IMPACT_LABELS[v.impact]}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <a
                        href={v.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                        style={{ color: agency.brandColor }}
                      >
                        {v.ruleId}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-700">{v.description}</td>
                    <td className="py-3 pr-4">
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                        {v.target}
                      </code>
                    </td>
                    <td className="py-3 text-xs">{STATUS_LABELS[v.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <footer className="mt-12 border-t pt-4 text-center text-xs text-gray-400 print:mt-8">
          Rapport généré par {agency.name} · Le Gardien d&apos;Accessibilité
        </footer>
      </main>
    </div>
  );
}
