import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { type Impact } from "@prisma/client";
import { ChevronLeft, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ViolationItem from "@/components/violation-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
const IMPACT_PILL: Record<Impact, string> = {
  CRITICAL: "text-[#991B1B] bg-[#FEE2E2]",
  SERIOUS: "text-[#9A3412] bg-[#FFEDD5]",
  MODERATE: "text-[#92400E] bg-[#FEF3C7]",
  MINOR: "text-[#1E40AF] bg-[#DBEAFE]",
};

function ScoreGauge({ score }: { score: number | null }) {
  const val = score ?? 0;
  const color =
    score === null
      ? "#E5E7EB"
      : val >= 90
        ? "#10B981"
        : val >= 60
          ? "#F59E0B"
          : "#EF4444";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = score !== null ? (val / 100) * circ : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text
          x="70"
          y="66"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill={score !== null ? color : "#D1D5DB"}
        >
          {score ?? "—"}
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="11" fill="#9CA3AF">
          {score !== null ? "/ 100" : "Aucun scan"}
        </text>
      </svg>
    </div>
  );
}

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
    include: { site: { select: { id: true, name: true } }, violations: true },
  });
  if (!scan) notFound();

  const violations = [...scan.violations].sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );

  const grouped = (
    ["CRITICAL", "SERIOUS", "MODERATE", "MINOR"] as Impact[]
  )
    .map((impact) => ({
      impact,
      items: violations.filter((v) => v.impact === impact),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href={`/sites/${scan.site.id}`}
        className="mb-4 flex w-fit items-center gap-1 text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
      >
        <ChevronLeft className="h-4 w-4" />
        {scan.site.name}
      </Link>

      {/* Score header */}
      <div className="mb-8 flex flex-col items-center gap-6 rounded-xl border border-[#E5E7EB] bg-white py-8 shadow-sm sm:flex-row sm:gap-8 sm:px-8">
        <ScoreGauge score={scan.score} />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-[#111827]">
            Résultats du scan
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {scan.violationsCount} violation
            {scan.violationsCount !== 1 ? "s" : ""} détectée
            {scan.violationsCount !== 1 ? "s" : ""}
          </p>
          <Link
            href={`/report/${scanId}`}
            target="_blank"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#4F46E5] px-4 py-2 text-sm font-medium text-[#4F46E5] transition-colors hover:bg-[#EEF2FF]"
          >
            <FileText className="h-4 w-4" />
            Générer le rapport client
          </Link>
        </div>
      </div>

      {/* Violations */}
      {violations.length === 0 ? (
        <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] p-8 text-center">
          <p className="font-semibold text-[#065F46]">
            Aucune violation — score parfait ✓
          </p>
        </div>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={["CRITICAL", "SERIOUS"]}
          className="space-y-3"
        >
          {grouped.map(({ impact, items }) => (
            <AccordionItem
              key={impact}
              value={impact}
              className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
            >
              <AccordionTrigger className="px-5 py-4 hover:bg-[#F9FAFB] hover:no-underline">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${IMPACT_PILL[impact]}`}
                  >
                    {IMPACT_LABELS[impact]}
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    {items.length} violation{items.length > 1 ? "s" : ""}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="divide-y divide-[#F3F4F6] px-0 pb-0">
                {items.map((v) => (
                  <ViolationItem key={v.id} violation={v} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
