# TRNG.le API Documentation v1.0

Proprietary RFQ system for trading digital assets on the Canton Network. Get real-time quotes and execute swaps with guaranteed pricing.

## Base URL

```
https://trngle.xyz/v1
```

## Authentication

Include your API key in the header:

```
X-API-Key: your_api_key
```

To get an API key, please contact us.

---

## Prices

### GET /prices

Returns current mid prices for all supported assets.

**Response:**

```json
{
  "CBTC": "97250.00",
  "CC": "0.07353",
  "timestamp": 1702312345.123
}
```

**Python Example:**

```python
import requests

response = requests.get(
    "https://trngle.xyz/v1/prices",
    headers={
        "X-API-Key": "your_api_key"
    }
)

prices = response.json()
print(f"CBTC: ${prices['CBTC']}")
print(f"CC: ${prices['CC']}")
```

---

### GET /prices/{symbol}

Returns the current mid price for a specific asset.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | CBTC or CC |

**Response:**

```json
{
  "symbol": "CBTC",
  "price": "97250.00",
  "timestamp": 1702312345.123
}
```

**Python Example:**

```python
import requests

symbol = "CBTC"

response = requests.get(
    f"https://trngle.xyz/v1/prices/{symbol}",
    headers={
        "X-API-Key": "your_api_key"
    }
)

data = response.json()
print(f"{data['symbol']}: ${data['price']}")
```

---

## Quote

### POST /quote

Request a quote for swapping one token for another. Quotes are valid for 60 seconds.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| from_token | string | Yes | CBTC or CC |
| to_token | string | Yes | CBTC or CC |
| amount | string | Yes | Amount to sell |
| max_spread_bps | integer | No | Max spread in bps (default: 50) |

**Request Body:**

```json
{
  "from_token": "CC",
  "to_token": "CBTC",
  "amount": "100000",
  "max_spread_bps": 50
}
```

**Response:**

```json
{
  "order_id": "ord_abc123xyz",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "price": "1322751.32",
  "spread_bps": 15,
  "usd_value": "7353.00",
  "payment_address": "f057be3ea9bbfaed954f8a4399e0a2db::1220a2884e3a763c516aa19e4d0224fdf8821f2cafe66a22b398896e115ba0e8e67d",
  "expires_in": 60,
  "expires_at": 1702312405
}
```

**Errors:**

- Insufficient liquidity:
  ```json
  { "error": "INSUFFICIENT_LIQUIDITY" }
  ```

- Spread exceeded:
  ```json
  { "error": "SPREAD_EXCEEDS_LIMIT" }
  ```

**Python Example:**

```python
import requests

response = requests.post(
    "https://trngle.xyz/v1/quote",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "from_token": "CC",
        "to_token": "CBTC",
        "amount": "100000",
        "max_spread_bps": 50
    }
)

quote = response.json()
print(f"Order: {quote['order_id']}")
print(f"Receive: {quote['amount_out']} CBTC")
```

---

### POST /multi-quote

Request quotes for multiple swaps in a single request. Maximum 10 orders per request. 

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| orders | array | Yes | Array of orders (max 10) |
| max_spread_bps | integer | No | Max spread in bps (default: 50) |

**Request Body:**

```json
{
  "orders": [
    { "from_token": "CC", "to_token": "CBTC", "amount": "100000" },
    { "from_token": "CC", "to_token": "CBTC", "amount": "50000" }
  ],
  "max_spread_bps": 50
}
```

**Response:**

```json
{
  "order_id": "ord_multi_abc123xyz",
  "orders": [
    { "index": 0, "amount_out": "0.0756", "spread_bps": 15, "payment_address": "f057be3ea9bbfaed954f8a4399e0a2db::1220a2884e3a763c516aa19e4d0224fdf8821f2cafe66a22b398896e115ba0e8e67d" },
    { "index": 1, "amount_out": "0.0378", "spread_bps": 15, "payment_address": "f057be3ea9bbfaed954f8a4399e0a2db::1220b3995f4b874d627bb20f5e1335gef9932g3dbfg77b33c409907f226cb1f9f78e" }
  ],
  "total_usd_value": "11029.50",
  "expires_in": 60
}
```

**Errors:**

- Insufficient liquidity:
  ```json
  { "error": "INSUFFICIENT_LIQUIDITY", "index": 0 }
  ```

- Spread exceeded:
  ```json
  { "error": "SPREAD_EXCEEDS_LIMIT", "index": 1 }
  ```

**Python Example:**

