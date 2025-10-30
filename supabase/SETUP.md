# Supabase Integration Setup Guide

This guide will help you set up Supabase with your Vercel deployment.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in the details:
   - **Name**: `ascii-wallet` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
6. Click "Create new project"
7. Wait 2-3 minutes for the project to be created

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 3: Seed Test Data (Optional)

1. In the SQL Editor, create another new query
2. Copy the entire contents of `supabase/seed.sql`
3. Paste and run it
4. This will create a test user (username: `test`, password: `test`)

## Step 4: Get Your API Keys

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the left menu
3. You'll see:
   - **Project URL**: Copy this
   - **Project API keys**:
     - `anon` `public` key: Copy this
     - `service_role` `secret` key: Copy this (keep it secret!)

## Step 5: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `ascii` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL from Step 4 | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon public key from Step 4 | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role secret key from Step 4 | Production, Preview, Development |

5. Click **Save** for each variable

## Step 6: Update Local Environment

Create or update `/home/rworth/bronswap/WEBAPP/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Existing variables
PRICE_UPDATE_API_KEY=6fcd802f2e03fb3ae88f60cfc0585d4b7c3e1233fd5114ea7a4878e590f0b7c7
NEXT_PUBLIC_BASE_URL=https://ascii-gold.vercel.app
JWT_SECRET=your-random-secret-key-change-in-production-use-something-long-and-random
NODE_ENV=development
```

## Step 7: Install Dependencies

```bash
cd /home/rworth/bronswap/WEBAPP
npm install @supabase/supabase-js
```

## Step 8: Redeploy to Vercel

After adding the environment variables to Vercel:

```bash
git push origin main
```

Or manually redeploy from the Vercel dashboard.

## Step 9: Test the Integration

1. Go to your deployed site
2. Try logging in with username `test` and password `test`
3. Check that wallets and transactions load correctly
4. Try creating a new wallet

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure all three environment variables are set in Vercel
- Redeploy your app after adding variables

### "Permission denied" errors
- Check that Row Level Security (RLS) policies are enabled
- Make sure the user is authenticated properly

### Can't connect to database
- Verify your Supabase project URL is correct
- Check that your API keys are correct
- Make sure your Supabase project is not paused (free tier auto-pauses after inactivity)

### Transactions not showing
- Run the seed.sql script to populate test data
- Check the wallet_id matches in the database

## Database Management

### View Data
1. Go to **Table Editor** in Supabase dashboard
2. Select a table to view/edit data

### Query Data
Use the SQL Editor to run custom queries:
```sql
-- Get all wallets for a user
SELECT * FROM wallets WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Get recent transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```

### Backup Database
1. Go to **Database** → **Backups**
2. Enable automatic daily backups (recommended)
3. Download manual backups as needed

## Security Best Practices

1. **Never commit** API keys to git
2. **Use service_role_key** only in server-side code
3. **Enable RLS** on all tables (already done in schema.sql)
4. **Rotate keys** if they are ever exposed
5. **Monitor usage** in Supabase dashboard

## Next Steps

Once Supabase is set up, the following features will work:
- ✅ Real user authentication
- ✅ Multiple wallets per user
- ✅ Transaction history stored in database
- ✅ Daily purchase limits tracked per wallet
- ✅ Persistent sessions

The app will automatically use Supabase instead of the JSON mock database!

