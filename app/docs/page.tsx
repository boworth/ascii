"use client"

import { useState, type MouseEvent, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeProvider, useTheme } from "../wallet/ThemeContext"
import { CodeBlock } from "./components/CodeBlock"

// Contact Modal Component
function ContactModal({ 
  isOpen, 
  onClose, 
  theme 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  theme: 'dark' | 'light';
}) {
  const [accountType, setAccountType] = useState<'company' | 'individual'>('company')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [info, setInfo] = useState('')
  const [telegram, setTelegram] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate submission - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Reset after showing success
    setTimeout(() => {
      setSubmitted(false)
      onClose()
      setEmail('')
      setCompanyName('')
      setFirstName('')
      setLastName('')
      setInfo('')
      setTelegram('')
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-md mx-4 rounded-xl border shadow-2xl ${
          theme === 'dark' 
            ? 'bg-zinc-900 border-zinc-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h3 className={`text-xl font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Request API Access
          </h3>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Request submitted! We'll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Toggle */}
              <div className="flex gap-2 p-1 rounded-lg bg-[var(--bg-soft)]">
                <button
                  type="button"
                  onClick={() => setAccountType('company')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    accountType === 'company'
                      ? theme === 'dark' 
                        ? 'bg-zinc-700 text-white' 
                        : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-zinc-200'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Company
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    accountType === 'individual'
                      ? theme === 'dark' 
                        ? 'bg-zinc-700 text-white' 
                        : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-zinc-200'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Individual
                </button>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                }`}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-zinc-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500'
                  } outline-none`}
                  placeholder="you@example.com"
                />
              </div>

              {/* Company Name or Individual Names */}
              {accountType === 'company' ? (
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}>
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-zinc-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500'
                    } outline-none`}
                    placeholder="Acme Inc."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}>
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-zinc-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500'
                      } outline-none`}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}>
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-zinc-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500'
                      } outline-none`}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              {/* Info */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                }`}>
                  Tell us about your use case <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-zinc-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500'
                  } outline-none`}
                  placeholder="What are you building? How will you use the API?"
                />
              </div>

              {/* Telegram (Optional) */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                }`}>
                  Telegram <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-zinc-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500'
                  } outline-none`}
                  placeholder="@username"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-600 disabled:text-zinc-400'
                    : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Navigation items structure
const navItems = [
  {
    category: "Overview",
    items: [
      { id: "info", method: "INFO", path: "", label: "Getting Started" },
    ]
  },
  {
    category: "Prices",
    items: [
      { id: "get-prices", method: "GET", path: "/prices", label: "Get all prices" },
      { id: "get-prices-symbol", method: "GET", path: "/prices/{symbol}", label: "Get price for asset" },
    ]
  },
  {
    category: "Quote",
    items: [
      { id: "post-quote", method: "POST", path: "/quote", label: "Request a quote" },
      { id: "post-multi-quote", method: "POST", path: "/multi-quote", label: "Quote multiple swaps" },
    ]
  },
  {
    category: "Swap",
    items: [
      { id: "post-swap", method: "POST", path: "/swap", label: "Execute quote" },
      { id: "post-multi-swap", method: "POST", path: "/multi-swap", label: "Execute multi-quote" },
    ]
  },
  {
    category: "Info",
    items: [
      { id: "get-quotes", method: "GET", path: "/quotes", label: "List quotes" },
      { id: "get-quote-details", method: "GET", path: "/quotes/{quote_id}", label: "Get quote details" },
      { id: "get-swaps", method: "GET", path: "/swaps", label: "List swaps" },
      { id: "get-swap-details", method: "GET", path: "/swaps/{order_id}", label: "Get swap details" },
    ]
  },
  {
    category: "WebSocket",
    items: [
      { id: "websocket", method: "WS", path: "/ws", label: "Real-time updates" },
    ]
  },
  {
    category: "Reference",
    items: [
      { id: "errors", method: "REF", path: "", label: "Error codes" },
      { id: "rate-limits", method: "REF", path: "", label: "Rate limits" },
    ]
  },
]

// Endpoint data
const endpointData: Record<string, {
  description?: string;
  parameters?: { name: string; type: string; required?: boolean; description: string }[];
  requestBody?: string;
  response?: string;
  errors?: { title: string; code: string }[];
  pythonExample?: string;
}> = {
  "get-prices": {
    description: "Returns current mid prices for all supported assets.",
    response: `{
  "CBTC": "97250.00",
  "CC": "0.07353",
  "timestamp": 1702312345.123
}`,
    pythonExample: `import requests

