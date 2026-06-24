import { NextResponse } from "next/server";
import { type Impact } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const IMPACT_ORDER: Record<Impact, number> = {
  CRITICAL: 0,
  SERIOUS: 1,
  MODERATE: 2,
  MINOR: 3,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scan = await prisma.scan.findFirst({
    where: { id: scanId, site: { agencyId: user.id } },
    include: { violations: true },
  });
  if (!scan) return NextResponse.json({ error: "Scan introuvable" }, { status: 404 });

  const violations = [...scan.violations].sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );

  return NextResponse.json({ ...scan, violations });
}
