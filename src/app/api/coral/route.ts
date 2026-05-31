import { NextRequest, NextResponse } from 'next/server'
import { runCoralQuery, checkCoralAvailable } from '@/lib/coral'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** POST /api/coral  —  direct SQL execution for the DORA and Sources pages */
export async function POST(request: NextRequest) {
  const { sql } = (await request.json()) as { sql: string }

  if (!sql?.trim()) {
    return NextResponse.json({ error: 'sql is required' }, { status: 400 })
  }

  try {
    const result = runCoralQuery(sql)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

/** GET /api/coral  —  health check */
export async function GET() {
  const available = checkCoralAvailable()
  return NextResponse.json({ available })
}
