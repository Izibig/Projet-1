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

  let aiSuggestion: string;
  try {
    aiSuggestion = await suggestFix({
      ruleId: violation.ruleId,
      description: violation.description,
      htmlSnippet: violation.htmlSnippet,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[suggest] Anthropic error:", message, error);
    return NextResponse.json({ error: "Génération IA échouée", detail: message }, { status: 500 });
  }

  await prisma.violation.update({
    where: { id: violation.id },
    data: { aiSuggestion },
  });

  return NextResponse.json({ aiSuggestion });
}
