# NEXUS — Engineering Intelligence Agent

> *From commit to customer. Zero blind spots.*

Built for the **Pirates of the Coral-bean Hackathon** · Track 1: Enterprise Agent · May 2026

---

## What is NEXUS?

NEXUS is an AI-powered engineering command center that answers any question about your engineering organisation in natural language — by executing cross-source Coral SQL queries across GitHub, Sentry, PagerDuty, Linear, Slack, Datadog, Stripe, and more.

Instead of switching between 6–8 tools to investigate an incident, you ask NEXUS once. It writes the SQL, runs it via Coral, and gives you a direct answer with the data inline.

**Powered by:** [Coral](https://withcoral.com) · [Gemini 2.0 Flash](https://ai.google.dev) · [Next.js 16](https://nextjs.org)

---

## Features

| Feature | What it does |
|---------|-------------|
| **Incident War Room** | Root-causes incidents by joining GitHub deploys + Sentry errors + PagerDuty alerts in one query |
| **Pre-Merge Risk Scorer** | Scores a PR 0–100 before merge using change size, historical error patterns, and incident frequency |
| **Live DORA Metrics** | Calculates all 4 DORA metrics from live data with 8-week sparkline trends |
| **Query Glass** | Shows the exact Coral SQL generated for every answer — full transparency, no black box |
| **Incident Timeline** | Auto-detects timestamped results and renders a visual incident timeline |
| **Multi-source Scenarios** | Pre-built prompts for Linear sprints, Slack threads, Stripe revenue risk, LaunchDarkly flags |
| **Sources Explorer** | Live source connection status, schema browser, and setup commands |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXUS Web App                            │
│   Next.js 16 · Tailwind CSS · Framer Motion · Recharts       │
│                                                              │
│  Landing │ Chat + QueryGlass │ DORA │ Risk Scorer │ Sources  │
└──────────────────────┬──────────────────────────────────────┘
                       │ SSE (streaming)
┌──────────────────────▼──────────────────────────────────────┐
│              Gemini 2.0 Flash Agent (API Route)              │
│   Tool: coral_query(sql) → spawnSync coral CLI               │
│   Tool: get_schema()     → coral.tables metadata            │
│   Agentic loop: stream → tool_call → execute → stream       │
└──────────────────────┬──────────────────────────────────────┘
                       │ child_process (local, no data egress)
┌──────────────────────▼──────────────────────────────────────┐
│                   Coral Runtime (local)                      │
│                                                              │
│  github  │  sentry  │  pagerduty  │  datadog  │  linear     │
│  slack   │  stripe  │  launchdarkly│  jira    │  confluence  │
│                                                              │
│  + buildkite  ← custom source spec (special bounty)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Example Coral SQL Queries

```sql
-- Incident root cause: GitHub deploy → Sentry error → PagerDuty alert
SELECT
  g.title        AS deploy,
  g.merged_by    AS author,
  s.error_message,
  s.users_affected,
  pd.urgency     AS incident_severity
FROM github.pull_requests g
JOIN sentry.issues s
  ON s.first_seen BETWEEN g.merged_at AND g.merged_at + INTERVAL '2 hours'
JOIN pagerduty.incidents pd
  ON pd.created_at >= g.merged_at
WHERE s.level = 'fatal'
ORDER BY s.users_affected DESC
LIMIT 10;

-- DORA: Change Failure Rate (last 30 days)
SELECT ROUND(
  COUNT(DISTINCT s.id) * 100.0 /
  NULLIF((SELECT COUNT(*) FROM github.pull_requests WHERE merged_at >= CURRENT_DATE - 30), 0), 1
) AS change_failure_rate_pct
FROM sentry.issues s
WHERE s.first_seen >= CURRENT_DATE - 30 AND s.level = 'fatal';

-- Sprint health: blocked issues with stale PRs
SELECT l.identifier, l.title, g.number AS pr, NOW() - g.created_at AS waiting
FROM linear.issues l
JOIN github.pull_requests g ON g.title LIKE '%' || l.identifier || '%'
WHERE l.state NOT IN ('done', 'cancelled') AND g.state = 'open'
ORDER BY g.created_at ASC;
```

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd nexus
npm install
```

### 2. Get a free Gemini API key

Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)** → Create API Key

```bash
cp .env.local.example .env.local
# Edit .env.local:
# GEMINI_API_KEY=AIzaSy...
```

### 3. Install Coral

**Windows:**
1. Download `coral-x86_64-pc-windows-msvc.zip` from [github.com/withcoral/coral/releases](https://github.com/withcoral/coral/releases)
2. Extract and add `coral.exe` to your PATH

**macOS / Linux:**
```bash
brew install withcoral/tap/coral        # macOS
curl -fsSL https://withcoral.com/install.sh | sh  # Linux
```

### 4. Connect data sources

```bash
coral source add github       # prompts for GitHub Personal Access Token
coral source add sentry       # prompts for Sentry token + org slug
coral source add pagerduty    # prompts for PagerDuty API key

# Optional extended sources
coral source add datadog
coral source add linear
coral source add slack
coral source add stripe
coral source add launchdarkly

# Custom Buildkite source (bounty spec)
coral source add --file ./coral-sources/buildkite.yaml

# Verify everything
coral sql "SELECT schema_name, table_name FROM coral.tables ORDER BY 1, 2"
```

### 5. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Custom Source: Buildkite

This project includes a custom Coral source spec for **Buildkite** CI/CD (not bundled in Coral). It exposes:
- `buildkite.builds` — all CI runs with state, branch, commit, timing
- `buildkite.pipelines` — pipeline config and metadata
- `buildkite.jobs` — individual job steps with exit codes

Enabling the full commit → CI → production → error chain:

```sql
SELECT b.number, b.state, b.branch, b.finished_at, p.name AS pipeline
FROM buildkite.builds b
JOIN buildkite.pipelines p ON p.id = b.pipeline__id
JOIN github.pull_requests g ON g.commit = b.commit
WHERE b.state = 'failed' AND b.created_at >= NOW() - INTERVAL '2 hours'
ORDER BY b.created_at DESC;
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| AI | Gemini 2.0 Flash · `@google/generative-ai` |
| Data Layer | Coral v0.4+ (cross-source SQL) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Judging Notes

| Criterion | How NEXUS addresses it |
|-----------|------------------------|
| **Potential Impact** | Incident MTTR + DORA metrics are core KPIs for every engineering org |
| **Creativity** | Pre-merge risk scoring + auto incident timeline detection are novel |
| **Technical Impl.** | Agentic loop with SSE streaming, 8+ source cross-JOINs, custom Buildkite spec |
| **Aesthetics/UX** | Dark glass UI, Query Glass SQL panel, animated DORA sparklines |
| **Best Use of Coral** | Every answer is backed by a Coral SQL query shown live to the user |
| **Special Bounty** | Buildkite source spec submitted to Coral GitHub for review |

---

*Pirates of the Coral-bean · May 2026*