response = requests.get(
    "https://trngle.xyz/v1/prices",
    headers={
        "X-API-Key": "your_api_key"
    }
)

prices = response.json()
print(f"CBTC: \${prices['CBTC']}")
print(f"CC: \${prices['CC']}")`
  },
  "get-prices-symbol": {
    description: "Returns the current mid price for a specific asset.",
    parameters: [
      { name: "symbol", type: "string", required: true, description: "CBTC or CC" }
    ],
    response: `{
  "symbol": "CBTC",
  "price": "97250.00",
  "timestamp": 1702312345.123
}`,
    pythonExample: `import requests

symbol = "CBTC"

response = requests.get(
    f"https://trngle.xyz/v1/prices/{symbol}",
    headers={
        "X-API-Key": "your_api_key"
    }
)

data = response.json()
print(f"{data['symbol']}: \${data['price']}")`
  },
  "post-quote": {
    description: "Request a quote for swapping one token for another. Quotes are valid for 60 seconds.",
    parameters: [
      { name: "from_token", type: "string", required: true, description: "CBTC or CC" },
      { name: "to_token", type: "string", required: true, description: "CBTC or CC" },
      { name: "amount", type: "string", required: true, description: "Amount to sell" },
      { name: "max_spread_bps", type: "integer", description: "Max spread in bps (default: 50)" }
    ],
    requestBody: `{
  "from_token": "CC",
  "to_token": "CBTC",
  "amount": "100000",
  "max_spread_bps": 50
}`,
    response: `{
  "order_id": "ord_abc123xyz",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "price": "1322751.32",
  "spread_bps": 15,
  "usd_value": "7353.00",
  "payment_address": "f057be3ea9bb...",
  "expires_in": 60,
  "expires_at": 1702312405
}`,
    errors: [
      { title: "Insufficient liquidity", code: `{ "error": "INSUFFICIENT_LIQUIDITY" }` },
      { title: "Spread exceeded", code: `{ "error": "SPREAD_EXCEEDS_LIMIT" }` }
    ],
    pythonExample: `import requests

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
print(f"Receive: {quote['amount_out']} CBTC")`
  },
  "post-multi-quote": {
    description: "Request quotes for multiple swaps in a single request. Maximum 10 orders per request.",
    parameters: [
      { name: "orders", type: "array", required: true, description: "Array of orders (max 10)" },
      { name: "max_spread_bps", type: "integer", description: "Max spread in bps (default: 50)" }
    ],
    requestBody: `{
  "orders": [
    { "from_token": "CC", "to_token": "CBTC", "amount": "100000" },
    { "from_token": "CC", "to_token": "CBTC", "amount": "50000" }
  ],
  "max_spread_bps": 50
}`,
    response: `{
  "order_id": "ord_multi_abc123xyz",
  "orders": [
    { "index": 0, "amount_out": "0.0756", "spread_bps": 15, "payment_address": "f057be3ea9bb..." },
    { "index": 1, "amount_out": "0.0378", "spread_bps": 15, "payment_address": "f057be3ea9bb..." }
  ],
  "total_usd_value": "11029.50",
  "expires_in": 60
}`,
    errors: [
      { title: "Insufficient liquidity", code: `{ "error": "INSUFFICIENT_LIQUIDITY", "index": 0 }` },
      { title: "Spread exceeded", code: `{ "error": "SPREAD_EXCEEDS_LIMIT", "index": 1 }` }
    ],
    pythonExample: `import requests

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
print(f"Total: \${quote['total_usd_value']}")`
  },
  "post-swap": {
    description: "Execute a quoted order. Send the amount_in to the payment_address from the quote response. If the swap fails or there is a discrepancy, funds will be returned to the from_wallet.",
    parameters: [
      { name: "order_id", type: "string", required: true, description: "Order ID from quote" },
      { name: "from_wallet", type: "string", required: true, description: "Source wallet address" },
      { name: "to_wallet", type: "string", required: true, description: "Destination wallet address" },
      { name: "tx_hash", type: "string", required: true, description: "Deposit transaction hash" }
    ],
    requestBody: `{
  "order_id": "ord_abc123xyz",
  "from_wallet": "f057be3ea9bb...",
  "to_wallet": "f057be3ea9bb...",
  "tx_hash": "12207092272c8c9e7872..."
}`,
    response: `{
  "valid": true,
  "order_id": "ord_abc123xyz",
  "status": "pending",
  "message": "Order submitted"
}`,
    errors: [
      { title: "Quote expired", code: `{ "error": "QUOTE_EXPIRED", "message": "quote expired, returning funds" }` },
      { title: "Amount in error", code: `{ "error": "AMOUNT_IN_ERROR", "message": "did not receive funds for swap, returning funds" }` },
      { title: "Amount out error", code: `{ "error": "AMOUNT_OUT_ERROR", "message": "unable to make payment, returning funds" }` }
    ],
    pythonExample: `import requests

