"use client";

import { useState } from "react";
import { toast } from "sonner";
import { type Impact, type ViolationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const IMPACT_COLORS: Record<Impact, string> = {
  CRITICAL: "bg-red-100 text-red-800 hover:bg-red-100",
  SERIOUS: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  MODERATE: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  MINOR: "bg-blue-100 text-blue-800 hover:bg-blue-100",
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
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <Badge className={`${IMPACT_COLORS[violation.impact]} shrink-0`}>
          {violation.impact}
        </Badge>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{violation.description}</p>
          <a
            href={violation.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline"
          >
            {violation.ruleId}
          </a>
        </div>
        <select
          value={status}
          disabled={loadingStatus}
          onChange={(e) => updateStatus(e.target.value as ViolationStatus)}
          className="shrink-0 rounded border bg-background px-2 py-1 text-xs"
        >
          <option value="OPEN">Ouvert</option>
          <option value="FIXED">Corrigé</option>
          <option value="IGNORED">Ignoré</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          <code>{violation.htmlSnippet}</code>
        </pre>

        {suggestion ? (
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Correction suggérée :
            </p>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
              <code>{suggestion}</code>
            </pre>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={loadingSuggestion}
            onClick={generateSuggestion}
          >
            {loadingSuggestion ? "Génération…" : "Générer la correction IA"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
