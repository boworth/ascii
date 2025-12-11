"use client";

import { useState } from "react";
import { Endpoint } from "@/components/Endpoint";
import { CodeBlock } from "@/components/CodeBlock";

export default function DocsPage() {
  const [openEndpoint, setOpenEndpoint] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenEndpoint(openEndpoint === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="w-full border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/90 backdrop-blur-sm z-50">
        <div className="w-full max-w-[1400px] mx-auto px-8 py-5">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg text-[var(--fg)]">TRNG.le</span>
            <span className="text-xs text-[var(--fg-dim)] bg-[var(--bg-soft)] px-2 py-0.5 rounded">v1.0</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1400px] px-8 py-16">
        {/* Hero / Info Section */}
        <section className="mb-16">
          <h1 className="text-3xl font-semibold text-[var(--fg)] mb-4">TRNG.le API</h1>
          <p className="text-lg text-[var(--fg-muted)] mb-6 max-w-2xl">
            Proprietary RFQ system for trading digital assets on the Canton Network. 
            Get real-time quotes and execute swaps with guaranteed pricing.
          </p>
        </section>

        {/* Auth Info */}
        <section className="mb-16">
          <div className="space-y-6">
            <div>
              <span className="text-sm text-[var(--fg-dim)] uppercase tracking-wider">Base URL</span>
              <p className="font-mono text-base mt-2 text-[var(--fg)]">https://trngle.xyz/v1</p>
            </div>
            <div>
              <span className="text-sm text-[var(--fg-dim)] uppercase tracking-wider">Authentication</span>
              <p className="text-[var(--fg-muted)] mt-2 mb-3">Include your API key in the header:</p>
              <code className="text-base bg-[var(--bg-soft)] px-4 py-2 rounded border border-[var(--border)] inline-block text-[var(--fg)]">
                X-API-Key: your_api_key
              </code>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-[var(--fg)]">Endpoints</h2>

          {/* Prices */}
          <div className="mb-10">
            <h3 className="text-base font-medium text-[var(--fg-dim)] mb-5">Prices</h3>
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-soft)]">
              <Endpoint
                id="get-prices"
                method="GET"
                path="/prices"
                description="Get all prices"
                isOpen={openEndpoint === "get-prices"}
                onToggle={handleToggle}
                response={`{
  "USDxlr": "1.00",
  "CBTC": "97250.00",
  "CC": "0.07353",
  "timestamp": 1702312345.123
}`}
                pythonExample={`import requests

response = requests.get(
    "https://trngle.xyz/v1/prices",
    headers={
        "X-API-Key": "your_api_key"
    }
)

prices = response.json()
print(f"CBTC: \${prices['CBTC']}")
print(f"CC: \${prices['CC']}")`}
              />
              <Endpoint
                id="get-prices-symbol"
                method="GET"
                path="/prices/{symbol}"
                description="Get price for asset"
                isOpen={openEndpoint === "get-prices-symbol"}
                onToggle={handleToggle}
                parameters={[
                  { name: "symbol", type: "string", required: true, description: "USDxlr, CBTC, or CC" }
                ]}
                response={`{
  "symbol": "CBTC",
  "price": "97250.00",
  "timestamp": 1702312345.123
}`}
                pythonExample={`import requests

symbol = "CBTC"

response = requests.get(
    f"https://trngle.xyz/v1/prices/{symbol}",
    headers={
        "X-API-Key": "your_api_key"
    }
)

data = response.json()
print(f"{data['symbol']}: \${data['price']}")`}
              />
            </div>
          </div>

          {/* Quote */}
          <div className="mb-10">
            <h3 className="text-base font-medium text-[var(--fg-dim)] mb-5">Quote</h3>
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-soft)]">
              <Endpoint
                id="post-quote"
                method="POST"
                path="/quote"
                description="Request a quote"
                isOpen={openEndpoint === "post-quote"}
                onToggle={handleToggle}
                parameters={[
                  { name: "from_token", type: "string", required: true, description: "USDxlr, CBTC, or CC" },
                  { name: "to_token", type: "string", required: true, description: "USDxlr, CBTC, or CC" },
                  { name: "amount", type: "string", required: true, description: "Amount to sell" },
                  { name: "max_slippage_bps", type: "integer", description: "Max slippage in bps (default: 50)" }
                ]}
                requestBody={`{
  "from_token": "CC",
  "to_token": "CBTC",
  "amount": "100000",
  "max_slippage_bps": 50
}`}
                response={`{
  "order_id": "ord_abc123xyz",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "price": "1322751.32",
  "slippage_bps": 15,
  "usd_value": "7353.00",
  "payment_address": "0x7890...",
  "expires_in": 60,
  "expires_at": 1702312405
}`}
                errors={[
                  {
                    title: "Insufficient liquidity",
                    code: `{ "error": "INSUFFICIENT_LIQUIDITY" }`
                  },
                  {
                    title: "Slippage exceeded",
                    code: `{ "error": "SLIPPAGE_EXCEEDS_LIMIT" }`
                  }
                ]}
                pythonExample={`import requests

response = requests.post(
    "https://trngle.xyz/v1/quote",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "from_token": "CC",
        "to_token": "CBTC",
        "amount": "100000",
        "max_slippage_bps": 50
    }
)

quote = response.json()
print(f"Order: {quote['order_id']}")
print(f"Receive: {quote['amount_out']} CBTC")`}
              />
              <Endpoint
                id="post-multi-quote"
                method="POST"
                path="/multi-quote"
                description="Quote multiple swaps"
                isOpen={openEndpoint === "post-multi-quote"}
                onToggle={handleToggle}
                parameters={[
                  { name: "orders", type: "array", required: true, description: "Array of orders (max 10)" },
                  { name: "max_slippage_bps", type: "integer", description: "Max slippage for all" }
                ]}
                requestBody={`{
  "orders": [
    { "from_token": "CC", "to_token": "CBTC", "amount": "100000" },
    { "from_token": "USDxlr", "to_token": "CC", "amount": "5000" }
  ],
  "max_slippage_bps": 50
}`}
                response={`{
  "order_id": "ord_multi_abc123xyz",
  "orders": [
    { "index": 0, "amount_out": "0.0756", "slippage_bps": 3, "payment_address": "0x7890..." },
    { "index": 1, "amount_out": "68027.21", "slippage_bps": 5, "payment_address": "0x7891..." }
  ],
  "total_usd_value": "12353.00",
  "expires_in": 60
}`}
                errors={[
                  {
                    title: "Insufficient liquidity",
                    code: `{ "error": "INSUFFICIENT_LIQUIDITY", "index": 0 }`
                  },
                  {
                    title: "Slippage exceeded",
                    code: `{ "error": "SLIPPAGE_EXCEEDS_LIMIT", "index": 1 }`
                  }
                ]}
                pythonExample={`import requests

orders = [
    {
        "from_token": "CC",
        "to_token": "CBTC",
        "amount": "100000"
    },
    {
        "from_token": "USDxlr",
        "to_token": "CC",
        "amount": "5000"
    }
]

response = requests.post(
    "https://trngle.xyz/v1/multi-quote",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "orders": orders,
        "max_slippage_bps": 50
    }
)

quote = response.json()
print(f"Total: \${quote['total_usd_value']}")`}
              />
            </div>
          </div>

          {/* Swap */}
          <div className="mb-10">
            <h3 className="text-base font-medium text-[var(--fg-dim)] mb-5">Swap Execution</h3>
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-soft)]">
              <Endpoint
                id="post-swap"
                method="POST"
                path="/swap"
                description="Execute a quoted order"
                detailedDescription="To complete a swap, send the amount_in to the payment_address from the quote response. If funds are not received or there is a discrepancy in amount_in or amount_out, funds will be returned."
                isOpen={openEndpoint === "post-swap"}
                onToggle={handleToggle}
                parameters={[
                  { name: "order_id", type: "string", required: true, description: "Order ID from quote" },
                  { name: "wallet", type: "string", required: true, description: "Wallet address" },
                  { name: "tx_hash", type: "string", required: true, description: "Deposit transaction hash" }
                ]}
                requestBody={`{
  "order_id": "ord_abc123xyz",
  "wallet": "0x1234...",
  "tx_hash": "0xabcdef..."
}`}
                response={`{
  "valid": true,
  "order_id": "ord_abc123xyz",
  "status": "pending",
  "message": "Order submitted"
}`}
                errors={[
                  {
                    title: "Quote expired",
                    code: `{ "error": "QUOTE_EXPIRED", "message": "quote expired, returning funds" }`
                  },
                  {
                    title: "Amount in error",
                    code: `{ "error": "AMOUNT_IN_ERROR", "message": "did not receive funds for swap, returning funds" }`
                  },
                  {
                    title: "Amount out error",
                    code: `{ "error": "AMOUNT_OUT_ERROR", "message": "unable to make payment, returning funds" }`
                  }
                ]}
                pythonExample={`import requests

response = requests.post(
    "https://trngle.xyz/v1/swap",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "order_id": "ord_abc123xyz",
        "wallet": "0x1234...",
        "tx_hash": "0xabcdef..."
    }
)

result = response.json()
if result["valid"]:
    print(f"Status: {result['status']}")
else:
    print(f"Error: {result['error']}")`}
              />
              <Endpoint
                id="post-multi-swap"
                method="POST"
                path="/multi-swap"
                description="Execute multi-order batch"
                detailedDescription="Send each amount_in to its corresponding payment_address from the quote response. If any swap in the batch has a payment error, all funds will be returned and all swaps will be cancelled."
                isOpen={openEndpoint === "post-multi-swap"}
                onToggle={handleToggle}
                parameters={[
                  { name: "order_id", type: "string", required: true, description: "Multi-quote order ID" },
                  { name: "wallet", type: "string", required: true, description: "Wallet address" },
                  { name: "tx_hashes", type: "array", required: true, description: "Transaction hashes in order" }
                ]}
                requestBody={`{
  "order_id": "ord_multi_abc123xyz",
  "wallet": "0x1234...",
  "tx_hashes": [
    "0xabcdef...",
    "0x098765..."
  ]
}`}
                response={`{
  "valid": true,
  "order_id": "ord_multi_abc123xyz",
  "status": "pending"
}`}
                errors={[
                  {
                    title: "Quote expired",
                    code: `{ "error": "QUOTE_EXPIRED", "index": 0, "message": "quote expired, returning funds" }`
                  },
                  {
                    title: "Amount in error",
                    code: `{ "error": "AMOUNT_IN_ERROR", "index": 1, "message": "did not receive funds for swap, returning funds" }`
                  },
                  {
                    title: "Amount out error",
                    code: `{ "error": "AMOUNT_OUT_ERROR", "index": 2, "message": "unable to make payment, returning funds" }`
                  }
                ]}
                pythonExample={`import requests

tx_hashes = [
    "0xabcdef...",
    "0x098765..."
]

response = requests.post(
    "https://trngle.xyz/v1/multi-swap",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "order_id": "ord_multi_abc123xyz",
        "wallet": "0x1234...",
        "tx_hashes": tx_hashes
    }
)

result = response.json()
print(f"Status: {result['status']}")`}
              />
            </div>
          </div>

          {/* Orders */}
          <div className="mb-10">
            <h3 className="text-base font-medium text-[var(--fg-dim)] mb-5">Orders</h3>
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-soft)]">
              <Endpoint
                id="get-orders"
                method="GET"
                path="/orders"
                description="List orders for wallet"
                isOpen={openEndpoint === "get-orders"}
                onToggle={handleToggle}
                parameters={[
                  { name: "wallet", type: "string", required: true, description: "Wallet address" },
                  { name: "status", type: "string", description: "Filter by status" },
                  { name: "limit", type: "integer", description: "Max results (default 50)" }
                ]}
                response={`{
  "wallet": "0x1234...",
  "total": 15,
  "orders": [
    { "order_id": "ord_abc123", "status": "completed" },
    { "order_id": "ord_def456", "status": "pending" }
  ]
}`}
                pythonExample={`import requests

response = requests.get(
    "https://trngle.xyz/v1/orders",
    headers={
        "X-API-Key": "your_api_key"
    },
    params={
        "wallet": "0x1234...",
        "status": "completed",
        "limit": 10
    }
)

data = response.json()
for order in data["orders"]:
    print(f"{order['order_id']}: {order['status']}")`}
              />
              <Endpoint
                id="get-order-details"
                method="GET"
                path="/orders/{order_id}"
                description="Get order details"
                isOpen={openEndpoint === "get-order-details"}
                onToggle={handleToggle}
                parameters={[
                  { name: "order_id", type: "string", required: true, description: "Order ID" },
                  { name: "wallet", type: "string", required: true, description: "Wallet address" }
                ]}
                response={`{
  "order_id": "ord_abc123xyz",
  "status": "completed",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "tx_hash_out": "0xdef456..."
}`}
                pythonExample={`import requests

order_id = "ord_abc123xyz"

response = requests.get(
    f"https://trngle.xyz/v1/orders/{order_id}",
    headers={
        "X-API-Key": "your_api_key"
    },
    params={
        "wallet": "0x1234..."
    }
)

order = response.json()
print(f"Status: {order['status']}")
print(f"Received: {order['amount_out']}")`}
              />
            </div>
          </div>
        </section>

        {/* WebSocket */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-[var(--fg)]">WebSocket</h2>
          
          <div className="space-y-8">
            <div>
              <span className="text-sm text-[var(--fg-dim)] uppercase tracking-wider">URL</span>
              <p className="font-mono text-base mt-2 text-[var(--fg)]">wss://trngle.xyz/v1/ws?api_key=your_key</p>
            </div>

            <div className="flex gap-20">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-[var(--fg-muted)] mb-4">Subscribe</h3>
                  <CodeBlock code={`{ "action": "subscribe", "wallet": "0x1234..." }`} language="json" />
                </div>

                <div>
                  <h3 className="text-base font-medium text-[var(--fg-muted)] mb-4">Events</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-[var(--fg-dim)] mb-3">Order update</p>
                      <CodeBlock code={`{
  "type": "order_update",
  "order_id": "ord_abc123xyz",
  "status": "processing"
}`} language="json" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--fg-dim)] mb-3">Order complete</p>
                      <CodeBlock code={`{
  "type": "order_complete",
  "order_id": "ord_abc123xyz",
  "status": "completed",
  "tx_hash_out": "0xdef456..."
}`} language="json" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-[520px] flex-shrink-0">
                <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                  </svg>
                  Python
                </h3>
                <CodeBlock code={`import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    if data["type"] == "order_complete":
        print(f"Order {data['order_id']} done!")

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
ws.run_forever()`} language="python" />
              </div>
            </div>
          </div>
        </section>

        {/* Errors */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-[var(--fg)]">Errors</h2>
          
          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-soft)]">
                  <th className="text-left p-4 font-medium text-[var(--fg-muted)]">Code</th>
                  <th className="text-left p-4 font-medium text-[var(--fg-muted)]">Status</th>
                  <th className="text-left p-4 font-medium text-[var(--fg-muted)]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {[
                  { code: "INVALID_REQUEST", status: "400", desc: "Missing or invalid parameters" },
                  { code: "ORDER_NOT_FOUND", status: "404", desc: "Order ID not found" },
                  { code: "UNAUTHORIZED", status: "401", desc: "Invalid or missing API key" },
                  { code: "RATE_LIMITED", status: "429", desc: "Too many requests" },
                  { code: "INTERNAL_ERROR", status: "500", desc: "Server error" },
                ].map((item) => (
                  <tr key={item.code}>
                    <td className="p-4 font-mono text-sm text-[var(--red)]">{item.code}</td>
                    <td className="p-4 text-[var(--fg-dim)]">{item.status}</td>
                    <td className="p-4 text-[var(--fg-muted)]">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10">
            <h3 className="text-base font-medium text-[var(--fg-dim)] mb-5">Rate Limits</h3>
            <div className="grid grid-cols-3 gap-x-12 gap-y-3">
              {[
                { endpoint: "/prices", limit: "60/min" },
                { endpoint: "/quote", limit: "60/min" },
                { endpoint: "/multi-quote", limit: "30/min" },
                { endpoint: "/swap", limit: "60/min" },
                { endpoint: "/multi-swap", limit: "30/min" },
                { endpoint: "/orders", limit: "60/min" },
                { endpoint: "WebSocket", limit: "100 msg/min" },
              ].map((item) => (
                <div key={item.endpoint} className="flex justify-between py-3 border-b border-[var(--border)]">
                  <code className="text-[var(--fg-muted)]">{item.endpoint}</code>
                  <span className="text-[var(--fg-dim)]">{item.limit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] pt-10 text-center text-[var(--fg-dim)]">
          TRNG.le v1.0
        </footer>
      </main>
    </div>
  );
}
