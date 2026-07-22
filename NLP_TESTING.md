# Xpnd AI - NLP Expense Parsing Testing Guide

## Overview

The Xpnd app uses an AI-powered NLP system to parse natural language expense descriptions into structured expense data. The system uses Ollama with the Gemma 2:2b (or Gemma 3:4b) model for intelligent extraction.

## Prerequisites

1. **Ollama Installation**: You need Ollama running locally
   ```bash
   # Install from https://ollama.ai
   ollama serve
   ```

2. **Pull the Model**:
   ```bash
   # For faster performance on most systems
   ollama pull gemma2:2b
   
   # Or for better accuracy (requires more resources)
   ollama pull gemma2:7b
   ```

3. **Verify Ollama is Running**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

## Testing the NLP API

### Via cURL

```bash
curl -X POST http://localhost:3000/api/parse-expense \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Spent $45.99 on groceries at Whole Foods using my credit card"
  }'
```

**Expected Response**:
```json
{
  "expense": {
    "amount": 45.99,
    "category": "Food & Dining",
    "description": "groceries at Whole Foods",
    "date": "2024-07-15",
    "paymentMethod": "credit_card"
  }
}
```

### Via the Web App

1. **Sign Up/Login** to the Xpnd app
2. Navigate to **Dashboard → Add Expense**
3. Enter a natural language description in the "Describe Your Expense" field
4. Click **"Parse Expense"** button
5. The AI will extract:
   - Amount (currency detection)
   - Category (intelligent matching)
   - Description (cleaned text)
   - Date (if mentioned, defaults to today)
   - Payment method (if mentioned)

## Test Cases

### Basic Expense Parsing

```
Input: "Bought coffee for $5 at Starbucks"
Expected: amount: 5, category: "Food & Dining"

Input: "Paid $120 for Uber from airport"
Expected: amount: 120, category: "Transportation"

Input: "Movie tickets $28"
Expected: amount: 28, category: "Entertainment"
```

### Complex Parsing

```
Input: "Spent $150 on groceries and supplies at Target with credit card yesterday"
Expected: amount: 150, category: "Shopping", date: yesterday's date

Input: "Gas $55.40, filled up the tank using debit card"
Expected: amount: 55.40, category: "Transportation"
```

### Edge Cases

```
Input: "Paid 45.99 dollars for dinner"
Expected: amount: 45.99 (handles written amounts)

Input: "$100 flight to NYC next week"
Expected: amount: 100, category: "Travel"
```

## Fallback Behavior

If Ollama is unavailable, the system automatically falls back to regex-based parsing:

- **Amount Extraction**: Uses regex to find currency amounts (`$X.XX`, `X dollars`, etc.)
- **Category Detection**: Uses keyword matching (e.g., "grocery" → Food & Dining)
- **Date**: Defaults to today's date
- **Description**: Uses the full input text

### Fallback Test

To test fallback mode:

```bash
# Stop Ollama
# Then try the API
curl -X POST http://localhost:3000/api/parse-expense \
  -H "Content-Type: application/json" \
  -d '{"text": "spent $30 on lunch"}'
```

You should still get a valid response with regex-extracted data.

## Performance Considerations

- **Gemma 2:2b**: ~2-5 seconds per request (recommended for testing)
- **Gemma 2:7b**: ~3-10 seconds per request (better accuracy)
- **Gemma 3:4b**: ~5-15 seconds per request (highest accuracy)

## Debugging

Check the browser console and server logs for debug output:

```
[v0] Received expense text: Spent $45 on groceries
[v0] Calling Ollama at: http://localhost:11434 with model: gemma2:2b
[v0] Ollama response: {"amount": 45, ...}
[v0] Successfully parsed JSON: {amount: 45, ...}
```

## Environment Variables

Configure the NLP system via environment variables:

```env
# Ollama server URL (default: http://localhost:11434)
OLLAMA_URL=http://localhost:11434

# Ollama model to use (default: gemma2:2b)
OLLAMA_MODEL=gemma2:7b
```

## Supported Categories

- Food & Dining
- Transportation
- Shopping
- Entertainment
- Utilities
- Healthcare
- Education
- Travel
- Personal Care
- Other

## Future Enhancements

- [ ] Receipt image parsing (OCR)
- [ ] Multi-language support
- [ ] Custom category definitions
- [ ] Transaction history analysis
- [ ] Budget recommendation engine
