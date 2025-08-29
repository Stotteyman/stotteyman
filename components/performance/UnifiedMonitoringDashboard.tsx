'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PerformanceDashboard } from './PerformanceDashboard'
import { BundleMonitor } from './BundleMonitor'
import { PerformanceAlerts } from './PerformanceAlerts'
import { 
  Activity, 
  Package, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings
} from 'lucide-react'

interface UnifiedMonitoringDashboardProps {
  className?: string
}

export function UnifiedMonitoringDashboard({ 
  className = '' 
}: UnifiedMonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'bundle' | 'alerts'>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'bundle', label: 'Bundle', icon: Package },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
  ]

  return (
    <div className={`unified-monitoring-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Performance Monitoring
        </h1>
        <p className="text-gray-400">
          Comprehensive performance, bundle, and security monitoring
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'performance' && <PerformanceDashboard />}
        {activeTab === 'bundle' && <BundleMonitor />}
        {activeTab === 'alerts' && <PerformanceAlerts />}
      </motion.div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          title="Performance Score"
          value="87"
          unit="/100"
          status="good"
          icon={<Activity size={24} />}
          trend="+5"
        />
        <StatusCard
          title="Bundle Size"
          value="180"
          unit="KB"
          status="good"
          icon={<Package size={24} />}
          trend="-12KB"
        />
        <StatusCard
          title="Security Score"
          value="95"
          unit="/100"
          status="excellent"
          icon={<Shield size={24} />}
          trend="0"
        />
      </div>

      {/* Quick Alerts */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Alerts</h3>
        <PerformanceAlerts maxVisible={3} />
      </div>
    </div>
  )
}

interface StatusCardProps {
  title: string
  value: string
  unit: string
  status: 'excellent' | 'good' | 'warning' | 'poor'
  icon: React.ReactNode
  trend: string
}

function StatusCard({ title, value, unit, status, icon, trend }: StatusCardProps) {
  const statusColors = {
    excellent: 'text-green-400 border-green-500/30 bg-green-500/10',
    good: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    warning: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    poor: 'text-red-400 border-red-500/30 bg-red-500/10'
  }

  return (
    <div className={`glass rounded-xl p-6 border ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={statusColors[status].split(' ')[0]}>
          {icon}
        </div>
        {status === 'excellent' ? (
          <CheckCircle size={16} className="text-green-400" />
        ) : status === 'poor' ? (
          <AlertTriangle size={16} className="text-red-400" />
        ) : null}
      </div>
      
      <div className="mb-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-gray-400 ml-1">{unit}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{title}</span>
        <span className={`text-xs ${trend.startsWith('+') || trend.startsWith('-') ? 'text-green-400' : 'text-gray-400'}`}>
          {trend !== '0' && trend}
        </span>
      </div>
    </div>
  )
}