response = requests.post(
    "https://trngle.xyz/v1/swap",
    headers={
        "X-API-Key": "your_api_key"
    },
    json={
        "order_id": "ord_abc123xyz",
        "from_wallet": "f057be3ea9bb...",
        "to_wallet": "f057be3ea9bb...",
        "tx_hash": "12207092272c8c9e7872..."
    }
)

result = response.json()
if result["valid"]:
    print(f"Status: {result['status']}")
else:
    print(f"Error: {result['error']}")`
  },
  "post-multi-swap": {
    description: "Execute a multi-order batch across multiple wallets. Send each amount_in to its corresponding payment_address. If any swap fails, funds will be returned to each respective from_wallet.",
    parameters: [
      { name: "order_id", type: "string", required: true, description: "Multi-quote order ID" },
      { name: "transactions", type: "array", required: true, description: "Array of transaction objects with tx_hash, from_wallet, and to_wallet" }
    ],
    requestBody: `{
  "order_id": "ord_multi_abc123xyz",
  "transactions": [
    {
      "tx_hash": "12207092272c8c9e...",
      "from_wallet": "f057be3ea9bb...",
      "to_wallet": "f057be3ea9bb..."
    },
    {
      "tx_hash": "1220abc3456def78...",
      "from_wallet": "f057be3ea9bb...",
      "to_wallet": "f057be3ea9bb..."
    }
  ]
}`,
    response: `{
  "valid": true,
  "order_id": "ord_multi_abc123xyz",
  "status": "pending"
}`,
    errors: [
      { title: "Quote expired", code: `{ "error": "QUOTE_EXPIRED", "index": 0, "message": "quote expired, returning funds" }` },
      { title: "Amount in error", code: `{ "error": "AMOUNT_IN_ERROR", "index": 1, "message": "did not receive funds for swap, returning funds" }` },
      { title: "Amount out error", code: `{ "error": "AMOUNT_OUT_ERROR", "index": 2, "message": "unable to make payment, returning funds" }` }
    ],
    pythonExample: `import requests

