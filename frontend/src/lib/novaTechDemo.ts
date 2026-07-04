/** NovaTech fictional company — Interactive Demo data only. */

import type { ImpactResponse } from "@/lib/api";

export const NOVA_TECH = "NovaTech";

export const DEMO_STEPS = [
  { id: "decision", label: "The Decision", number: 1 },
  { id: "evidence", label: "The Evidence", number: 2 },
  { id: "impact", label: "The Impact", number: 3 },
  { id: "ask", label: "Ask Anything", number: 4 },
  { id: "your-turn", label: "Your Turn", number: 5 },
] as const;

export type DemoStepId = (typeof DEMO_STEPS)[number]["id"];

export const proposedDecision =
  "We're considering switching from PostgreSQL to MongoDB.";

export const hookAlert = {
  title: "Wait. Chronicle found something important before your team makes this decision.",
  subtext:
    "Your proposed decision resembles previous architectural decisions stored in organizational memory. Review them before proceeding.",
};

export const migrationImpactQuestion =
  "We're planning to migrate from PostgreSQL to MongoDB. Based on previous organizational decisions, what should we consider first?";

export type NovaTechMemorySeed = {
  id: string;
  title: string;
  category: string;
  memoryText: string;
};

/** Memories seeded into Cognee when the demo loads. All NovaTech. */
export const novaTechMemoriesToSeed: NovaTechMemorySeed[] = [
  {
    id: "customer-interviews-onboarding",
    title: "Customer Interview",
    category: "Customer Research",
    memoryText:
      "Customer Interview at NovaTech: Users were confused during onboarding. Enterprise prospects asked about data integrity, audit trails, and compliance reporting before signing.",
  },
  {
    id: "meeting-12",
    title: "Product Meeting #12",
    category: "Decision Record",
    memoryText:
      "Product Meeting #12 at NovaTech: The team decided to redesign onboarding before implementing enterprise features. Authentication roadmap deferred until onboarding UX improved.",
  },
  {
    id: "sso-postponed",
    title: "Enterprise SSO Decision",
    category: "Decision Record",
    memoryText:
      "NovaTech decision: Enterprise SSO was postponed until the onboarding redesign is complete. Engineering capacity redirected to onboarding flow improvements.",
  },
  {
    id: "analytics-onboarding",
    title: "Analytics Report",
    category: "Analytics",
    memoryText:
      "Analytics Report at NovaTech: Onboarding completion improved from 41% to 79% after the redesign. Security and compliance concerns appeared in 68% of churned trial accounts.",
  },
  {
    id: "analytics-incident",
    title: "Analytics Incident",
    category: "Postmortem",
    memoryText:
      "Analytics Incident at NovaTech: A rushed database migration for the reporting pipeline caused inconsistent revenue metrics for two weeks. Postmortem documented insufficient testing of join-heavy billing queries.",
  },
  {
    id: "architecture-review",
    title: "Architecture Review",
    category: "Architecture Review",
    memoryText:
      "Architecture Review at NovaTech: Query analysis showed 70% of workloads involved multi-table joins across users, subscriptions, and invoices. Document store migration would require significant application rewrites for revenue-critical data.",
  },
  {
    id: "postgres-decision",
    title: "Database Decision",
    category: "Decision Record",
    memoryText:
      "Decision at NovaTech: Chose PostgreSQL over MongoDB for the core platform. Reasoning: relational integrity for financial reporting, existing team SQL expertise, lower migration risk, and enterprise audit requirements. MongoDB deferred for a potential future catalog microservice.",
  },
  {
    id: "customer-interviews-db",
    title: "Customer Interview (Database)",
    category: "Customer Research",
    memoryText:
      "Customer Interviews at NovaTech: Six enterprise prospects required audit trails and transactional accuracy. Document-style storage came up for catalogs, but compliance was non-negotiable.",
  },
];

/** Evidence cards shown in step 2 — mirror seeded organizational memory. */
export const novaTechEvidence = novaTechMemoriesToSeed.map((m) => ({
  id: m.id,
  title: m.title,
  category: m.category,
  preview: m.memoryText.split(".")[0] + ".",
}));

export const memorySnapshot = [
  { label: "Slack", count: 24 },
  { label: "Jira", count: 18 },
  { label: "Architecture Reviews", count: 6 },
  { label: "Decision Records", count: 12 },
  { label: "Postmortems", count: 3 },
  { label: "Documentation", count: 31 },
];

export const suggestionChips = [
  "Why did we choose PostgreSQL?",
  "Should we switch our database?",
  "Explain Product Meeting #12",
  "How are onboarding metrics connected to Enterprise SSO?",
  "What customer feedback changed our roadmap?",
  "Will Chronicle monitor my computer to acquire memory?",
];

export const monitorQuestionPattern =
  /monitor.*(my )?computer|acquire.*memory|watch.*(my )?computer|spy.*computer/i;

export const monitorQuestionResponse = `Chronicle is an AI Decision Intelligence platform. Its purpose is to transform historical organizational decisions into guidance for future decisions.

Today, Chronicle reasons over memories stored in its organizational knowledge graph — not by monitoring your computer.

Chronicle follows an event-driven architecture. Future versions can receive events from systems like GitHub, Slack, Jira, or desktop agents through a unified Event Ingestion API. The reasoning engine remains exactly the same regardless of where memories originate.

Chronicle does not currently monitor your computer.`;

export const demoFooterCopy =
  "Chronicle is actively reasoning over a fictional organizational memory created for demonstration. Ask your own questions. The reasoning engine is fully functional.";

export const journeyBottomCard = {
  title: "This demo is yours.",
  lines: ["Pause.", "Explore.", "Ask anything."],
};

export function demoGracefulFallback(context: "recall" | "impact" | "seed" | "explore"): string {
  switch (context) {
    case "seed":
      return "Demo memories couldn't be loaded. Check that the demo environment is running, then replay.";
    case "recall":
      return "Chronicle couldn't find a matching memory for that question. Try one of the suggested prompts.";
    case "impact":
      return "Impact analysis is temporarily unavailable. You can still ask Chronicle directly.";
    case "explore":
      return "Reasoning path unavailable for this query.";
    default:
      return "Please try again in a moment.";
  }
}

/** Static fallback only if impact API fails — uses same narrative intent, not shown when API works. */
export const impactFallbackSummary =
  "Your previous database decision prioritized reporting consistency and ACID guarantees. Switching now introduces risks similar to the analytics migration discussed previously.";

export const impactFallbackRecommendation =
  "Review the previous decision before proceeding.";

export type DemoImpactState = ImpactResponse | null;
