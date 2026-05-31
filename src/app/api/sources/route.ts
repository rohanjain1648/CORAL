import { NextResponse } from 'next/server'
import { runSchemaQuery, checkCoralAvailable } from '@/lib/coral'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const KNOWN_SOURCES = [
  // Core — set up first
  { id: 'github',       label: 'GitHub',       color: '#e2e8f0', description: 'Pull requests, issues, commits, repositories' },
  { id: 'sentry',       label: 'Sentry',       color: '#a78bfa', description: 'Errors, crashes, performance issues, releases' },
  { id: 'pagerduty',    label: 'PagerDuty',    color: '#34d399', description: 'Incidents, services, on-call schedules' },
  // Day 2 extended sources
  { id: 'stripe',       label: 'Stripe',       color: '#6366f1', description: 'Payments, subscriptions, charges, disputes' },
  { id: 'linear',       label: 'Linear',       color: '#5e6ad2', description: 'Issues, projects, sprints, roadmap' },
  { id: 'slack',        label: 'Slack',        color: '#f472b6', description: 'Messages, channels, threads, reactions' },
  { id: 'launchdarkly', label: 'LaunchDarkly', color: '#fbbf24', description: 'Feature flags, rollouts, experiments, environments' },
  // Observability & infra
  { id: 'datadog',      label: 'Datadog',      color: '#818cf8', description: 'Metrics, monitors, APM traces, logs' },
  // Documentation & project management
  { id: 'confluence',   label: 'Confluence',   color: '#60a5fa', description: 'Pages, spaces, documentation' },
  { id: 'jira',         label: 'Jira',         color: '#38bdf8', description: 'Issues, sprints, epics, projects' },
  // CI/CD — custom source spec included
  { id: 'buildkite',    label: 'Buildkite',    color: '#fb923c', description: 'Builds, pipelines, jobs, test results' },
  // Product analytics
  { id: 'posthog',      label: 'PostHog',      color: '#f97316', description: 'Product events, funnels, feature flags, session recordings, persons' },
  // Growth & distribution — custom source specs included
  { id: 'beehiiv',      label: 'Beehiiv',      color: '#22c55e', description: 'Newsletter subscribers, post stats, open/click rates, UTM attribution' },
  { id: 'dub',          label: 'Dub',          color: '#3b82f6', description: 'Short link clicks, conversions, sales revenue, UTM campaign tracking' },
]

export async function GET() {
  const coralAvailable = checkCoralAvailable()

  if (!coralAvailable) {
    return NextResponse.json({
      coralAvailable: false,
      sources: KNOWN_SOURCES.map(s => ({ ...s, connected: false, tables: [] })),
    })
  }

  try {
    const schema = runSchemaQuery()
    const connectedSchemas = new Set(
      (schema as Array<{ schema_name?: string }>).map(r => r.schema_name)
    )

    // Group tables by schema
    const tableMap: Record<string, string[]> = {}
    for (const row of schema as Array<{ schema_name?: string; table_name?: string }>) {
      if (!row.schema_name || !row.table_name) continue
      tableMap[row.schema_name] ??= []
      tableMap[row.schema_name].push(row.table_name)
    }

    const sources = KNOWN_SOURCES.map(s => ({
      ...s,
      connected: connectedSchemas.has(s.id),
      tables: tableMap[s.id] ?? [],
    }))

    return NextResponse.json({ coralAvailable: true, sources })
  } catch (e) {
    return NextResponse.json({
      coralAvailable: true,
      error: (e as Error).message,
      sources: KNOWN_SOURCES.map(s => ({ ...s, connected: false, tables: [] })),
    })
  }
}
