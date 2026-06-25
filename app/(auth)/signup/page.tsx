"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Inscription…" : "Créer mon compte"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, action] = useActionState(signUpAction, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4">
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold tracking-tight text-[#111827]">Clario</span>
        <p className="mt-1 text-sm text-[#6B7280]">Audits d&apos;accessibilité web</p>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-[#111827]">Créer un compte</h1>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de l&apos;agence</Label>
            <Input id="name" name="name" type="text" autoComplete="organization" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <SubmitButton />
        </form>
        <p className="mt-5 text-center text-sm text-[#6B7280]">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-[#4F46E5] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
