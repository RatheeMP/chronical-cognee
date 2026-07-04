"use client";

import { useCallback, useState } from "react";

import AskChronicle from "@/components/AskChronicle";
import BeforeYouDecide from "@/components/BeforeYouDecide";
import SuggestedMemory from "@/components/chroni/SuggestedMemory";
import MemoryEvolution from "@/components/MemoryEvolution";
import MemoryExplorer from "@/components/MemoryExplorer";
import OrganizationalMemory from "@/components/OrganizationalMemory";
import type { PresentationMetrics } from "@/components/ui/DashboardMetrics";
import MetricsStrip from "@/components/ui/MetricsStrip";
import type { ReasoningChain } from "@/lib/api";
import type { MemoryItem } from "@/types/memory";

const initialMetrics: PresentationMetrics = {
  memoriesStored: 0,
  decisionAnalyses: 0,
  reasoningPaths: 0,
  lastUpdated: null,
};

export default function ChronicleDashboard() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [chain, setChain] = useState<ReasoningChain | null>(null);
  const [chainKey, setChainKey] = useState(0);
  const [metrics, setMetrics] = useState<PresentationMetrics>(initialMetrics);

  const bumpMetric = useCallback(
    (update: (prev: PresentationMetrics) => Partial<PresentationMetrics>) => {
      setMetrics((prev) => ({
        ...prev,
        ...update(prev),
        lastUpdated: new Date(),
      }));
    },
    [],
  );

  function addMemory(item: MemoryItem) {
    setMemories((prev) => [item, ...prev]);
  }

  function removeMemory(id: string) {
    setMemories((prev) => prev.filter((item) => item.id !== id));
  }

  function showExplorer(nextChain: ReasoningChain) {
    if (nextChain.nodes.length === 0) return;
    setChain(nextChain);
    setChainKey((value) => value + 1);
    bumpMetric((prev) => ({ reasoningPaths: prev.reasoningPaths + 1 }));
  }

  return (
    <div className="flex flex-col gap-20">
      <SuggestedMemory
        onItemAdded={addMemory}
        onMemoryStored={() =>
          bumpMetric((prev) => ({ memoriesStored: prev.memoriesStored + 1 }))
        }
      />

      <div className="space-y-20">
        <AskChronicle onExplored={showExplorer} />
        <BeforeYouDecide
          onExplored={showExplorer}
          onAnalysisComplete={() =>
            bumpMetric((prev) => ({
              decisionAnalyses: prev.decisionAnalyses + 1,
            }))
          }
        />
        {chain && chain.nodes.length > 0 && (
          <MemoryExplorer key={chainKey} chain={chain} />
        )}
      </div>

      <div className="divider space-y-20 border-t pt-20">
        <OrganizationalMemory
          items={memories}
          onItemAdded={addMemory}
          onItemRemoved={removeMemory}
          onMemoryStored={() =>
            bumpMetric((prev) => ({ memoriesStored: prev.memoriesStored + 1 }))
          }
          onMemoryForgotten={() =>
            bumpMetric((prev) => ({
              memoriesStored: Math.max(0, prev.memoriesStored - 1),
            }))
          }
        />
        <MemoryEvolution />
      </div>

      <MetricsStrip metrics={metrics} />
    </div>
  );
}
