export type RetrievalProfile = "full" | "demo";

/** Internal request context — never sent as headers; only serialized in JSON bodies. */
export type ChronicleRequestContext = {
  retrievalProfile: RetrievalProfile;
};

export const WORKSPACE_CONTEXT: ChronicleRequestContext = {
  retrievalProfile: "full",
};

export const GUIDED_DEMO_CONTEXT: ChronicleRequestContext = {
  retrievalProfile: "demo",
};
