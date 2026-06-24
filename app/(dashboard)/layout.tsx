import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const agency = await prisma.agency.findUnique({ where: { id: user.id } });
  if (!agency) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-card px-4 py-6">
        <div className="mb-6 truncate text-sm font-semibold">{agency.name}</div>
        <nav className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Sites
          </Link>
          <Link
            href="/settings"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Réglages
          </Link>
        </nav>
        <form action={signOutAction}>
          <Button variant="outline" size="sm" className="w-full">
            Déconnexion
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
