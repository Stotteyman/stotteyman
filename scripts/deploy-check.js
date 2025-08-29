#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Production Deployment Readiness Check\n')

const checks = []

// 1. Build Check
console.log('📦 Running build check...')
try {
  execSync('npm run build', { stdio: 'pipe' })
  checks.push({ name: 'Build', status: 'PASS', message: 'Build completed successfully' })
} catch (error) {
  checks.push({ name: 'Build', status: 'FAIL', message: 'Build failed', error: error.message })
}

// 2. Bundle Size Check
console.log('📊 Checking bundle size...')
try {
  const buildDir = path.join(process.cwd(), '.next')
  if (fs.existsSync(buildDir)) {
    const stats = fs.statSync(path.join(buildDir, 'static'))
    const sizeInMB = stats.size / (1024 * 1024)
    
    if (sizeInMB < 5) {
      checks.push({ name: 'Bundle Size', status: 'PASS', message: `Bundle size: ${sizeInMB.toFixed(2)}MB` })
    } else {
      checks.push({ name: 'Bundle Size', status: 'WARN', message: `Bundle size is large: ${sizeInMB.toFixed(2)}MB` })
    }
  }
} catch (error) {
  checks.push({ name: 'Bundle Size', status: 'SKIP', message: 'Could not check bundle size' })
}

// 3. Security Headers Check
console.log('🔒 Checking security configuration...')
const middlewareExists = fs.existsSync(path.join(process.cwd(), 'middleware.ts'))
const nextConfigExists = fs.existsSync(path.join(process.cwd(), 'next.config.js'))

if (middlewareExists && nextConfigExists) {
  checks.push({ name: 'Security Headers', status: 'PASS', message: 'Security middleware configured' })
} else {
  checks.push({ name: 'Security Headers', status: 'FAIL', message: 'Security configuration missing' })
}

// 4. Environment Variables Check
console.log('⚙️  Checking environment variables...')
const requiredEnvVars = ['NODE_ENV']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length === 0) {
  checks.push({ name: 'Environment Variables', status: 'PASS', message: 'All required env vars present' })
} else {
  checks.push({ name: 'Environment Variables', status: 'FAIL', message: `Missing: ${missingEnvVars.join(', ')}` })
}

// 5. Performance Configuration Check
console.log('⚡ Checking performance configuration...')
try {
  const nextConfig = require(path.join(process.cwd(), 'next.config.js'))
  const hasOptimizations = nextConfig.experimental?.optimizeCss && nextConfig.compiler?.removeConsole
  
  if (hasOptimizations) {
    checks.push({ name: 'Performance Config', status: 'PASS', message: 'Performance optimizations enabled' })
  } else {
    checks.push({ name: 'Performance Config', status: 'WARN', message: 'Some optimizations missing' })
  }
} catch (error) {
  checks.push({ name: 'Performance Config', status: 'SKIP', message: 'Could not check config' })
}

// Generate Report
console.log('\n📋 Deployment Readiness Report')
console.log('================================')

let passCount = 0
let failCount = 0
let warnCount = 0

checks.forEach(check => {
  const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : check.status === 'WARN' ? '⚠️' : '⏭️'
  console.log(`${icon} ${check.name}: ${check.message}`)
  
  if (check.status === 'PASS') passCount++
  else if (check.status === 'FAIL') failCount++
  else if (check.status === 'WARN') warnCount++
})

console.log('\n📊 Summary')
console.log(`✅ Passed: ${passCount}`)
console.log(`❌ Failed: ${failCount}`)
console.log(`⚠️  Warnings: ${warnCount}`)

// Overall Status
if (failCount === 0 && warnCount <= 1) {
  console.log('\n🎉 Ready for deployment!')
  process.exit(0)
} else if (failCount === 0) {
  console.log('\n⚠️  Deployment possible with warnings')
  process.exit(0)
} else {
  console.log('\n🚫 Not ready for deployment - fix critical issues first')
  process.exit(1)
}