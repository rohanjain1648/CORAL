import { spawnSync } from 'child_process'
import type { DataRow } from '@/types'

const CORAL_BIN = process.env.CORAL_BIN ?? 'coral'

export interface CoralResult {
  rows: DataRow[]
  executionTime: number
  sources: string[]
  sql: string
}

export function runCoralQuery(sql: string): CoralResult {
  const startTime = Date.now()

  const proc = spawnSync(CORAL_BIN, ['sql', sql, '--json'], {
    encoding: 'utf8',
    timeout: 30_000,
    shell: process.platform === 'win32',
  })

  const executionTime = (Date.now() - startTime) / 1000

  if (proc.error) {
    const msg = (proc.error as NodeJS.ErrnoException).code
    if (msg === 'ENOENT') {
      throw new Error(
        `Coral CLI not found. Download it from https://withcoral.com/docs and ensure "${CORAL_BIN}" is in your PATH, or set CORAL_BIN in .env.local`
      )
    }
    throw proc.error
  }

  if (proc.status !== 0) {
    const errMsg = proc.stderr?.trim() || 'Coral query failed'
    throw new Error(errMsg)
  }

  const stdout = proc.stdout.trim()
  let rows: DataRow[] = []

  if (stdout) {
    try {
      const parsed = JSON.parse(stdout)
      rows = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      // Try NDJSON
      try {
        rows = stdout.split('\n').filter(Boolean).map(l => JSON.parse(l) as DataRow)
      } catch {
        rows = [{ result: stdout }]
      }
    }
  }

  return { rows, executionTime, sources: extractSources(sql), sql }
}

export function runSchemaQuery(): DataRow[] {
  const proc = spawnSync(
    CORAL_BIN,
    ['sql', 'SELECT schema_name, table_name FROM coral.tables ORDER BY schema_name, table_name', '--json'],
    { encoding: 'utf8', timeout: 10_000, shell: process.platform === 'win32' }
  )

  if (proc.status !== 0 || proc.error) return []

  try {
    const parsed = JSON.parse(proc.stdout.trim())
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function checkCoralAvailable(): boolean {
  const proc = spawnSync(CORAL_BIN, ['--version'], {
    encoding: 'utf8',
    timeout: 5_000,
    shell: process.platform === 'win32',
  })
  return !proc.error && proc.status === 0
}

function extractSources(sql: string): string[] {
  const pattern =
    /\b(github|sentry|pagerduty|datadog|stripe|linear|slack|jira|confluence|launchdarkly|buildkite|grafana|intercom|posthog|beehiiv|dub)\b/gi
  const matches = sql.match(pattern) ?? []
  return [...new Set(matches.map(s => s.toLowerCase()))]
}