```python
import requests

orders = [
    { "from_token": "CC", "to_token": "CBTC", "amount": "100000" },
    { "from_token": "CC", "to_token": "CBTC", "amount": "50000" }
]

response = requests.post(
    "https://trngle.xyz/v1/multi-quote",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "orders": orders,
        "max_spread_bps": 50
    }
)

quote = response.json()
print(f"Total: ${quote['total_usd_value']}")
```

---

## Swap

### POST /swap

Execute a quoted order. Send the amount_in to the payment_address from the quote response. If the swap fails or there is a discrepancy, funds will be returned to the from_wallet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| order_id | string | Yes | Order ID from quote |
| from_wallet | string | Yes | Source wallet address |
| to_wallet | string | Yes | Destination wallet address |
| tx_hash | string | Yes | Deposit transaction hash |

**Request Body:**

```json
{
  "order_id": "ord_abc123xyz",
  "from_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12201234abcd5678ef90abcd1234567890abcdef12345678abcdef1234567890ab",
  "to_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12205678efab1234cd56ef7890123456abcdef7890abcd1234ef5678abcd9012cd",
  "tx_hash": "12207092272c8c9e7872bd43abd3ba6a217481b76640b51855ecc601fd3ff06cfad2"
}
```

**Response:**

```json
{
  "valid": true,
  "order_id": "ord_abc123xyz",
  "status": "pending",
  "message": "Order submitted"
}
```

**Errors:**

- Quote expired:
  ```json
  { "error": "QUOTE_EXPIRED", "message": "quote expired, returning funds" }
  ```

- Amount in error:
  ```json
  { "error": "AMOUNT_IN_ERROR", "message": "did not receive funds for swap, returning funds" }
  ```

- Amount out error:
  ```json
  { "error": "AMOUNT_OUT_ERROR", "message": "unable to make payment, returning funds" }
  ```

**Python Example:**

```python
import requests

response = requests.post(
    "https://trngle.xyz/v1/swap",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "order_id": "ord_abc123xyz",
        "from_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12201234abcd5678ef90abcd1234567890abcdef12345678abcdef1234567890ab",
        "to_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12205678efab1234cd56ef7890123456abcdef7890abcd1234ef5678abcd9012cd",
        "tx_hash": "12207092272c8c9e7872bd43abd3ba6a217481b76640b51855ecc601fd3ff06cfad2"
    }
)

result = response.json()
if result["valid"]:
    print(f"Status: {result['status']}")
else:
    print(f"Error: {result['error']}")
```

---

### POST /multi-swap

Execute a multi-order batch across multiple wallets. Send each amount_in to its corresponding payment_address. If any swap fails, funds will be returned to each respective from_wallet.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| order_id | string | Yes | Multi-quote order ID |
| transactions | array | Yes | Array of transaction objects with tx_hash, from_wallet, and to_wallet |

**Request Body:**

```json
{
  "order_id": "ord_multi_abc123xyz",
  "transactions": [
    {
      "tx_hash": "12207092272c8c9e7872bd43abd3ba6a217481b76640b51855ecc601fd3ff06cfad2",
      "from_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12201234abcd5678ef90abcd1234567890abcdef12345678abcdef1234567890ab",
      "to_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12205678efab1234cd56ef7890123456abcdef7890abcd1234ef5678abcd9012cd"
    },
    {
      "tx_hash": "1220abc3456def7890123456789abcdef0123456789abcdef0123456789abcdef01",
      "from_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::1220aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aa",
      "to_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::1220bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aaaa1111bb"
    }
  ]
}
```

**Response:**

```json
{
  "valid": true,
  "order_id": "ord_multi_abc123xyz",
  "status": "pending"
}
```

**Errors:**

- Quote expired:
  ```json
  { "error": "QUOTE_EXPIRED", "index": 0, "message": "quote expired, returning funds" }
  ```

- Amount in error:
  ```json
  { "error": "AMOUNT_IN_ERROR", "index": 1, "message": "did not receive funds for swap, returning funds" }
  ```

- Amount out error:
  ```json
  { "error": "AMOUNT_OUT_ERROR", "index": 2, "message": "unable to make payment, returning funds" }
  ```

**Python Example:**

```python
import requests

transactions = [
    {
        "tx_hash": "12207092272c8c9e7872bd43abd3ba6a217481b76640b51855ecc601fd3ff06cfad2",
        "from_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12201234abcd5678ef90abcd1234567890abcdef12345678abcdef1234567890ab",
        "to_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::12205678efab1234cd56ef7890123456abcdef7890abcd1234ef5678abcd9012cd"
    },
    {
        "tx_hash": "1220abc3456def7890123456789abcdef0123456789abcdef0123456789abcdef01",
        "from_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::1220aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aa",
        "to_wallet": "f057be3ea9bbfaed954f8a4399e0a2db::1220bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aaaa1111bb"
    }
]

response = requests.post(
    "https://trngle.xyz/v1/multi-swap",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "order_id": "ord_multi_abc123xyz",
        "transactions": transactions
    }
)

result = response.json()
print(f"Status: {result['status']}")
```

