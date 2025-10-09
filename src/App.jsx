import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from './components/MainPage'
import Gyming from './pages/gyming'
import Socializing from './pages/socializing'
import Working from './pages/working'
import PikachuLoading from './components/PikachuLoading'
import { authService } from './services/authService'
import './App.css'

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.initialize()
        const authenticated = authService.isAuthenticated() && !authService.isAnonymous()
        setIsAuthenticated(authenticated)
      } catch (error) {
        console.error('Error initializing auth:', error)
      }
    }
    
    initAuth()
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    // If not authenticated, show login modal after loading
    if (!isAuthenticated) {
      setTimeout(() => {
        setShowLoginModal(true)
      }, 300)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (isSignUp) {
        await authService.signUp(email, password)
      } else {
        await authService.signIn(email, password)
      }
      
      setIsAuthenticated(true)
      setShowLoginModal(false)
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Authentication error:', error)
      setError(error.message || 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading animation on initial app load
  if (isLoading) {
    return <PikachuLoading onLoadingComplete={handleLoadingComplete} />
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#ffeabb] flex items-center justify-center">
        {showLoginModal && (
          <div className="bg-white rounded-lg shadow-xl p-8 w-96 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isSignUp ? 'Sign up to get started' : 'Please sign in to continue'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // User is authenticated, show app routes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/gyming" element={<Gyming />} />
        <Route path="/socializing" element={<Socializing />} />
        <Route path="/working" element={<Working />} />
      </Routes>
    </Router>
  )
}

export default App