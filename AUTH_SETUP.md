# Authentication Setup Guide

This guide will help you set up the authentication system for the BronSwap webapp.

## Prerequisites

- MySQL/MariaDB server running
- Node.js and npm installed
- Redis server running (for session management)

## Step 1: Install Dependencies

```bash
cd /home/rworth/bronswap/WEBAPP
npm install
```

This will install:
- `mysql2` - MySQL client for Node.js
- `bcryptjs` - Password hashing
- `jose` - JWT token management

## Step 2: Configure Environment Variables

Create a `.env` file in the WEBAPP directory (or copy from `env.template`):

```bash
cp env.template .env
```

Edit `.env` and set your values:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=bronswap_wallet

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Secret (IMPORTANT: Change this to a random string in production!)
JWT_SECRET=your-random-secret-key-change-in-production

# Node Environment
NODE_ENV=development
```

## Step 3: Initialize Database

Run the authentication setup script:

```bash
cd /home/rworth/bronswap/database
./setup_auth.sh
```

This will:
1. Create the `bronswap_wallet` database (if it doesn't exist)
2. Create the authentication tables:
   - `users` - User accounts
   - `user_wallets` - Links users to Canton wallet addresses
   - `user_sessions` - Session management
3. Create a test user:
   - Username: `test`
   - Password: `test`

## Step 4: Start the Application

```bash
cd /home/rworth/bronswap/WEBAPP
npm run dev
```

The app will be available at `http://localhost:6969`

## Testing

1. Navigate to `http://localhost:6969`
2. Click "Login"
3. Enter credentials:
   - Username: `test`
   - Password: `test`
4. You should be redirected to the wallet page

## API Endpoints

The authentication system provides these endpoints:

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session
- `GET /api/auth/session` - Check current session

## Database Schema

### users table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Bcrypt hashed password
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp
- `is_active` - Account status

### user_wallets table
- `id` - Primary key
- `user_id` - Foreign key to users
- `wallet_label` - Display name for wallet
- `wallet_address` - Canton wallet address (bron::...)
- `is_primary` - Primary wallet flag

### user_sessions table
- `id` - Primary key
- `user_id` - Foreign key to users
- `session_token` - JWT token
- `expires_at` - Session expiration
- `ip_address` - Client IP
- `user_agent` - Client user agent

## Creating New Users

### Via Script

Use the hash_password.js utility to generate password hashes:

```bash
cd /home/rworth/bronswap/database
node hash_password.js mypassword
```

Then insert into database:

```sql
INSERT INTO users (username, email, password_hash, is_active) 
VALUES ('newuser', 'user@example.com', 'bcrypt_hash_here', TRUE);
```

### Via API (TODO)

A registration endpoint can be added:

```typescript
// POST /api/auth/register
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

## Security Considerations

1. **JWT_SECRET**: MUST be changed in production to a long random string
2. **Password Policy**: Consider adding password strength requirements
3. **Rate Limiting**: Add rate limiting to login endpoint
4. **HTTPS**: Always use HTTPS in production
5. **Session Expiration**: Sessions expire after 7 days by default
6. **HTTP-Only Cookies**: Session tokens are stored in HTTP-only cookies to prevent XSS

## Troubleshooting

### Database Connection Errors

- Check MySQL is running: `systemctl status mysql`
- Verify credentials in `.env` file
- Test connection: `mysql -u root -p -e "SHOW DATABASES;"`

### Login Not Working

- Check browser console for errors
- Verify API endpoint is accessible: `curl http://localhost:6969/api/auth/session`
- Check database has test user: `mysql -u root -p bronswap_wallet -e "SELECT * FROM users;"`

### Session Issues

- Clear cookies and try again
- Check session table: `SELECT * FROM user_sessions WHERE expires_at > NOW();`
- Verify JWT_SECRET is set in `.env`

## Next Steps

1. **Add Registration Page**: Create UI for new user signup
2. **Password Reset**: Implement forgot password flow
3. **Email Verification**: Add email confirmation
4. **2FA**: Add two-factor authentication
5. **OAuth**: Add social login (Google, GitHub, etc.)
6. **User Profile**: Create profile management page
7. **Wallet Management**: Allow users to add/remove wallets