---

## Info

### GET /quotes

List all quotes for your API key.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| status | string | No | Filter by status (active, expired, executed) |
| limit | integer | No | Max results (default 50) |

**Response:**

```json
{
  "total": 8,
  "quotes": [
    { "order_id": "ord_abc123", "status": "active", "expires_at": 1702312405, "created_at": 1702312345 },
    { "order_id": "ord_def456", "status": "expired", "expires_at": 1702312000, "created_at": 1702311940 }
  ]
}
```

**Python Example:**

```python
import requests

response = requests.get(
    "https://trngle.xyz/v1/quotes",
    headers={
        "X-API-Key": "your_api_key"
    },
    params={
        "status": "active",
        "limit": 10
    }
)

data = response.json()
for quote in data["quotes"]:
    print(f"{quote['order_id']}: {quote['status']}")
```

---

### GET /quotes/{order_id}

Get detailed information about a specific quote.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| order_id | string | Yes | Order ID |

**Response:**

```json
{
  "order_id": "ord_abc123xyz",
  "status": "active",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "price": "1322751.32",
  "spread_bps": 15,
  "payment_address": "f057be3ea9bbfaed954f8a4399e0a2db::1220a2884e3a763c516aa19e4d0224fdf8821f2cafe66a22b398896e115ba0e8e67d",
  "expires_at": 1702312405
}
```

**Python Example:**

```python
import requests

order_id = "ord_abc123xyz"

response = requests.get(
    f"https://trngle.xyz/v1/quotes/{order_id}",
    headers={
        "X-API-Key": "your_api_key"
    }
)

quote = response.json()
print(f"Status: {quote['status']}")
print(f"Amount out: {quote['amount_out']}")
```

---

### GET /swaps

List all swaps for your API key.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| status | string | No | Filter by status (pending, processing, completed, failed) |
| limit | integer | No | Max results (default 50) |

**Response:**

```json
{
  "total": 15,
  "swaps": [
    { "order_id": "ord_abc123", "status": "completed", "created_at": 1702312345 },
    { "order_id": "ord_def456", "status": "pending", "created_at": 1702312400 }
  ]
}
```

**Python Example:**

```python
import requests

response = requests.get(
    "https://trngle.xyz/v1/swaps",
    headers={
        "X-API-Key": "your_api_key"
    },
    params={
        "status": "completed",
        "limit": 10
    }
)

data = response.json()
for swap in data["swaps"]:
    print(f"{swap['order_id']}: {swap['status']}")
```

---

### GET /swaps/{order_id}

Get detailed information about a specific swap.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| order_id | string | Yes | Order ID |

**Response:**

```json
{
  "order_id": "ord_abc123xyz",
  "status": "completed",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "tx_hash_out": "1220def456789abc0123456789abcdef0123456789abcdef0123456789abcdef01",
  "created_at": 1702312345,
  "completed_at": 1702312400
}
```

**Python Example:**

```python
import requests

order_id = "ord_abc123xyz"

response = requests.get(
    f"https://trngle.xyz/v1/swaps/{order_id}",
    headers={
        "X-API-Key": "your_api_key"
    }
)

swap = response.json()
print(f"Status: {swap['status']}")
print(f"Received: {swap['amount_out']}")
```

---

## WebSocket

### WS /ws

Connect to receive real-time order updates. The WebSocket provides push notifications for quote creation, expiry, swap lifecycle events, and refunds.

**URL:**

```
wss://trngle.xyz/v1/ws?api_key=your_key
```

**Client Commands:**

Ping (keep-alive):
```json
{ "action": "ping" }
```

Subscribe to wallet updates:
```json
{ "action": "subscribe", "wallet": "f057be3ea9bb...::1220a2884e3a..." }
```

Unsubscribe from wallet:
```json
{ "action": "unsubscribe", "wallet": "f057be3ea9bb...::1220a2884e3a..." }
```

**Server Events:**

All events include `type` and `timestamp` fields.

