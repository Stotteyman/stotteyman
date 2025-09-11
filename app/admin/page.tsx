'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminProps {
  // This will be a protected route
}

export default function AdminPage({}: AdminProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authorized
    const authToken = localStorage.getItem('admin_auth');
    if (authToken === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      localStorage.setItem('admin_auth', password);
      setIsAuthorized(true);
      setMessage('Login successful!');
    } else {
      setMessage('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthorized(false);
    setPassword('');
    setMessage('');
  };

  const loadPersona = async () => {
    setIsLoading(true);
    try {
      // Load current persona from database
      const response = await fetch('/api/admin/persona');
      if (response.ok) {
        const data = await response.json();
        setPersona(data.persona);
      }
    } catch (error) {
      setMessage('Failed to load persona');
    } finally {
      setIsLoading(false);
    }
  };

  const savePersona = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ persona }),
      });
      
      if (response.ok) {
        setMessage('Persona saved successfully!');
      } else {
        setMessage('Failed to save persona');
      }
    } catch (error) {
      setMessage('Failed to save persona');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="card-neon max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-neon-cyan mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white font-mono mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-neon w-full"
                required
              />
            </div>
            <button type="submit" className="btn-neon w-full">
              Login
            </button>
          </form>
          {message && (
            <div className="mt-4 text-center text-red-400 font-mono text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neon-cyan font-mono">
            Admin Panel
          </h1>
          <button
            onClick={handleLogout}
            className="btn-neon px-4 py-2"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Persona Management */}
          <div className="card-neon">
            <h2 className="text-xl font-bold text-neon-cyan mb-4 font-mono">
              AI Persona
            </h2>
            <div className="space-y-4">
              <button
                onClick={loadPersona}
                disabled={isLoading}
                className="btn-neon w-full"
              >
                {isLoading ? 'Loading...' : 'Load Current Persona'}
              </button>
              
              {persona && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-mono mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={persona.name || ''}
                      onChange={(e) => setPersona({...persona, name: e.target.value})}
                      className="input-neon w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-mono mb-2">
                      Description
                    </label>
                    <textarea
                      value={persona.description || ''}
                      onChange={(e) => setPersona({...persona, description: e.target.value})}
                      className="input-neon w-full h-20"
                    />
                  </div>
                  
                  <button
                    onClick={savePersona}
                    disabled={isLoading}
                    className="btn-neon w-full"
                  >
                    {isLoading ? 'Saving...' : 'Save Persona'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className="card-neon">
            <h2 className="text-xl font-bold text-neon-cyan mb-4 font-mono">
              Analytics
            </h2>
            <div className="space-y-4">
              <div className="text-gray-400 font-mono text-sm">
                <p>Total Players: Loading...</p>
                <p>Active Sessions: Loading...</p>
                <p>Total Conversations: Loading...</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="btn-neon w-full"
              >
                View Site
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-4 text-center text-neon-cyan font-mono text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
