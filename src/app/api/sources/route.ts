import { NextResponse } from 'next/server'
import { runSchemaQuery, checkCoralAvailable } from '@/lib/coral'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const KNOWN_SOURCES = [
  { id: 'github',    label: 'GitHub',    color: '#e2e8f0', description: 'Pull requests, issues, commits, repositories' },
  { id: 'sentry',    label: 'Sentry',    color: '#a78bfa', description: 'Errors, crashes, performance issues, releases' },
  { id: 'pagerduty', label: 'PagerDuty', color: '#34d399', description: 'Incidents, services, on-call schedules' },
  { id: 'datadog',   label: 'Datadog',   color: '#818cf8', description: 'Metrics, monitors, APM traces, logs' },
  { id: 'linear',    label: 'Linear',    color: '#5e6ad2', description: 'Issues, projects, sprints, roadmap' },
  { id: 'slack',     label: 'Slack',     color: '#f472b6', description: 'Messages, channels, threads, reactions' },
  { id: 'stripe',    label: 'Stripe',    color: '#6366f1', description: 'Payments, subscriptions, events, disputes' },
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
