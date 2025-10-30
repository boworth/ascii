-- Supabase Database Schema for Ascii Wallet App
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    address TEXT UNIQUE NOT NULL,
    cc_balance DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT wallets_user_id_label_unique UNIQUE(user_id, label)
);

-- Index for faster wallet lookups
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    transaction_hash TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('BUY', 'DEPOSIT', 'WITHDRAWAL')),
    amount DECIMAL(20, 8) NOT NULL,
    usd_value DECIMAL(20, 2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    to_address TEXT,
    from_address TEXT,
    paid_with VARCHAR(50),
    paid_amount DECIMAL(20, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);

-- Daily purchase limits table
CREATE TABLE IF NOT EXISTS daily_purchase_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    purchase_date DATE NOT NULL,
    total_cc_purchased DECIMAL(20, 8) DEFAULT 0,
    daily_limit DECIMAL(20, 8) DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT daily_limits_wallet_date_unique UNIQUE(wallet_id, purchase_date)
);

-- Index for faster daily limit lookups
CREATE INDEX IF NOT EXISTS idx_daily_limits_wallet_date ON daily_purchase_limits(wallet_id, purchase_date);

-- Sessions table (for JWT token management)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_limits_updated_at BEFORE UPDATE ON daily_purchase_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_purchase_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can only see their own wallets
CREATE POLICY wallets_select_own ON wallets
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY wallets_insert_own ON wallets
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY wallets_update_own ON wallets
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can only see transactions for their wallets
CREATE POLICY transactions_select_own ON transactions
    FOR SELECT USING (
        wallet_id IN (
            SELECT id FROM wallets WHERE user_id::text = auth.uid()::text
        )
    );

CREATE POLICY transactions_insert_own ON transactions
    FOR INSERT WITH CHECK (
        wallet_id IN (
            SELECT id FROM wallets WHERE user_id::text = auth.uid()::text
        )
    );

-- Users can only see daily limits for their wallets
CREATE POLICY daily_limits_select_own ON daily_purchase_limits
    FOR SELECT USING (
        wallet_id IN (
            SELECT id FROM wallets WHERE user_id::text = auth.uid()::text
        )
    );

CREATE POLICY daily_limits_insert_own ON daily_purchase_limits
    FOR INSERT WITH CHECK (
        wallet_id IN (
            SELECT id FROM wallets WHERE user_id::text = auth.uid()::text
        )
    );

CREATE POLICY daily_limits_update_own ON daily_purchase_limits
    FOR UPDATE USING (
        wallet_id IN (
            SELECT id FROM wallets WHERE user_id::text = auth.uid()::text
        )
    );

-- Sessions policies
CREATE POLICY sessions_select_own ON sessions
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY sessions_insert_own ON sessions
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY sessions_delete_own ON sessions
    FOR DELETE USING (user_id::text = auth.uid()::text);

