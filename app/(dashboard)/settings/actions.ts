"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function updateBrandingAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const logoUrl = (formData.get("logoUrl") as string).trim();
  const brandColor = (formData.get("brandColor") as string) || "#4f46e5";

  if (logoUrl) {
    try {
      new URL(logoUrl);
    } catch {
      return { error: "URL du logo invalide" };
    }
  }

  await prisma.agency.update({
    where: { id: user.id },
    data: { logoUrl: logoUrl || null, brandColor },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}
