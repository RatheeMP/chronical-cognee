import type { ChronicleRequestContext } from "@/lib/api/context";
import {
  ChronicleApiError,
  ChronicleValidationError,
} from "@/lib/api/errors";

const RETRIEVAL_PROFILES = new Set(["full", "demo"]);

function requireNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ChronicleValidationError(field, `${field} is required`);
  }
  return trimmed;
}

export function validateRememberRequest(text: string): { text: string } {
  return { text: requireNonEmpty(text, "text") };
}

export function validateRecallRequest(query: string): { query: string } {
  return { query: requireNonEmpty(query, "query") };
}

export function validateImpactRequest(
  question: string,
  context: ChronicleRequestContext,
): { question: string; retrieval_profile: "full" | "demo" } {
  const profile = context.retrievalProfile;
  if (!RETRIEVAL_PROFILES.has(profile)) {
    throw new ChronicleValidationError(
      "retrieval_profile",
      `Invalid retrieval profile: ${profile}`,
    );
  }
  return {
    question: requireNonEmpty(question, "question"),
    retrieval_profile: profile,
  };
}

export function validateImproveRequest(
  datasetName: string,
  instructions?: string,
): { dataset_name: string; instructions?: string } {
  const body: { dataset_name: string; instructions?: string } = {
    dataset_name: requireNonEmpty(datasetName, "dataset_name"),
  };
  const trimmedInstructions = instructions?.trim();
  if (trimmedInstructions) {
    body.instructions = trimmedInstructions;
  }
  return body;
}

export function validateForgetRequest(
  datasetName: string,
  dataId: string,
): { dataset_name: string; data_id: string } {
  return {
    dataset_name: requireNonEmpty(datasetName, "dataset_name"),
    data_id: requireNonEmpty(dataId, "data_id"),
  };
}

export function mapFetchError(error: unknown): ChronicleApiError {
  if (error instanceof ChronicleApiError || error instanceof ChronicleValidationError) {
    if (error instanceof ChronicleValidationError) {
      return new ChronicleApiError(error.message, {
        code: error.code,
        status: 0,
        fieldErrors: [{ field: error.field, message: error.message }],
      });
    }
    return error;
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return ChronicleApiError.network(error.message);
  }

  if (error instanceof Error) {
    return new ChronicleApiError(error.message, {
      code: "UNKNOWN_ERROR",
      status: 0,
    });
  }

  return new ChronicleApiError("Unknown error", { code: "UNKNOWN_ERROR", status: 0 });
}
