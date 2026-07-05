import { apiRequest, apiRequestWithTimeout } from "@/lib/api/client";
import type {
  ExploreResponse,
  ForgetResponse,
  HealthResponse,
  ImpactResponse,
  ImproveResponse,
  RecallResult,
  RememberResponse,
} from "@/lib/api/contracts";
import {
  type ChronicleRequestContext,
  WORKSPACE_CONTEXT,
} from "@/lib/api/context";
import {
  validateForgetRequest,
  validateImpactRequest,
  validateImproveRequest,
  validateRecallRequest,
  validateRememberRequest,
} from "@/lib/api/validators";
import { withTransientRetry } from "@/lib/api/retry";

export async function fetchHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/health", { cache: "no-store" });
}

export async function rememberMemory(text: string): Promise<RememberResponse> {
  return apiRequest<RememberResponse>("/memory/remember", {
    method: "POST",
    body: validateRememberRequest(text),
  });
}

export async function recallMemory(query: string): Promise<RecallResult[]> {
  return withTransientRetry(
    () =>
      apiRequest<RecallResult[]>("/memory/recall", {
        method: "POST",
        body: validateRecallRequest(query),
      }),
    { path: "/memory/recall" },
  );
}

export async function analyzeImpact(
  question: string,
  context: ChronicleRequestContext = WORKSPACE_CONTEXT,
): Promise<ImpactResponse> {
  const data = await withTransientRetry(
    () =>
      apiRequest<ImpactResponse>("/memory/impact", {
        method: "POST",
        body: validateImpactRequest(question, context),
      }),
    { path: "/memory/impact" },
  );

  if (process.env.NODE_ENV === "development" && data.performance) {
    console.log("[Chronicle Performance]", data.performance);
  }

  return data;
}

export async function analyzeImpactWithTimeout(
  question: string,
  options: {
    context?: ChronicleRequestContext;
    timeoutMs: number;
  },
): Promise<ImpactResponse> {
  const data = await apiRequestWithTimeout<ImpactResponse>("/memory/impact", {
    method: "POST",
    body: validateImpactRequest(question, options.context ?? WORKSPACE_CONTEXT),
    timeoutMs: options.timeoutMs,
    retryTransient: true,
    retryPath: "/memory/impact",
  });

  if (process.env.NODE_ENV === "development" && data.performance) {
    console.log("[Chronicle Performance]", data.performance);
  }

  return data;
}

export async function exploreReasoning(query: string): Promise<ExploreResponse> {
  return apiRequest<ExploreResponse>("/memory/explore", {
    method: "POST",
    body: validateRecallRequest(query),
  });
}

export async function improveMemory(
  datasetName: string,
  instructions?: string,
): Promise<ImproveResponse> {
  return apiRequest<ImproveResponse>("/memory/improve", {
    method: "POST",
    body: validateImproveRequest(datasetName, instructions),
  });
}

export async function forgetMemory(
  datasetName: string,
  dataId: string,
): Promise<ForgetResponse> {
  return apiRequest<ForgetResponse>("/memory/forget", {
    method: "POST",
    body: validateForgetRequest(datasetName, dataId),
  });
}
