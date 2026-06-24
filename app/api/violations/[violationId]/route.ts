import { NextResponse } from "next/server";
import { type ViolationStatus } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES: ViolationStatus[] = ["OPEN", "FIXED", "IGNORED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ violationId: string }> }
) {
  const { violationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const violation = await prisma.violation.findFirst({
    where: { id: violationId, scan: { site: { agencyId: user.id } } },
  });
  if (!violation) return NextResponse.json({ error: "Violation introuvable" }, { status: 404 });

  const updated = await prisma.violation.update({
    where: { id: violation.id },
    data: { status },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}
