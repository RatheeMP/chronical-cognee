"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  StickyNote,
} from "lucide-react";

import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import type { ReasoningChain, ReasoningNode } from "@/lib/api";

type DemoMemoryExplorerProps = {
  chain: ReasoningChain;
  compact?: boolean;
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
  expanded,
  onToggle,
  hovered,
  onHover,
  compact,
}: {
  node: ReasoningNode;
  expanded: boolean;
  onToggle: () => void;
  hovered: boolean;
  onHover: (hover: boolean) => void;
  compact?: boolean;
}) {
  const timestamp = formatTimestamp(node.timestamp);
  const isQuestion = node.type === "question";

  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`surface surface-interactive w-full rounded-[var(--radius-md)] text-left transition-shadow duration-300 ${
          compact ? "px-3 py-3" : "px-5 py-4"
        } ${hovered ? "shadow-[0_0_24px_rgb(99_102_241/0.12)]" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className={`badge ${isQuestion ? "badge-cyan" : ""} text-[10px]`}>
              {isQuestion ? (
                <HelpCircle className="h-3 w-3" aria-hidden />
              ) : (
                <StickyNote className="h-3 w-3" aria-hidden />
              )}
              {isQuestion ? "Question" : "Memory"}
            </span>
            <p className={`mt-1.5 font-medium text-slate-100 ${compact ? "text-xs" : "text-sm"}`}>
              {node.title}
            </p>
            {!expanded && (
              <p className={`mt-1 text-slate-500 ${compact ? "text-[11px] line-clamp-2" : "text-sm"}`}>
                {node.preview}
              </p>
            )}
          </div>
          <span className="shrink-0 text-slate-500">
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            )}
          </span>
        </div>

        {expanded && (
          <div className="divider mt-3 border-t pt-3">
            <p className={`leading-relaxed text-slate-400 ${compact ? "text-[11px]" : "text-sm"}`}>
              {node.content}
            </p>
            {timestamp && (
              <p className="mt-2 text-[10px] text-slate-500">
                Preserved {timestamp}
              </p>
            )}
          </div>
        )}
      </button>
    </div>
  );
}

function ExplorerArrow({ active }: { active: boolean }) {
  return (
    <div
      className="flex justify-center py-0.5 transition-all duration-300"
      style={{ opacity: active ? 0.55 : 0.25 }}
      aria-hidden
    >
      <ChevronDown
        className={`h-3.5 w-3.5 transition-colors duration-300 ${
          active ? "text-[#38BDF8]/70" : "text-[#6366F1]/40"
        }`}
      />
    </div>
  );
}

export default function DemoMemoryExplorer({
  chain,
  compact = false,
}: DemoMemoryExplorerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nodes = [...chain.nodes].sort((a, b) => a.order - b.order);

  if (nodes.length === 0) {
    return null;
  }

  const content = (
    <div className={compact ? "space-y-0.5" : "mx-auto max-w-md space-y-1"}>
      {nodes.map((node, index) => (
        <div key={node.id}>
          <ExplorerNode
            node={node}
            expanded={expandedId === node.id}
            hovered={hoveredId === node.id}
            compact={compact}
            onHover={(hover) => setHoveredId(hover ? node.id : null)}
            onToggle={() =>
              setExpandedId((current) =>
                current === node.id ? null : node.id,
              )
            }
          />
          {index < nodes.length - 1 && (
            <ExplorerArrow
              active={
                hoveredId === node.id ||
                hoveredId === nodes[index + 1]?.id
              }
            />
          )}
        </div>
      ))}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="surface-elevated p-6 sm:p-8" glow>
        {content}
      </Card>
    </MotionDiv>
  );
}
