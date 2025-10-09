import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const MinimalAuth: React.FC = () => {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAnon = authService.isAnonymous();
      console.log('Auth check - isAnonymous:', isAnon, 'user:', authService.getCurrentUser());
      setIsAnonymous(isAnon);
    };
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.signIn(email, password);
      setShowForm(false);
      setEmail('');
      setPassword('');
      setError(null);
    } catch (error: any) {
      console.error('Sign in failed:', error);
      setError(error.message || 'Sign in failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.signUp(email, password);
      setShowForm(false);
      setEmail('');
      setPassword('');
      setError(null);
    } catch (error: any) {
      console.error('Sign up failed:', error);
      setError(error.message || 'Sign up failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <button 
              onClick={() => {
                setShowForm(false);
                setError(null);
                setEmail('');
                setPassword('');
                setIsSignUp(false);
              }} 
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
            >
              {isLoading ? '...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      {isAnonymous ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1 text-sm border border-white border-opacity-30 hover:bg-opacity-30 transition-all"
        >
          Sign In
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1 text-sm border border-white border-opacity-30">
            {authService.getUserEmail()}
          </span>
          <button
            onClick={handleSignOut}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-2 py-1 text-sm border border-white border-opacity-30 hover:bg-opacity-30 transition-all"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default MinimalAuth;
