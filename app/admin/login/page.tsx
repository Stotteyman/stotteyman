'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check if user is already logged in
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user?.role === 'admin') {
        router.push('/admin');
      }
    };
    
    checkSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/admin'
      });
      
      if (result?.error) {
        setError('Authentication failed. Please try again.');
      } else if (result?.ok) {
        router.push('/admin');
      }
    } catch (error) {
      setError('An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4 font-mono text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white transition-colors duration-300 font-mono text-sm"
              >
                ← Back to Site
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-light tracking-wide">Admin Access</h1>
              <p className="text-gray-400 text-sm font-mono mt-1">Stotteyman</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light mb-2">Log in to gain access</h2>
          <p className="text-gray-400 font-mono text-sm">
            Please sign in with your authorized Google account to access the admin panel.
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full p-6 border border-gray-700 hover:border-white transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <span className="font-light tracking-wide">
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </span>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {isLoading ? 'Please wait...' : 'Sign in with your Google account'}
                </p>
              </div>
            </div>
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-600 font-mono">
              Only authorized admin accounts can access this area
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
