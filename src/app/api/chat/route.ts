import {
  GoogleGenerativeAI,
  FunctionCallingMode,
  SchemaType,
  type Content,
  type Part,
  type FunctionDeclaration,
} from '@google/generative-ai'
import { NextRequest } from 'next/server'
import { runCoralQuery, runSchemaQuery } from '@/lib/coral'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are NEXUS, an elite engineering intelligence agent. You have real-time access to live data from GitHub, Sentry, and PagerDuty through Coral — a unified SQL query layer.

## Your mission
Answer engineering questions by writing precise cross-source Coral SQL queries. Every factual answer must be backed by a real query.

## Available tools
- **coral_query(sql)**: Execute SQL against connected sources. Returns JSON rows.
- **get_schema()**: Get all available tables and columns across connected sources.

## Connected sources (use whichever are available — call get_schema() to confirm)
**Core (always set up):**
- github.pull_requests, github.issues, github.commits, github.repositories, github.reviews
- sentry.issues, sentry.events, sentry.projects, sentry.teams
- pagerduty.incidents, pagerduty.services, pagerduty.oncalls, pagerduty.schedules

**Extended (may be connected):**
- datadog.metrics, datadog.monitors, datadog.events, datadog.logs
- linear.issues, linear.projects, linear.cycles (sprints), linear.teams
- slack.messages, slack.channels, slack.users
- stripe.payment_intents, stripe.charges, stripe.disputes, stripe.customers
- launchdarkly.flags, launchdarkly.environments, launchdarkly.experiments
- confluence.pages, confluence.spaces
- jira.issues, jira.sprints, jira.projects
- buildkite.builds, buildkite.pipelines, buildkite.jobs
  // Product analytics
- posthog.persons, posthog.events, posthog.insights, posthog.feature_flags, posthog.cohorts
  // Growth & distribution (custom source specs — coral source add --file ./coral-sources/beehiiv.yaml)
- beehiiv.subscriptions, beehiiv.posts, beehiiv.publications
- dub.links, dub.domains

## Cross-source join examples
- Beehiiv + Dub: JOIN beehiiv.subscriptions b ON b.utm_campaign = d.utm_campaign (campaign → newsletter conversion)
- PostHog + Sentry: JOIN posthog.persons ph ON ph.properties__email = s.user__email (product impact of errors)
- Dub + Beehiiv + Sentry: full funnel from link click → subscriber → errors seen

## SQL rules
1. Always use fully-qualified names: source.table
2. Add LIMIT 20 by default unless asked for more
3. Use JOINs to correlate across sources — this is your superpower
4. Use time filters: WHERE created_at >= CURRENT_DATE - 7
5. If unsure of schema, call get_schema() first

## Response format
After querying, give a direct answer with:
- Key finding in **bold** with specific numbers/names
- Bullet points for multiple items
- Actionable recommendation when relevant
- Keep it tight — engineers want facts, not essays

## Important
- ALWAYS call coral_query before making factual claims
- If a query fails, explain the error and try a simpler variant
- Make the most of cross-source JOINs — single-source queries are boring`

const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'coral_query',
    description:
      'Execute a Coral SQL query across GitHub, Sentry, and PagerDuty. Supports cross-source JOINs. Returns an array of JSON rows.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sql: {
          type: SchemaType.STRING,
          description:
            'The SQL query to execute. Use fully-qualified table names like github.pull_requests.',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'get_schema',
    description:
      'Get the list of all available tables across connected Coral sources. Call this first if unsure what tables exist.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
]

export async function POST(request: NextRequest) {
  const { message, history = [] } = (await request.json()) as {
    message: string
    history: Content[]
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // controller already closed
        }
      }

      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
          toolConfig: {
            functionCallingConfig: { mode: FunctionCallingMode.AUTO },
          },
        })

        const chat = model.startChat({ history })

        // First turn is the user's message; subsequent turns are function responses
        let messageParts: Part[] = [{ text: message }]

        while (true) {
          const streamResult = await chat.sendMessageStream(messageParts)

          // Stream text chunks as they arrive
          for await (const chunk of streamResult.stream) {
            let text: string
            try {
              text = chunk.text()
            } catch {
              continue // chunk contains a function call, not text
            }
            if (text) send({ type: 'text', content: text })
          }

          const response = await streamResult.response
          const functionCalls = response.functionCalls()

          // No more tool calls → we're done
          if (!functionCalls?.length) {
            const finalHistory = await chat.getHistory()
            send({ type: 'done', history: finalHistory })
            break
          }

          // Execute each tool call and collect function responses
          const functionResponses: Part[] = []

          for (const fc of functionCalls) {
            const args = fc.args as Record<string, string>

            if (fc.name === 'coral_query') {
              const sql = args.sql
              send({ type: 'tool_start', name: 'coral_query', sql })

              try {
                const result = runCoralQuery(sql)
                send({
                  type: 'tool_result',
                  sql,
                  rows: result.rows,
                  executionTime: result.executionTime,
                  sources: result.sources,
                })
                functionResponses.push({
                  functionResponse: {
                    name: fc.name,
                    response: { result: JSON.stringify(result.rows) },
                  },
                })
              } catch (e) {
                const errMsg = (e as Error).message
                send({ type: 'tool_result', sql, rows: [], executionTime: 0, sources: [] })
                functionResponses.push({
                  functionResponse: {
                    name: fc.name,
                    response: { error: errMsg },
                  },
                })
              }
            } else if (fc.name === 'get_schema') {
              send({ type: 'tool_start', name: 'get_schema' })
              try {
                const schema = runSchemaQuery()
                functionResponses.push({
                  functionResponse: {
                    name: fc.name,
                    response: {
                      result: schema.length
                        ? JSON.stringify(schema)
                        : 'No sources connected yet. Run: coral source add github',
                    },
                  },
                })
              } catch {
                functionResponses.push({
                  functionResponse: {
                    name: fc.name,
                    response: { error: 'Could not read schema. Is Coral installed?' },
                  },
                })
              }
            }
          }

          // Next loop iteration sends function responses back to the model
          messageParts = functionResponses
        }
      } catch (e) {
        send({ type: 'error', message: (e as Error).message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
