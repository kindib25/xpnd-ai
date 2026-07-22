# Xpnd - AI-Powered Expense Tracking

> Smart expense tracking with intelligent natural language processing.

## Overview

Xpnd is a modern expense tracking application that harnesses the power of AI to make tracking expenses effortless. Simply describe your expenses in natural language, and let Xpnd's intelligent system parse and categorize them automatically.

**Key Features:**
- 🤖 **AI Expense Parsing** - Describe expenses naturally, let AI extract the details
- 💰 **Smart Budgeting** - Set category budgets and track spending
- 🎯 **Savings Goals** - Create and monitor savings targets
- 📊 **Analytics Dashboard** - Visual breakdown of spending patterns
- 🔐 **Secure & Private** - Supabase auth with Row-Level Security
- 🌙 **Dark Mode** - Beautiful modern interface

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Ollama (for AI expense parsing - optional, app works without it)

### Installation

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd xpnd
   pnpm install
   ```

2. **Setup Environment**
   ```bash
   # Copy env template
   cp .env.example .env.development.local
   
   # Configure Supabase (via v0 UI or manually)
   # NEXT_PUBLIC_SUPABASE_URL=...
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Setup Ollama (Optional)**
   ```bash
   # Install Ollama from https://ollama.ai
   ollama serve  # Run in another terminal
   ollama pull gemma2:2b
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

5. **Open Browser**
   ```
   http://localhost:3000
   ```

## Features Overview

### 1. AI Expense Parsing

Enter expenses naturally:
- "Spent $45 on groceries at Whole Foods"
- "Paid $35 for Uber to downtown"
- "Flight to NYC $250"

The system automatically extracts:
- **Amount** - $45, $35, $250
- **Category** - Food & Dining, Transportation, Travel
- **Date** - Today, specific dates, or relative dates
- **Description** - Cleaned, readable summary
- **Payment Method** - Credit card, cash, etc.

### 2. Dashboard

Real-time overview:
- Monthly spending summary
- Expense breakdown by category (pie chart)
- Budget progress bars
- Active savings goals
- Recent transactions

### 3. Budget Management

- Set monthly budgets per category
- Visual progress indicators
- Budget alerts when overspending
- Historical budget tracking

### 4. Savings Goals

- Create multiple savings targets
- Track progress toward goals
- Set deadlines
- Monitor all goals at a glance

### 5. Transaction History

- View all expenses
- Filter by category, date, amount
- Edit or delete transactions
- Add tags for organization
- Receipt URL storage

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth with Google OAuth
- **AI/NLP**: Ollama with Gemma 2

### Infrastructure
- **Deployment**: Vercel
- **Database Hosting**: Supabase
- **Real-time**: Supabase Real-time Subscriptions

## Project Structure


```
xpnd/
├── app/
│   ├── api/
│   │   ├── parse-expense/          # Main NLP endpoint (auth required)
│   │   └── parse-expense-demo/     # Demo endpoint (no auth)
│   ├── auth/
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── callback/
│   │   └── error/
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── add-expense/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── goals/
│   │   └── settings/
│   ├── layout.tsx
│   ├── page.tsx                    # Home/redirect
│   └── globals.css
├── components/
│   ├── add-expense-form.tsx        # AI parsing + form
│   ├── dashboard-overview.tsx      # Summary widgets
│   ├── expense-chart.tsx           # Spending breakdown
│   ├── budget-overview.tsx         # Budget tracking
│   ├── transactions-list.tsx       # Transaction table
│   ├── budgets-list.tsx            # Budget management
│   ├── goals-list.tsx              # Savings goals
│   ├── settings-form.tsx           # Profile/settings
│   ├── navigation.tsx              # Sidebar nav
│   └── ui/                         # shadcn components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts
│   └── utils.ts
├── hooks/
│   └── use-user.ts
├── middleware.ts                    # Auth middleware
└── NLP_TESTING.md                   # NLP test guide
```

## Database Schema

### Tables

**profiles**
- id (UUID) - User ID
- email, full_name, avatar_url
- currency, monthly_budget
- created_at, updated_at

**expenses**
- id, user_id, amount, category
- description, date, payment_method
- tags (array), receipt_url
- created_at, updated_at

**budgets**
- id, user_id, category
- limit_amount, current_amount
- month_year (e.g., "2024-07")
- created_at, updated_at

**savings_goals**
- id, user_id, name, target_amount
- current_amount, deadline
- category, created_at, updated_at

## API Endpoints

### Authentication
- `POST /auth/sign-up` - Create account
- `POST /auth/login` - Sign in with email/password
- `POST /auth/callback` - OAuth callback (internal)
- `GET /auth/logout` - Sign out

### Expenses
- `POST /api/parse-expense` - Parse natural language expense (auth required)
- `POST /api/parse-expense-demo` - Demo parsing (no auth)

### Dashboard
- `GET /dashboard` - Main overview
- `POST /dashboard/add-expense` - Create expense
- `GET /dashboard/transactions` - List expenses
- `GET /dashboard/budgets` - List budgets
- `GET /dashboard/goals` - List savings goals

## Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Ollama (optional)
OLLAMA_URL=http://localhost:11434          # Default: http://localhost:11434
OLLAMA_MODEL=gemma3:4b                     # Default: gemma3:4b
```

