"use client";

import { useState } from "react";

import { rememberMemory } from "@/lib/api";

type FeedItem = {
  id: string;
  timestamp: Date;
  text: string;
  status: string;
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

export default function MemoryFeed() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      setItems((prev) => [
        {
          id: response.pipeline_run_id ?? crypto.randomUUID(),
          timestamp: new Date(),
          text: trimmed,
          status: response.status,
        },
        ...prev,
      ]);
      setText("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Chronicle</h1>
        <p className="text-sm text-zinc-500">
          Store memories in Cognee Cloud
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <label htmlFor="memory-input" className="block text-sm font-medium">
          New memory
        </label>
        <textarea
          id="memory-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What should Chronicle remember?"
          rows={4}
          disabled={loading}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRemember}
            disabled={loading || !text.trim()}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Remembering..." : "Remember"}
          </button>
          {loading && (
            <span className="text-sm text-zinc-500">Sending to Cognee Cloud...</span>
          )}
          {success && !loading && (
            <span className="text-sm text-emerald-600">Stored successfully</span>
          )}
          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Memory Feed</h2>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800">
            No memories yet. Add one above to see it here.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-2 flex items-center justify-between gap-4 text-xs text-zinc-500">
                  <time dateTime={item.timestamp.toISOString()}>
                    {formatTime(item.timestamp)}
                  </time>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {firstLine(item.text)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
