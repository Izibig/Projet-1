import Link from "next/link";
import { Globe } from "lucide-react";

interface SiteCardProps {
  site: {
    id: string;
    name: string;
    url: string;
    lastScan: { score: number | null; violationsCount: number } | null;
  };
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null)
    return (
      <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
        Aucun scan
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

export default function SiteCard({ site }: SiteCardProps) {
  return (
    <Link href={`/sites/${site.id}`} className="group block">
      <div className="h-full rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow group-hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="rounded-lg bg-[#EEF2FF] p-1.5">
              <Globe className="h-3.5 w-3.5 text-[#4F46E5]" />
            </div>
            <p className="truncate font-semibold text-[#111827]">{site.name}</p>
          </div>
          <ScorePill score={site.lastScan?.score ?? null} />
        </div>
        <p className="truncate text-xs text-[#6B7280]">{site.url}</p>
        {site.lastScan && (
          <p className="mt-2 text-xs text-[#9CA3AF]">
            {site.lastScan.violationsCount} violation
            {site.lastScan.violationsCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
