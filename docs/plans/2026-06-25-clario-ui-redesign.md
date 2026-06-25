# Clario UI Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refonte complète de l'UI/UX de l'app "Le Gardien d'Accessibilité" renommée "Clario" — design sobre et professionnel inspiré Linear/Vercel, sans toucher à la logique métier.

**Architecture:** Mise à jour des CSS variables globales (design tokens), réécriture des pages et composants en gardant toute la logique existante intacte. Ajout de l'accordion shadcn pour les violations groupées par sévérité.

**Tech Stack:** Next.js App Router, shadcn/ui v4, Tailwind CSS v4, Geist (installé), Lucide React, oklch color space

---

## Design tokens de référence

```
Primary:       #4F46E5  (indigo-600)  → oklch(0.511 0.237 264)
Primary hover: #3730A3  (indigo-800)  → oklch(0.386 0.191 264)
Background:    #F9FAFB  → oklch(0.98 0 0)
Card:          #FFFFFF  → oklch(1 0 0)
Border:        #E5E7EB  → oklch(0.922 0 0)
Foreground:    #111827  → oklch(0.145 0 0)
Muted fg:      #6B7280  → oklch(0.499 0 0)
Success:       #10B981  → oklch(0.696 0.17 162)
Warning:       #F59E0B  → oklch(0.768 0.165 70)
Danger:        #EF4444  → oklch(0.627 0.239 29)
```

---

## Task 1 — Ajouter accordion shadcn + mettre à jour le design token global

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `components/ui/accordion.tsx`

**Step 1 — Installer le composant accordion**

```bash
cd /Users/eliott/Desktop/Projet-1
npx shadcn@latest add accordion --yes
```

**Step 2 — Modifier `app/globals.css`**

Remplacer les variables `:root` pour adopter la palette Clario. Changer uniquement la section `:root { ... }` et laisser le reste intact :

```css
:root {
    --background: oklch(0.98 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.511 0.237 264);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.961 0.013 264);
    --secondary-foreground: oklch(0.386 0.191 264);
    --muted: oklch(0.961 0.005 264);
    --muted-foreground: oklch(0.499 0 0);
    --accent: oklch(0.956 0.018 264);
    --accent-foreground: oklch(0.386 0.191 264);
    --destructive: oklch(0.627 0.239 29);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.511 0.237 264);
    --radius: 0.5rem;
}
```

**Step 3 — Modifier `app/layout.tsx`**

Changer le titre et la description :

```tsx
export const metadata: Metadata = {
  title: "Clario — Audits d'accessibilité web",
  description: "Auditez, corrigez et rapportez l'accessibilité de vos sites clients avec l'IA.",
};
```

**Step 4 — Commit**

```bash
git add app/globals.css app/layout.tsx components/ui/accordion.tsx
git commit -m "feat: add Clario design tokens and accordion component"
```

---

## Task 2 — Landing page publique (`app/page.tsx`)

**Files:**
- Rewrite: `app/page.tsx`

**Step 1 — Réécrire `app/page.tsx` entièrement**

