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
  "payment_address": "0x7890...",
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
    { "index": 0, "amount_out": "0.0756", "spread_bps": 15, "payment_address": "0x7890..." },
    { "index": 1, "amount_out": "0.0378", "spread_bps": 15, "payment_address": "0x7891..." }
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
  "from_wallet": "0x1234...",
  "to_wallet": "0x5678...",
  "tx_hash": "0xabcdef..."
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
        "from_wallet": "0x1234...",
        "to_wallet": "0x5678...",
        "tx_hash": "0xabcdef..."
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
      "tx_hash": "0xabcdef...",
      "from_wallet": "0x1234...",
      "to_wallet": "0x5678..."
    },
    {
      "tx_hash": "0x098765...",
      "from_wallet": "0xaaaa...",
      "to_wallet": "0xbbbb..."
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
        "tx_hash": "0xabcdef...",
        "from_wallet": "0x1234...",
        "to_wallet": "0x5678..."
    },
    {
        "tx_hash": "0x098765...",
        "from_wallet": "0xaaaa...",
        "to_wallet": "0xbbbb..."
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
  "payment_address": "0x7890...",
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
  "tx_hash_out": "0xdef456...",
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

Connect to receive real-time order updates.

**URL:**

```
wss://trngle.xyz/v1/ws?api_key=your_key
```

**Subscribe:**

```json
{ "action": "subscribe", "wallet": "0x1234..." }
```

**Events:**

Order update:
```json
{
  "type": "order_update",
  "order_id": "ord_abc123xyz",
  "status": "processing"
}
```

Order complete:
```json
{
  "type": "order_complete",
  "order_id": "ord_abc123xyz",
  "status": "completed",
  "tx_hash_out": "0xdef456..."
}
```

Order failed:
```json
{
  "type": "order_failed",
  "order_id": "ord_abc123xyz",
  "status": "failed",
  "error": "QUOTE_EXPIRED",
  "tx_hash_refund": "0x987654..."
}
```

**Python Example:**

```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    if data["type"] == "order_complete":
        print(f"Order {data['order_id']} done!")
    elif data["type"] == "order_failed":
        print(f"Order {data['order_id']} failed: {data['error']}")
        print(f"Refund tx: {data['tx_hash_refund']}")

def on_open(ws):
    ws.send(json.dumps({
        "action": "subscribe",
        "wallet": "0x1234..."
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
