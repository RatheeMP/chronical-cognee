"use client";

import { useState } from "react";
import { Check, Eye, X } from "lucide-react";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import ProgressBar from "@/components/ui/ProgressBar";
import SuccessBanner from "@/components/ui/SuccessBanner";
import { chroniSuggestedMemory, friendlyError } from "@/lib/demoCopy";
import { rememberMemory } from "@/lib/api";
import type { MemoryItem } from "@/types/memory";

type SuggestedMemoryProps = {
  onItemAdded: (item: MemoryItem) => void;
  onMemoryStored?: () => void;
};

export default function SuggestedMemory({
  onItemAdded,
  onMemoryStored,
}: SuggestedMemoryProps) {
  const [dismissed, setDismissed] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [stored, setStored] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemember() {
    if (loading || stored) return;

    setLoading(true);
    setError(null);

    try {
      const response = await rememberMemory(chroniSuggestedMemory.text);

      if (response.status !== "completed") {
        throw new Error(`Cognee returned status: ${response.status}`);
      }

      const dataId = response.items?.[response.items.length - 1]?.id;
      if (!dataId) {
        throw new Error("Missing memory id from Cognee response");
      }

      onItemAdded({
        id: response.pipeline_run_id ?? crypto.randomUUID(),
        dataId,
        datasetName: response.dataset_name ?? "main_dataset",
        timestamp: new Date(),
        text: chroniSuggestedMemory.text,
        status: response.status,
      });
      setStored(true);
      onMemoryStored?.();
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
    } finally {
      setLoading(false);
    }
  }

  if (dismissed) {
    return null;
  }

  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="surface-elevated relative overflow-hidden p-6 sm:p-8" glow>
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <ChroniAvatar size="lg" />
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <span className="badge badge-cyan">Chroni</span>
              <p className="mt-3 text-lg font-medium tracking-tight text-slate-100">
                {stored
                  ? "Stored. This decision is now in your organizational memory."
                  : chroniSuggestedMemory.greeting}
              </p>
            </div>

            {(reviewing || stored) && !stored && (
              <div className="content-enter memory-chip">
                <p className="mb-2 text-xs text-slate-500">
                  {chroniSuggestedMemory.context}
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {chroniSuggestedMemory.text}
                </p>
              </div>
            )}

            {loading && <ProgressBar label="Storing memory" />}

            {!stored && (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setReviewing(true)}
                  disabled={loading || reviewing}
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  Review
                </Button>
                <Button onClick={handleRemember} disabled={loading}>
                  <Check className="h-4 w-4" aria-hidden />
                  {loading ? "Storing..." : "Remember"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Dismiss
                </Button>
              </div>
            )}

            {stored && (
              <SuccessBanner compact message="Decision preserved" />
            )}
            {error && (
              <p className="text-sm text-red-400/90">{error}</p>
            )}
          </div>
        </div>
      </Card>
    </MotionDiv>
  );
}
