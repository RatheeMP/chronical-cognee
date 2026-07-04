"""NovaTech fictional organizational memory dataset for Chronicle interactive demo.

Approximately 50 interconnected memories referencing a single engineering narrative.
Do not import this module from production application code.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DemoMemory:
    category: str
    text: str


NOVA_TECH_DEMO_MEMORIES: list[DemoMemory] = [
    # ── Customer interviews ──────────────────────────────────────────────
    DemoMemory(
        category="Customer Interview",
        text=(
            "Customer Interview #3 (NovaTech, Jun 2025): Trial users abandoned onboarding "
            "at the workspace setup step. Three prospects cited confusion about permissions "
            "and team invites. This feedback was escalated to Product Meeting #8."
        ),
    ),
    DemoMemory(
        category="Customer Interview",
        text=(
            "Customer Interview #8 (NovaTech, Sep 2025): Enterprise customers require "
            "reliable reporting exports with row-level audit trails. Reporting consistency "
            "is considered more important than write throughput. This feedback influenced "
            "Architecture Review Oct 2025 and ADR-004 on PostgreSQL."
        ),
    ),
    DemoMemory(
        category="Customer Interview",
        text=(
            "Customer Interview #11 (NovaTech, Oct 2025): Six enterprise prospects required "
            "transactional accuracy and SOX-friendly audit logs before signing. Document-style "
            "storage was acceptable only for product catalogs, not billing. Referenced in "
            "Security Review Q4 2025 and the PostgreSQL decision."
        ),
    ),
    DemoMemory(
        category="Customer Interview",
        text=(
            "Customer Interview #14 (NovaTech, Jan 2026): Churned trial accounts frequently "
            "mentioned security questionnaires and missing SSO. Sales noted SSO is a blocker "
            "for deals over $50k ARR. Product linked this to the deferred Enterprise SSO "
            "roadmap from Product Meeting #12."
        ),
    ),
    # ── Product meetings ─────────────────────────────────────────────────
    DemoMemory(
        category="Product Meeting",
        text=(
            "Product Meeting #8 (NovaTech, Jul 2025): Agreed to prioritize onboarding clarity "
            "over net-new enterprise features for H2. Success metric set at 60% onboarding "
            "completion. Engineering allocated one squad to onboarding redesign."
        ),
    ),
    DemoMemory(
        category="Product Meeting",
        text=(
            "Product Meeting #12 (NovaTech, Aug 2025): The team decided to redesign onboarding "
            "before implementing enterprise features. Authentication roadmap and Enterprise SSO "
            "deferred until onboarding UX improved. Referenced in Sprint Planning S24 and Jira "
            "epic ENT-1201."
        ),
    ),
    DemoMemory(
        category="Product Meeting",
        text=(
            "Product Meeting #15 (NovaTech, Nov 2025): Reviewed analytics migration proposal. "
            "Decided not to bypass PostgreSQL joins for revenue dashboards after Incident #41. "
            "Approved incremental materialized views instead of document store for reporting."
        ),
    ),
    DemoMemory(
        category="Product Meeting",
        text=(
            "Product Meeting #18 (NovaTech, Feb 2026): Onboarding completion reached 79%. "
            "Product reopened Enterprise SSO for Q2 planning contingent on Security Review "
            "sign-off. Executive Summary Feb 2026 noted this milestone."
        ),
    ),
    # ── Engineering meetings ─────────────────────────────────────────────
    DemoMemory(
        category="Engineering Meeting",
        text=(
            "Engineering Meeting (NovaTech, Sep 2025): Discussed PostgreSQL vs MongoDB for core "
            "platform. 70% of queries are multi-table joins across users, subscriptions, and "
            "invoices. Team SQL expertise favored PostgreSQL. Outcome fed Architecture Review "
            "Oct 2025."
        ),
    ),
    DemoMemory(
        category="Engineering Meeting",
        text=(
            "Engineering Meeting (NovaTech, Dec 2025): API Gateway migration from monolith "
            "ingress to Kong approved for billing and auth routes. Reporting services remain "
            "on internal PostgreSQL read replicas per ADR-004. Feature flag rollout planned "
            "for gateway cutover."
        ),
    ),
    DemoMemory(
        category="Engineering Meeting",
        text=(
            "Engineering Meeting (NovaTech, Mar 2026): Performance review of onboarding API "
            "showed p95 latency improved 38% after Redis caching. Database team reiterated "
            "no MongoDB migration for core ledger tables citing Incident #41 and customer "
            "audit requirements."
        ),
    ),
    # ── Architecture reviews ─────────────────────────────────────────────
    DemoMemory(
        category="Architecture Review",
        text=(
            "Architecture Review (NovaTech, Oct 2025): MongoDB evaluated for core platform. "
            "Rejected because reporting consistency and ACID guarantees outweighed scaling "
            "benefits. Referenced Product Meeting #12 priorities and Customer Interview #8. "
            "PostgreSQL retained; MongoDB scoped to future catalog microservice only."
        ),
    ),
    DemoMemory(
        category="Architecture Review",
        text=(
            "Architecture Review (NovaTech, Jan 2026): Analytics pipeline redesign must preserve "
            "relational integrity for revenue metrics. Prohibited denormalized document snapshots "
            "for billing reconciliation. Aligns with postmortem from Incident #41."
        ),
    ),
    DemoMemory(
        category="Architecture Review",
        text=(
            "Architecture Review (NovaTech, Mar 2026): API Gateway migration architecture "
            "approved. External traffic routes through Kong; internal reporting continues via "
            "PostgreSQL replicas. Feature flags gate 10% canary per Release Decision REL-2026-03."
        ),
    ),
    # ── ADRs ─────────────────────────────────────────────────────────────
    DemoMemory(
        category="ADR",
        text=(
            "ADR-004 (NovaTech, Oct 2025): Chose PostgreSQL over MongoDB for core platform. "
            "Reasoning: relational integrity for financial reporting, existing team SQL "
            "expertivity, lower migration risk, enterprise audit requirements. MongoDB deferred "
            "to catalog microservice. Supersedes draft ADR-003."
        ),
    ),
    DemoMemory(
        category="ADR",
        text=(
            "ADR-007 (NovaTech, Nov 2025): Enterprise SSO implementation postponed until "
            "onboarding redesign completes. Depends on Product Meeting #12. Security team "
            "documented SAML requirements but assigned no sprint capacity."
        ),
    ),
    DemoMemory(
        category="ADR",
        text=(
            "ADR-009 (NovaTech, Jan 2026): Analytics reporting must use PostgreSQL with "
            "materialized views; no document-store shortcut for revenue dashboards. Response "
            "to Incident #41 and Architecture Review Jan 2026."
        ),
    ),
    DemoMemory(
        category="ADR",
        text=(
            "ADR-011 (NovaTech, Mar 2026): API Gateway standard is Kong for north-south "
            "traffic. East-west service mesh out of scope for H1. Feature flag service "
            "LaunchDarkly required for gateway migration rollout."
        ),
    ),
    # ── Jira decisions ───────────────────────────────────────────────────
    DemoMemory(
        category="Jira Decision",
        text=(
            "Jira ENT-1201 (NovaTech): Epic closed — Onboarding redesign phase 1. Linked to "
            "Product Meeting #12. Completion unblocks ENT-1450 Enterprise SSO discovery."
        ),
    ),
    DemoMemory(
        category="Jira Decision",
        text=(
            "Jira DATA-882 (NovaTech): Ticket rejected — Migrate billing tables to MongoDB. "
            "Reason: violates ADR-004 and Customer Interview #11 audit requirements. "
            "Reopened as DATA-901 materialized view optimization instead."
        ),
    ),
    DemoMemory(
        category="Jira Decision",
        text=(
            "Jira INC-41 follow-up (NovaTech): Action item complete — add join regression tests "
            "for analytics export pipeline. Owner: data platform squad. Referenced in "
            "Postmortem Incident #41."
        ),
    ),
    DemoMemory(
        category="Jira Decision",
        text=(
            "Jira REL-330 (NovaTech): Release gate — API Gateway canary requires feature flag "
            "api_gateway_v2 at 10% with rollback playbook. Blocks REL-2026-03 production cutover."
        ),
    ),
    # ── Slack discussions ────────────────────────────────────────────────
    DemoMemory(
        category="Slack Discussion",
        text=(
            "Slack #engineering (NovaTech, Sep 2025): Thread on MongoDB POC. Data team noted "
            "revenue reconciliation queries need five-way joins. Consensus: POC useful for "
            "catalog only. Link shared to Architecture Review Oct 2025 notes."
        ),
    ),
    DemoMemory(
        category="Slack Discussion",
        text=(
            "Slack #product (NovaTech, Aug 2025): PM confirmed Enterprise SSO slides removed "
            "from Q3 roadmap deck per Product Meeting #12. Onboarding metrics dashboard linked."
        ),
    ),
    DemoMemory(
        category="Slack Discussion",
        text=(
            "Slack #incidents (NovaTech, Nov 2025): On-call reported analytics export latency "
            "spike during attempted join bypass. Incident #41 opened. Engineering reminded "
            "channel of ADR-004 relational requirements."
        ),
    ),
    DemoMemory(
        category="Slack Discussion",
        text=(
            "Slack #releases (NovaTech, Mar 2026): Feature flag api_gateway_v2 enabled for 10% "
            "canary. No regressions on billing read path. PostgreSQL replica lag within SLO."
        ),
    ),
    # ── Incidents & postmortems ──────────────────────────────────────────
    DemoMemory(
        category="Incident Report",
        text=(
            "Incident Report #41 (NovaTech, Nov 2025): Analytics service experienced severe "
            "latency and inconsistent revenue metrics after bypassing relational joins for a "
            "faster document snapshot export. Duration: 14 days of metric drift. Linked to "
            "Jira DATA-882 rejection rationale."
        ),
    ),
    DemoMemory(
        category="Postmortem",
        text=(
            "Postmortem Incident #41 (NovaTech, Nov 2025): Root cause — rushed analytics "
            "migration skipped join-heavy billing query tests. Action: future reporting services "
            "must preserve relational integrity per ADR-009. Engineering decided against "
            "MongoDB shortcuts for revenue data."
        ),
    ),
    DemoMemory(
        category="Incident Report",
        text=(
            "Incident Report #28 (NovaTech, Jul 2025): Onboarding API timeout during peak "
            "signup traffic. Performance bottleneck in permission seeding. Led to Sprint 22 "
            "onboarding performance work and Redis cache layer."
        ),
    ),
    # ── Analytics reviews ────────────────────────────────────────────────
    DemoMemory(
        category="Analytics Review",
        text=(
            "Analytics Review (NovaTech, Oct 2025): Onboarding completion at 41%. Drop-off "
            "concentrated at team invite step per Customer Interview #3. Recommended UX "
            "simplification before enterprise feature work."
        ),
    ),
    DemoMemory(
        category="Analytics Review",
        text=(
            "Analytics Review (NovaTech, Jan 2026): Onboarding completion improved to 79% after "
            "redesign. Security and compliance concerns appeared in 68% of churned trial "
            "accounts per Customer Interview #14. SSO demand increasing."
        ),
    ),
    DemoMemory(
        category="Analytics Review",
        text=(
            "Analytics Review (NovaTech, Mar 2026): Revenue dashboard accuracy restored post "
            "Incident #41. Materialized view refresh SLA met for 30 days. Reporting consistency "
            "KPI green; supports Executive Summary Q1 2026."
        ),
    ),
    # ── Sprint planning ──────────────────────────────────────────────────
    DemoMemory(
        category="Sprint Planning",
        text=(
            "Sprint Planning S22 (NovaTech, Jul 2025): Committed to onboarding permission cache "
            "after Incident #28. Deferred SSO spike. Aligns with Product Meeting #8."
        ),
    ),
    DemoMemory(
        category="Sprint Planning",
        text=(
            "Sprint Planning S24 (NovaTech, Aug 2025): Onboarding redesign squad formed. "
            "Enterprise SSO removed from sprint backlog per Product Meeting #12. Capacity "
            "reallocated from ENT-1450 to ONB-200 series."
        ),
    ),
    DemoMemory(
        category="Sprint Planning",
        text=(
            "Sprint Planning S31 (NovaTech, Feb 2026): Enterprise SSO discovery sprint planned "
            "for Q2 after 79% onboarding milestone. Security Review Q1 must complete first."
        ),
    ),
    # ── Performance reports ──────────────────────────────────────────────
    DemoMemory(
        category="Performance Report",
        text=(
            "Performance Report (NovaTech, Mar 2026): Onboarding API p95 latency down 38% "
            "after Redis caching. PostgreSQL connection pool stable at 62% utilization. "
            "No evidence supporting MongoDB migration for performance on join-heavy workloads."
        ),
    ),
    DemoMemory(
        category="Performance Report",
        text=(
            "Performance Report (NovaTech, Nov 2025): Analytics export join bypass reduced "
            "query time 20% short-term but caused Incident #41 data drift. Recommendation: "
            "optimize indexes and materialized views instead."
        ),
    ),
    # ── Security reviews ─────────────────────────────────────────────────
    DemoMemory(
        category="Security Review",
        text=(
            "Security Review Q4 2025 (NovaTech): Enterprise audit requirements mandate "
            "immutable audit trails on subscription changes. PostgreSQL row-level security "
            "approved. Document stores require additional compliance work — not prioritized."
        ),
    ),
    DemoMemory(
        category="Security Review",
        text=(
            "Security Review Q1 2026 (NovaTech): Enterprise SSO SAML design reviewed. "
            "Implementation approved to begin Q2 contingent on onboarding milestone from "
            "Product Meeting #18. Blocks no ADR-004 database decisions."
        ),
    ),
    # ── Release decisions ────────────────────────────────────────────────
    DemoMemory(
        category="Release Decision",
        text=(
            "Release Decision REL-2025-11 (NovaTech): Rolled back experimental analytics "
            "document export after Incident #41 detection. Restored PostgreSQL join pipeline."
        ),
    ),
    DemoMemory(
        category="Release Decision",
        text=(
            "Release Decision REL-2026-03 (NovaTech): API Gateway migration canary at 10% "
            "via feature flag api_gateway_v2. Rollback tested. Billing and reporting paths "
            "unchanged on PostgreSQL replicas."
        ),
    ),
    DemoMemory(
        category="Release Decision",
        text=(
            "Release Decision REL-2026-01 (NovaTech): Onboarding redesign v2 shipped to 100% "
            "traffic. Feature flag onboarding_v2 removed after Analytics Review confirmed 79% "
            "completion rate."
        ),
    ),
    # ── Executive decisions ──────────────────────────────────────────────
    DemoMemory(
        category="Executive Decision",
        text=(
            "Executive Summary (NovaTech, Oct 2025): Leadership endorsed PostgreSQL for core "
            "platform per ADR-004. Paused enterprise upsell features until onboarding fixed. "
            "Customer Interview #8 reporting requirements cited."
        ),
    ),
    DemoMemory(
        category="Executive Decision",
        text=(
            "Executive Summary (NovaTech, Feb 2026): Board noted 79% onboarding completion. "
            "Approved Q2 budget for Enterprise SSO discovery. Reinforced no database migration "
            "without architecture review after Incident #41."
        ),
    ),
    DemoMemory(
        category="Executive Decision",
        text=(
            "Executive Summary (NovaTech, Mar 2026): CEO commended reporting consistency "
            "recovery post Incident #41. API Gateway migration on track. MongoDB remains "
            "scoped to future catalog service only."
        ),
    ),
    # ── Additional cross-links (feature flags, API gateway, complaints) ─
    DemoMemory(
        category="Feature Flag Rollout",
        text=(
            "Feature Flag Rollout (NovaTech, Jan 2026): onboarding_v2 enabled progressively "
            "10% → 50% → 100%. Monitored via Analytics Review metrics. No rollback required. "
            "Unblocked Enterprise SSO planning in Product Meeting #18."
        ),
    ),
    DemoMemory(
        category="Feature Flag Rollout",
        text=(
            "Feature Flag Rollout (NovaTech, Mar 2026): api_gateway_v2 canary at 10% per "
            "Release Decision REL-2026-03. LaunchDarkly integration per ADR-011. PostgreSQL "
            "read paths validated under canary load."
        ),
    ),
    DemoMemory(
        category="API Gateway Migration",
        text=(
            "API Gateway Migration Plan (NovaTech, Dec 2025): Kong replaces legacy nginx "
            "ingress for external APIs. Internal reporting microservices retain direct "
            "PostgreSQL replica access. Documented in Architecture Review Mar 2026."
        ),
    ),
    DemoMemory(
        category="Customer Complaint",
        text=(
            "Customer Complaint Log #447 (NovaTech, Sep 2025): Enterprise prospect declined "
            "POC citing missing SSO and unclear onboarding. Sales linked to Product Meeting #12 "
            "deferral and Customer Interview #14 themes."
        ),
    ),
    DemoMemory(
        category="Customer Complaint",
        text=(
            "Customer Complaint Log #512 (NovaTech, Dec 2025): Existing customer reported "
            "mismatch in quarterly revenue export during analytics migration experiment. "
            "Matched Incident #41 timeline; account received corrected report."
        ),
    ),
    DemoMemory(
        category="Engineering Meeting",
        text=(
            "Engineering Meeting (NovaTech, Nov 2025): War room for Incident #41. Agreed to "
            "halt document-store analytics shortcut. Reaffirmed PostgreSQL as source of truth "
            "for billing joins. Created ADR-009 action items."
        ),
    ),
    DemoMemory(
        category="Product Meeting",
        text=(
            "Product Meeting #10 (NovaTech, Jul 2025): Early discussion of Enterprise SSO for "
            "enterprise tier. Engineering flagged dependency on onboarding stability from "
            "Customer Interview #3. Predecessor to Product Meeting #12 deferral."
        ),
    ),
    DemoMemory(
        category="Architecture Review",
        text=(
            "Architecture Review (NovaTech, Aug 2025): Evaluated feature flag platform for "
            "risky rollouts. Selected LaunchDarkly. Required for future API Gateway migration "
            "and onboarding experiments."
        ),
    ),
    DemoMemory(
        category="Slack Discussion",
        text=(
            "Slack #data-platform (NovaTech, Jan 2026): Engineer asked about MongoDB for "
            "analytics again. Team pointed to ADR-004, ADR-009, and Postmortem Incident #41. "
            "Thread closed with link to materialized view runbook."
        ),
    ),
    DemoMemory(
        category="Sprint Planning",
        text=(
            "Sprint Planning S28 (NovaTech, Nov 2025): Sprint redirected to Incident #41 "
            "remediation. Analytics migration tickets DATA-882 closed. Postmortem action items "
            "assigned."
        ),
    ),
    DemoMemory(
        category="Security Review",
        text=(
            "Security Review (NovaTech, Aug 2025): SSO vendor shortlist created but implementation "
            "not approved until onboarding complete per ADR-007 and Product Meeting #12."
        ),
    ),
    DemoMemory(
        category="Analytics Review",
        text=(
            "Analytics Review (NovaTech, Dec 2025): Detected revenue metric divergence during "
            "analytics migration experiment. Triggered Incident #41 investigation. Confirmed "
            "reporting consistency as top customer priority from Interview #8."
        ),
    ),
    DemoMemory(
        category="Jira Decision",
        text=(
            "Jira ONB-215 (NovaTech): Closed — simplified team invite flow. Contributed to "
            "onboarding completion rise from 41% to 79%. Referenced in Release Decision "
            "REL-2026-01."
        ),
    ),
    DemoMemory(
        category="Performance Report",
        text=(
            "Performance Report (NovaTech, Aug 2025): PostgreSQL slow query log showed billing "
            "join queries dominate CPU. Index tuning prioritized over database replacement. "
            "Input to Engineering Meeting Sep 2025 PostgreSQL vs MongoDB discussion."
        ),
    ),
    DemoMemory(
        category="Executive Decision",
        text=(
            "Executive Decision (NovaTech, Aug 2025): CTO memo — 'Fix onboarding before "
            "enterprise features.' Formalized Product Meeting #12 outcome. Enterprise SSO "
            "removed from Q3 OKRs."
        ),
    ),
    DemoMemory(
        category="Incident Report",
        text=(
            "Incident Report #33 (NovaTech, Sep 2025): Feature flag misconfiguration exposed "
            "beta onboarding to 5% of users unintentionally. No data loss. Led to stricter "
            "LaunchDarkly change review per Architecture Review Aug 2025."
        ),
    ),
    DemoMemory(
        category="ADR",
        text=(
            "ADR-003 draft (NovaTech, Sep 2025): Proposed MongoDB for core platform — "
            "superseded by ADR-004 after Architecture Review Oct 2025 and customer audit "
            "feedback from Interview #11."
        ),
    ),
    DemoMemory(
        category="Customer Interview",
        text=(
            "Customer Interview #6 (NovaTech, Aug 2025): Mid-market customer praised product "
            "velocity but requested SSO and clearer setup wizard. Findings routed to Product "
            "Meeting #12 and onboarding redesign squad."
        ),
    ),
    DemoMemory(
        category="Postmortem",
        text=(
            "Postmortem Incident #28 (NovaTech, Jul 2025): Onboarding API timeouts during "
            "peak traffic. Added Redis cache and connection pool tuning. Performance Report "
            "Mar 2026 validated improvements."
        ),
    ),
    DemoMemory(
        category="Release Decision",
        text=(
            "Release Decision REL-2025-09 (NovaTech): PostgreSQL 15 upgrade for core cluster "
            "approved. Zero MongoDB migration scope. Validated against ADR-004 compliance "
            "checklist."
        ),
    ),
    DemoMemory(
        category="Engineering Meeting",
        text=(
            "Engineering Meeting (NovaTech, Feb 2026): Reviewed Enterprise SSO architecture "
            "with security. Confirmed no change to PostgreSQL auth token storage. SSO IdP "
            "integration only. Depends on Sprint Planning S31."
        ),
    ),
    DemoMemory(
        category="Slack Discussion",
        text=(
            "Slack #exec-staff (NovaTech, Feb 2026): CFO asked about revenue report accuracy "
            "after Incident #41. Eng confirmed PostgreSQL reconciliation restored. Executive "
            "Summary Mar 2026 drafted."
        ),
    ),
]

DATASET_NAME = "main_dataset"
