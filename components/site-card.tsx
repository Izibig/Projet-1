import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreBadge from "./score-badge";

interface SiteCardProps {
  site: {
    id: string;
    name: string;
    url: string;
    lastScan: { score: number | null } | null;
  };
}

export default function SiteCard({ site }: SiteCardProps) {
  return (
    <Link href={`/sites/${site.id}`} className="block">
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="truncate text-base">{site.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="truncate text-xs text-muted-foreground">{site.url}</p>
          <ScoreBadge score={site.lastScan?.score ?? null} />
        </CardContent>
      </Card>
    </Link>
  );
}
