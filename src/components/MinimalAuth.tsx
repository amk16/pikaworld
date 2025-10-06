import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const MinimalAuth: React.FC = () => {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAnonymous(authService.isAnonymous());
    };
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      setShowForm(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.signUp(email, password);
      setShowForm(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Sign up failed:', error);
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
            <h2 className="text-lg font-medium">Sign In</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500">✕</button>
          </div>
          
          <form onSubmit={handleSignIn} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
            >
              {isLoading ? '...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-3 text-center">
            <button
              onClick={handleSignUp}
              className="text-sm text-blue-600"
            >
              Create account
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
