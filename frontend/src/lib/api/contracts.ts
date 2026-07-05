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

export type ImpactResponse = {
  summary: string;
  supporting_memories: string[];
  reasoning: string;
  potential_impacts: string[];
  reasoning_chain: ReasoningChain;
  performance?: ImpactPerformance;
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

export type HealthResponse = {
  status: string;
};
