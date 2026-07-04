import {
  analyzeImpact,
  type ImpactResponse,
  type ReasoningChain,
} from "@/lib/api";

export type EvidenceSource = {
  id: string;
  title: string;
  preview: string;
  content: string;
  timestamp: string | null;
};

export type StructuredAnswer = {
  summary: string;
  evidence: EvidenceSource[];
  reasoning: string;
  recommendation: string;
  potentialImpacts?: string[];
  confidence?: "high" | "medium" | "low";
  chain: ReasoningChain;
};

export type AskChronicleSuccess = {
  kind: "answer";
  structured: StructuredAnswer;
  plainText: string;
};

export type AskChronicleEmpty = {
  kind: "empty";
};

export type AskChronicleError = {
  kind: "error";
  errorType: "offline" | "timeout" | "unavailable";
};

export type AskChronicleResult =
  | AskChronicleSuccess
  | AskChronicleEmpty
  | AskChronicleError;

export const EMPTY_FALLBACK = {
  title:
    "I couldn't find enough organizational context to answer confidently.",
  suggestions: [
    "Enterprise SSO",
    "Database decisions",
    "Customer interviews",
    "Analytics migration",
  ],
  footer: "Or add additional memories.",
};

const REQUEST_TIMEOUT_MS = 120_000;

function memoryTitle(text: string): string {
  const firstLine = text.trim().split("\n")[0] ?? text;
  if (firstLine.includes(":") && firstLine.split(":")[0].length <= 50) {
    return firstLine.split(":")[0].trim();
  }
  const sentence = firstLine.split(".")[0]?.trim() ?? firstLine;
  if (sentence.length <= 60) return sentence;
  return `${firstLine.slice(0, 57)}...`;
}

function preview(text: string, limit = 160): string {
  const compact = text.trim().replace(/\s+/g, " ");
  if (compact.length <= limit) return compact;
  return `${compact.slice(0, limit - 3)}...`;
}

function isEmptyImpact(impact: ImpactResponse): boolean {
  const summary = impact.summary?.trim() ?? "";
  if (
    summary.includes("I couldn't find enough organizational context") ||
    /no relevant memory found/i.test(summary)
  ) {
    return (
      impact.supporting_memories.length === 0 &&
      !impact.reasoning?.trim() &&
      impact.potential_impacts.length === 0
    );
  }

  return (
    !summary &&
    impact.supporting_memories.length === 0 &&
    !impact.reasoning?.trim() &&
    impact.potential_impacts.length === 0
  );
}

function evidenceFromImpact(impact: ImpactResponse): EvidenceSource[] {
  const chainMemories = impact.reasoning_chain.nodes.filter(
    (node) => node.type === "memory",
  );

  if (chainMemories.length > 0) {
    return chainMemories.map((node) => ({
      id: node.id,
      title: node.title,
      preview: node.preview,
      content: node.content,
      timestamp: node.timestamp,
    }));
  }

  return impact.supporting_memories.map((content, index) => ({
    id: `support-${index}`,
    title: memoryTitle(content),
    preview: preview(content),
    content,
    timestamp: null,
  }));
}

function deriveConfidence(evidence: EvidenceSource[]): "high" | "medium" | "low" {
  if (evidence.length >= 4) return "high";
  if (evidence.length >= 2) return "medium";
  return "low";
}

function impactToStructured(impact: ImpactResponse): StructuredAnswer {
  const evidence = evidenceFromImpact(impact);
  const recommendation =
    impact.potential_impacts[0]?.trim() ||
    "Review the supporting evidence and previous trade-offs before proceeding.";
  const extraImpacts = impact.potential_impacts
    .slice(1)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    summary: impact.summary?.trim() || EMPTY_FALLBACK.title,
    evidence,
    reasoning: impact.reasoning?.trim() || "",
    recommendation,
    potentialImpacts: extraImpacts,
    confidence: deriveConfidence(evidence),
    chain: impact.reasoning_chain ?? { nodes: [], edges: [] },
  };
}

function formatPlainText(answer: StructuredAnswer): string {
  const parts = [answer.summary];

  if (answer.evidence.length > 0) {
    parts.push(
      "",
      "Evidence:",
      ...answer.evidence.map((item) => `• ${item.title}`),
    );
  }

  if (answer.reasoning) {
    parts.push("", answer.reasoning);
  }

  if (answer.recommendation) {
    parts.push("", `Recommendation: ${answer.recommendation}`);
  }

  return parts.join("\n");
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("timeout")), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function isTimeoutError(err: unknown): boolean {
  return err instanceof Error && /timeout/i.test(err.message);
}

function isOfflineError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /fetch|network|502|503|504|failed to fetch|cognee cloud request failed/i.test(
    err.message,
  );
}

export function errorMessage(errorType: AskChronicleError["errorType"]): string {
  switch (errorType) {
    case "offline":
    case "unavailable":
      return "Chronicle is temporarily unable to reach organizational memory.";
    case "timeout":
      return "I'm still reasoning over the available memories.";
    default:
      return "Chronicle is temporarily unable to reach organizational memory.";
  }
}

/** Thin client adapter — all reasoning runs in the backend unified pipeline. */
export async function askChronicleQuestion(
  question: string,
  options?: { timeoutMs?: number },
): Promise<AskChronicleResult> {
  const trimmed = question.trim();
  if (!trimmed) return { kind: "empty" };

  const timeoutMs = options?.timeoutMs ?? REQUEST_TIMEOUT_MS;

  try {
    const impact = await withTimeout(analyzeImpact(trimmed), timeoutMs);

    if (isEmptyImpact(impact)) {
      return { kind: "empty" };
    }

    const structured = impactToStructured(impact);
    return {
      kind: "answer",
      structured,
      plainText: formatPlainText(structured),
    };
  } catch (err) {
    if (isTimeoutError(err)) return { kind: "error", errorType: "timeout" };
    if (isOfflineError(err)) return { kind: "error", errorType: "offline" };
    return { kind: "error", errorType: "unavailable" };
  }
}