transactions = [
    {
        "tx_hash": "12207092272c8c9e...",
        "from_wallet": "f057be3ea9bb...",
        "to_wallet": "f057be3ea9bb..."
    },
    {
        "tx_hash": "1220abc3456def78...",
        "from_wallet": "f057be3ea9bb...",
        "to_wallet": "f057be3ea9bb..."
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
print(f"Status: {result['status']}")`
  },
  "get-quotes": {
    description: "List all quotes for your API key.",
    parameters: [
      { name: "status", type: "string", description: "Filter by status (active, expired, executed)" },
      { name: "limit", type: "integer", description: "Max results (default 50)" }
    ],
    response: `{
  "total": 8,
  "quotes": [
    { "order_id": "ord_abc123", "status": "active", "expires_at": 1702312405, "created_at": 1702312345 },
    { "order_id": "ord_def456", "status": "expired", "expires_at": 1702312000, "created_at": 1702311940 }
  ]
}`,
    pythonExample: `import requests

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
    print(f"{quote['order_id']}: {quote['status']}")`
  },
  "get-quote-details": {
    description: "Get detailed information about a specific quote.",
    parameters: [
      { name: "order_id", type: "string", required: true, description: "Order ID" }
    ],
    response: `{
  "order_id": "ord_abc123xyz",
  "status": "active",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "price": "1322751.32",
  "spread_bps": 15,
  "payment_address": "f057be3ea9bb...",
  "expires_at": 1702312405
}`,
    pythonExample: `import requests

order_id = "ord_abc123xyz"

response = requests.get(
    f"https://trngle.xyz/v1/quotes/{order_id}",
    headers={
        "X-API-Key": "your_api_key"
    }
)

quote = response.json()
print(f"Status: {quote['status']}")
print(f"Amount out: {quote['amount_out']}")`
  },
  "get-swaps": {
    description: "List all swaps for your API key.",
    parameters: [
      { name: "status", type: "string", description: "Filter by status (pending, processing, completed, failed)" },
      { name: "limit", type: "integer", description: "Max results (default 50)" }
    ],
    response: `{
  "total": 15,
  "swaps": [
    { "order_id": "ord_abc123", "status": "completed", "created_at": 1702312345 },
    { "order_id": "ord_def456", "status": "pending", "created_at": 1702312400 }
  ]
}`,
    pythonExample: `import requests

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
    print(f"{swap['order_id']}: {swap['status']}")`
  },
  "get-swap-details": {
    description: "Get detailed information about a specific swap.",
    parameters: [
      { name: "order_id", type: "string", required: true, description: "Order ID" }
    ],
    response: `{
  "order_id": "ord_abc123xyz",
  "status": "completed",
  "from_token": "CC",
  "to_token": "CBTC",
  "amount_in": "100000",
  "amount_out": "0.0756",
  "tx_hash_out": "1220def456789abc...",
  "created_at": 1702312345,
  "completed_at": 1702312400
}`,
    pythonExample: `import requests

order_id = "ord_abc123xyz"

response = requests.get(
    f"https://trngle.xyz/v1/swaps/{order_id}",
    headers={
        "X-API-Key": "your_api_key"
    }
)

swap = response.json()
print(f"Status: {swap['status']}")
print(f"Received: {swap['amount_out']}")`
  },
}

const methodColors: Record<string, string> = {
  GET: "text-[var(--green)]",
  POST: "text-[var(--blue)]",
  PUT: "text-[var(--yellow)]",
  DELETE: "text-[var(--red)]",
  WS: "text-[var(--purple)]",
  REF: "text-[var(--fg-dim)]",
  INFO: "text-[var(--aqua)]",
}

// WebSocket event data with example payloads
const wsEvents = [
  { 
    event: "connected", 
    desc: "Successfully authenticated",
    example: `{
  "type": "connected",
  "timestamp": 1702312345.123,
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tier": "standard",
  "message": "Connected to TRNG.le WebSocket"
}`
  },
  { 
    event: "pong", 
    desc: "Response to ping",
    example: `{
  "type": "pong",
  "timestamp": 1702312345.123
}`
  },
  { 
    event: "quote_created", 
    desc: "New quote created",
    example: `{
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
}`
  },
  { 
    event: "quote_expired", 
    desc: "Quote TTL expired",
    example: `{
  "type": "quote_expired",
  "timestamp": 1702312375.123,
  "order_id": "ord_abc123xyz",
  "reason": "TTL expired"
}`
  },
  { 
    event: "swap_submitted", 
    desc: "Swap request received",
    example: `{
  "type": "swap_submitted",
  "timestamp": 1702312350.123,
  "order_id": "ord_abc123xyz",
  "tx_hash": "12207092272c8c9e...",
  "from_wallet": "f057be3ea9bb...",
  "to_wallet": "f057be3ea9bb..."
}`
  },
  { 
    event: "swap_verifying", 
    desc: "Verifying deposit",
    example: `{
  "type": "swap_verifying",
  "timestamp": 1702312352.123,
  "order_id": "ord_abc123xyz",
  "status": "PENDING_VERIFICATION"
}`
  },
  { 
    event: "swap_verified", 
    desc: "Deposit confirmed",
    example: `{
  "type": "swap_verified",
  "timestamp": 1702312355.123,
  "order_id": "ord_abc123xyz",
  "amount_received": "10000",
  "token_received": "CC"
}`
  },
  { 
    event: "swap_completed", 
    desc: "Payout successful",
    example: `{
  "type": "swap_completed",
  "timestamp": 1702312360.123,
  "order_id": "ord_abc123xyz",
  "tx_hash_out": "1220def456789abc...",
  "amount_out": "0.00803",
  "token_out": "CBTC",
  "wallet_out": "f057be3ea9bb..."
}`
  },
  { 
    event: "swap_failed", 
    desc: "Swap failed",
    example: `{
  "type": "swap_failed",
  "timestamp": 1702312360.123,
  "order_id": "ord_abc123xyz",
  "error": "VERIFICATION_FAILED",
  "message": "Amount mismatch: expected 10000, got 9000",
  "stage": "verification"
}`
  },
  { 
    event: "refund_initiated", 
    desc: "Refund started",
    example: `{
  "type": "refund_initiated",
  "timestamp": 1702312365.123,
  "order_id": "ord_abc123xyz",
  "reason": "Quote had expired when transaction was submitted",
  "amount": "10000",
  "to_wallet": "f057be3ea9bb..."
}`
  },
  { 
    event: "refund_completed", 
    desc: "Refund sent",
    example: `{
  "type": "refund_completed",
  "timestamp": 1702312370.123,
  "order_id": "ord_abc123xyz",
  "tx_hash_out": "1220987654321fed...",
  "amount_out": "9999.5",
  "token_out": "CC",
  "wallet_out": "f057be3ea9bb..."
}`
  },
]

function DocsPageContent() {
  const { theme, toggleTheme } = useTheme()
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 })
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const toggleEventExpanded = (event: string) => {
    setExpandedEvents((prev: Set<string>) => {
      // If clicking the same one, close it
      if (prev.has(event)) {
        return new Set()
      }
      // Otherwise, close all others and open this one
      return new Set([event])
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    setCursorPosition({ x, y })
  }

  const getGradientColors = () => {
    const { x, y } = cursorPosition
    const layer1 = {
      r: Math.round(255 + (30 - 255) * x),
      g: Math.round(85 + (220 - 85) * x),
      b: Math.round(30 + (255 - 30) * x)
    }
    const layer2 = {
      r: Math.round(255),
      g: Math.round(50 + (245 - 50) * y),
      b: Math.round(180 + (50 - 180) * y)
    }
    const diag = (x + y) / 2
    const layer3 = {
      r: Math.round(150 + (50 - 150) * diag),
      g: Math.round(255 + (130 - 255) * diag),
      b: Math.round(50 + (255 - 50) * diag)
    }
    return {
      layer1: `rgb(${layer1.r}, ${layer1.g}, ${layer1.b})`,
      layer2: `rgb(${layer2.r}, ${layer2.g}, ${layer2.b})`,
      layer3: `rgb(${layer3.r}, ${layer3.g}, ${layer3.b})`
    }
  }

  const getSelectedItem = () => {
    for (const category of navItems) {
      const item = category.items.find(i => i.id === selectedEndpoint)
      if (item) return item
    }
    return null
  }

  const selectedItem = getSelectedItem()
  const selectedData = selectedEndpoint ? endpointData[selectedEndpoint] : null

  return (
    <main 
      className={`theme-transition relative h-screen flex flex-col select-none overflow-hidden p-12 ${
        theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100'
      }`}
      onMouseMove={handleMouseMove}
      style={{
        '--bg': theme === 'dark' ? '#18181b' : '#f8f8f8',
        '--bg-soft': theme === 'dark' ? '#1f1f23' : '#f0f0f0',
        '--bg-hard': theme === 'dark' ? '#111113' : '#ffffff',
        '--border': theme === 'dark' ? '#2e2e32' : '#e0e0e0',
        '--fg': theme === 'dark' ? '#e4e4e7' : '#24292e',
        '--fg-muted': theme === 'dark' ? '#a1a1aa' : '#586069',
        '--fg-dim': theme === 'dark' ? '#71717a' : '#6a737d',
        '--red': theme === 'dark' ? '#fb4934' : '#d73a49',
        '--green': theme === 'dark' ? '#b8bb26' : '#22863a',
        '--yellow': theme === 'dark' ? '#fabd2f' : '#b08800',
        '--blue': theme === 'dark' ? '#83a598' : '#0366d6',
        '--purple': theme === 'dark' ? '#d3869b' : '#6f42c1',
        '--aqua': theme === 'dark' ? '#8ec07c' : '#22863a',
        '--orange': theme === 'dark' ? '#fe8019' : '#e36209',
        transition: 'background-color 0.5s ease',
      } as React.CSSProperties}
    >
      {/* Main Floating Card Container with Glow */}
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Dynamic Gradient Glow */}
        <div 
          className="absolute -inset-8 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle 1000px at ${cursorPosition.x * 100}% ${cursorPosition.y * 100}%, ${getGradientColors().layer1.replace('rgb(', 'rgba(').replace(')', ', 0.5)')}, ${getGradientColors().layer2.replace('rgb(', 'rgba(').replace(')', ', 0.3)')}, ${getGradientColors().layer3.replace('rgb(', 'rgba(').replace(')', ', 0.15)')}, transparent 75%)`,
            zIndex: 0
          }}
        />
        <div 
          className="absolute -inset-4 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle 600px at ${cursorPosition.x * 100}% ${cursorPosition.y * 100}%, ${getGradientColors().layer1.replace('rgb(', 'rgba(').replace(')', ', 0.8)')}, ${getGradientColors().layer2.replace('rgb(', 'rgba(').replace(')', ', 0.6)')}, ${getGradientColors().layer3.replace('rgb(', 'rgba(').replace(')', ', 0.3)')}, transparent 65%)`,
            filter: 'blur(20px)',
            zIndex: 0
          }}
        />
        
        {/* Main Card */}
        <div 
          className={`relative flex-1 flex rounded-3xl border-2 shadow-2xl backdrop-blur-sm overflow-hidden z-10 min-h-0 ${
            theme === 'dark' 
              ? 'bg-[#1a1a1a] border-[#3a3a3a]' 
              : 'bg-white border-gray-300'
          }`}
          style={{
            boxShadow: theme === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            transition: 'background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease',
          }}
        >
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`fixed bottom-20 right-20 z-50 p-4 rounded-full transition-all duration-300 shadow-lg ${
              theme === 'dark' 
                ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          {/* Left Sidebar - Navigation */}
          <div className={`w-80 flex-shrink-0 border-r overflow-y-auto ${
            theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200'
          }`}>
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className={`text-5xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>TRNG.le</h1>
                <div className="flex items-baseline gap-2 mt-1 ml-1">
                  <span className={`text-2xl font-bold transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>API</span>
                  <span className={`text-xl font-normal transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`} style={{ fontFamily: 'var(--font-roboto-mono), "Roboto Mono", monospace' }}>v1.0</span>
                </div>
              </div>

              {/* Base URL */}
              <div className="mb-8">
                <span className="text-xs text-[var(--fg-dim)] uppercase tracking-wider">Base URL</span>
                <p className="font-mono text-sm mt-1 text-[var(--fg-muted)]">https://trngle.xyz/v1</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-6">
                {navItems.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-xs font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedEndpoint(selectedEndpoint === item.id ? null : item.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                            selectedEndpoint === item.id
                              ? theme === 'dark'
                                ? 'bg-[#2a2a2a] text-white'
                                : 'bg-gray-100 text-black'
                              : theme === 'dark'
                                ? 'hover:bg-[#242424] text-[var(--fg-muted)]'
                                : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span className={`font-mono text-xs font-medium w-10 ${methodColors[item.method]}`}>
                            {item.method}
                          </span>
                          <span className="text-sm truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 relative overflow-hidden min-h-0">
            <AnimatePresence mode="wait">
              {(!selectedEndpoint || selectedEndpoint === 'info') ? (
                /* Welcome/Auth Info */
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex items-center justify-center p-12"
                >
                  <div className="max-w-xl text-center">
                    <h2 className="text-3xl font-semibold text-[var(--fg)] mb-4">TRNG.le API</h2>
                    <p className="text-lg text-[var(--fg-muted)] mb-8">
                      Proprietary RFQ system for trading digital assets on the Canton Network. 
                      Get real-time quotes and execute swaps with guaranteed pricing.
                    </p>
                    <div className="text-center bg-[var(--bg-soft)] rounded-lg p-6 border border-[var(--border)] mb-6">
                      <span className="text-sm text-[var(--fg-dim)] uppercase tracking-wider">Authentication</span>
                      <p className="text-[var(--fg-muted)] mt-2 mb-3"></p>
                      <code className="text-sm bg-[var(--bg-hard)] px-4 py-2 rounded border border-[var(--border)] inline-block text-[var(--fg)] font-mono">
                        X-API-Key: your_api_key
                      </code>
                    </div>

                    {/* Contact section */}
                    <div className="text-center">
                      <p className="text-[var(--fg-muted)] mb-4">
                        To get an API key, please reach out to us.
                      </p>
                      <button
                        onClick={() => setShowContactModal(true)}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                          theme === 'dark'
                            ? 'bg-white text-black hover:bg-zinc-200'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        Contact Us
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : selectedEndpoint === 'websocket' ? (
                /* WebSocket Content */
                <motion.div
                  key="websocket"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full overflow-y-auto p-12"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`font-mono text-sm font-medium px-2 py-1 rounded ${methodColors['WS']} bg-[var(--bg-soft)]`}>
                        WS
                      </span>
                      <code className="text-xl text-[var(--fg)]">/ws</code>
                    </div>
                    <p className="text-[var(--fg-muted)] mb-8">
                      Connect to receive real-time order updates. Get push notifications for quote creation, expiry, swap lifecycle events, and refunds.
                    </p>

                    {/* URL - Full Width */}
                    <div className="mb-8">
                      <span className="text-sm text-[var(--fg-dim)] uppercase tracking-wider">URL</span>
                      <p className="font-mono text-base mt-2 text-[var(--fg)]">wss://trngle.xyz/v1/ws?api_key=your_key</p>
                    </div>

                    {/* Two Column Layout */}
                    <div className="flex gap-8">
                      {/* Left Column - Commands & Events */}
                      <div className="flex-1 min-w-0 space-y-8">
                        <div>
                          <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4">Client Commands</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-[var(--fg-dim)] mb-2">Ping (keep-alive)</p>
                              <CodeBlock theme={theme} code={`{ "action": "ping" }`} language="json" />
                            </div>
                            <div>
                              <p className="text-sm text-[var(--fg-dim)] mb-2">Subscribe to wallet</p>
                              <CodeBlock theme={theme} code={`{ "action": "subscribe", "wallet": "f057be3ea9bb..." }`} language="json" />
                            </div>
                            <div>
                              <p className="text-sm text-[var(--fg-dim)] mb-2">Unsubscribe</p>
                              <CodeBlock theme={theme} code={`{ "action": "unsubscribe", "wallet": "f057be3ea9bb..." }`} language="json" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4">Server Events</h3>
                          <p className="text-sm text-[var(--fg-muted)] mb-4">Click on an event to see its response structure.</p>
                          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                            {wsEvents.map((item, idx) => (
                              <div key={item.event}>
                                <button
                                  onClick={() => toggleEventExpanded(item.event)}
                                  className={`w-full flex items-center justify-between p-3 text-left hover:bg-[var(--bg-soft)] transition-colors ${
                                    idx > 0 ? 'border-t border-[var(--border)]' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <code className="font-mono text-sm text-[var(--aqua)]">{item.event}</code>
                                    <span className="text-sm text-[var(--fg-muted)]">{item.desc}</span>
                                  </div>
                                  <svg 
                                    className={`w-4 h-4 text-[var(--fg-dim)] transition-transform duration-200 ${
                                      expandedEvents.has(item.event) ? 'rotate-180' : ''
                                    }`}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <AnimatePresence>
                                  {expandedEvents.has(item.event) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden border-t border-[var(--border)]"
                                    >
                                      <div className="p-3">
                                        <CodeBlock theme={theme} code={item.example} language="json" />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Python Example */}
                      <div className="w-[650px] flex-shrink-0">
                        <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                          </svg>
                          Python
                        </h3>
                        <CodeBlock theme={theme} code={`import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    event_type = data["type"]
    
    if event_type == "connected":
        print(f"Connected as {data['tier']} tier")
    elif event_type == "quote_created":
        print(f"Quote {data['order_id']}: "
              f"{data['amount_in']} {data['from_token']} → "
              f"{data['amount_out']} {data['to_token']}")
    elif event_type == "swap_verified":
        print(f"Swap {data['order_id']} verified: "
              f"received {data['amount_received']} "
              f"{data['token_received']}")
    elif event_type == "swap_completed":
        print(f"Swap {data['order_id']} complete!")
        print(f"Sent {data['amount_out']} {data['token_out']} "
              f"to {data['wallet_out']}")
    elif event_type == "swap_failed":
        print(f"Swap {data['order_id']} failed: "
              f"{data['message']}")
    elif event_type == "refund_completed":
        print(f"Refund complete for {data['order_id']}")
        print(f"Sent {data['amount_out']} {data['token_out']} "
              f"to {data['wallet_out']}")

def on_open(ws):
    # Optionally subscribe to wallet updates
    ws.send(json.dumps({
        "action": "subscribe",
        "wallet": "f057be3ea9bb..."
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
                </motion.div>
              ) : selectedEndpoint === 'errors' ? (
                /* Errors Content */
                <motion.div
                  key="errors"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full overflow-y-auto p-12"
                >
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-semibold text-[var(--fg)] mb-6">Error Codes</h2>
                    
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
                  </div>
                </motion.div>
              ) : selectedEndpoint === 'rate-limits' ? (
                /* Rate Limits Content */
                <motion.div
                  key="rate-limits"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full overflow-y-auto p-12"
                >
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-semibold text-[var(--fg)] mb-6">Rate Limits</h2>
                    
                    <div className="space-y-3">
                      {[
                        { endpoint: "/prices", limit: "60/min" },
                        { endpoint: "/quote", limit: "60/min" },
                        { endpoint: "/multi-quote", limit: "30/min" },
                        { endpoint: "/swap", limit: "60/min" },
                        { endpoint: "/multi-swap", limit: "30/min" },
                        { endpoint: "/swaps", limit: "60/min" },
                        { endpoint: "WebSocket", limit: "100 msg/min" },
                      ].map((item) => (
                        <div key={item.endpoint} className="flex justify-between py-3 px-4 border border-[var(--border)] rounded-lg bg-[var(--bg-soft)]">
                          <code className="text-[var(--fg)]">{item.endpoint}</code>
                          <span className="text-[var(--fg-muted)]">{item.limit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : selectedItem && selectedData ? (
                /* Endpoint Detail Content */
                <motion.div
                  key={selectedEndpoint}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full overflow-y-auto p-12"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`font-mono text-sm font-medium px-2 py-1 rounded ${methodColors[selectedItem.method]} bg-[var(--bg-soft)]`}>
                        {selectedItem.method}
                      </span>
                      <code className="text-xl text-[var(--fg)]">{selectedItem.path}</code>
                    </div>
                    <p className="text-[var(--fg-muted)] mb-8">{selectedData.description}</p>

                    {/* Parameters - Full Width */}
                    {selectedData.parameters && selectedData.parameters.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4">
                          Parameters
                        </h3>
                        <div className="space-y-3">
                          {selectedData.parameters.map((param) => (
                            <div key={param.name} className="flex items-baseline gap-3 flex-wrap">
                              <code className="text-[var(--aqua)] text-sm font-medium">
                                {param.name}
                              </code>
                              <span className="text-[var(--fg-dim)] text-sm">{param.type}</span>
                              {param.required && (
                                <span className="text-[var(--orange)] text-xs">required</span>
                              )}
                              <span className="text-[var(--fg-muted)] text-sm">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Two Column Layout: Left (Request/Response/Errors) | Right (Python) */}
                    <div className="flex gap-8">
                      {/* Left Column - Request Body, Response, Errors */}
                      <div className="flex-1 min-w-0 space-y-8">
                        {/* Request Body */}
                        {selectedData.requestBody && (
                          <div>
                            <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4">
                              Request Body
                            </h3>
                            <CodeBlock theme={theme} code={selectedData.requestBody} language="json" />
                          </div>
                        )}

                        {/* Response */}
                        {selectedData.response && (
                          <div>
                            <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4">
                              Response
                            </h3>
                            <CodeBlock theme={theme} code={selectedData.response} language="json" />
                          </div>
                        )}

                        {/* Errors */}
                        {selectedData.errors && selectedData.errors.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4">
                              Errors
                            </h3>
                            <div className="space-y-4">
                              {selectedData.errors.map((error, idx) => (
                                <div key={idx}>
                                  <p className="text-sm text-[var(--fg-dim)] mb-2">{error.title}</p>
                                  <CodeBlock theme={theme} code={error.code} language="json" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Python Example */}
                      {selectedData.pythonExample && (
                        <div className="w-[650px] flex-shrink-0">
                          <h3 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                            </svg>
                            Python
                          </h3>
                          <CodeBlock theme={theme} code={selectedData.pythonExample} language="python" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
        theme={theme}
      />
    </main>
  )
}

export default function DocsPage() {
  return (
    <ThemeProvider>
      <DocsPageContent />
    </ThemeProvider>
  )
}
