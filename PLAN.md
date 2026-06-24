# Le Gardien d'Accessibilité — Plan d'architecture & feuille de route (MVP)

> Document de pilotage destiné à **Claude Code (CLI)**.
> Convention d'usage : dis simplement *« Exécute l'Étape N du PLAN.md »*. Chaque étape est autonome et liste les fichiers à créer/modifier + un prompt prêt à l'emploi.

---

## 0. Reformulation du projet

**Le Gardien d'Accessibilité** est un SaaS B2B mono-tenant par agence. Une agence web s'inscrit, déclare son **parc de sites clients** (10–50 URLs), lance des **scans d'accessibilité** (moteur `axe-core` exécuté dans un Chrome headless serverless), puis obtient pour chaque erreur une **suggestion de correction en code (copier-coller)** générée par IA à la demande. Elle peut enfin exporter un **rapport en marque blanche** (logo + couleur de l'agence) pour son client final, et l'historique des scans + statuts de correction sert de **preuve de bonne foi** (RGAA / EAA / ADA).

**Périmètre MVP volontairement restreint** : pas de cron de re-scan automatique, pas de gestion d'équipe multi-utilisateurs, pas de paiement Stripe. Ce sont les premiers candidats au post-MVP (section 7).

### Pile technique arrêtée
| Couche | Choix | Raison |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | SSR + Route Handlers natifs |
| UI | Tailwind + shadcn/ui | Composants accessibles par défaut (cohérent avec le produit) |
| DB | Supabase (Postgres managé) | Postgres + **Auth incluse** → économise ~300 lignes |
| ORM | Prisma | Migrations versionnées + types, idéal pour Claude Code |
| Scan | `puppeteer-core` + `@sparticuz/chromium` + `@axe-core/puppeteer` | Seule combinaison fiable pour Chrome headless sur Vercel |
| IA | `@anthropic-ai/sdk` | Suggestions de code, appel à la demande (lazy) |
| Hébergement | Vercel | Functions serverless + déploiement Git |

### ⚠️ 3 contraintes d'architecte à intégrer dès maintenant
1. **L'objectif « < 1000 lignes »** vise *ton code métier* (lib, routes, pages). Les composants `shadcn/ui` générés, la config et le `schema.prisma` ne sont pas comptés — sinon c'est irréaliste avec auth + scan + rapports.
2. **Chrome headless sur Vercel est lourd** : cold start ~2–4 s, et le scan synchrone peut dépasser le timeout. Le MVP fait un **scan synchrone avec `maxDuration = 60`** (nécessite un plan Vercel Pro). Chemin d'évolution : passer en scan asynchrone (job + polling de statut) — déjà prévu par le champ `Scan.status`.
3. **Supabase Auth + Prisma** cohabitent via une table `Agency` dont l'`id` = l'`id` de l'utilisateur `auth.users`. On ne touche jamais au schéma `auth` avec Prisma : on le reflète seulement.

---

## 1. Architecture des dossiers (App Router)

