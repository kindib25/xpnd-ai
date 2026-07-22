import { NextRequest, NextResponse } from 'next/server'

/**
 * Demo endpoint for testing NLP expense parsing
 * Does NOT require authentication
 * GET with query params: /api/parse-expense-demo?text=...
 * POST with JSON body: /api/parse-expense-demo
 */

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
]

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get('text')

  if (!text) {
    return NextResponse.json(
      {
        error: 'No text provided',
        example: '/api/parse-expense-demo?text=Spent%20%2445%20on%20groceries',
      },
      { status: 400 }
    )
  }

  return parseExpense(text)
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    return parseExpense(text)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

async function parseExpense(text: string) {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
  const MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b'

  console.log('[v0] Demo parse - Input:', text)

  const prompt = `You are an expert at parsing expense information from natural language text.
    
The user has described an expense. Extract and return ONLY a JSON object (no markdown, no code blocks) with these exact fields:
- amount: (number, extract the numeric amount)
- category: (string, must be one of: ${EXPENSE_CATEGORIES.join(', ')})
- description: (string, a short description of what was purchased)
- date: (string, in YYYY-MM-DD format, default to today if not specified)

User expense description: "${text}"

Return ONLY the JSON object, nothing else. If you cannot determine a value, use null.`

  try {
    console.log('[v0] Calling Ollama at:', OLLAMA_URL, 'with model:', MODEL)

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        temperature: 0.3,
      }),
      timeout: 30000,
    })

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text()
      console.error('[v0] Ollama error status:', ollamaResponse.status)
      console.error('[v0] Ollama error response:', errorText.substring(0, 200))

      // Fallback to regex parsing
      console.log('[v0] Using fallback regex parsing')
      return handleFallbackParsing(text)
    }

    const ollamaData = await ollamaResponse.json()
    const responseText = ollamaData.response || ''
    console.log('[v0] Ollama response (first 200 chars):', responseText.substring(0, 200))

    // Parse the JSON response
    let parsedData
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
        console.log('[v0] Successfully parsed JSON:', JSON.stringify(parsedData))
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('[v0] JSON parse error:', parseError)
      return handleFallbackParsing(text)
    }

    // Validate and sanitize the parsed data
    const expense = {
      amount: validateAmount(parsedData.amount),
      category: validateCategory(parsedData.category),
      description: validateDescription(parsedData.description),
      date: validateDate(parsedData.date),
      paymentMethod: 'credit_card',
    }

    if (expense.amount === null) {
      return NextResponse.json({ error: 'Could not parse amount' }, { status: 400 })
    }

    return NextResponse.json({
      expense,
      source: 'ollama',
      model: MODEL,
    })
  } catch (error) {
    console.error('[v0] Parse expense error:', error)
    return handleFallbackParsing(text)
  }
}

function validateAmount(value: any): number | null {
  if (typeof value === 'number' && value > 0) return value
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''))
    if (!isNaN(num) && num > 0) return num
  }
  return null
}

function validateCategory(value: any): string {
  if (typeof value === 'string' && EXPENSE_CATEGORIES.includes(value)) return value
  return 'Other'
}

function validateDescription(value: any): string {
  if (typeof value === 'string') return value.substring(0, 255)
  return ''
}

function validateDate(value: any): string {
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  }
  return new Date().toISOString().split('T')[0]
}

function handleFallbackParsing(text: string) {
  console.log('[v0] Using fallback regex parsing for:', text)

  // Try to extract amount with regex
  const amountMatch = text.match(/\$?([\d,]+\.?\d*)|(\d+\.?\d*)\s*dollars?/i)
  const amount = amountMatch ? parseFloat((amountMatch[1] || amountMatch[2]).replace(/,/g, '')) : null

  if (amount === null) {
    return NextResponse.json({ error: 'Could not parse amount' }, { status: 400 })
  }

  // Try to determine category from keywords
  // Order matters: check more specific patterns first
  let category = 'Other'
  const lowerText = text.toLowerCase()

  // Travel (check first, before Transportation)
  if (lowerText.match(/(hotel|trip|travel|vacation|airbnb|resort|nyc|london|paris|hawaii|flight.*to|plane|flight)/i))
    category = 'Travel'
  // Shopping (check before Transportation/Gas since "supplies" is vague)
  else if (lowerText.match(/(shop|buy|store|mall|purchase|clothing|clothes|amazon|target|walmart|supplies|retail)/i))
    category = 'Shopping'
  // Food & Dining
  else if (lowerText.match(/(grocery|food|restaurant|lunch|dinner|breakfast|eat|meal|coffee|cafe)/))
    category = 'Food & Dining'
  // Transportation
  else if (lowerText.match(/(gas|uber|taxi|bus|train|parking|fuel|transport|car|bike)/i))
    category = 'Transportation'
  // Entertainment
  else if (lowerText.match(/(movie|game|entertainment|concert|ticket|show|netflix|gaming|sports)/i))
    category = 'Entertainment'
  // Healthcare
  else if (lowerText.match(/(doctor|hospital|medicine|pharmacy|health|medical|dental|clinic|prescription)/i))
    category = 'Healthcare'
  // Education
  else if (lowerText.match(/(book|course|school|university|education|class|tuition|textbook|learning)/i))
    category = 'Education'
  // Personal Care
  else if (lowerText.match(/(gym|haircut|spa|salon|personal|beauty|haircut|massage|fitness)/i))
    category = 'Personal Care'
  // Utilities
  else if (lowerText.match(/(electric|water|internet|phone|utility|wifi|internet|electricity|bill|subscription)/i))
    category = 'Utilities'

  const expense = {
    amount,
    category,
    description: text.substring(0, 255),
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'credit_card',
  }

  return NextResponse.json({
    expense,
    source: 'regex-fallback',
    warning: 'Ollama not available, using regex parsing',
  })
}
