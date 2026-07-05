/** Curated NovaTech sample for the Workspace playground — not used by Guided Demo. */

export const NOVATECH_SAMPLE_MEMORIES: string[] = [
  "Customer Interview #8 (NovaTech, Sep 2025): Enterprise customers require reliable reporting exports with row-level audit trails. Reporting consistency is considered more important than write throughput. This feedback influenced Architecture Review Oct 2025 and ADR-004 on PostgreSQL.",
  "Product Meeting #12 (NovaTech, Aug 2025): The team decided to redesign onboarding before implementing enterprise features. Authentication roadmap and Enterprise SSO deferred until onboarding UX improved.",
  "ADR-004 (NovaTech, Oct 2025): Chose PostgreSQL over MongoDB for the core platform. Reasoning: relational integrity for financial reporting, existing team SQL expertise, lower migration risk, and enterprise audit requirements.",
  "Architecture Review (NovaTech, Oct 2025): MongoDB evaluated for core platform. Rejected because reporting consistency and ACID guarantees outweighed scaling benefits. Referenced Product Meeting #12 and Customer Interview #8.",
  "NovaTech decision: Enterprise SSO was postponed until the onboarding redesign is complete. Engineering capacity redirected to onboarding flow improvements.",
  "Analytics Review (NovaTech, Jan 2026): Onboarding completion improved from 41% to 79% after the redesign. Security and compliance concerns appeared in 68% of churned trial accounts.",
  "Incident Report #41 (NovaTech, Nov 2025): Analytics service experienced severe latency and inconsistent revenue metrics after bypassing relational joins for a faster document snapshot export. Duration: 14 days of metric drift.",
  "Postmortem Incident #41 (NovaTech, Nov 2025): Root cause — rushed analytics migration skipped join-heavy billing query tests. Future reporting services must preserve relational integrity.",
  "Engineering Meeting (NovaTech, Sep 2025): Discussed PostgreSQL vs MongoDB. 70% of queries are multi-table joins across users, subscriptions, and invoices. Outcome fed Architecture Review Oct 2025.",
  "Jira DATA-882 (NovaTech): Ticket rejected — Migrate billing tables to MongoDB. Reason: violates ADR-004 and Customer Interview #11 audit requirements.",
  "Customer Interview #11 (NovaTech, Oct 2025): Six enterprise prospects required transactional accuracy and SOX-friendly audit logs. Document-style storage acceptable only for catalogs, not billing.",
  "Product Meeting #18 (NovaTech, Feb 2026): Onboarding completion reached 79%. Product reopened Enterprise SSO for Q2 planning contingent on Security Review sign-off.",
  "Security Review Q4 2025 (NovaTech): Enterprise audit requirements mandate immutable audit trails on subscription changes. PostgreSQL row-level security approved.",
  "Sprint Planning S24 (NovaTech, Aug 2025): Onboarding redesign squad formed. Enterprise SSO removed from sprint backlog per Product Meeting #12.",
  "Executive Summary (NovaTech, Feb 2026): Board noted 79% onboarding completion. Approved Q2 budget for Enterprise SSO discovery. Reinforced no database migration without architecture review after Incident #41.",
  "Slack #engineering (NovaTech, Sep 2025): Thread on MongoDB POC. Revenue reconciliation queries need five-way joins. Consensus: POC useful for catalog only.",
  "Analytics Review (NovaTech, Oct 2025): Onboarding completion at 41%. Drop-off concentrated at team invite step. Recommended UX simplification before enterprise features.",
  "Release Decision REL-2025-11 (NovaTech): Rolled back experimental analytics document export after Incident #41. Restored PostgreSQL join pipeline.",
  "ADR-009 (NovaTech, Jan 2026): Analytics reporting must use PostgreSQL with materialized views; no document-store shortcut for revenue dashboards.",
  "Customer Interview #3 (NovaTech, Jun 2025): Trial users abandoned onboarding at workspace setup. Three prospects cited confusion about permissions and team invites.",
  "Performance Report (NovaTech, Mar 2026): Onboarding API p95 latency down 38% after Redis caching. No evidence supporting MongoDB migration for join-heavy workloads.",
  "Feature Flag Rollout (NovaTech, Jan 2026): onboarding_v2 enabled progressively to 100%. Monitored via Analytics Review metrics.",
  "API Gateway Migration Plan (NovaTech, Dec 2025): Kong replaces legacy nginx ingress for external APIs. Internal reporting microservices retain direct PostgreSQL replica access.",
  "Customer Complaint Log #512 (NovaTech, Dec 2025): Customer reported mismatch in quarterly revenue export during analytics migration experiment. Matched Incident #41 timeline.",
  "Executive Decision (NovaTech, Aug 2025): CTO memo — Fix onboarding before enterprise features. Enterprise SSO removed from Q3 OKRs.",
];

export const CLAUDE_MEMORY_PROMPT = `You are helping populate Chronicle, a Decision Intelligence validation playground.

Generate 12–18 interconnected organizational memories for a fictional SaaS company called NovaTech.

Requirements:
- Reference other decisions naturally (meetings, ADRs, incidents, interviews)
- Cover: database decisions, Enterprise SSO, onboarding, analytics incidents, architecture reviews
- Use realistic formats: Customer Interview #N, Product Meeting #N, ADR-NNN, Incident Report #N, etc.
- One memory per paragraph
- Separate each memory with a blank line

Topics to interconnect:
- PostgreSQL vs MongoDB (PostgreSQL chosen for reporting/ACID)
- Enterprise SSO postponed until onboarding improved (41% → 79% completion)
- Analytics Incident #41 from bypassing relational joins
- Customer audit and reporting consistency requirements

Output only the memory paragraphs — no preamble.`;

export const DATASET_LABEL = "main_dataset";

export const NOVATECH_DATASET_DISPLAY_NAME = "NovaTech (Pre-loaded)";