```
le-gardien/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # shell protégé (sidebar + header agence)
│   │   ├── dashboard/page.tsx         # vue parc de sites + score global
│   │   ├── sites/[siteId]/page.tsx    # détail site + historique des scans
│   │   └── scans/[scanId]/page.tsx    # résultats d'un scan + liste violations
│   ├── report/[scanId]/page.tsx       # rapport PUBLIC en marque blanche
│   ├── api/
│   │   ├── sites/route.ts             # GET (liste) + POST (créer)
│   │   ├── scans/route.ts             # POST (lancer un scan)
│   │   ├── scans/[scanId]/route.ts    # GET (résultats)
│   │   └── violations/[violationId]/
│   │       ├── route.ts               # PATCH (statut: FIXED/IGNORED)
│   │       └── suggest/route.ts       # POST (génère la correction IA)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                            # shadcn (généré)
│   ├── site-card.tsx
│   ├── scan-button.tsx
│   ├── score-badge.tsx
│   ├── violation-item.tsx
│   └── branding-form.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # client navigateur
│   │   └── server.ts                  # client serveur (cookies)
│   ├── prisma.ts                      # singleton PrismaClient
│   ├── scanner.ts                     # Chrome headless + axe-core
│   ├── ai.ts                          # appel Anthropic
│   ├── score.ts                       # calcul du score d'accessibilité
│   └── utils.ts                       # cn() shadcn
├── prisma/
│   └── schema.prisma
├── middleware.ts                      # protection des routes (dashboard)
├── .env.local
├── .env.example
├── components.json                    # config shadcn
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 2. Schéma de base de données (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")        // pooler Supabase (port 6543)
  directUrl = env("DIRECT_URL")          // connexion directe (port 5432) pour les migrations
}

// L'id correspond à auth.users.id de Supabase (jamais géré par Prisma)
model Agency {
  id         String   @id @db.Uuid
  email      String   @unique
  name       String
  logoUrl    String?  @map("logo_url")
  brandColor String   @default("#4f46e5") @map("brand_color")
  sites      Site[]
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("agencies")
}

model Site {
  id        String   @id @default(uuid()) @db.Uuid
  agencyId  String   @map("agency_id") @db.Uuid
  agency    Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  name      String
  url       String
  scans     Scan[]
  createdAt DateTime @default(now()) @map("created_at")

  @@map("sites")
}

model Scan {
  id              String      @id @default(uuid()) @db.Uuid
  siteId          String      @map("site_id") @db.Uuid
  site            Site        @relation(fields: [siteId], references: [id], onDelete: Cascade)
  status          ScanStatus  @default(PENDING)
  score           Int?        // 0–100, null tant que non terminé
  violationsCount Int         @default(0) @map("violations_count")
  violations      Violation[]
  createdAt       DateTime    @default(now()) @map("created_at")
  completedAt     DateTime?   @map("completed_at")

  @@map("scans")
}

model Violation {
  id           String          @id @default(uuid()) @db.Uuid
  scanId       String          @map("scan_id") @db.Uuid
  scan         Scan            @relation(fields: [scanId], references: [id], onDelete: Cascade)
  ruleId       String          @map("rule_id")        // ex: "color-contrast"
  impact       Impact
  description  String                                  // texte axe "help"
  helpUrl      String          @map("help_url")
  htmlSnippet  String          @map("html_snippet")    // node.html fautif
  target       String                                  // sélecteur CSS du node
  aiSuggestion String?         @map("ai_suggestion")   // null tant que non demandé
  status       ViolationStatus @default(OPEN)          // historique de correction
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")

  @@map("violations")
}

enum ScanStatus { PENDING RUNNING DONE ERROR }
enum Impact     { CRITICAL SERIOUS MODERATE MINOR }
enum ViolationStatus { OPEN FIXED IGNORED }
```

**Note « preuve de bonne foi »** : l'historique vient de la conservation de tous les `Scan` + le champ `Violation.status` horodaté par `updatedAt`. Pour un vrai journal d'audit immuable (post-MVP), ajouter une table `ViolationEvent(violationId, oldStatus, newStatus, at)`.

---

## 3. Spécifications des endpoints d'API

Toutes les routes vérifient l'agence via Supabase server client. Réponses JSON, codes HTTP standard.

### `GET /api/sites`
Liste les sites de l'agence connectée (avec le dernier scan).
→ `200 [{ id, name, url, lastScan: { score, createdAt } | null }]`

### `POST /api/sites`
Body : `{ name: string, url: string }` → valide l'URL → crée le `Site`.
→ `201 { id, name, url }`

### `POST /api/scans` — **route centrale**
Body : `{ siteId: string }`
1. Auth + vérifie que le `Site` appartient à l'agence.
2. Crée `Scan(status: RUNNING)`.
3. `runScan(url)` → lance Chrome headless, exécute `axe-core`.
4. Mappe `results.violations[].nodes[]` → lignes `Violation` (impact, ruleId, html, target, helpUrl).
5. `computeScore(violations)` → met à jour `Scan(status: DONE, score, violationsCount, completedAt)`.
6. En cas d'exception : `Scan(status: ERROR)`.
→ `200 { scanId, score, violationsCount }`
Config route : `export const maxDuration = 60;` et `export const runtime = "nodejs";`

### `GET /api/scans/[scanId]`
Renvoie le scan + ses violations triées par `impact`.
→ `200 { id, status, score, violations: [...] }`

### `POST /api/violations/[violationId]/suggest`
Aucun body. Lit la violation, appelle `suggestFix()` (Anthropic), enregistre `aiSuggestion`, le renvoie. Idempotent : si `aiSuggestion` existe déjà, le renvoie sans rappeler l'IA (économie de tokens).
→ `200 { aiSuggestion: string }`

### `PATCH /api/violations/[violationId]`
Body : `{ status: "FIXED" | "IGNORED" | "OPEN" }` → met à jour le statut (trace de correction).
→ `200 { id, status, updatedAt }`

### Logique métier de référence

**`lib/scanner.ts`**
```ts
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { AxePuppeteer } from "@axe-core/puppeteer";

export async function runScan(url: string) {
  const isLocal = process.env.NODE_ENV === "development";
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: isLocal
      ? process.env.LOCAL_CHROME_PATH // ex: /usr/bin/chromium ou chemin macOS
      : await chromium.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
    return await new AxePuppeteer(page).analyze(); // { violations, passes, ... }
  } finally {
    await browser.close();
  }
}
```

