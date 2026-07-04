/** NovaTech fictional company — guided experience presentation data only. */

export const NOVA_TECH = "NovaTech";

export type NovaTechTimelineEntry = {
  id: string;
  title: string;
  date: string;
  preview: string;
  memoryText: string;
};

export const novaTechTimeline: NovaTechTimelineEntry[] = [
  {
    id: "meeting-12",
    title: "Product Meeting #12",
    date: "Mar 12",
    preview: "Authentication roadmap and enterprise readiness.",
    memoryText:
      "Product Meeting #12 at NovaTech: The team reviewed the authentication roadmap. Enterprise prospects consistently ask about SSO before signing. We agreed security infrastructure must scale before aggressive enterprise sales.",
  },
  {
    id: "customer-interview",
    title: "Customer Interview",
    date: "Mar 18",
    preview: "Enterprise buyers require SSO before procurement.",
    memoryText:
      "Customer Interview at NovaTech: Three enterprise buyers stated SSO is a non-negotiable requirement. One VP of IT said they cannot approve tools without SAML or OIDC integration. Delaying SSO risks losing Q3 enterprise pipeline.",
  },
  {
    id: "analytics-report",
    title: "Analytics Report",
    date: "Apr 2",
    preview: "Security concerns appear in churn and trial data.",
    memoryText:
      "Analytics Report at NovaTech: 68% of churned trial accounts mentioned security or compliance concerns. Support tickets referencing login and access control increased 40% quarter over quarter.",
  },
  {
    id: "sso-discussion",
    title: "Enterprise SSO Discussion",
    date: "Apr 9",
    preview: "Build vs buy debate for SSO implementation.",
    memoryText:
      "Enterprise SSO Discussion at NovaTech: Engineering debated building SSO in-house versus using Auth0. Decision: prioritize SSO in Q3 because enterprise deals stall without it. Estimated 6-week implementation. Risk accepted: delaying feature work on analytics dashboard.",
  },
];

export const guidedSsoQuestion =
  "We're planning Enterprise SSO next quarter. Is there anything from previous decisions we should know first?";

export const chroniGuidedScript = {
  welcome: `Welcome to ${NOVA_TECH}. Over the last few months I've been observing important product decisions. Let's look at them together.`,
  timeline: "Here's what your organization already captured — decisions, context, and the reasoning behind them.",
  ssoSetup:
    "Imagine your team is planning Enterprise SSO again. Before making that decision… let's see what your organization already learned.",
  seeding: "Let me connect these memories so Chronicle can reason across them.",
  seedingDone: "Organizational memory is ready. Now let's ask the question that matters.",
  questionPrompt: "Ask what your organization already knows — before you decide.",
  results: "Here's what NovaTech already learned — with full reasoning you can trace.",
  improve: "I've strengthened the connections between these decisions.",
  celebrate:
    "That's decision intelligence — recall, reasoning, and traceability. Ready to use Chronicle on your own?",
};
