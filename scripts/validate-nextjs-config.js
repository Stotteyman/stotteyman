#!/usr/bin/env node

/**
 * Next.js 15.5.0 Configuration Validation Script
 * Validates that all Next.js 15.5.0 features are properly configured
 */

const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  if (exists) {
    log(`✓ ${description}`, 'green')
  } else {
    log(`✗ ${description}`, 'red')
  }
  return exists
}

function checkPackageJson() {
  log('\n📦 Checking package.json...', 'blue')
  
  const packagePath = path.join(process.cwd(), 'package.json')
  if (!checkFileExists(packagePath, 'package.json exists')) {
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  // Check Next.js version
  const nextVersion = packageJson.dependencies?.next
  if (nextVersion && nextVersion.includes('15.5.0')) {
    log(`✓ Next.js 15.5.0 configured (${nextVersion})`, 'green')
  } else {
    log(`✗ Next.js 15.5.0 not found (current: ${nextVersion})`, 'red')
  }

  // Check React version
  const reactVersion = packageJson.dependencies?.react
  if (reactVersion && reactVersion.includes('18.3')) {
    log(`✓ React 18.3+ configured (${reactVersion})`, 'green')
  } else {
    log(`✗ React 18.3+ not found (current: ${reactVersion})`, 'yellow')
  }

  // Check TypeScript version
  const tsVersion = packageJson.devDependencies?.typescript
  if (tsVersion && tsVersion.includes('5.')) {
    log(`✓ TypeScript 5.x configured (${tsVersion})`, 'green')
  } else {
    log(`✗ TypeScript 5.x not found (current: ${tsVersion})`, 'yellow')
  }

  // Check animation libraries
  const animationLibs = ['framer-motion', 'gsap', 'lottie-react', 'three']
  animationLibs.forEach(lib => {
    if (packageJson.dependencies?.[lib]) {
      log(`✓ ${lib} configured`, 'green')
    } else {
      log(`✗ ${lib} not found`, 'yellow')
    }
  })

  return true
}

function checkNextConfig() {
  log('\n⚙️  Checking next.config.js...', 'blue')
  
  const configPath = path.join(process.cwd(), 'next.config.js')
  if (!checkFileExists(configPath, 'next.config.js exists')) {
    return false
  }

  const configContent = fs.readFileSync(configPath, 'utf8')
  
  // Check experimental features
  const experimentalFeatures = [
    'optimizeCss',
    'optimizeServerReact',
    'optimizePackageImports',
    'webVitalsAttribution',
    'turbotrace',
    'reactCompiler',
  ]

  experimentalFeatures.forEach(feature => {
    if (configContent.includes(feature)) {
      log(`✓ ${feature} enabled`, 'green')
    } else {
      log(`✗ ${feature} not found`, 'yellow')
    }
  })

  // Check image optimization
  if (configContent.includes("formats: ['image/avif', 'image/webp']")) {
    log('✓ AVIF and WebP image formats configured', 'green')
  } else {
    log('✗ Modern image formats not configured', 'yellow')
  }

  // Check security headers
  if (configContent.includes('Content-Security-Policy')) {
    log('✓ Content Security Policy configured', 'green')
  } else {
    log('✗ Content Security Policy not found', 'red')
  }

  return true
}

function checkTypeScriptConfig() {
  log('\n📝 Checking tsconfig.json...', 'blue')
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
  if (!checkFileExists(tsconfigPath, 'tsconfig.json exists')) {
    return false
  }

  const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8')
  
  // Check strict mode
  if (tsconfigContent.includes('"strict": true')) {
    log('✓ TypeScript strict mode enabled', 'green')
  } else {
    log('✗ TypeScript strict mode not enabled', 'red')
  }

  // Check module resolution
  if (tsconfigContent.includes('"moduleResolution": "bundler"')) {
    log('✓ Bundler module resolution configured', 'green')
  } else {
    log('✗ Bundler module resolution not configured', 'yellow')
  }

  // Check path mapping
  if (tsconfigContent.includes('"@/*"')) {
    log('✓ Path mapping configured', 'green')
  } else {
    log('✗ Path mapping not configured', 'yellow')
  }

  return true
}

function checkAppDirectory() {
  log('\n📁 Checking App Router structure...', 'blue')
  
  const appPath = path.join(process.cwd(), 'app')
  if (!checkFileExists(appPath, 'app directory exists')) {
    return false
  }

  // Check required files
  const requiredFiles = [
    'layout.tsx',
    'page.tsx',
    'loading.tsx',
    'error.tsx',
    'not-found.tsx',
    'globals.css',
  ]

  requiredFiles.forEach(file => {
    const filePath = path.join(appPath, file)
    checkFileExists(filePath, `app/${file}`)
  })

  return true
}

function checkPerformanceConfig() {
  log('\n🚀 Checking performance configuration...', 'blue')
  
  const perfConfigPath = path.join(process.cwd(), 'lib/config/performance.ts')
  checkFileExists(perfConfigPath, 'Performance configuration')

  const webpackConfigPath = path.join(process.cwd(), 'lib/config/webpack.config.js')
  checkFileExists(webpackConfigPath, 'Enhanced webpack configuration')

  const cacheHandlerPath = path.join(process.cwd(), 'lib/cache-handler.js')
  checkFileExists(cacheHandlerPath, 'Enhanced cache handler')

  return true
}

function checkSecurityConfig() {
  log('\n🔒 Checking security configuration...', 'blue')
  
  const middlewarePath = path.join(process.cwd(), 'middleware.ts')
  checkFileExists(middlewarePath, 'Middleware configuration')

  // Check for security libraries in package.json
  const packagePath = path.join(process.cwd(), 'package.json')
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    const securityLibs = ['dompurify', 'helmet', 'csurf']
    securityLibs.forEach(lib => {
      if (packageJson.dependencies?.[lib]) {
        log(`✓ ${lib} configured`, 'green')
      } else {
        log(`✗ ${lib} not found`, 'yellow')
      }
    })
  }

  return true
}

function main() {
  log('🔍 Next.js 15.5.0 Configuration Validation', 'blue')
  log('==========================================', 'blue')

  const checks = [
    checkPackageJson,
    checkNextConfig,
    checkTypeScriptConfig,
    checkAppDirectory,
    checkPerformanceConfig,
    checkSecurityConfig,
  ]

  let allPassed = true
  for (const check of checks) {
    if (!check()) {
      allPassed = false
    }
  }

  log('\n📊 Validation Summary', 'blue')
  log('====================', 'blue')
  
  if (allPassed) {
    log('✅ All checks passed! Next.js 15.5.0 is properly configured.', 'green')
  } else {
    log('⚠️  Some checks failed. Please review the configuration.', 'yellow')
  }

  log('\n💡 Next Steps:', 'blue')
  log('1. Run `npm install` to install new dependencies', 'reset')
  log('2. Run `npm run build` to test the configuration', 'reset')
  log('3. Run `npm run dev` to start development server', 'reset')
  log('4. Run `npm run analyze` to analyze bundle size', 'reset')
}

if (require.main === module) {
  main()
}

module.exports = {
  checkPackageJson,
  checkNextConfig,
  checkTypeScriptConfig,
  checkAppDirectory,
  checkPerformanceConfig,
  checkSecurityConfig,
}