**`lib/score.ts`** (formule simple et défendable)
```ts
const WEIGHT = { CRITICAL: 10, SERIOUS: 5, MODERATE: 2, MINOR: 1 } as const;

export function computeScore(violations: { impact: keyof typeof WEIGHT }[]) {
  const penalty = violations.reduce((s, v) => s + WEIGHT[v.impact], 0);
  return Math.max(0, 100 - penalty); // 100 = aucune violation
}
```

**`lib/ai.ts`**
```ts
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

export async function suggestFix(v: {
  ruleId: string; description: string; htmlSnippet: string;
}) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",            // haiku-4-5 si priorité au coût
    max_tokens: 1024,
    system:
      "Tu es un expert accessibilité web. On te donne une erreur axe-core. " +
      "Renvoie UNIQUEMENT le HTML/CSS corrigé dans un bloc de code, " +
      "suivi d'une phrase d'explication. Pas de préambule.",
    messages: [{
      role: "user",
      content:
        `Règle: ${v.ruleId}\nProblème: ${v.description}\n` +
        `Code fautif:\n${v.htmlSnippet}`,
    }],
  });
  const block = msg.content.find((c) => c.type === "text");
  return block?.type === "text" ? block.text : "";
}
```

---

## 4 & 5. Feuille de route en 5 étapes + prompts Claude Code

> Avant chaque étape, vérifie que la précédente compile (`npm run build`). Ne passe pas à l'étape suivante si Claude Code laisse des erreurs TypeScript.

---

### Étape 1 — Setup projet + base de données

**Fichiers créés/modifiés :**
- `package.json` (deps), `next.config.ts`, `tailwind.config.ts`, `components.json`
- `prisma/schema.prisma` *(cf. section 2 — à copier tel quel)*
- `lib/prisma.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/utils.ts`
- `.env.example`

**Prompt Claude Code :**
```
Initialise un projet Next.js 15 (App Router, TypeScript, Tailwind) déjà présent dans ce dossier.
1. Installe : @prisma/client prisma @supabase/supabase-js @supabase/ssr
   puppeteer-core @sparticuz/chromium @axe-core/puppeteer @anthropic-ai/sdk
2. Initialise shadcn/ui (style "new-york", base "neutral") et ajoute les composants :
   button card input label badge table sonner dialog skeleton.
3. Crée prisma/schema.prisma EXACTEMENT comme dans la section 2 de PLAN.md.
4. Crée lib/prisma.ts (singleton PrismaClient compatible hot-reload).
5. Crée lib/supabase/client.ts et lib/supabase/server.ts avec @supabase/ssr
   (createBrowserClient / createServerClient + gestion cookies Next 15).
6. Crée .env.example avec : DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL,
   NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, LOCAL_CHROME_PATH.
Ne lance PAS encore de migration : je remplis d'abord .env.local, puis tu lanceras
`npx prisma migrate dev --name init` quand je te le dirai.
```

---

### Étape 2 — Authentification + shell du dashboard

**Fichiers créés/modifiés :**
- `middleware.ts`
- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx` *(placeholder pour l'instant)*

**Prompt Claude Code :**
```
Exécute l'Étape 2 du PLAN.md.
1. middleware.ts : protège toutes les routes de (dashboard) via Supabase ssr ;
   redirige les non-connectés vers /login.
2. signup : email/mot de passe + champ "nom de l'agence". À l'inscription réussie,
   crée la ligne Agency (id = user.id, email, name) via Prisma dans un Route Handler
   ou Server Action. Gère le cas où l'agence existe déjà.
3. login : email/mot de passe, redirige vers /dashboard.
4. (dashboard)/layout.tsx : sidebar (logo agence, lien Sites, bouton Déconnexion)
   + header. Récupère l'Agency côté serveur.