### Supabase Setup

The app comes with a pre-configured schema:

```sql
-- Run via Supabase SQL Editor or use supabase_execute_sql tool
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  ...
);

-- Similar for expenses, budgets, savings_goals
-- All tables have Row-Level Security (RLS) enabled
```

## AI/NLP System

### How It Works

1. **User Input**: "Spent $45 on groceries"
2. **API Call**: Sends to `/api/parse-expense`
3. **Ollama Processing**: LLM extracts structure
4. **Response**: `{amount: 45, category: "Food & Dining", ...}`
5. **Form Population**: Pre-fills expense form
6. **User Review**: User can edit before saving
7. **Save to DB**: Stores in Supabase

### Fallback Mode

If Ollama is unavailable:
- Uses intelligent regex parsing
- Keyword-based category detection
- App continues to work fully
- User can always manually enter data

### Supported Categories

1. Food & Dining
2. Transportation
3. Shopping
4. Entertainment
5. Utilities
6. Healthcare
7. Education
8. Travel
9. Personal Care
10. Other

## Testing

### Test the NLP API

```bash
# Demo endpoint (no auth)
curl -X POST http://localhost:3000/api/parse-expense-demo \
  -H "Content-Type: application/json" \
  -d '{"text": "Spent $45 on groceries"}'

# Response
{
  "expense": {
    "amount": 45,
    "category": "Food & Dining",
    "description": "Spent $45 on groceries",
    "date": "2026-07-15",
    "paymentMethod": "credit_card"
  },
  "source": "regex-fallback"
}
```

### Full Integration Test

1. Sign up with email/password or Google
2. Go to Dashboard → Add Expense
3. Enter: "Paid $50 for dinner"
4. Click "Parse Expense"
5. Review parsed result
6. Click "Save Expense"
7. Verify in Transactions

### Test Cases

See **NLP_TESTING.md** for comprehensive test cases.

## Deployment

### Vercel (Recommended)

```bash
# Connect GitHub repo
vercel link

# Deploy
vercel deploy

# Set environment variables in Vercel dashboard
```

### Docker

```bash
docker build -t xpnd .
docker run -p 3000:3000 xpnd
```

### Manual

```bash
pnpm build
pnpm start
```

## Troubleshooting

### "Failed to parse expense"

1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Verify model is installed: `ollama list`
3. Check OLLAMA_URL env var
4. App falls back to regex parsing automatically

### "Not authenticated"

1. Sign up/login first
2. Check Supabase credentials in env vars
3. Verify auth callback route exists

### Missing UI Components

```bash
# Add missing shadcn components
pnpm dlx shadcn@latest add card input label -y
```

### Database Connection Error

1. Verify Supabase credentials
2. Check database schema is created
3. Enable Row-Level Security policies

## Performance

### Optimization Tips

- Use Gemma 3:4b for faster parsing (2-5s)
- Enable Ollama GPU acceleration if available
- Database queries use indexes for speed
- Supabase real-time optional

### Browser Performance

- Dark mode reduces eye strain
- Lazy loading for dashboard charts
- Optimized images and assets
- Modern CSS for smooth animations

## Security

### Features

- ✅ Row-Level Security (RLS) on all tables
- ✅ OAuth 2.0 authentication
- ✅ HTTPS encryption
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configured
- ✅ Session management

### Best Practices

- Never commit `.env` files
- Use environment variables for secrets
- Keep dependencies updated
- Review Supabase RLS policies

## Contributing

Contributions welcome! Areas for enhancement:

- Receipt OCR parsing
- Multi-language support
- Budget recommendations
- Machine learning fine-tuning
- Mobile app (React Native)

## Future Roadmap

- [ ] Receipt image parsing
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Bill splitting
- [ ] Tax category exports
- [ ] Mobile app
- [ ] Collaborative budgets
- [ ] AI budgeting assistant

## Support

- 📚 **Docs**: See NLP_TESTING.md, OLLAMA_SETUP.md
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussion**: GitHub Discussions
- 📧 **Email**: support@xpnd.app

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Ollama & Gemma for AI capabilities
- Supabase for backend infrastructure
- shadcn/ui for component library
- Vercel for hosting platform

---

**Ready to track expenses intelligently?**

→ [Get Started](http://localhost:3000)  
→ [Read NLP Guide](./NLP_TESTING.md)  
→ [Setup Ollama](./OLLAMA_SETUP.md)  
→ [View Features](./NLP_FEATURE_SUMMARY.md)
