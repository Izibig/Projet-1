import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { suggestFix } from "@/lib/ai";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ violationId: string }> }
) {
  const { violationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const violation = await prisma.violation.findFirst({
    where: { id: violationId, scan: { site: { agencyId: user.id } } },
  });
  if (!violation) return NextResponse.json({ error: "Violation introuvable" }, { status: 404 });

  // Idempotent : renvoie sans rappeler l'IA si suggestion déjà générée
  if (violation.aiSuggestion) {
    return NextResponse.json({ aiSuggestion: violation.aiSuggestion });
  }

  const aiSuggestion = await suggestFix({
    ruleId: violation.ruleId,
    description: violation.description,
    htmlSnippet: violation.htmlSnippet,
  });

  await prisma.violation.update({
    where: { id: violation.id },
    data: { aiSuggestion },
  });

  return NextResponse.json({ aiSuggestion });
}