| Event Type | Description |
|------------|-------------|
| `connected` | Successfully authenticated |
| `pong` | Response to ping |
| `quote_created` | New quote created |
| `quote_expired` | Quote TTL expired |
| `swap_submitted` | Swap request received |
| `swap_verifying` | Verifying deposit transaction |
| `swap_verified` | Deposit confirmed |
| `swap_processing` | Sending payout |
| `swap_completed` | Payout successful |
| `swap_failed` | Swap failed (verification or payout) |
| `refund_initiated` | Refund started |
| `refund_completed` | Refund sent |

**Event Examples:**

Connected:
```json
{
  "type": "connected",
  "timestamp": 1702312345.123,
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tier": "standard",
  "message": "Connected to TRNG.le WebSocket"
}
```

Quote created:
```json
{
  "type": "quote_created",
  "timestamp": 1702312345.123,
  "order_id": "ord_abc123xyz",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "10000",
  "amount_out": "0.00803",
  "spread_bps": 5.0,
  "usd_value": "725.30",
  "payment_address": "f057be3ea9bb...",
  "expires_at": 1702312375
}
```

Quote expired:
```json
{
  "type": "quote_expired",
  "timestamp": 1702312375.123,
  "order_id": "ord_abc123xyz",
  "reason": "TTL expired"
}
```

Swap submitted:
```json
{
  "type": "swap_submitted",
  "timestamp": 1702312350.123,
  "order_id": "ord_abc123xyz",
  "tx_hash": "12207092272c8c9e...",
  "from_wallet": "f057be3ea9bb...",
  "to_wallet": "f057be3ea9bb..."
}
```

Swap verified:
```json
{
  "type": "swap_verified",
  "timestamp": 1702312355.123,
  "order_id": "ord_abc123xyz",
  "amount_received": "10000",
  "token_received": "CC"
}
```

Swap completed:
```json
{
  "type": "swap_completed",
  "timestamp": 1702312360.123,
  "order_id": "ord_abc123xyz",
  "tx_hash_out": "1220def456789abc...",
  "amount_out": "0.00803",
  "token_out": "CBTC",
  "wallet_out": "f057be3ea9bb..."
}
```

Swap failed:
```json
{
  "type": "swap_failed",
  "timestamp": 1702312360.123,
  "order_id": "ord_abc123xyz",
  "error": "VERIFICATION_FAILED",
  "message": "Amount mismatch: expected 10000, got 9000",
  "stage": "verification"
}
```

Refund initiated:
```json
{
  "type": "refund_initiated",
  "timestamp": 1702312365.123,
  "order_id": "ord_abc123xyz",
  "reason": "Quote had expired when transaction was submitted",
  "amount": "10000",
  "to_wallet": "f057be3ea9bb..."
}
```

Refund completed:
```json
{
  "type": "refund_completed",
  "timestamp": 1702312370.123,
  "order_id": "ord_abc123xyz",
  "tx_hash_out": "1220987654321fed...",
  "amount_out": "9999.5",
  "token_out": "CC",
  "wallet_out": "f057be3ea9bb..."
}
```

**Python Example:**

```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    event_type = data["type"]
    
    if event_type == "connected":
        print(f"Connected as {data['tier']} tier")
    elif event_type == "quote_created":
        print(f"Quote {data['order_id']}: {data['amount_in']} {data['from_token']} → {data['amount_out']} {data['to_token']}")
    elif event_type == "swap_verified":
        print(f"Swap {data['order_id']} verified, received {data['amount_received']} {data['token_received']}")
    elif event_type == "swap_completed":
        print(f"Swap {data['order_id']} complete! Sent {data['amount_out']} {data['token_out']} to {data['wallet_out']}")
    elif event_type == "swap_failed":
        print(f"Swap {data['order_id']} failed: {data['message']}")
    elif event_type == "refund_completed":
        print(f"Refund sent: {data['amount_out']} {data['token_out']} to {data['wallet_out']}")

def on_open(ws):
    # Optionally subscribe to specific wallet updates
    ws.send(json.dumps({
        "action": "subscribe",
        "wallet": "f057be3ea9bbfaed954f8a4399e0a2db::1220a2884e3a763c516aa19e4d0224fdf8821f2cafe66a22b398896e115ba0e8e67d"
    }))

ws = websocket.WebSocketApp(
    "wss://trngle.xyz/v1/ws?api_key=your_key",
    on_message=on_message,
    on_open=on_open
)
ws.run_forever()
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Missing or invalid parameters |
| ORDER_NOT_FOUND | 404 | Order ID not found |
| UNAUTHORIZED | 401 | Invalid or missing API key |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| /prices | 60/min |
| /quote | 60/min |
| /multi-quote | 30/min |
| /swap | 60/min |
| /multi-swap | 30/min |
| /swaps | 60/min |
| WebSocket | 100 msg/min |
