export type FieldError = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  detail?: string | null;
  field_errors?: FieldError[] | null;
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};

export class ChronicleValidationError extends Error {
  readonly code = "CLIENT_VALIDATION_ERROR";
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ChronicleValidationError";
    this.field = field;
  }
}

export class ChronicleApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly detail?: string;
  readonly fieldErrors?: FieldError[];

  constructor(
    message: string,
    options: {
      code: string;
      status: number;
      detail?: string;
      fieldErrors?: FieldError[];
    },
  ) {
    super(message);
    this.name = "ChronicleApiError";
    this.code = options.code;
    this.status = options.status;
    this.detail = options.detail;
    this.fieldErrors = options.fieldErrors;
  }

  static async fromResponse(response: Response): Promise<ChronicleApiError> {
    const status = response.status;
    const fallbackMessage = `Chronicle API request failed (${status})`;

    try {
      const payload = (await response.json()) as ApiErrorResponse | { detail?: unknown };
      if ("error" in payload && payload.error?.message) {
        return new ChronicleApiError(payload.error.message, {
          code: payload.error.code ?? "HTTP_ERROR",
          status,
          detail: payload.error.detail ?? undefined,
          fieldErrors: payload.error.field_errors ?? undefined,
        });
      }
      if ("detail" in payload && payload.detail) {
        const detail =
          typeof payload.detail === "string"
            ? payload.detail
            : JSON.stringify(payload.detail);
        return new ChronicleApiError(detail, {
          code: "HTTP_ERROR",
          status,
          detail,
        });
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) {
        return new ChronicleApiError(text, {
          code: "HTTP_ERROR",
          status,
          detail: text,
        });
      }
    }

    return new ChronicleApiError(fallbackMessage, {
      code: "HTTP_ERROR",
      status,
    });
  }

  static network(message = "Network request failed"): ChronicleApiError {
    return new ChronicleApiError(message, {
      code: "NETWORK_ERROR",
      status: 0,
    });
  }

  static timeout(message = "Request timed out"): ChronicleApiError {
    return new ChronicleApiError(message, {
      code: "TIMEOUT",
      status: 0,
    });
  }
}

export function isChronicleApiError(error: unknown): error is ChronicleApiError {
  return error instanceof ChronicleApiError;
}

export function isChronicleValidationError(
  error: unknown,
): error is ChronicleValidationError {
  return error instanceof ChronicleValidationError;
}
