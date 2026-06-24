import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getAgency() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.agency.findUnique({ where: { id: user.id } });
}

export async function GET() {
  const agency = await getAgency();
  if (!agency) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sites = await prisma.site.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: "asc" },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { score: true, createdAt: true, status: true },
      },
    },
  });

  return NextResponse.json(
    sites.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      lastScan: s.scans[0] ?? null,
    }))
  );
}

export async function POST(request: Request) {
  const agency = await getAgency();
  if (!agency) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, url } = await request.json();

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  const site = await prisma.site.create({
    data: { agencyId: agency.id, name, url },
  });

  return NextResponse.json({ id: site.id, name: site.name, url: site.url }, { status: 201 });
}
