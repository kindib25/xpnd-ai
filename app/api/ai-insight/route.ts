import { NextRequest, NextResponse } from 'next/server'

const OLLAMA_URL =
  process.env.OLLAMA_URL || 'http://localhost:11434'

const MODEL = 'gemma3:4b'

export async function POST(request: NextRequest) {
  try {
    const { expenses, budgets } = await request.json()

    console.log('\n================ Xpnd AI REQUEST ================')

    if (!Array.isArray(expenses)) {
      console.error('[Xpnd AI] Invalid expense data')

      return NextResponse.json(
        { error: 'Invalid expense data' },
        { status: 400 }
      )
    }

    /*
     * ============================================================
     * CURRENT MONTH FILTER
     * Philippine timezone: Asia/Manila
     * ============================================================
     */

    const now = new Date()

    const philippinesDate = new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).format(now)

    // Example: 2026-10-04
    const currentMonth = philippinesDate.slice(0, 7)

    console.log('[Xpnd AI] Current Philippine date:', philippinesDate)
    console.log('[Xpnd AI] Current month:', currentMonth)

    /*
     * ============================================================
     * FILTER EXPENSES
     *
     * Change "date" below if your database uses another field,
     * such as "expense_date" or "transaction_date".
     * ============================================================
     */

    const currentMonthExpenses = expenses.filter((expense) => {
      if (!expense?.date) return false

      const expenseDate = String(expense.date)

      return expenseDate.startsWith(currentMonth)
    })

    /*
     * ============================================================
     * FILTER BUDGETS
     *
     * This supports budgets containing:
     *
     * month: "2026-10"
     *
     * OR
     *
     * date: "2026-10-01"
     *
     * If your budget records use a different field, change this.
     * ============================================================
     */

    const currentMonthBudgets = Array.isArray(budgets)
      ? budgets.filter((budget) => {
          if (!budget) return false

          if (budget.month) {
            return String(budget.month).startsWith(currentMonth)
          }

          if (budget.date) {
            return String(budget.date).startsWith(currentMonth)
          }

          return false
        })
      : []

    /*
     * Limit the amount of data sent to Gemma
     */

    const safeExpenses = currentMonthExpenses.slice(0, 100)
    const safeBudgets = currentMonthBudgets.slice(0, 50)

    console.log(
      '[Xpnd AI] Total expenses received:',
      expenses.length
    )

    console.log(
      '[Xpnd AI] Current month expenses:',
      safeExpenses.length
    )

    console.log(
      '[Xpnd AI] Total budgets received:',
      Array.isArray(budgets) ? budgets.length : 0
    )

    console.log(
      '[Xpnd AI] Current month budgets:',
      safeBudgets.length
    )

    console.log('[Xpnd AI] Current month expenses:')
    console.log(JSON.stringify(safeExpenses, null, 2))

    console.log('[Xpnd AI] Current month budgets:')
    console.log(JSON.stringify(safeBudgets, null, 2))

    console.log('==================================================\n')

    /*
     * ============================================================
     * GEMMA PROMPT
     * ============================================================
     */

    const prompt = `
You are Xpnd AI, a personal finance coach for users in the Philippines.

Analyze ONLY the user's expenses and budgets for the current month.

Current month: ${currentMonth}

Provide ONE concise, actionable financial insight.

STRICT RULES:
- Return exactly ONE sentence.
- Maximum 18 words.
- All monetary amounts are in Philippine pesos.
- Always use the ₱ symbol for money.
- Never use $, USD, dollars, or other currencies.
- Mention a specific spending category, merchant, amount, or budget when possible.
- Give one practical suggestion.
- Base the insight only on the provided data.
- Never invent information.
- Do not use markdown.
- Do not use headings.
- Do not use bullet points.
- Do not use emojis.
- Do not give generic financial advice.
- Do not say "based on your expenses".
- Return only the final sentence.

Examples:
Food spending reached ₱3,200, so consider setting a lower weekly food limit.
You have used ₱4,500 of your ₱5,000 budget, so limit non-essential purchases this week.
Transport costs are your highest expense, so consider reducing unnecessary trips.

CURRENT MONTH EXPENSES:
${JSON.stringify(safeExpenses)}

CURRENT MONTH BUDGETS:
${JSON.stringify(safeBudgets)}
`

    /*
     * ============================================================
     * DEBUG: GEMMA INPUT
     * ============================================================
     */

    console.log('\n================ GEMMA INPUT ================')

    console.log('[Xpnd AI] Model:', MODEL)
    console.log('[Xpnd AI] Ollama URL:', OLLAMA_URL)

    console.log('[Xpnd AI] Current month:', currentMonth)

    console.log('[Xpnd AI] Expenses sent to model:')
    console.log(JSON.stringify(safeExpenses, null, 2))

    console.log('[Xpnd AI] Budgets sent to model:')
    console.log(JSON.stringify(safeBudgets, null, 2))

    console.log('[Xpnd AI] Full prompt sent to Gemma:')
    console.log(prompt)

    console.log('=============================================\n')

    /*
     * ============================================================
     * CALL OLLAMA
     * ============================================================
     */

    const response = await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.2,
            top_p: 0.8,
            top_k: 40,
            num_predict: 50,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    )

    console.log('\n================ GEMMA RESPONSE ================')

    console.log(
      '[Xpnd AI] HTTP status:',
      response.status
    )

    console.log(
      '[Xpnd AI] Response OK:',
      response.ok
    )

    if (!response.ok) {
      const errorText = await response.text()

      console.error('[Xpnd AI] Ollama error:')
      console.error(errorText)

      console.log('=================================================\n')

      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 503 }
      )
    }

    const data = await response.json()

    console.log('[Xpnd AI] Complete Ollama response:')
    console.log(JSON.stringify(data, null, 2))

    console.log('[Xpnd AI] Raw Gemma response:')
    console.log(data.response)

    console.log('=================================================\n')

    /*
     * ============================================================
     * PROCESS AI RESPONSE
     * ============================================================
     */

    let insight =
      typeof data.response === 'string'
        ? data.response.trim()
        : ''

    if (!insight) {
      console.error('[Xpnd AI] AI returned no insight')

      return NextResponse.json(
        { error: 'AI returned no insight' },
        { status: 502 }
      )
    }

    // Clean unwanted formatting
    insight = insight
      .replace(/^["']|["']$/g, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/\$/g, '₱')
      .replace(/\s+/g, ' ')
      .trim()

    // Keep only the first sentence
    const sentenceMatch = insight.match(
      /^.*?[.!?](?:\s|$)/
    )

    if (sentenceMatch) {
      insight = sentenceMatch[0].trim()
    }

    // Remove accidental quotation marks
    insight = insight
      .replace(/^["']|["']$/g, '')
      .trim()

    /*
     * ============================================================
     * FALLBACK
     * ============================================================
     */

    if (!insight) {
      insight =
        'Track your spending regularly to keep your budget on target.'
    }

    /*
     * ============================================================
     * FINAL DEBUG
     * ============================================================
     */

    console.log('\n================ FINAL INSIGHT ================')

    console.log(
      '[Xpnd AI] Processed insight:',
      insight
    )

    console.log(
      '[Xpnd AI] Data analyzed:',
      `${safeExpenses.length} expenses, ${safeBudgets.length} budgets`
    )

    console.log(
      '[Xpnd AI] Month:',
      currentMonth
    )

    console.log('================================================\n')

    return NextResponse.json({
      insight,
      model: MODEL,
      currency: 'PHP',
      month: currentMonth,
      expenseCount: safeExpenses.length,
      budgetCount: safeBudgets.length,
    })
  } catch (error) {
    console.error(
      '[Xpnd AI] AI insight error:',
      error
    )

    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    )
  }
}