```tsx
import Link from "next/link";
import { ArrowRight, CheckCircle, Globe, Zap, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold tracking-tight text-[#111827]">
          Clario
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            Connexion
          </Link>
          <Link href="/signup">
            <Button size="sm">Commencer gratuitement</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E0E0FF] bg-[#F0F0FF] px-3 py-1 text-xs font-medium text-[#4F46E5]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Conforme RGAA &amp; EAA
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-[#111827]">
          L'accessibilité web,<br />
          <span className="text-[#4F46E5]">sans l'effort.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-[#6B7280]">
          Clario scanne les sites de vos clients, détecte les violations RGAA/EAA
          et génère des rapports marque blanche en un clic. Avec corrections IA incluses.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Se connecter
            </Button>
          </Link>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-[#111827]">
          Comment ça marche
        </h2>
        <p className="mb-12 text-center text-sm text-[#6B7280]">
          De l'audit à la correction en trois étapes.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: <Globe className="h-5 w-5 text-[#4F46E5]" />,
              title: "Ajoutez un site",
              desc: "Renseignez l'URL du site de votre client. Clario le prend en charge immédiatement.",
            },
            {
              n: "02",
              icon: <Zap className="h-5 w-5 text-[#4F46E5]" />,
              title: "Lancez un scan",
              desc: "Notre moteur analyse chaque page et détecte les violations RGAA/EAA en quelques secondes.",
            },
            {
              n: "03",
              icon: <FileText className="h-5 w-5 text-[#4F46E5]" />,
              title: "Recevez les corrections",
              desc: "L'IA propose des corrections HTML/CSS prêtes à l'emploi. Générez le rapport client en un clic.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#4F46E5] opacity-60">{step.n}</span>
                <div className="rounded-lg bg-[#F0F0FF] p-2">{step.icon}</div>
              </div>
              <h3 className="mb-2 font-semibold text-[#111827]">{step.title}</h3>
              <p className="text-sm text-[#6B7280]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bénéfices */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-[#111827]">
          Conçu pour les agences web
        </h2>
        <p className="mb-12 text-center text-sm text-[#6B7280]">
          Gérez l'accessibilité de tout votre parc client depuis un seul tableau de bord.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Conformité RGAA & EAA", desc: "Couverture complète des référentiels européens en vigueur." },
            { title: "Rapports marque blanche", desc: "Rapports PDF à votre charte graphique, prêts à envoyer au client." },
            { title: "Corrections IA", desc: "Suggestions de code HTML/CSS générées automatiquement pour chaque violation." },
            { title: "Tableau de bord unifié", desc: "Tous vos sites, leurs scores et leurs violations au même endroit." },
            { title: "Historique des scans", desc: "Suivez l'évolution de l'accessibilité dans le temps." },
            { title: "Multi-clients", desc: "Gérez autant de sites que nécessaire sans limite." },
          ].map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
            >
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
              <div>
                <p className="mb-0.5 text-sm font-semibold text-[#111827]">{b.title}</p>
                <p className="text-xs text-[#6B7280]">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <blockquote className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <p className="mb-4 text-lg font-medium text-[#111827]">
            &ldquo;Clario nous a permis de passer nos audits d'accessibilité de 2 jours à 20 minutes.
            Nos clients reçoivent un rapport professionnel le jour même.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-sm font-bold">
              ML
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#111827]">Marie Lefebvre</p>
              <p className="text-xs text-[#6B7280]">Directrice, Agence Pixel &amp; Co</p>
            </div>
          </div>
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
          {["Agence Nord", "Studio Marseille", "Digital Sud", "Web Est"].map((n) => (
            <span key={n} className="text-xs font-semibold uppercase tracking-widest text-[#111827]">{n}</span>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="mb-3 text-3xl font-bold text-[#111827]">
          Prêt à simplifier vos audits ?
        </h2>
        <p className="mb-8 text-[#6B7280]">
          Rejoignez les agences qui font confiance à Clario pour leurs audits d'accessibilité.
        </p>
        <Link href="/signup">
          <Button size="lg" className="gap-2">
            Commencer gratuitement <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-sm font-bold text-[#111827]">Clario</span>
          <span className="text-xs text-[#6B7280]">by STRATA</span>
        </div>
      </footer>
    </div>
  );
}
```

**Step 2 — Commit**

```bash
git add app/page.tsx
git commit -m "feat: Clario landing page — hero, étapes, bénéfices, social proof"
```

---

## Task 3 — Pages auth (login + signup)

**Files:**
- Rewrite: `app/(auth)/login/page.tsx`
- Rewrite: `app/(auth)/signup/page.tsx`

**Step 1 — Réécrire login page**

Garder toute la logique `useActionState`, `signInAction`, `useFormStatus`. Changer uniquement le JSX :

