'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
    
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [status, session, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (!mounted || status === 'loading') {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4 font-mono text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null; // Will redirect
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
              <h1 className="text-2xl font-light tracking-wide">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm font-mono mt-1">Stotteyman</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-mono">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 font-mono">{session?.user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors duration-300 font-mono text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-4 mb-6">
              <img
                src={session?.user?.image || 'https://via.placeholder.com/150/ff6b35/ffffff?text=A'}
                alt={session?.user?.name || 'Admin'}
                className="w-16 h-16 rounded-full border-2 border-gray-700"
              />
              <div className="text-left">
                <h2 className="text-2xl font-light">Welcome back, {session?.user?.name}</h2>
                <p className="text-gray-400 text-sm font-mono">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Site Statistics */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-light mb-4">Site Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Total Visitors</span>
                  <span className="text-white font-mono">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Page Views</span>
                  <span className="text-white font-mono">3,891</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Blog Posts</span>
                  <span className="text-white font-mono">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Admin Logins</span>
                  <span className="text-white font-mono">42</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-light mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-300">• Admin login: 2 hours ago</p>
                  <p className="text-gray-500 text-xs font-mono">You signed in</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-300">• Blog post updated: 1 day ago</p>
                  <p className="text-gray-500 text-xs font-mono">Life is what you make it</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-300">• Site deployed: 2 days ago</p>
                  <p className="text-gray-500 text-xs font-mono">Latest version</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-light mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded">
                  → View Blog Posts
                </button>
                <button className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded">
                  → Analytics Dashboard
                </button>
                <button className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded">
                  → Site Settings
                </button>
                <button className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded">
                  → User Management
                </button>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-light mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-sm">Database</span>
                  <span className="text-green-400 font-mono text-sm">● Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-sm">Authentication</span>
                  <span className="text-green-400 font-mono text-sm">● Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-sm">Deployment</span>
                  <span className="text-green-400 font-mono text-sm">● Live</span>
                </div>
              </div>
            </div>

            {/* Content Management */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-light mb-4">Content Management</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Blog Posts</span>
                  <span className="text-white font-mono">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Draft Posts</span>
                  <span className="text-white font-mono">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Last Updated</span>
                  <span className="text-white font-mono text-xs">Today</span>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-light mb-4">Security Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-sm">SSL Certificate</span>
                  <span className="text-green-400 font-mono text-sm">● Valid</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-sm">Firewall</span>
                  <span className="text-green-400 font-mono text-sm">● Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-sm">Auth Sessions</span>
                  <span className="text-green-400 font-mono text-sm">● Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
