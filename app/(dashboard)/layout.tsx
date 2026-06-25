import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/app/(auth)/actions";

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
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[#E5E7EB] bg-white px-3 py-5">
        {/* Logo */}
        <div className="mb-6 px-3">
          <span className="text-lg font-bold tracking-tight text-[#111827]">Clario</span>
        </div>

        {/* Agency name */}
        <div className="mb-4 px-3">
          <p className="truncate text-xs font-medium text-[#6B7280]">{agency.name}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 text-[#6B7280]" />
            Sites
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
          >
            <Settings className="h-4 w-4 shrink-0 text-[#6B7280]" />
            Marque blanche
          </Link>
        </nav>

        {/* Sign out */}
        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
