"use client";

import { useState } from "react";

import AskChronicle from "@/components/AskChronicle";
import ArchitectureCard from "@/components/workspace/ArchitectureCard";
import MemoryImportPanel from "@/components/workspace/MemoryImportPanel";
import MemorySummary from "@/components/workspace/MemorySummary";
import WorkspaceWelcome from "@/components/workspace/WorkspaceWelcome";
import type { MemoryItem } from "@/types/memory";

export default function ChronicleDashboard() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  function handleItemsAdded(items: MemoryItem[]) {
    setMemories((prev) => [...items, ...prev]);
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <WorkspaceWelcome />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="space-y-8 lg:space-y-10">
          <MemoryImportPanel onItemsAdded={handleItemsAdded} />
          <MemorySummary items={memories} />
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
