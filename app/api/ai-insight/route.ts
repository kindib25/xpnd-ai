import { NextRequest, NextResponse } from 'next/server'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const MODEL = 'gemma3:4b'

export async function POST(request: NextRequest) {
  try {
    const { expenses, budgets } = await request.json()

    if (!Array.isArray(expenses)) {
      return NextResponse.json({ error: 'Invalid expense data' }, { status: 400 })
    }

    const prompt = `You are a concise personal finance coach. Analyze the user's recent expenses and budgets, then return one useful, actionable insight in plain text. Mention a specific spending pattern or category when possible, and include a practical suggestion. Keep it to 1-2 sentences. Do not use markdown, headings, emojis, or generic filler.

Expenses:
${JSON.stringify(expenses.slice(0, 100))}

Budgets:
${JSON.stringify(Array.isArray(budgets) ? budgets.slice(0, 50) : [])}`

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
    }

    const data = await response.json()
    const insight = typeof data.response === 'string' ? data.response.trim() : ''

    if (!insight) {
      return NextResponse.json({ error: 'AI returned no insight' }, { status: 502 })
    }

    return NextResponse.json({ insight, model: MODEL })
  } catch (error) {
    console.error('[v0] AI insight error:', error)
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 })
  }
}