```tsx
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Connexion…" : "Se connecter"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(signInAction, null);

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
        <h1 className="mb-6 text-xl font-semibold text-[#111827]">Connexion</h1>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <SubmitButton />
        </form>
        <p className="mt-5 text-center text-sm text-[#6B7280]">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-[#4F46E5] hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 2 — Réécrire signup page**

Garder toute la logique `signUpAction`. Changer uniquement le JSX :

```tsx
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
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required />
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
```

**Step 3 — Commit**

```bash
git add "app/(auth)/login/page.tsx" "app/(auth)/signup/page.tsx"
git commit -m "feat: Clario auth pages — login et signup rebranding"
```

---

## Task 4 — Dashboard layout (sidebar)

**Files:**
- Rewrite: `app/(dashboard)/layout.tsx`

**Step 1 — Réécrire le layout**

Garder toute la logique auth (`createClient`, `prisma.agency.findUnique`, redirect). Changer uniquement le JSX de la sidebar :

```tsx
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
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 text-[#6B7280]" />
            Sites
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            <Settings className="h-4 w-4 shrink-0 text-[#6B7280]" />
            Marque blanche
          </Link>
        </nav>

        {/* Sign out */}
        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
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
```

**Step 2 — Commit**

```bash
git add "app/(dashboard)/layout.tsx"
git commit -m "feat: Clario sidebar layout — nav icons, Clario branding"
```

---

## Task 5 — Dashboard page (métriques + grille)

**Files:**
- Rewrite: `app/(dashboard)/dashboard/page.tsx`
- Rewrite: `components/site-card.tsx`

**Step 1 — Modifier la query dans `dashboard/page.tsx`**

Ajouter les métriques agrégées (score moyen, violations critiques) tout en gardant la logique existante :

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import SiteCard from "@/components/site-card";
import AddSiteDialog from "./add-site-dialog";
import { Globe, AlertTriangle, BarChart2 } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sites = await prisma.site.findMany({
    where: { agencyId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { score: true, violationsCount: true },
      },
    },
  });

  const data = sites.map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    lastScan: s.scans[0] ?? null,
  }));

  // Métriques
  const scoresWithValues = data.filter((s) => s.lastScan?.score != null);
  const avgScore =
    scoresWithValues.length > 0
      ? Math.round(
          scoresWithValues.reduce((sum, s) => sum + (s.lastScan!.score ?? 0), 0) /
            scoresWithValues.length
        )
      : null;

  const criticalViolations = data.reduce(
    (sum, s) => sum + (s.lastScan?.violationsCount ?? 0),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Tableau de bord</h1>
          <p className="mt-0.5 text-sm text-[#6B7280]">Vue d&apos;ensemble de votre parc de sites</p>
        </div>
        <AddSiteDialog />
      </div>

      {/* Métriques */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          {
            label: "Sites suivis",
            value: data.length,
            icon: <Globe className="h-4 w-4" />,
            color: "text-[#4F46E5]",
            bg: "bg-[#F0F0FF]",
          },
          {
            label: "Score moyen",
            value: avgScore !== null ? `${avgScore}/100` : "—",
            icon: <BarChart2 className="h-4 w-4" />,
            color: avgScore != null && avgScore >= 90
              ? "text-[#10B981]"
              : avgScore != null && avgScore >= 60
              ? "text-[#F59E0B]"
              : "text-[#EF4444]",
            bg: avgScore != null && avgScore >= 90
              ? "bg-[#D1FAE5]"
              : avgScore != null && avgScore >= 60
              ? "bg-[#FEF3C7]"
              : "bg-[#FEE2E2]",
          },
          {
            label: "Violations totales",
            value: criticalViolations,
            icon: <AlertTriangle className="h-4 w-4" />,
            color: criticalViolations > 0 ? "text-[#EF4444]" : "text-[#10B981]",
            bg: criticalViolations > 0 ? "bg-[#FEE2E2]" : "bg-[#D1FAE5]",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">{metric.label}</p>
              <div className={`rounded-lg p-2 ${metric.bg} ${metric.color}`}>
                {metric.icon}
              </div>
            </div>
            <p className={`mt-3 text-2xl font-bold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Sites */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111827]">Mes sites</h2>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#D1D5DB] bg-white py-24 text-center">
          <Globe className="h-8 w-8 text-[#D1D5DB]" />
          <p className="font-medium text-[#111827]">Aucun site pour l&apos;instant</p>
          <p className="text-sm text-[#6B7280]">Ajoutez votre premier site pour lancer un scan.</p>
          <AddSiteDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2 — Réécrire `components/site-card.tsx`**

