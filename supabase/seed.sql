-- Seed data for testing
-- Password for test user is "test" (hashed with bcrypt)
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- Insert test user
INSERT INTO users (id, username, password_hash, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW())
ON CONFLICT (username) DO NOTHING;

-- Insert test wallets
INSERT INTO wallets (id, user_id, label, address, cc_balance, created_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Main Wallet', 'bron::122067a3096266f3cbb9320eeacf64bd5bec8de8f94c1ae605fda3218d3424a16da3', 10000.5234, NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Trading Account', 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345', 5432.1234, NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Savings Wallet', 'bron::1220ghi012345678901234567890123456789012345678901234567', 25000.0000, NOW())
ON CONFLICT (address) DO NOTHING;

-- Insert test transactions for Trading Account
INSERT INTO transactions (wallet_id, transaction_hash, type, amount, usd_value, status, paid_with, paid_amount, created_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440002', '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4612:2', 'BUY', 1250.5678, 250.11, 'completed', 'USDC', 250.11, '2025-10-30T14:32:15Z'),
    ('660e8400-e29b-41d4-a716-446655440002', '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4619:8', 'WITHDRAWAL', 500.0, 79.80, 'completed', NULL, NULL, '2025-10-30T10:15:42Z'),
    ('660e8400-e29b-41d4-a716-446655440002', '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4614:3', 'BUY', 5000.0, 1000.0, 'completed', 'USDT', 1000.0, '2025-10-29T16:45:30Z'),
    ('660e8400-e29b-41d4-a716-446655440002', '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4615:4', 'DEPOSIT', 2500.25, 399.04, 'completed', NULL, NULL, '2025-10-28T09:20:15Z')
ON CONFLICT DO NOTHING;

-- Set to_address and from_address for transactions
UPDATE transactions SET 
    to_address = 'bron::1220abc123def456789012345678901234567890123456789012345',
    from_address = 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345'
WHERE type = 'WITHDRAWAL' AND transaction_hash = '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4619:8';

UPDATE transactions SET 
    from_address = 'bron::1220xyz987654321098765432109876543210987654321098765432',
    to_address = 'bron::1220def456789abcdef0123456789abcdef0123456789abcdef012345'
WHERE type = 'DEPOSIT' AND transaction_hash = '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4615:4';

-- Insert test transactions for Main Wallet
INSERT INTO transactions (wallet_id, transaction_hash, type, amount, usd_value, status, paid_with, paid_amount, created_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4616:5', 'BUY', 10000.0, 1596.0, 'completed', 'USDC', 1596.0, '2025-10-30T08:15:22Z'),
    ('660e8400-e29b-41d4-a716-446655440001', '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4617:6', 'DEPOSIT', 523.4, 83.53, 'completed', NULL, NULL, '2025-10-29T14:30:45Z')
ON CONFLICT DO NOTHING;

UPDATE transactions SET 
    from_address = 'bron::1220exchange001234567890123456789012345678901234567890',
    to_address = 'bron::122067a3096266f3cbb9320eeacf64bd5bec8de8f94c1ae605fda3218d3424a16da3'
WHERE type = 'DEPOSIT' AND transaction_hash = '122071c0a43ec72a715f29d42d375ca817b587533f2b61d1439d319c8a83abfe4617:6';

-- Insert daily purchase limits
INSERT INTO daily_purchase_limits (wallet_id, purchase_date, total_cc_purchased, daily_limit)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440002', '2025-10-30', 1250.5678, 10000),
    ('660e8400-e29b-41d4-a716-446655440001', '2025-10-30', 0, 10000)
ON CONFLICT (wallet_id, purchase_date) DO UPDATE SET
    total_cc_purchased = EXCLUDED.total_cc_purchased;

