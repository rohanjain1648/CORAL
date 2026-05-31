<div align="center">
  
# NEXUS
**From commit to customer. Zero blind spots. Powered by Coral SQL & Gemini.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-orange)](https://deepmind.google/technologies/gemini/)

</div>

---

## 1. The Problem
Engineering telemetry is deeply siloed. Pull requests live in GitHub, crash reports live in Sentry, and on-call alerts live in PagerDuty. When a Sev-1 incident strikes, engineers waste critical minutes switching tabs, cross-referencing timestamps, and manually correlating deployments to errors. This friction inflates Mean Time to Recovery (MTTR) and causes immense developer fatigue.

## 2. The Solution
**NEXUS** is an elite engineering intelligence command center. It unifies your entire stack by allowing you to query GitHub, Sentry, and PagerDuty simultaneously. Through a seamless chat interface, engineers can ask natural language questions and NEXUS will write federated SQL to instantly track a production incident back to the exact commit that caused it.

## 3. Innovation
NEXUS introduces a "Zero Glue Code" architecture. Instead of building brittle ETL pipelines, scraping webhooks, or syncing data to a central warehouse, NEXUS uses **Coral SQL** as a live, federated query engine. Data is queried in real-time directly from 3rd-party SaaS APIs, completely removing data staleness and maintenance overhead. 

## 4. Features
- 🚨 **Incident War Room**: Root cause analysis in seconds via cross-source SQL JOINs.
- 🛡️ **Pre-Merge Risk Score**: Correlates historical error patterns with active PRs.
- 📊 **Live DORA Metrics**: Calculates deployment frequency, lead time, MTTR, and change failure rates automatically.
- 🔍 **Interactive Query Glass**: A slide-out panel allowing engineers to view, copy, and inspect the raw SQL and tabular data powering the AI's answers.

## 5. User Journey
1. **Connect**: The user authorizes their SaaS tools via the Coral CLI (`coral source add github`).
2. **Investigate**: The user asks a question like *"What caused the latest PagerDuty incident?"*
3. **Reason & Query**: NEXUS translates this intent into a multi-source SQL JOIN.
4. **Execute**: The query runs locally via Coral, pulling live data from the APIs.
5. **Resolve**: NEXUS renders the results as an executive summary alongside actionable data tables.

## 6. System Architecture
NEXUS operates on a strictly stateless edge architecture:
- **Client (Browser)**: React 19 UI with Server-Sent Events (SSE) streaming for real-time AI responses.
- **API Layer**: Next.js App Router (Node.js runtime) orchestrating AI tool calls.
- **Execution Engine**: Local `coral` binary spawned via Node's `child_process`, executing SQL over HTTP against live SaaS endpoints.

## 7. Workflow & Orchestration
1. **User Prompt** arrives at `/api/chat`.
2. **Gemini 2.0 Flash** evaluates the prompt against connected schemas.
3. **Tool Call (`coral_query`)** is triggered by Gemini with a generated SQL string.
4. **Node.js** intercepts the call and runs `spawnSync('coral', ['sql', generated_sql])`.
5. **JSON Results** are fed back to Gemini.
6. **Final Output** is streamed back to the frontend UI.

## 8. Data Flow & State Management
The Next.js frontend uses React state (`useState`, `useRef`) to manage the chat history array. As chunks stream in from the SSE endpoint, the current message buffer is updated recursively. The Query Glass state manages the visual layer of raw tabular data, strictly separated from the conversational context to maintain a clean UI. **No PII or raw engineering data is persisted locally or stored in a database.**

## 9. Tech Stack
- **Framework**: Next.js 16.2 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS v4, Lucide React, Framer Motion
- **AI / LLM**: `@google/generative-ai` (Gemini 2.0 Flash)
- **Data Federation**: Coral CLI

## 10. AI Deep Dive — Gemini 2.0 Flash
Gemini 2.0 Flash is the absolute core of NEXUS's reasoning engine. Given the complexity of federated SQL (e.g., joining `github.pull_requests` with `sentry.issues` on timestamps), we rely on Gemini's massive context window and state-of-the-art function calling capabilities. Gemini dynamically inspects the available schema and authors syntactically perfect Coral SQL, capable of handling time-bounds (`CURRENT_DATE - 7`), aggregations, and complex JOIN logic on the fly.

## 11. Impact
NEXUS transforms incident response. By eliminating the "swivel-chair" analytics problem, engineering teams can reduce their MTTR drastically. Furthermore, the automated DORA metrics panel democratizes engineering performance tracking without requiring expensive enterprise BI tools.

## 12. Real-World Use Cases
- **Active Outage Triage**: *"Show me all PRs merged in the last 2 hours and any fatal Sentry errors that spiked immediately after."*
- **On-Call Handoff**: *"Who is currently on call in PagerDuty and what active incidents are assigned to them?"*
- **Sprint Retrospectives**: *"Calculate the change failure rate for the frontend team over the last 14 days."*

## 13. Comparison
| Feature | NEXUS | Datadog / New Relic | Internal ETL + Snowflake |
| :--- | :--- | :--- | :--- |
| **Data Freshness** | Real-time (Live APIs) | Agent-delayed | Batch-delayed (Hourly/Daily) |
| **Maintenance** | Zero (No DBs) | High (Agent Configs) | Very High (Airflow/DB Admin) |
| **Cross-SaaS Joins** | Yes (Native via Coral) | Limited | Yes (But requires manual SQL) |
| **Cost** | Free / Local | Enterprise $$$ | Infrastructure $$$ |

## 14. Scalability
Because NEXUS delegates the heavy lifting of API rate-limiting, pagination, and data mapping to **Coral**, the Node.js layer remains incredibly thin and performant. The application is completely stateless and scales infinitely on Vercel or any standard containerized environment.

## 15. Responsible AI and Ethics
- **Data Privacy**: All SQL execution happens locally on the host machine. NEXUS does not send your API keys or source code to external servers.
- **Transparency**: The interactive *Query Glass* ensures the AI cannot hallucinate data. The raw SQL and exact API response rows are always visible to the engineer for verification.

## 16. Evaluation Criteria Alignment
- **Technical Complexity**: Seamlessly orchestrates federated SQL across SaaS platforms using an LLM.
- **UX/UI**: Features a premium, glassmorphism design with micro-animations and intuitive state transitions.
- **Business Value**: Solves a trillion-dollar industry problem (downtime and developer velocity).

## 17. Trade-offs
- **Latency**: Because queries execute live against 3rd-party APIs, large analytical queries (e.g., "all commits from the last year") can take several seconds to resolve compared to a pre-cached data warehouse.
- **Dependency**: Requires the Coral binary to be installed on the host operating system.

## 18. Project Complexity Tiers
- **Tier 1**: Basic LLM chat interface answering generic DevOps questions.
- **Tier 2**: Dynamic schema fetching and single-source querying (e.g., just GitHub).
- **Tier 3 (Achieved)**: Multi-source federated JOINs, streaming UI, Query Glass inspector, and automated parallel DORA metrics calculations.

## 19. Installation & Setup
1. **Install Coral CLI**: Follow instructions at [withcoral.com/docs](https://withcoral.com/docs)
2. **Connect Sources**: 
   ```bash
   coral source add github
   coral source add sentry
   coral source add pagerduty
   ```
3. **Clone & Install NEXUS**:
   ```bash
   git clone https://github.com/your-username/CORAL.git
   cd CORAL/nexus
   npm install
   ```
4. **Environment Variables**:
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   CORAL_BIN=coral
   ```
5. **Run**:
   ```bash
   npm run dev
   ```

## 20. Why This Will Win
NEXUS perfectly balances high-end technical architecture with a consumer-grade user experience. It tackles a known, universal developer pain point and leverages the exact strengths of the hackathon's sponsor technologies (Coral and Gemini) to deliver a "magic" experience that works out of the box.

## 21. Future Scope
- **Slack Integration**: Bring NEXUS directly into incident channels (e.g., `@nexus what caused this alert?`).
- **Automated Rollbacks**: Give the LLM permission to trigger GitHub Actions to revert offending PRs.
- **More Sources**: Expand support for Datadog, Linear, Jira, and Slack data.

## 22. FAQ
**Q: Do I need a database?**
No! Coral queries the APIs directly in real-time. 

**Q: Is it secure?**
Yes. Your SaaS API keys are managed securely by Coral locally. Gemini only sees the specific schemas and the rows returned by the queries it writes.

## 23. Lessons Learned
- **AI Tool Calling is powerful but strict**: Forcing the LLM to write perfectly qualified SQL (`github.pull_requests` instead of just `pull_requests`) required careful prompt engineering.
- **Streaming UI elevates UX**: Holding the user hostage while an API call takes 5 seconds is bad UX. Streaming the AI's "thought process" and tool execution status (`Running Coral SQL...`) dramatically improves perceived performance.

---

# 🔎 Deep Dive: The Use of Coral SQL

Coral is the foundational data fabric of NEXUS. Without it, joining GitHub PRs to Sentry issues would require hundreds of lines of brittle API orchestration code. 

### How NEXUS interacts with Coral:
1. **The Wrapper (`src/lib/coral.ts`)**: NEXUS communicates with Coral via Node.js `child_process.spawnSync`. It passes the SQL query and requests JSON output (`--json`).
2. **Schema Discovery**: NEXUS runs `SELECT schema_name, table_name FROM coral.tables` to dynamically understand what SaaS tools the user has connected. This schema is fed to Gemini so it knows exactly what data is available.
3. **Federated JOINs**: The true power of this integration is the cross-source JOIN. When a user asks about an incident, NEXUS generates Coral SQL like this:
   ```sql
   SELECT
     g.title, g.merged_by, s.error_message, pd.urgency
   FROM github.pull_requests g
   JOIN sentry.issues s ON s.first_seen >= g.merged_at
   JOIN pagerduty.incidents pd ON pd.created_at >= g.merged_at
   WHERE s.level = 'fatal'
   ```
4. **Local Execution**: Coral takes this single SQL string, breaks it down, concurrently fetches data from GitHub, Sentry, and PagerDuty via their native REST/GraphQL APIs, performs the JOIN in-memory locally, and returns the unified JSON to NEXUS.

By leveraging Coral, NEXUS achieves zero-glue-code data federation, ensuring that the engineering intelligence provided is always 100% fresh, accurate, and actionable.
