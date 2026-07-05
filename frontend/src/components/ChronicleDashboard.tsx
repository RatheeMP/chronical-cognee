"use client";

import { useEffect, useRef, useState } from "react";

import AskChronicle from "@/components/AskChronicle";
import ArchitectureCard from "@/components/workspace/ArchitectureCard";
import MemoryImportPanel from "@/components/workspace/MemoryImportPanel";
import MemorySummary from "@/components/workspace/MemorySummary";
import WorkspaceWelcome from "@/components/workspace/WorkspaceWelcome";
import { importMemoryTexts } from "@/lib/workspaceMemoryImport";
import {
  NOVATECH_DATASET_DISPLAY_NAME,
  NOVATECH_SAMPLE_MEMORIES,
} from "@/lib/workspaceSampleMemories";
import type { MemoryItem } from "@/types/memory";

export default function ChronicleDashboard() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [preloadLoading, setPreloadLoading] = useState(true);
  const preloadStarted = useRef(false);

  useEffect(() => {
    if (preloadStarted.current) return;
    preloadStarted.current = true;

    async function preloadNovaTech() {
      setPreloadLoading(true);
      try {
        const { items } = await importMemoryTexts(NOVATECH_SAMPLE_MEMORIES);
        if (items.length > 0) {
          setMemories(items);
        }
      } finally {
        setPreloadLoading(false);
      }
    }

    void preloadNovaTech();
  }, []);

  function handleItemsAdded(items: MemoryItem[]) {
    setMemories((prev) => [...items, ...prev]);
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <WorkspaceWelcome />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="space-y-8 lg:space-y-10">
          <MemoryImportPanel onItemsAdded={handleItemsAdded} />
          <MemorySummary
            items={memories}
            datasetLabel={NOVATECH_DATASET_DISPLAY_NAME}
            loading={preloadLoading}
          />
          <AskChronicle />
        </div>

        <aside className="hidden lg:block">
          <ArchitectureCard />
        </aside>
      </div>

      <div className="lg:hidden">
        <ArchitectureCard />
      </div>
    </div>
  );
}
