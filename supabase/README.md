# Supabase Database Integration

This directory contains all the files needed to set up and manage the Supabase PostgreSQL database for the Ascii Wallet app.

## Files

- **`schema.sql`** - Complete database schema with tables, indexes, RLS policies
- **`seed.sql`** - Test data for development (test user, wallets, transactions)
- **`SETUP.md`** - Step-by-step setup guide for integrating with Vercel
- **`README.md`** - This file

## Quick Start

Follow these steps to get Supabase integrated:

1. **Create a Supabase account** at https://supabase.com
2. **Create a new project** in Supabase dashboard
3. **Run the schema** from `schema.sql` in the SQL Editor
4. **Seed test data** (optional) from `seed.sql`
5. **Copy API keys** from Project Settings → API
6. **Add environment variables** to Vercel
7. **Install dependencies**: `npm install @supabase/supabase-js`
8. **Deploy and test**

See `SETUP.md` for detailed instructions.

## Database Schema Overview

### Tables

**`users`**
- Stores user accounts with hashed passwords
- Primary key: `id` (UUID)
- Unique: `username`

**`wallets`**
- Multiple wallets per user
- Each wallet has a Canton address and CC balance
- Foreign key: `user_id` → `users.id`
- Unique: `address`

**`transactions`**
- Transaction history for each wallet
- Types: BUY, DEPOSIT, WITHDRAWAL
- Tracks amounts, USD values, addresses, payment methods
- Foreign key: `wallet_id` → `wallets.id`

**`daily_purchase_limits`**
- Tracks daily CC purchase limits per wallet
- Default limit: 10,000 CC per day
- Foreign key: `wallet_id` → `wallets.id`
- Unique: `(wallet_id, purchase_date)`

**`sessions`**
- JWT session management
- Stores active authentication tokens
- Foreign key: `user_id` → `users.id`

### Security

**Row Level Security (RLS)** is enabled on all tables with policies to ensure:
- Users can only see their own data
- Users can only access wallets they own
- Users can only see transactions for their wallets
- Users can only see daily limits for their wallets

### Triggers

Auto-updating `updated_at` timestamps on all tables when records are modified.

## Test User

After running `seed.sql`, you can login with:
- **Username**: `test`
- **Password**: `test`

This user has 3 pre-configured wallets with transaction history.

## Environment Variables

Required environment variables (add to Vercel and `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## API Integration

The app uses `lib/supabase.ts` to interact with the database:

```typescript
import { supabase, getServiceRoleClient } from '@/lib/supabase'

// Client-side queries (respects RLS)
const { data, error } = await supabase
  .from('wallets')
  .select('*')
  .eq('user_id', userId)

// Server-side admin queries (bypasses RLS)
const serviceClient = getServiceRoleClient()
const { data, error } = await serviceClient
  .from('users')
  .select('*')
```

## Migrations

To add new features or modify the schema:

1. Write a new migration SQL file
2. Test it locally if possible
3. Run it in Supabase SQL Editor
4. Document the changes
5. Update TypeScript types in `lib/supabase.ts`

## Backup & Recovery

### Automatic Backups
- Enable in Database → Backups (Supabase dashboard)
- Free tier: 7-day retention
- Pro tier: 30-day retention

### Manual Export
```bash
# From Supabase dashboard:
# Database → Backups → Download
```

## Monitoring

View real-time database activity:
- **Table Editor**: Browse and edit data
- **SQL Editor**: Run custom queries
- **Database**: Monitor connections and performance
- **Logs**: View query logs and errors

## Support

For issues or questions:
1. Check `SETUP.md` for troubleshooting
2. Review Supabase docs: https://supabase.com/docs
3. Check Supabase Discord: https://discord.supabase.com

