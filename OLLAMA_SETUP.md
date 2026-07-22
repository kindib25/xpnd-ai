# Xpnd - Ollama Integration Guide

## Quick Start

The Xpnd app features AI-powered natural language expense parsing using Ollama. Here's how to set it up.

### Step 1: Install Ollama

1. Download from [https://ollama.ai](https://ollama.ai)
2. Install for your OS (macOS, Linux, or Windows)
3. Run Ollama:
   ```bash
   ollama serve
   ```

### Step 2: Pull a Model

Choose one based on your system capabilities:

```bash
# Recommended for most systems (fast, decent accuracy)
ollama pull gemma2:2b

# Better accuracy (requires more resources)
ollama pull gemma2:7b

# Original spec from requirements
ollama pull gemma2  # pulls latest version
```

Check available models:
```bash
ollama list
```

### Step 3: Verify Connection

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Expected output
{
  "models": [
    {
      "name": "gemma2:2b",
      "modified_at": "...",
      "size": ...
    }
  ]
}
```

### Step 4: Configure the App

Set environment variables (optional, has sensible defaults):

```env
# .env.development.local or .env.production.local
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
```

The app will automatically fall back to regex parsing if Ollama is unavailable.

## Features

### Smart Expense Parsing

The NLP system extracts:
- **Amount**: Currency detection (`$45.99`, `45 dollars`, etc.)
- **Category**: Intelligent keyword matching with 10 predefined categories
- **Date**: Relative date parsing (`yesterday`, `last week`, specific dates)
- **Description**: Cleaned summary of the expense
- **Payment Method**: Credit card, debit, cash, etc. (when mentioned)

### Supported Categories

1. **Food & Dining** - Restaurants, groceries, coffee shops
2. **Transportation** - Gas, Uber, taxis, parking
3. **Shopping** - Retail, clothing, stores
4. **Entertainment** - Movies, games, concerts, shows
5. **Utilities** - Electric, water, internet, phone bills
6. **Healthcare** - Doctor, hospital, medicine, pharmacy
7. **Education** - Books, courses, tuition
8. **Travel** - Hotels, flights, vacation
9. **Personal Care** - Gym, salon, haircut, spa
10. **Other** - Miscellaneous expenses

### Example Inputs

```
"Spent $45 on groceries"
→ { amount: 45, category: "Food & Dining" }

"Paid $120 for Uber ride to airport"
→ { amount: 120, category: "Transportation" }

"Movie tickets $28 with credit card"
→ { amount: 28, category: "Entertainment", paymentMethod: "credit_card" }

"Doctor visit $150 yesterday"
→ { amount: 150, category: "Healthcare", date: "2024-07-14" }

"Flight NYC $250"
→ { amount: 250, category: "Travel" }
```

## API Endpoints

### Main Endpoint (Authenticated)

```
POST /api/parse-expense
Content-Type: application/json
Authorization: Bearer {session_token}

{
  "text": "Spent $45 on groceries"
}
```

### Demo Endpoint (No Auth Required)

Perfect for testing:

```bash
# Via POST
curl -X POST http://localhost:3000/api/parse-expense-demo \
  -H "Content-Type: application/json" \
  -d '{"text": "Spent $45 on groceries"}'

# Via GET (query parameter)
curl "http://localhost:3000/api/parse-expense-demo?text=Spent%20%2445%20on%20groceries"
```

Response:
```json
{
  "expense": {
    "amount": 45,
    "category": "Food & Dining",
    "description": "Spent $45 on groceries",
    "date": "2026-07-15",
    "paymentMethod": "credit_card"
  },
  "source": "ollama",
  "model": "gemma2:2b"
}
```

## Fallback Behavior

If Ollama isn't available:
- The app falls back to intelligent regex parsing
- Still extracts amount, category, date, and description
- User can manually edit the result before saving
- Returns `"source": "regex-fallback"` in response

## Performance

| Model | Speed | Quality | VRAM | CPU |
|-------|-------|---------|------|-----|
| gemma2:2b | Fast (2-5s) | Good | 3GB | Efficient |
| gemma2:7b | Medium (5-10s) | Better | 8GB | Moderate |
| gemma2 (latest) | Varies | Varies | Varies | Varies |

Recommendation: **Start with gemma2:2b** - good balance of speed and accuracy.

## Debugging

### Check Ollama is Running

```bash
# Should return version and status
curl http://localhost:11434/api/version
```

### Monitor Parsing

Look for `[v0]` logs in browser console and server terminal:

```
[v0] Received expense text: Spent $45 on groceries
[v0] Calling Ollama at: http://localhost:11434 with model: gemma2:2b
[v0] Ollama response: {"amount": 45, "category": "Food & Dining", ...}
[v0] Successfully parsed JSON: {...}
```

### Common Issues

**"Ollama not available"**
- Ensure `ollama serve` is running in another terminal
- Check OLLAMA_URL is correct (default: `http://localhost:11434`)
- Verify no firewall blocks port 11434

**"Model not found"**
- Pull model: `ollama pull gemma2:2b`
- Or set different model: `OLLAMA_MODEL=llama2`

**Slow parsing**
- Check system resources (CPU, RAM)
- Try smaller model: `gemma2:2b` instead of `gemma2:7b`
- Ensure Ollama isn't processing other requests

**Inaccurate categories**
- Improve prompts in `app/api/parse-expense/route.ts`
- Use a larger model: `ollama pull gemma2:7b`
- Enable Ollama locally for offline use

## Advanced Configuration

### Use Different Models

```env
# Llama 2 (Meta's model)
OLLAMA_MODEL=llama2

# Mistral (fast and small)
OLLAMA_MODEL=mistral

# Neural Chat (optimized for chat/instructions)
OLLAMA_MODEL=neural-chat
```

### Remote Ollama

```env
# Use Ollama on another machine
OLLAMA_URL=http://192.168.1.100:11434
```

### Custom Prompts

Edit the prompt in `app/api/parse-expense/route.ts` line ~32:

```typescript
const prompt = `You are an expert at parsing expense information...
[Your custom prompt here]`
```

## Testing

### Unit Tests (Coming Soon)

```bash
npm run test:nlp
```

### Integration Tests

See `NLP_TESTING.md` for comprehensive test cases and examples.

## Production Deployment

For Vercel deployment without local Ollama:

1. **Option A**: Use cloud Ollama service
   ```env
   OLLAMA_URL=https://ollama-service.example.com
   ```

2. **Option B**: Deploy Ollama separately and link
   - Deploy Ollama on a separate server
   - Configure `OLLAMA_URL` to point to it

3. **Option C**: Use an AI API instead
   - Modify `app/api/parse-expense/route.ts`
   - Replace Ollama call with OpenAI/Anthropic API
   - Returns same response format

## Roadmap

- [ ] Receipt image parsing (OCR)
- [ ] Multi-language support
- [ ] Custom category definitions per user
- [ ] Machine learning model fine-tuning
- [ ] Budget recommendation engine
- [ ] Transaction pattern analysis

## Resources

- Ollama GitHub: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library
- Gemma 2 Docs: https://ai.google.dev/gemma
- Get Help: https://github.com/ollama/ollama/issues
