import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
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
        select: { score: true },
      },
    },
  });

  const data = sites.map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    lastScan: s.scans[0] ? { score: s.scans[0].score } : null,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes sites</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4" />
            Marque blanche
          </Link>
          <AddSiteDialog />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
          <p className="text-lg font-medium text-foreground">Aucun site</p>
          <p className="text-sm">Ajoutez votre premier site pour lancer un scan.</p>
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