```tsx
import Link from "next/link";
import { Globe } from "lucide-react";

interface SiteCardProps {
  site: {
    id: string;
    name: string;
    url: string;
    lastScan: { score: number | null; violationsCount: number } | null;
  };
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
        Aucun scan
      </span>
    );
  }
  const color =
    score >= 90
      ? "bg-[#D1FAE5] text-[#065F46]"
      : score >= 60
      ? "bg-[#FEF3C7] text-[#92400E]"
      : "bg-[#FEE2E2] text-[#991B1B]";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

export default function SiteCard({ site }: SiteCardProps) {
  return (
    <Link href={`/sites/${site.id}`} className="block group">
      <div className="h-full rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow group-hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-lg bg-[#F0F0FF] p-1.5">
              <Globe className="h-3.5 w-3.5 text-[#4F46E5]" />
            </div>
            <p className="truncate font-semibold text-[#111827]">{site.name}</p>
          </div>
          <ScorePill score={site.lastScan?.score ?? null} />
        </div>
        <p className="truncate text-xs text-[#6B7280]">{site.url}</p>
        {site.lastScan && (
          <p className="mt-2 text-xs text-[#9CA3AF]">
            {site.lastScan.violationsCount} violation{site.lastScan.violationsCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
```

**Step 3 — Commit**

```bash
git add "app/(dashboard)/dashboard/page.tsx" components/site-card.tsx
git commit -m "feat: dashboard metrics cards + site card redesign"
```

---

## Task 6 — Page site (historique des scans)

**Files:**
- Rewrite: `app/(dashboard)/sites/[siteId]/page.tsx`

**Step 1 — Réécrire la page**

Garder toute la logique Prisma et auth. Changer uniquement le JSX :

```tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ScanLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ScanButton from "@/components/scan-button";

function ScorePill({ score }: { score: number | null }) {
  if (score === null)
    return <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">—</span>;
  const color =
    score >= 90 ? "bg-[#D1FAE5] text-[#065F46]" :
    score >= 60 ? "bg-[#FEF3C7] text-[#92400E]" :
    "bg-[#FEE2E2] text-[#991B1B]";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{score}/100</span>;
}

export default async function SitePage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const site = await prisma.site.findFirst({
    where: { id: siteId, agencyId: user.id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        select: { id: true, score: true, status: true, violationsCount: true, createdAt: true },
      },
    },
  });
  if (!site) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/dashboard" className="mb-4 flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors w-fit">
        <ChevronLeft className="h-4 w-4" />
        Mes sites
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{site.name}</h1>
          <p className="mt-0.5 text-sm text-[#6B7280]">{site.url}</p>
        </div>
        <ScanButton siteId={site.id} />
      </div>

      {/* Scan history */}
      <h2 className="mb-3 text-base font-semibold text-[#111827]">Historique des scans</h2>

      {site.scans.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#D1D5DB] bg-white py-16 text-center">
          <ScanLine className="h-7 w-7 text-[#D1D5DB]" />
          <p className="text-sm text-[#6B7280]">Aucun scan pour ce site. Lancez votre premier scan.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          {site.scans.map((scan, i) => (
            <Link key={scan.id} href={`/scans/${scan.id}`} className="block group">
              <div className={`flex items-center gap-4 px-5 py-4 transition-colors group-hover:bg-[#F9FAFB] ${i !== 0 ? "border-t border-[#E5E7EB]" : ""}`}>
                <ScorePill score={scan.score} />
                <span className="text-sm text-[#374151]">
                  {scan.violationsCount} violation{scan.violationsCount !== 1 ? "s" : ""}
                </span>
                <span className="ml-auto text-xs text-[#9CA3AF]">
                  {new Date(scan.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <ChevronLeft className="h-4 w-4 rotate-180 text-[#D1D5DB] transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2 — Commit**

```bash
git add "app/(dashboard)/sites/[siteId]/page.tsx"
git commit -m "feat: site page — breadcrumb, scan history table"
```

---

## Task 7 — Page résultats de scan (score + violations groupées)

**Files:**
- Rewrite: `app/(dashboard)/scans/[scanId]/page.tsx`
- Rewrite: `components/violation-item.tsx`

**Step 1 — Réécrire `scans/[scanId]/page.tsx`**

Garder toute la logique Prisma, auth, IMPACT_ORDER. Ajouter le groupement par sévérité et le score gauge SVG :

```tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { type Impact } from "@prisma/client";
import { ChevronLeft, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ViolationItem from "@/components/violation-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const IMPACT_ORDER: Record<Impact, number> = { CRITICAL: 0, SERIOUS: 1, MODERATE: 2, MINOR: 3 };
const IMPACT_LABELS: Record<Impact, string> = { CRITICAL: "Critique", SERIOUS: "Sérieux", MODERATE: "Modéré", MINOR: "Mineur" };
const IMPACT_COLORS: Record<Impact, string> = {
  CRITICAL: "text-[#EF4444] bg-[#FEE2E2]",
  SERIOUS: "text-[#EA580C] bg-[#FFEDD5]",
  MODERATE: "text-[#D97706] bg-[#FEF3C7]",
  MINOR: "text-[#2563EB] bg-[#DBEAFE]",
};

function ScoreGauge({ score }: { score: number | null }) {
  const val = score ?? 0;
  const color = val >= 90 ? "#10B981" : val >= 60 ? "#F59E0B" : "#EF4444";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (val / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={score !== null ? color : "#E5E7EB"}
          strokeWidth="10"
          strokeDasharray={`${score !== null ? dash : 0} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="700" fill={score !== null ? color : "#D1D5DB"}>
          {score ?? "—"}
        </text>
        <text x="70" y="82" textAnchor="middle" fontSize="11" fill="#9CA3AF">
          {score !== null ? "/ 100" : "Aucun scan"}
        </text>
      </svg>
    </div>
  );
}

export default async function ScanPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scan = await prisma.scan.findFirst({
    where: { id: scanId, site: { agencyId: user.id } },
    include: { site: { select: { id: true, name: true } }, violations: true },
  });
  if (!scan) notFound();

  const violations = [...scan.violations].sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );

  const grouped = (["CRITICAL", "SERIOUS", "MODERATE", "MINOR"] as Impact[]).map((impact) => ({
    impact,
    items: violations.filter((v) => v.impact === impact),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Breadcrumb */}
      <Link href={`/sites/${scan.site.id}`} className="mb-4 flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors w-fit">
        <ChevronLeft className="h-4 w-4" />
        {scan.site.name}
      </Link>

      {/* Score header */}
      <div className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white py-8 shadow-sm sm:flex-row sm:gap-8 sm:px-8">
        <ScoreGauge score={scan.score} />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-[#111827]">Résultats du scan</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {scan.violationsCount} violation{scan.violationsCount !== 1 ? "s" : ""} détectée{scan.violationsCount !== 1 ? "s" : ""}
          </p>
          <Link
            href={`/report/${scanId}`}
            target="_blank"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#4F46E5] px-4 py-2 text-sm font-medium text-[#4F46E5] hover:bg-[#F0F0FF] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Générer le rapport client
          </Link>
        </div>
      </div>

      {/* Violations */}
      {violations.length === 0 ? (
        <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] p-8 text-center">
          <p className="font-semibold text-[#065F46]">Aucune violation — score parfait ✓</p>
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={["CRITICAL", "SERIOUS"]} className="space-y-3">
          {grouped.map(({ impact, items }) => (
            <AccordionItem
              key={impact}
              value={impact}
              className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-[#F9FAFB]">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${IMPACT_COLORS[impact]}`}>
                    {IMPACT_LABELS[impact]}
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    {items.length} violation{items.length > 1 ? "s" : ""}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="divide-y divide-[#F3F4F6] px-0 pb-0">
                {items.map((v) => (
                  <ViolationItem key={v.id} violation={v} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
```

**Step 2 — Réécrire `components/violation-item.tsx`**

Garder toute la logique (`generateSuggestion`, `updateStatus`, state, fetch). Changer uniquement le JSX :

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { type Impact, type ViolationStatus } from "@prisma/client";
import { Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMPACT_DOT: Record<Impact, string> = {
  CRITICAL: "bg-[#EF4444]",
  SERIOUS: "bg-[#EA580C]",
  MODERATE: "bg-[#F59E0B]",
  MINOR: "bg-[#3B82F6]",
};

interface ViolationItemProps {
  violation: {
    id: string;
    ruleId: string;
    impact: Impact;
    description: string;
    helpUrl: string;
    htmlSnippet: string;
    target: string;
    aiSuggestion: string | null;
    status: ViolationStatus;
  };
}

export default function ViolationItem({ violation }: ViolationItemProps) {
  const [suggestion, setSuggestion] = useState(violation.aiSuggestion);
  const [status, setStatus] = useState(violation.status);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  async function generateSuggestion() {
    setLoadingSuggestion(true);
    try {
      const res = await fetch(`/api/violations/${violation.id}/suggest`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Erreur");
      setSuggestion(data.aiSuggestion);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoadingSuggestion(false);
    }
  }

  async function updateStatus(newStatus: ViolationStatus) {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/violations/${violation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur");
      setStatus(newStatus);
    } catch {
      toast.error("Impossible de mettre à jour le statut");
    } finally {
      setLoadingStatus(false);
    }
  }

  return (
    <div className="px-5 py-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${IMPACT_DOT[violation.impact]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[#111827]">{violation.description}</p>
              <a
                href={violation.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"
              >
                {violation.ruleId}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <select
              value={status}
              disabled={loadingStatus}
              onChange={(e) => updateStatus(e.target.value as ViolationStatus)}
              className="shrink-0 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="OPEN">Ouvert</option>
              <option value="FIXED">Corrigé</option>
              <option value="IGNORED">Ignoré</option>
            </select>
          </div>

          {/* Code snippet */}
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#374151] border border-[#E5E7EB]">
            <code>{violation.htmlSnippet}</code>
          </pre>

          {/* AI suggestion */}
          {suggestion ? (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-[#6B7280]">Correction suggérée par l&apos;IA :</p>
              <pre className="overflow-x-auto rounded-lg bg-[#F0FDF4] px-3 py-2.5 text-xs text-[#065F46] border border-[#BBF7D0]">
                <code>{suggestion}</code>
              </pre>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={loadingSuggestion}
              onClick={generateSuggestion}
              className="mt-3 h-8 gap-1.5 text-xs border-[#E5E7EB] text-[#374151] hover:border-[#4F46E5] hover:text-[#4F46E5]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {loadingSuggestion ? "Génération…" : "Générer la correction IA"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 3 — Commit**

```bash
git add "app/(dashboard)/scans/[scanId]/page.tsx" components/violation-item.tsx
git commit -m "feat: scan page — score gauge SVG, violations en accordéons par sévérité"
```

---

## Task 8 — Rapport marque blanche (`app/report/[scanId]/page.tsx`)

**Files:**
- Rewrite: `app/report/[scanId]/page.tsx`

**Step 1 — Réécrire la page**

Garder toute la logique Prisma (scan, violations, agency). Améliorer uniquement le design print-ready :

```tsx
import { notFound } from "next/navigation";
import { type Impact, type ViolationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const IMPACT_ORDER: Record<Impact, number> = { CRITICAL: 0, SERIOUS: 1, MODERATE: 2, MINOR: 3 };
const IMPACT_LABELS: Record<Impact, string> = { CRITICAL: "Critique", SERIOUS: "Sérieux", MODERATE: "Modéré", MINOR: "Mineur" };
const IMPACT_BG: Record<Impact, string> = {
  CRITICAL: "background:#FEE2E2;color:#991B1B",
  SERIOUS:  "background:#FFEDD5;color:#9A3412",
  MODERATE: "background:#FEF3C7;color:#92400E",
  MINOR:    "background:#DBEAFE;color:#1E40AF",
};
const STATUS_LABELS: Record<ViolationStatus, string> = { OPEN: "Ouvert", FIXED: "Corrigé", IGNORED: "Ignoré" };

export default async function ReportPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      violations: true,
      site: {
        include: {
          agency: { select: { name: true, logoUrl: true, brandColor: true } },
        },
      },
    },
  });
  if (!scan) notFound();

  const { agency } = scan.site;
  const brandColor = agency.brandColor ?? "#4F46E5";
  const violations = [...scan.violations].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);

  const counts = violations.reduce((acc, v) => {
    acc[v.impact] = (acc[v.impact] ?? 0) + 1;
    return acc;
  }, {} as Partial<Record<Impact, number>>);

  const scanDate = new Date(scan.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif", background: "#fff", color: "#111827", minHeight: "100vh" }}>
      {/* Header marque blanche */}
      <header style={{ background: brandColor, color: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 32px", display: "flex", alignItems: "center", gap: 16 }}>
          {agency.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agency.logoUrl} alt={agency.name} style={{ height: 44, width: "auto", objectFit: "contain" }} />
          )}
          <div>
            <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{agency.name}</p>
            <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Rapport d&apos;audit d&apos;accessibilité</p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}>
        {/* Titre */}
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>{scan.site.name}</h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 32px" }}>
          Scan du {scanDate} &nbsp;·&nbsp; <span style={{ color: brandColor }}>{scan.site.url}</span>
        </p>

        {/* Score + compteurs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
          <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 24px", textAlign: "center", minWidth: 120 }}>
            <p style={{ fontSize: 36, fontWeight: 800, color: brandColor, margin: 0 }}>
              {scan.score ?? "—"}
              <span style={{ fontSize: 16, fontWeight: 400, color: "#9CA3AF" }}>/100</span>
            </p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "4px 0 0" }}>Score global</p>
          </div>
          {(["CRITICAL", "SERIOUS", "MODERATE", "MINOR"] as Impact[])
            .filter((imp) => counts[imp])
            .map((imp) => (
              <div key={imp} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 24px", textAlign: "center", minWidth: 100 }}>
                <p style={{ fontSize: 30, fontWeight: 700, color: imp === "CRITICAL" ? "#EF4444" : imp === "SERIOUS" ? "#EA580C" : imp === "MODERATE" ? "#F59E0B" : "#3B82F6", margin: 0 }}>
                  {counts[imp]}
                </p>
                <p style={{ fontSize: 11, color: "#6B7280", margin: "4px 0 0" }}>{IMPACT_LABELS[imp]}</p>
              </div>
            ))}
        </div>

        {/* Résumé exécutif */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#111827" }}>Résumé exécutif</h2>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, borderLeft: `3px solid ${brandColor}`, paddingLeft: 12 }}>
            L&apos;audit automatisé du site <strong>{scan.site.name}</strong> a été réalisé le {scanDate}.
            {scan.score !== null && scan.score >= 90 && " Le site présente un excellent niveau d'accessibilité."}
            {scan.score !== null && scan.score >= 60 && scan.score < 90 && " Des améliorations sont recommandées pour atteindre la conformité RGAA/EAA."}
            {(scan.score === null || scan.score < 60) && " Des violations importantes ont été détectées. Une mise en conformité est nécessaire."}
            {" "}Au total, <strong>{violations.length} violation{violations.length !== 1 ? "s" : ""}</strong> ont été identifiées.
          </p>
        </section>

        {/* Tableau violations */}
        {violations.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6B7280" }}>Aucune violation détectée.</p>
        ) : (
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#111827" }}>Violations détectées</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                  {["Impact", "Règle", "Description", "Cible", "Statut"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px 8px 0", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {violations.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 12px 10px 0" }}>
                      <span style={{ borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, ...Object.fromEntries(IMPACT_BG[v.impact].split(";").map(s => s.split(":"))) }}>
                        {IMPACT_LABELS[v.impact]}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px 10px 0" }}>
                      <a href={v.helpUrl} target="_blank" rel="noopener noreferrer" style={{ color: brandColor, fontSize: 11, textDecoration: "underline" }}>
                        {v.ruleId}
                      </a>
                    </td>
                    <td style={{ padding: "10px 12px 10px 0", color: "#374151", maxWidth: 220 }}>{v.description}</td>
                    <td style={{ padding: "10px 12px 10px 0" }}>
                      <code style={{ background: "#F3F4F6", borderRadius: 4, padding: "1px 6px", fontSize: 10, color: "#374151" }}>{v.target}</code>
                    </td>
                    <td style={{ padding: "10px 0", color: "#6B7280" }}>{STATUS_LABELS[v.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Footer */}
        <footer style={{ marginTop: 48, paddingTop: 16, borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
            Audit réalisé par <strong style={{ color: "#6B7280" }}>{agency.name}</strong>
          </p>
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
            Propulsé par <strong style={{ color: "#4F46E5" }}>Clario</strong> · by STRATA
          </p>
        </footer>
      </main>
    </div>
  );
}
```

**Step 2 — Commit**

```bash
git add "app/report/[scanId]/page.tsx"
git commit -m "feat: rapport marque blanche — print-ready, résumé exécutif, footer STRATA/Clario"
```

---

## Task 9 — Push final

```bash
git push
```
