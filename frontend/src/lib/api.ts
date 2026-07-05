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

export type RecallResult = {
  source?: string;
  text?: string;
  answer?: string;
  content?: string;
  [key: string]: unknown;
};

export type ImpactPerformance = {
  query_expansion_ms: number;
  retrieval_ms: number;
  ranking_ms: number;
  context_build_ms: number;
  graph_completion_ms: number;
  parsing_ms: number;
  total_ms: number;
};

export type ImpactResponse = {
  summary: string;
  supporting_memories: string[];
  reasoning: string;
  potential_impacts: string[];
  reasoning_chain: ReasoningChain;
  performance?: ImpactPerformance;
};

export type ReasoningNode = {
  id: string;
  type: "memory" | "question";
  title: string;
  content: string;
  preview: string;
  timestamp: string | null;
  order: number;
};

export type ReasoningEdge = {
  from: string;
  to: string;
};

export type ReasoningChain = {
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
};

export type ExploreResponse = {
  reasoning_chain: ReasoningChain;
  supporting_memories: string[];
};

export type ImproveResponse = {
  status: string;
  dataset_name?: string;
  dataset_id?: string;
  pipeline_run_id?: string;
  elapsed_seconds?: number;
  [key: string]: unknown;
};

export type ForgetResponse = {
  status?: string;
  dataset_id?: string;
  data_id?: string;
  [key: string]: unknown;
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

export async function recallMemory(query: string): Promise<RecallResult[]> {
  const res = await fetch(`${API_BASE}/memory/recall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to recall memory");
  }

  return res.json();
}

export async function analyzeImpact(
  question: string,
  options?: { guidedDemo?: boolean },
): Promise<ImpactResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.guidedDemo) {
    headers["X-Chronicle-Context"] = "guided-demo";
  }

  const res = await fetch(`${API_BASE}/memory/impact`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to analyze decision impact");
  }

  const data = (await res.json()) as ImpactResponse;

  if (process.env.NODE_ENV === "development" && data.performance) {
    console.log("[Chronicle Performance]", data.performance);
  }

  return data;
}

export async function exploreReasoning(query: string): Promise<ExploreResponse> {
  const res = await fetch(`${API_BASE}/memory/explore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to explore reasoning path");
  }

  return res.json();
}

export async function improveMemory(
  datasetName: string,
  instructions?: string,
): Promise<ImproveResponse> {
  const res = await fetch(`${API_BASE}/memory/improve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataset_name: datasetName,
      instructions,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to improve memory");
  }

  return res.json();
}

export async function forgetMemory(
  datasetName: string,
  dataId: string,
): Promise<ForgetResponse> {
  const res = await fetch(`${API_BASE}/memory/forget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataset_name: datasetName,
      data_id: dataId,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to forget memory");
  }

  return res.json();
}
