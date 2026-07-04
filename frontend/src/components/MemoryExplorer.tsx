"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Network,
  StickyNote,
} from "lucide-react";

import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import Panel from "@/components/ui/Panel";
import type { ReasoningChain, ReasoningNode } from "@/lib/api";

type MemoryExplorerProps = {
  chain: ReasoningChain;
};

function formatTimestamp(value: string | null): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ExplorerNode({
  node,
  visible,
  expanded,
  onToggle,
}: {
  node: ReasoningNode;
  visible: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const timestamp = formatTimestamp(node.timestamp);
  const isQuestion = node.type === "question";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0.15, y: visible ? 0 : 4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="surface surface-interactive w-full rounded-[var(--radius-md)] px-5 py-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className={`badge ${isQuestion ? "badge-cyan" : ""}`}
            >
              {isQuestion ? (
                <HelpCircle className="h-3 w-3" aria-hidden />
              ) : (
                <StickyNote className="h-3 w-3" aria-hidden />
              )}
              {isQuestion ? "Question" : "Memory"}
            </span>
            <p className="mt-2 text-sm font-medium text-slate-100">
              {node.title}
            </p>
            {!expanded && (
              <p className="mt-2 text-sm text-slate-500">{node.preview}</p>
            )}
          </div>
          <span className="text-slate-500">
            {expanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </span>
        </div>

        {expanded && (
          <div className="divider mt-4 border-t pt-4">
            <p className="text-sm leading-relaxed text-slate-400">
              {node.content}
            </p>
            {timestamp && (
              <p className="mt-2 text-xs text-slate-500">
                Preserved {timestamp}
              </p>
            )}
          </div>
        )}
      </button>
    </MotionDiv>
  );
}

function ExplorerArrow({ visible }: { visible: boolean }) {
  return (
    <div
      className="flex justify-center py-1 transition-opacity duration-700"
      style={{ opacity: visible ? 0.35 : 0.08 }}
      aria-hidden
    >
      <ChevronDown className="h-4 w-4 text-[#6366F1]/50" />
    </div>
  );
}

export default function MemoryExplorer({ chain }: MemoryExplorerProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const nodes = [...chain.nodes].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (nodes.length === 0) return;

    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setVisibleCount(step);
      if (step >= nodes.length) {
        window.clearInterval(timer);
      }
    }, 550);

    return () => window.clearInterval(timer);
  }, [nodes.length]);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <Panel
      tier="primary"
      title="Memory Explorer"
      icon={<Network className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
    >
      <MotionDiv {...fadeInUp} transition={transition}>
        <Card className="surface-elevated content-stable p-6 sm:p-8" glow>
          <div className="mx-auto max-w-md space-y-1">
            {nodes.map((node, index) => (
              <div key={node.id}>
                <ExplorerNode
                  node={node}
                  visible={index < visibleCount}
                  expanded={expandedId === node.id}
                  onToggle={() =>
                    setExpandedId((current) =>
                      current === node.id ? null : node.id,
                    )
                  }
                />
                {index < nodes.length - 1 && (
                  <ExplorerArrow visible={index < visibleCount - 1} />
                )}
              </div>
            ))}
          </div>
        </Card>
      </MotionDiv>
    </Panel>
  );
}
