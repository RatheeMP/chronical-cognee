"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Panel from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import Spinner from "@/components/ui/Spinner";
import SuccessBanner from "@/components/ui/SuccessBanner";
import { friendlyError } from "@/lib/demoCopy";
import { improveMemory, type ImproveResponse } from "@/lib/api";

const DEFAULT_DATASET = "main_dataset";

function improveSucceeded(response: ImproveResponse): boolean {
  if (response.status === "completed") {
    return true;
  }

  const serialized = JSON.stringify(response).toLowerCase();
  return (
    serialized.includes("pipelineruncompleted") ||
    serialized.includes('"status":"completed"')
  );
}

export default function MemoryEvolution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleImprove() {
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await improveMemory(DEFAULT_DATASET);
      if (!improveSucceeded(response)) {
        throw new Error(`Cognee returned status: ${response.status ?? "unknown"}`);
      }
      setSuccess(true);
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel
      tier="secondary"
      title="Improve Memory"
      icon={<Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
    >
      <Card className="content-stable space-y-4">
        {loading && (
          <div className="space-y-3">
            <Spinner showChroni label="Strengthening connections" />
            <ProgressBar label="Improving memory connections" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleImprove} disabled={loading} variant="secondary">
            {loading ? "Improving..." : "Improve Memory"}
          </Button>
          {success && !loading && (
            <SuccessBanner compact message="Memory connections strengthened" />
          )}
        </div>
        {error && <p className="text-sm text-red-400/90">{error}</p>}
      </Card>
    </Panel>
  );
}
