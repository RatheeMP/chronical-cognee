const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type RememberResponse = {
  status: string;
  dataset_name?: string;
  dataset_id?: string;
  pipeline_run_id?: string;
  items_processed?: number;
  elapsed_seconds?: number;
  items?: { id: string }[];
};

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/v1/health`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch health");
  }

  return res.json();
}

export async function rememberMemory(text: string): Promise<RememberResponse> {
  const res = await fetch(`${API_BASE}/memory/remember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to store memory");
  }

  return res.json();
}
