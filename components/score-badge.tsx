import { Badge } from "@/components/ui/badge";

export default function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge variant="secondary">Aucun scan</Badge>;
  }

  const className =
    score >= 90
      ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
      : score >= 60
        ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400";

  return <Badge className={className}>{score} / 100</Badge>;
}
