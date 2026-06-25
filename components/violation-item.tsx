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
      const res = await fetch(`/api/violations/${violation.id}/suggest`, {
        method: "POST",
      });
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
      <div className="flex items-start gap-3">
        <div
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${IMPACT_DOT[violation.impact]}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[#111827]">
                {violation.description}
              </p>
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

          <pre className="mt-3 overflow-x-auto rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#374151]">
            <code>{violation.htmlSnippet}</code>
          </pre>

          {suggestion ? (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-[#6B7280]">
                Correction suggérée par l&apos;IA :
              </p>
              <pre className="overflow-x-auto rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5 text-xs text-[#065F46]">
                <code>{suggestion}</code>
              </pre>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={loadingSuggestion}
              onClick={generateSuggestion}
              className="mt-3 h-8 gap-1.5 border-[#E5E7EB] text-xs text-[#374151] hover:border-[#4F46E5] hover:text-[#4F46E5]"
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