5. dashboard/page.tsx : placeholder "Aucun site" pour l'instant.
Utilise les toasts shadcn (sonner) pour les erreurs. Garde le code concis.
```

---

### Étape 3 — Gestion du parc de sites (CRUD)

**Fichiers créés/modifiés :**
- `app/api/sites/route.ts`
- `app/(dashboard)/dashboard/page.tsx` *(vraie version)*
- `components/site-card.tsx`, `components/score-badge.tsx`

**Prompt Claude Code :**
```
Exécute l'Étape 3 du PLAN.md.
1. app/api/sites/route.ts : GET (liste des sites de l'agence + dernier scan) et
   POST (créer un site, valider l'URL avec new URL()). Vérifie l'agence sur chaque requête.
2. components/score-badge.tsx : badge coloré selon le score (vert >=90, orange >=60, rouge sinon).
3. components/site-card.tsx : carte avec nom, url, score du dernier scan, lien vers /sites/[id].
4. dashboard/page.tsx : grille de site-card + Dialog shadcn "Ajouter un site" (POST /api/sites).
Rafraîchis la liste après création (router.refresh()). Reste sous ~250 lignes au total.
```

---

### Étape 4 — Moteur de scan (axe-core) + suggestions IA

**Fichiers créés/modifiés :**
- `lib/scanner.ts`, `lib/score.ts`, `lib/ai.ts` *(cf. section 3)*
- `app/api/scans/route.ts`, `app/api/scans/[scanId]/route.ts`
- `app/api/violations/[violationId]/route.ts`, `app/api/violations/[violationId]/suggest/route.ts`
- `app/(dashboard)/sites/[siteId]/page.tsx`, `app/(dashboard)/scans/[scanId]/page.tsx`
- `components/scan-button.tsx`, `components/violation-item.tsx`

**Prompt Claude Code :**
```
Exécute l'Étape 4 du PLAN.md — c'est le cœur du produit.
1. lib/scanner.ts, lib/score.ts, lib/ai.ts : copie les implémentations de la section 3 de PLAN.md.
2. app/api/scans/route.ts : POST { siteId }. Ajoute `export const maxDuration = 60;`
   et `export const runtime = "nodejs";`. Suis exactement le flux décrit (RUNNING → scan →
   mappe violations → score → DONE, ou ERROR en cas d'exception).
3. scans/[scanId]/route.ts : GET scan + violations triées par impact (CRITICAL d'abord).
4. violations/[id]/suggest/route.ts : POST, idempotent (ne rappelle pas l'IA si aiSuggestion existe).
5. violations/[id]/route.ts : PATCH { status }.
6. scan-button.tsx : bouton "Lancer un scan" avec état loading (POST /api/scans, puis redirige
   vers /scans/[scanId]).
7. sites/[siteId]/page.tsx : infos site + historique des scans + scan-button.
8. scans/[scanId]/page.tsx : score-badge + liste de violation-item.
9. violation-item.tsx : impact, description, htmlSnippet, bouton "Générer la correction" (appelle
   /suggest, affiche le code), et sélecteur de statut (OPEN/FIXED/IGNORED → PATCH).
Pour tester en local, j'aurai défini LOCAL_CHROME_PATH dans .env.local.
```

---

### Étape 5 — Rapport en marque blanche + déploiement Vercel

**Fichiers créés/modifiés :**
- `app/report/[scanId]/page.tsx` *(page publique, hors dashboard)*
- `components/branding-form.tsx`
- `app/(dashboard)/dashboard/page.tsx` *(ajout du lien réglages branding)*
- `next.config.ts` *(externaliser @sparticuz/chromium du bundle)*
- `vercel.json` *(optionnel : maxDuration)*

**Prompt Claude Code :**
```
Exécute l'Étape 5 du PLAN.md.
1. components/branding-form.tsx : formulaire (logoUrl + brandColor) qui met à jour l'Agency.
2. report/[scanId]/page.tsx : page PUBLIQUE (pas derrière le middleware) qui affiche un rapport
   propre — logo + couleur de l'agence en en-tête, score, tableau des violations avec statut.
   Pensée pour l'impression / export PDF du navigateur. Vérifie que l'URL n'expose rien de sensible
   (lecture seule via scanId).
3. next.config.ts : ajoute serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"].
4. Vérifie que `npm run build` passe sans erreur.
Ensuite, donne-moi la checklist exacte de déploiement Vercel : variables d'env à définir,
réglage du plan Pro pour maxDuration=60, et la commande de migration en production
(npx prisma migrate deploy).
```

---

## 6. Variables d'environnement (`.env.example`)

```bash
# Supabase → Project Settings > Database (utilise le "Connection Pooler" pour DATABASE_URL)
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@...supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# IA
ANTHROPIC_API_KEY="sk-ant-..."

# Dev local uniquement (chemin vers un Chrome installé)
LOCAL_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

---

## 7. Post-MVP (volontairement exclu pour rester sous 1000 lignes)
- Re-scan automatique planifié (Vercel Cron) + notifications de régression.
- Scan **asynchrone** (queue + polling) pour gérer les sites lents sans timeout.
- Journal d'audit immuable `ViolationEvent` (preuve de bonne foi renforcée).
- Multi-utilisateurs par agence (rôles) et facturation Stripe par nombre de sites.
- Export PDF serveur du rapport (au lieu de l'impression navigateur).
- Crawl multi-pages d'un même site (le MVP scanne une seule URL par scan).
