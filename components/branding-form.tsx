"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBrandingAction } from "@/app/(dashboard)/settings/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sauvegarde…" : "Sauvegarder"}
    </Button>
  );
}

interface BrandingFormProps {
  logoUrl: string | null;
  brandColor: string;
}

export default function BrandingForm({ logoUrl, brandColor }: BrandingFormProps) {
  const [state, action] = useActionState(updateBrandingAction, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) toast.success("Marque blanche mise à jour !");
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="logoUrl">URL du logo</Label>
        <Input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={logoUrl ?? ""}
          placeholder="https://example.com/logo.png"
        />
        <p className="text-xs text-muted-foreground">
          Affiché en en-tête des rapports clients.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="brandColor">Couleur de marque</Label>
        <div className="flex items-center gap-3">
          <input
            id="brandColor"
            name="brandColor"
            type="color"
            defaultValue={brandColor}
            className="h-10 w-14 cursor-pointer rounded border bg-background p-1"
          />
          <p className="text-xs text-muted-foreground">
            Utilisée dans l&apos;en-tête des rapports marque blanche.
          </p>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
