import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const MODEL =
  process.env.OPENROUTER_MODEL ??
  'google/gemma-4-26b-a4b-it:free'


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

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    console.log('[Xpnd AI] Received expense text:', text.substring(0, 100))

    // Get current date in Asia/Manila timezone
    const now = new Date()

    const currentDate = now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila',
    })

    const prompt = `You are an expense information extraction system for Xpnd AI.

Your job is to analyze a user's natural language expense entry.

Today's date is ${currentDate}.

Interpret relative dates based on today's date:
- "today" = ${currentDate}
- "yesterday" = one day before ${currentDate}
- "tomorrow" = one day after ${currentDate}
- Interpret other relative dates correctly.

If no date is mentioned, use ${currentDate}.

You must return ONLY a valid JSON object.
Do not include markdown.
Do not include explanations.
Do not include code blocks.

Use exactly this structure:

{
  "amount": number or null,
  "category": string,
  "description": string or null,
  "merchant": string or null,
  "date": "YYYY-MM-DD"
}

The category MUST be exactly one of:

${EXPENSE_CATEGORIES.join(', ')}

Category rules:

Food & Dining:
Restaurants, meals, food, coffee, snacks, groceries, carinderia, fast food, Jollibee, McDonald's, cafes, milk tea, bakery, palengke, supermarket.

Transportation:
Jeepney, tricycle, bus, taxi, Grab, Angkas, Uber, gas, fuel, parking, toll, transportation fare, pamasahe.

Shopping:
Clothes, shoes, bags, electronics, gadgets, accessories, online shopping, Shopee, Lazada, Amazon, retail purchases.

Entertainment:
Movies, cinema, concerts, games, Netflix, Spotify, gaming, subscriptions related to entertainment, karaoke.

Utilities:
Electricity, water bills, internet bills, WiFi bills, phone bills, mobile load, mobile data, utility payments.

Healthcare:
Medicine, pharmacy, doctor, hospital, clinic, dentist, dental services, checkups, laboratory tests.

Education:
Tuition, school fees, textbooks, notebooks, printing, photocopying, school supplies, courses, training, academic expenses.

Travel:
Hotels, resorts, flights, airplane tickets, vacations, trips, tours, accommodation.

Personal Care:
Haircuts, salons, barber, spa, skincare, cosmetics, toiletries, gym memberships, fitness services.

Other:
Use only when the expense does not clearly belong to any category.

The user may use English, Filipino, Tagalog, Bisaya, or mixed language.

Examples:

Input: "Nagbayad ko ug 50 pesos pamasahe sa jeep"
Output:
{
  "amount": 50,
  "category": "Transportation",
  "description": "Jeepney fare",
  "merchant": null,
  "date": "${currentDate}"
}

Input: "Spent 150 pesos for Jollibee lunch yesterday"
Output:
{
  "amount": 150,
  "category": "Food & Dining",
  "description": "Lunch at Jollibee",
  "merchant": "Jollibee",
  "date": "yesterday's date"
}

Input: "Bought medicine worth ₱250"
Output:
{
  "amount": 250,
  "category": "Healthcare",
  "description": "Medicine purchase",
  "merchant": null,
  "date": "${currentDate}"
}

Input: "Netflix subscription 149"
Output:
{
  "amount": 149,
  "category": "Entertainment",
  "description": "Netflix subscription",
  "merchant": "Netflix",
  "date": "${currentDate}"
}

Input: "nagpalit ko ug tshirt sa Shopee 500"
Output:
{
  "amount": 500,
  "category": "Shopping",
  "description": "T-shirt purchase",
  "merchant": "Shopee",
  "date": "${currentDate}"
}

User expense description:

"${text}"

Return ONLY the JSON object.`


    console.log('[Xpnd AI] Calling OpenRouter with model:', MODEL)

    let parsedData: any

    try {
      const aiResponse = await openrouter.chat.completions.create(
        {
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          response_format: {
            type: 'json_object',
          },
        },
        {
          timeout: 30_000,
        }
      )

      const responseText =
        aiResponse.choices[0]?.message?.content ?? ''

      console.log(
        '[Xpnd AI] OpenRouter response:',
        responseText.substring(0, 300)
      )

      parsedData = JSON.parse(responseText)

      console.log(
        '[Xpnd AI] Successfully parsed AI response:',
        parsedData
      )
    } catch (error) {
      console.error('[Xpnd AI] OpenRouter error:', error)

      return handleFallbackParsing(text)
    }

    if (
      !parsedData ||
      typeof parsedData !== 'object' ||
      Array.isArray(parsedData)
    ) {
      return handleFallbackParsing(text)
    }


    const expense = {
      amount: validateAmount(parsedData.amount),
      category: validateCategory(parsedData.category, text),
      description: validateDescription(parsedData.description, text),
      merchant: validateMerchant(parsedData.merchant),
      date: validateDate(parsedData.date),
    }

    if (expense.amount === null) {
      return handleFallbackParsing(text)
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('[Xpnd AI] Parse expense error:', error)

    if (
      error instanceof Error &&
      error.name === 'TimeoutError'
    ) {
      return NextResponse.json(
        {
          error: 'AI request timed out',
        },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to parse expense' },
      { status: 500 }
    )
  }
}

