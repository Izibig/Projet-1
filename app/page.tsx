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
          L&apos;accessibilité web,<br />
          <span className="text-[#4F46E5]">sans l&apos;effort.</span>
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
          De l&apos;audit à la correction en trois étapes.
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
                <span className="font-mono text-xs font-bold text-[#4F46E5] opacity-60">{step.n}</span>
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
          Gérez l&apos;accessibilité de tout votre parc client depuis un seul tableau de bord.
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
            &ldquo;Clario nous a permis de passer nos audits d&apos;accessibilité de 2 jours à 20 minutes.
            Nos clients reçoivent un rapport professionnel le jour même.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5] text-sm font-bold text-white">
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
          Rejoignez les agences qui font confiance à Clario pour leurs audits d&apos;accessibilité.
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
