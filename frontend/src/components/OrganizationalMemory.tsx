"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock, History, PenLine, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { FieldLabel, TextArea } from "@/components/ui/Input";
import { MotionDiv, fadeInUp, scaleIn, transition } from "@/components/ui/motion";
import Panel from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import ResultSlot from "@/components/ui/ResultSlot";
import SuccessBanner from "@/components/ui/SuccessBanner";
import { friendlyError } from "@/lib/demoCopy";
import { forgetMemory, rememberMemory } from "@/lib/api";
import type { MemoryItem } from "@/types/memory";

type OrganizationalMemoryProps = {
  items: MemoryItem[];
  onItemAdded: (item: MemoryItem) => void;
  onItemRemoved: (id: string) => void;
  onMemoryStored?: () => void;
  onMemoryForgotten?: () => void;
};

function firstLine(text: string): string {
  const line = text.trim().split("\n")[0];
  return line.length > 120 ? `${line.slice(0, 117)}...` : line;
}

function formatTime(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrganizationalMemory({
  items,
  onItemAdded,
  onItemRemoved,
  onMemoryStored,
  onMemoryForgotten,
}: OrganizationalMemoryProps) {
  const [manualOpen, setManualOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingForget, setPendingForget] = useState<MemoryItem | null>(null);
  const [forgettingId, setForgettingId] = useState<string | null>(null);
  const [forgetError, setForgetError] = useState<string | null>(null);

  async function handleRemember() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await rememberMemory(trimmed);

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
        text: trimmed,
        status: response.status,
      });
      setText("");
      setSuccess(true);
      setManualOpen(false);
      onMemoryStored?.();
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmForget() {
    if (!pendingForget || forgettingId) return;

    setForgettingId(pendingForget.id);
    setForgetError(null);

    try {
      await forgetMemory(pendingForget.datasetName, pendingForget.dataId);
      onItemRemoved(pendingForget.id);
      setPendingForget(null);
      onMemoryForgotten?.();
    } catch (err) {
      setForgetError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
    } finally {
      setForgettingId(null);
    }
  }

  useEffect(() => {
    if (!pendingForget) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !forgettingId) {
        setPendingForget(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingForget, forgettingId]);

  return (
    <>
      <Panel
        tier="secondary"
        title="Organizational Memory"
        icon={<History className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
      >
        <ResultSlot minHeight={items.length === 0 ? 140 : 0}>
          {items.length === 0 ? (
            <EmptyState
              icon={History}
              title="No decisions preserved yet"
              description="Review Chroni's suggestion above."
            />
          ) : (
            <ol className="timeline-rail relative space-y-0 border-l pl-6">
              {items.map((item, index) => (
                <MotionDiv
                  key={item.id}
                  {...fadeInUp}
                  transition={{ ...transition, delay: index * 0.05 }}
                  className="relative pb-6 last:pb-0"
                >
                  <span
                    className="timeline-dot absolute -left-[25px] top-1.5 h-2 w-2 rounded-full"
                    aria-hidden
                  />
                  <Card padding="sm" hover>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <time
                        dateTime={item.timestamp.toISOString()}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                      >
                        <Clock className="h-3 w-3" aria-hidden />
                        {formatTime(item.timestamp)}
                      </time>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setForgetError(null);
                          setPendingForget(item);
                        }}
                        disabled={forgettingId === item.id}
                        className="!px-2 !py-1 text-xs"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                        Remove
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {firstLine(item.text)}
                    </p>
                  </Card>
                </MotionDiv>
              ))}
            </ol>
          )}
        </ResultSlot>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setManualOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-dashed border-[rgb(99_102_241/0.2)] px-4 py-3.5 text-left text-sm text-slate-500 transition-all duration-300 hover:border-[rgb(99_102_241/0.35)] hover:text-slate-300"
          >
            <span className="inline-flex items-center gap-2">
              <PenLine className="h-4 w-4" aria-hidden />
              Add memory manually
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                manualOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </button>

          {manualOpen && (
            <Card className="mt-3 space-y-4 content-enter">
              <FieldLabel htmlFor="manual-memory">
                Describe a decision and why it was made
              </FieldLabel>
              <TextArea
                id="manual-memory"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What decision should your organization remember?"
                rows={3}
                disabled={loading}
              />
              {loading && <ProgressBar label="Preserving memory" />}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleRemember}
                  disabled={loading || !text.trim()}
                  variant="secondary"
                >
                  {loading ? "Storing..." : "Store memory"}
                </Button>
                {success && (
                  <SuccessBanner compact message="Decision preserved" />
                )}
              </div>
              {error && <p className="text-sm text-red-400/90">{error}</p>}
            </Card>
          )}
        </div>

        {forgetError && (
          <p className="text-sm text-red-400/90">{forgetError}</p>
        )}
      </Panel>

      {pendingForget && (
        <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
          <MotionDiv
            {...scaleIn}
            transition={transition}
            className="w-full max-w-sm"
          >
            <Card
              className="surface-elevated p-6"
              role="dialog"
              aria-modal="true"
              glow
            >
              <h3 className="text-base font-semibold text-slate-100">
                Remove this memory?
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {firstLine(pendingForget.text)}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setPendingForget(null)}
                  disabled={Boolean(forgettingId)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmForget}
                  disabled={Boolean(forgettingId)}
                >
                  {forgettingId ? "Removing..." : "Remove"}
                </Button>
              </div>
            </Card>
          </MotionDiv>
        </div>
      )}
    </>
  );
}