function validateAmount(value: unknown): number | null {
  if (typeof value === 'number' && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.]/g, '')
    const num = parseFloat(cleaned)

    if (!isNaN(num) && num > 0) {
      return num
    }
  }

  return null
}

function validateCategory(
  value: unknown,
  originalText: string
): string {
  if (
    typeof value === 'string' &&
    EXPENSE_CATEGORIES.includes(value)
  ) {
    return value
  }

  return categorizeExpense(originalText)
}

function validateDescription(
  value: unknown,
  originalText: string
): string {
  if (typeof value === 'string' && value.trim()) {
    return value.substring(0, 255)
  }

  return originalText.substring(0, 255)
}

function validateMerchant(value: unknown): string {
  if (typeof value === 'string') {
    return value.substring(0, 100)
  }

  return ''
}

function validateDate(value: unknown): string {
  if (typeof value === 'string') {
    // Accept only YYYY-MM-DD
    const match = value.match(/^\d{4}-\d{2}-\d{2}$/)

    if (match) {
      const date = new Date(`${value}T12:00:00+08:00`)

      if (!isNaN(date.getTime())) {
        return value
      }
    }
  }

  // Default to today's date in Asia/Manila
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Manila',
  })
}

function categorizeExpense(text: string): string {
  const lowerText = text.toLowerCase()

  const categoryScores: Record<string, number> = {
    'Food & Dining': 0,
    Transportation: 0,
    Shopping: 0,
    Entertainment: 0,
    Utilities: 0,
    Healthcare: 0,
    Education: 0,
    Travel: 0,
    'Personal Care': 0,
    Other: 0,
  }

  const addScore = (
    category: string,
    patterns: RegExp[],
    points = 1
  ) => {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        categoryScores[category] += points
      }
    }
  }

  // ==========================================
  // FOOD & DINING
  // ==========================================

  addScore(
    'Food & Dining',
    [
      /\bfood\b/i,
      /\bmeal\b/i,
      /\bbreakfast\b/i,
      /\blunch\b/i,
      /\bdinner\b/i,
      /\bsnack\b/i,
      /\bcoffee\b/i,
      /\bmilk tea\b/i,
      /\bmilktea\b/i,
      /\brestaurant\b/i,
      /\bcafe\b/i,
      /\bcarinderia\b/i,
      /\beatery\b/i,
      /\bfast food\b/i,
      /\bjollibee\b/i,
      /\bmcdonald'?s\b/i,
      /\bmcdo\b/i,
      /\bkfc\b/i,
      /\bchowking\b/i,
      /\bmang inasal\b/i,
      /\bpizza\b/i,
      /\bburger\b/i,
      /\bchicken\b/i,
      /\brice\b/i,
      /\bgrocery\b/i,
      /\bgroceries\b/i,
      /\bsupermarket\b/i,
      /\bpalengke\b/i,
      /\bpagkain\b/i,
      /\bkape\b/i,
      /\bulam\b/i,
      /\bmeryenda\b/i,
      /\bpamahaw\b/i,
      /\bpaniudto\b/i,
      /\bpamahaw\b/i,
      /\bkaon\b/i,
      /\bkan-on\b/i,
    ],
    2
  )

  // ==========================================
  // TRANSPORTATION
  // ==========================================

  addScore(
    'Transportation',
    [
      /\bgas\b/i,
      /\bgasoline\b/i,
      /\bfuel\b/i,
      /\bdiesel\b/i,
      /\bpetrol\b/i,
      /\buber\b/i,
      /\bgrab\b/i,
      /\bgrabcar\b/i,
      /\bgrab bike\b/i,
      /\btaxi\b/i,
      /\bbus\b/i,
      /\btrain\b/i,
      /\blrt\b/i,
      /\bmrt\b/i,
      /\bjeep\b/i,
      /\bjeepney\b/i,
      /\btricycle\b/i,
      /\btrike\b/i,
      /\bhabal-habal\b/i,
      /\bhabal habal\b/i,
      /\bangkas\b/i,
      /\bmove it\b/i,
      /\bparking\b/i,
      /\btoll\b/i,
      /\bpamasahe\b/i,
      /\bfare\b/i,
      /\bpasahe\b/i,
      /\bpamasahe\b/i,
      /\bplite\b/i,
      /\bpliti\b/i,
      /\bcar wash\b/i,
      /\bvehicle repair\b/i,
      /\bmotor repair\b/i,
    ],
    2
  )

  // ==========================================
  // SHOPPING
  // ==========================================

  addScore(
    'Shopping',
    [
      /\bclothes\b/i,
      /\bclothing\b/i,
      /\bshirt\b/i,
      /\bt-shirt\b/i,
      /\bpants\b/i,
      /\bshorts\b/i,
      /\bdress\b/i,
      /\bshoes\b/i,
      /\bsneakers\b/i,
      /\bslippers\b/i,
      /\bphone\b/i,
      /\bsmartphone\b/i,
      /\blaptop\b/i,
      /\bkeyboard\b/i,
      /\bmouse\b/i,
      /\bheadphones\b/i,
      /\bearphones\b/i,
      /\bgadget\b/i,
      /\bmall\b/i,
      /\bdepartment store\b/i,
      /\bonline shopping\b/i,
      /\bshopee\b/i,
      /\blazada\b/i,
      /\bamazon\b/i,
      /\bbag\b/i,
      /\bbackpack\b/i,
      /\bwatch\b/i,
      /\bjewelry\b/i,
      /\baccessories\b/i,
    ],
    2
  )

  // ==========================================
  // ENTERTAINMENT
  // ==========================================

  addScore(
    'Entertainment',
    [
      /\bmovie\b/i,
      /\bcinema\b/i,
      /\bconcert\b/i,
      /\bticket\b/i,
      /\bshow\b/i,
      /\bnetflix\b/i,
      /\bspotify\b/i,
      /\bdisney\b/i,
      /\byoutube premium\b/i,
      /\bgame\b/i,
      /\bgaming\b/i,
      /\bsteam\b/i,
      /\bplaystation\b/i,
      /\bps5\b/i,
      /\bxbox\b/i,
      /\bkaraoke\b/i,
      /\bvideoke\b/i,
      /\barcade\b/i,
    ],
    2
  )

  // ==========================================
  // UTILITIES
  // ==========================================

  addScore(
    'Utilities',
    [
      /\belectricity\b/i,
      /\belectric bill\b/i,
      /\bpower bill\b/i,
      /\belectric\b/i,
      /\bwater bill\b/i,
      /\bwater utility\b/i,
      /\binternet bill\b/i,
      /\bwifi bill\b/i,
      /\bbroadband\b/i,
      /\bphone bill\b/i,
      /\bmobile bill\b/i,
      /\bmobile load\b/i,
      /\bdata plan\b/i,
      /\bmobile data\b/i,
      /\bload\b/i,
      /\butility bill\b/i,
      /\butilities\b/i,
      /\bveco\b/i,
      /\bcebeco\b/i,
      /\bmeralco\b/i,
      /\bpldt\b/i,
      /\bglobe internet\b/i,
      /\bconverge\b/i,
    ],
    2
  )

  // ==========================================
  // HEALTHCARE
  // ==========================================

  addScore(
    'Healthcare',
    [
      /\bdoctor\b/i,
      /\bhospital\b/i,
      /\bclinic\b/i,
      /\bdentist\b/i,
      /\bdental\b/i,
      /\bmedicine\b/i,
      /\bmeds\b/i,
      /\bmedication\b/i,
      /\bpharmacy\b/i,
      /\bdrugstore\b/i,
      /\bmercury drug\b/i,
      /\bwatsons\b/i,
      /\bcheckup\b/i,
      /\bconsultation\b/i,
      /\bmedical\b/i,
      /\bvitamins\b/i,
      /\blaboratory\b/i,
      /\blab test\b/i,
      /\btherapy\b/i,
    ],
    2
  )

  // ==========================================
  // EDUCATION
  // ==========================================

  addScore(
    'Education',
    [
      /\btuition\b/i,
      /\bschool fee\b/i,
      /\buniversity fee\b/i,
      /\bcollege fee\b/i,
      /\btextbook\b/i,
      /\bnotebook\b/i,
      /\bschool supplies\b/i,
      /\bcourse\b/i,
      /\bonline course\b/i,
      /\btraining\b/i,
      /\bseminar\b/i,
      /\bprinting\b/i,
      /\bprint\b/i,
      /\bphotocopy\b/i,
      /\bphotocopying\b/i,
      /\bproject materials\b/i,
      /\bthesis\b/i,
      /\bschool\b/i,
      /\bcollege\b/i,
      /\buniversity\b/i,
      /\beducation\b/i,
    ],
    2
  )

  // ==========================================
  // TRAVEL
  // ==========================================

  addScore(
    'Travel',
    [
      /\bhotel\b/i,
      /\bresort\b/i,
      /\bairbnb\b/i,
      /\bhostel\b/i,
      /\bflight\b/i,
      /\bplane\b/i,
      /\bairplane\b/i,
      /\bvacation\b/i,
      /\bholiday\b/i,
      /\btravel\b/i,
      /\btrip\b/i,
      /\btour\b/i,
      /\bairport\b/i,
      /\baccommodation\b/i,
    ],
    3
  )

  // ==========================================
  // PERSONAL CARE
  // ==========================================

  addScore(
    'Personal Care',
    [
      /\bhaircut\b/i,
      /\bbarber\b/i,
      /\bsalon\b/i,
      /\bspa\b/i,
      /\bmassage\b/i,
      /\bfacial\b/i,
      /\bskincare\b/i,
      /\bskin care\b/i,
      /\bmakeup\b/i,
      /\bcosmetics\b/i,
      /\bbeauty\b/i,
      /\bgym\b/i,
      /\bfitness membership\b/i,
      /\bshampoo\b/i,
      /\btoiletries\b/i,
      /\bsoap\b/i,
      /\bdeodorant\b/i,
      /\bperfume\b/i,
    ],
    2
  )

  // ==========================================
  // DETERMINE BEST CATEGORY
  // ==========================================

  const sortedCategories = Object.entries(categoryScores).sort(
    ([, scoreA], [, scoreB]) => scoreB - scoreA
  )

  const [bestCategory, highestScore] = sortedCategories[0]

  if (highestScore === 0) {
    return 'Other'
  }

  return bestCategory
}

function handleFallbackParsing(text: string) {
  console.log('[Xpnd AI] Using fallback parsing for:', text)

  // Supports:
  // ₱150
  // PHP 150
  // 150 pesos
  // 150
  // 1,500.50

  const amountMatch = text.match(
    /(?:₱|php|peso|pesos|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i
  )

  const amount = amountMatch
    ? parseFloat(amountMatch[1].replace(/,/g, ''))
    : null

  if (amount === null || amount <= 0) {
    return NextResponse.json(
      { error: 'Could not parse amount' },
      { status: 400 }
    )
  }

  const category = categorizeExpense(text)

  const expense = {
    amount,
    category,
    description: text.substring(0, 255),
    merchant: '',
    date: new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila',
    }),
  }

  return NextResponse.json({ expense })
}