'use client'

import { useState } from 'react'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          passwordConfirm,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      // Success
      setSuccessMessage(data.message)
      setEmail('')
      setUsername('')
      setPassword('')
      setPasswordConfirm('')
      
      // Wait a moment then call onSuccess
      setTimeout(() => {
        onSuccess()
      }, 3000)

    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
      <div className="bg-black bg-opacity-20 border-2 border-white rounded-lg p-6 w-full max-w-md"
      >
        {successMessage ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-white mb-4">Registration Successful!</h3>
            <p className="text-white text-opacity-90 mb-2">{successMessage}</p>
            <p className="text-white text-opacity-70 text-sm">Redirecting...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-400 ${
                    error ? 'border-red-400 focus:ring-red-400' : 'border-white focus:ring-white'
                  }`}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value)
                    if (error) setError('')
                  }}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-400 ${
                    error ? 'border-red-400 focus:ring-red-400' : 'border-white focus:ring-white'
                  }`}
                  placeholder="Username"
                  required
                  disabled={isLoading}
                  minLength={3}
                  maxLength={20}
                />
                <p className="text-xs text-white text-opacity-60 mt-1">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-400 ${
                    error ? 'border-red-400 focus:ring-red-400' : 'border-white focus:ring-white'
                  }`}
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <p className="text-xs text-white text-opacity-60 mt-1">
                  At least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPasswordConfirm(e.target.value)
                    if (error) setError('')
                  }}
                  className={`w-full px-4 py-3 bg-black bg-opacity-30 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-400 ${
                    error ? 'border-red-400 focus:ring-red-400' : 'border-white focus:ring-white'
                  }`}
                  placeholder="Confirm Password"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 bg-white text-black font-bold rounded-lg transition-all duration-200 ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-opacity-90'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-center text-sm text-white text-opacity-70 mt-4">
                By creating an account, you agree to receive verification emails.
              </p>
            </form>
          </>
        )}
      </div>
  )
}

