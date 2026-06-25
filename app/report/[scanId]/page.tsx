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
const IMPACT_TEXT: Record<Impact, string> = {
  CRITICAL: "#991B1B",
  SERIOUS: "#9A3412",
  MODERATE: "#92400E",
  MINOR: "#1E40AF",
};
const IMPACT_BG: Record<Impact, string> = {
  CRITICAL: "#FEE2E2",
  SERIOUS: "#FFEDD5",
  MODERATE: "#FEF3C7",
  MINOR: "#DBEAFE",
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
  const brandColor = agency.brandColor ?? "#4F46E5";
  const violations = [...scan.violations].sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );

  const counts = violations.reduce(
    (acc, v) => {
      acc[v.impact] = (acc[v.impact] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<Impact, number>>
  );

  const scanDate = new Date(scan.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        background: "#ffffff",
        color: "#111827",
        minHeight: "100vh",
      }}
    >
      {/* Header marque blanche */}
      <header style={{ background: brandColor, color: "#ffffff" }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "24px 32px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {agency.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agency.logoUrl}
              alt={agency.name}
              style={{ height: 44, width: "auto", objectFit: "contain" }}
            />
          )}
          <div>
            <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>
              {agency.name}
            </p>
            <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>
              Rapport d&apos;audit d&apos;accessibilité
            </p>
          </div>
        </div>
      </header>

      <main
        style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}
      >
        {/* Titre */}
        <h1
          style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}
        >
          {scan.site.name}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#6B7280",
            margin: "0 0 32px",
          }}
        >
          Scan du {scanDate}&nbsp;·&nbsp;
          <span style={{ color: brandColor }}>{scan.site.url}</span>
        </p>

        {/* Score + compteurs */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: "16px 24px",
              textAlign: "center",
              minWidth: 120,
            }}
          >
            <p
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: brandColor,
                margin: 0,
              }}
            >
              {scan.score ?? "—"}
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#9CA3AF",
                }}
              >
                /100
              </span>
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#6B7280",
                margin: "4px 0 0",
              }}
            >
              Score global
            </p>
          </div>

          {(["CRITICAL", "SERIOUS", "MODERATE", "MINOR"] as Impact[])
            .filter((imp) => counts[imp])
            .map((imp) => (
              <div
                key={imp}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "16px 24px",
                  textAlign: "center",
                  minWidth: 100,
                }}
              >
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: IMPACT_TEXT[imp],
                    margin: 0,
                  }}
                >
                  {counts[imp]}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    margin: "4px 0 0",
                  }}
                >
                  {IMPACT_LABELS[imp]}
                </p>
              </div>
            ))}
        </div>

        {/* Résumé exécutif */}
        <section style={{ marginBottom: 36 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 8,
              color: "#111827",
            }}
          >
            Résumé exécutif
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.7,
              borderLeft: `3px solid ${brandColor}`,
              paddingLeft: 12,
              margin: 0,
            }}
          >
            L&apos;audit automatisé du site <strong>{scan.site.name}</strong>{" "}
            a été réalisé le {scanDate}.
            {scan.score !== null && scan.score >= 90
              ? " Le site présente un excellent niveau d'accessibilité."
              : scan.score !== null && scan.score >= 60
                ? " Des améliorations sont recommandées pour atteindre la pleine conformité RGAA/EAA."
                : " Des violations importantes ont été identifiées. Une mise en conformité est nécessaire."}
            {" "}
            Au total,{" "}
            <strong>
              {violations.length} violation
              {violations.length !== 1 ? "s" : ""}
            </strong>{" "}
            ont été détectées.
          </p>
        </section>

        {/* Tableau violations */}
        {violations.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Aucune violation détectée. Excellent travail !
          </p>
        ) : (
          <section>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#111827",
              }}
            >
              Violations détectées
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                  {["Impact", "Règle", "Description", "Cible", "Statut"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px 8px 0",
                          textAlign: "left",
                          fontSize: 10,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.05em",
                          color: "#9CA3AF",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {violations.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 12px 10px 0" }}>
                      <span
                        style={{
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          color: IMPACT_TEXT[v.impact],
                          background: IMPACT_BG[v.impact],
                        }}
                      >
                        {IMPACT_LABELS[v.impact]}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px 10px 0" }}>
                      <a
                        href={v.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: brandColor,
                          fontSize: 11,
                          textDecoration: "underline",
                        }}
                      >
                        {v.ruleId}
                      </a>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px 10px 0",
                        color: "#374151",
                        maxWidth: 220,
                      }}
                    >
                      {v.description}
                    </td>
                    <td style={{ padding: "10px 12px 10px 0" }}>
                      <code
                        style={{
                          background: "#F3F4F6",
                          borderRadius: 4,
                          padding: "1px 6px",
                          fontSize: 10,
                          color: "#374151",
                        }}
                      >
                        {v.target}
                      </code>
                    </td>
                    <td style={{ padding: "10px 0", color: "#6B7280" }}>
                      {STATUS_LABELS[v.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Footer */}
        <footer
          style={{
            marginTop: 48,
            paddingTop: 16,
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
            Audit réalisé par{" "}
            <strong style={{ color: "#6B7280" }}>{agency.name}</strong>
          </p>
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
            Propulsé par{" "}
            <strong style={{ color: "#4F46E5" }}>Clario</strong> · by STRATA
          </p>
        </footer>
      </main>
    </div>
  );
}
