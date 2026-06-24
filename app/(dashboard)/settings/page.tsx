import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import BrandingForm from "@/components/branding-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const agency = await prisma.agency.findUnique({ where: { id: user.id } });
  if (!agency) redirect("/login");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Marque blanche</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Logo et couleur affichés dans les rapports partagés avec vos clients.
      </p>
      <div className="max-w-md">
        <BrandingForm logoUrl={agency.logoUrl} brandColor={agency.brandColor} />
      </div>
    </div>
  );
}
