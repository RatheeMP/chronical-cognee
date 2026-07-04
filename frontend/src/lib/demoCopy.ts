/** Presentation copy — workspace defaults and Chroni voice only. */

export const chroniSuggestedMemory = {
  greeting:
    "I found an important engineering decision. Would you like to review it before storing it?",
  context: "Observed from recent platform discussions",
  text: "We chose PostgreSQL over MongoDB in Q2 because our team needed relational integrity for financial reporting and existing SQL expertise on staff.",
};

export const demoQuestionPlaceholder =
  "Why did we choose PostgreSQL for the analytics platform?";

export const demoImpactPlaceholder =
  "What should we know before making this decision?";

export function friendlyError(message: string): string {
  if (/network|fetch|failed to fetch/i.test(message)) {
    return "Connection issue. Check that the demo environment is running.";
  }
  if (/cognee|status|pipeline|dataset|missing memory id/i.test(message)) {
    return "Something went wrong on our side. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
