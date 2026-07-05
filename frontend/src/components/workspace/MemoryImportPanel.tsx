"use client";

import { useRef, useState } from "react";
import {
  Check,
  ClipboardCopy,
  Database,
  FileUp,
  Layers,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextArea } from "@/components/ui/Input";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import Panel from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import Spinner from "@/components/ui/Spinner";
import { CLAUDE_MEMORY_PROMPT } from "@/lib/workspaceSampleMemories";
import {
  importMemoryTexts,
  splitMemoryStack,
} from "@/lib/workspaceMemoryImport";
import type { MemoryItem } from "@/types/memory";

type TabId = "paste" | "upload" | "prompt";

const TABS: { id: TabId; label: string; icon: typeof Database }[] = [
  { id: "paste", label: "Paste Memory Stack", icon: Layers },
  { id: "upload", label: "Upload Memory Document", icon: FileUp },
  { id: "prompt", label: "Copy Claude Prompt", icon: ClipboardCopy },
];

type MemoryImportPanelProps = {
  onItemsAdded: (items: MemoryItem[]) => void;
};

export default function MemoryImportPanel({ onItemsAdded }: MemoryImportPanelProps) {
  const [tab, setTab] = useState<TabId>("paste");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function runImport(texts: string[], label: string) {
    if (loading || texts.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProgress({ current: 0, total: texts.length });

    const { items, failures } = await importMemoryTexts(texts, (current, total) => {
      setProgress({ current, total });
    });

    if (items.length > 0) {
      onItemsAdded(items);
      setSuccess(`${label}: ${items.length} memories imported.`);
    }
    if (failures.length > 0) {
      setError(`${failures.length} memories could not be imported. Try again.`);
    }
    if (items.length === 0 && failures.length === 0) {
      setError("No valid memories found to import.");
    }

    setLoading(false);
    setProgress({ current: 0, total: 0 });
  }

  async function handlePasteImport() {
    const texts = splitMemoryStack(pasteText);
    await runImport(texts, "Memory stack");
    if (texts.length > 0) setPasteText("");
  }

  async function handleFileUpload(file: File) {
    const content = await file.text();
    const texts = splitMemoryStack(content);
    await runImport(texts, file.name);
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(CLAUDE_MEMORY_PROMPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Panel
        tier="secondary"
        title="Import Organizational Memory"
        icon={<Database className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
      >
        <div className="flex flex-wrap gap-2 border-b border-[rgb(99_102_241/0.1)] pb-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setError(null);
                setSuccess(null);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
                tab === id
                  ? "bg-[#6366F1] text-white shadow-[0_0_20px_rgb(99_102_241/0.25)]"
                  : "bg-[rgb(30_27_75/0.5)] text-slate-400 hover:bg-[rgb(67_56_202/0.15)] hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <Card className="mt-4 space-y-4 p-5">
          {tab === "paste" && (
            <>
              <p className="text-sm text-slate-400">
                Paste memories separated by blank lines. Each paragraph becomes
                one organizational memory.
              </p>
              <TextArea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Customer Interview #1: …&#10;&#10;Product Meeting #4: …"
                rows={6}
                disabled={loading}
              />
              <Button
                onClick={() => void handlePasteImport()}
                disabled={loading || !pasteText.trim()}
                variant="secondary"
              >
                Import Memory Stack
              </Button>
            </>
          )}

          {tab === "upload" && (
            <>
              <p className="text-sm text-slate-400">
                Upload a plain-text document. Memories are split by blank lines.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file);
                  e.target.value = "";
                }}
              />
              <Button
                variant="secondary"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
              >
                <FileUp className="h-4 w-4" aria-hidden />
                Choose Document
              </Button>
            </>
          )}

          {tab === "prompt" && (
            <>
              <p className="text-sm text-slate-400">
                Copy this prompt into Claude to generate a custom memory stack,
                then paste the result using the Paste Memory Stack tab.
              </p>
              <div className="surface max-h-48 overflow-y-auto rounded-[var(--radius-md)] p-4 text-xs leading-relaxed text-slate-500">
                {CLAUDE_MEMORY_PROMPT}
              </div>
              <Button variant="secondary" onClick={() => void handleCopyPrompt()}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-4 w-4" aria-hidden />
                    Copy Claude Prompt
                  </>
                )}
              </Button>
            </>
          )}

          {loading && (
            <div className="space-y-3">
              <Spinner showChroni label="Importing organizational memory" />
              {progress.total > 0 && (
                <ProgressBar
                  label={`Importing ${progress.current} of ${progress.total}`}
                />
              )}
            </div>
          )}

          {success && (
            <p className="text-sm text-emerald-400/90">{success}</p>
          )}
          {error && (
            <p className="text-sm text-amber-400/90">{error}</p>
          )}
        </Card>
      </Panel>
    </MotionDiv>
  );
}
