#!/usr/bin/env node

/**
 * TypeScript Configuration Validation Script for Next.js 15.5.0
 * Validates TypeScript configuration and type definitions
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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

function checkTsConfig() {
  log('\n📝 Checking tsconfig.json configuration...', 'blue')
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
  if (!checkFileExists(tsconfigPath, 'tsconfig.json exists')) {
    return false
  }

  try {
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8')

    // Check essential compiler options by searching for them in the file
    const essentialOptions = {
      'strict': true,
      'noEmit': true,
      'esModuleInterop': true,
      'moduleResolution': 'bundler',
      'jsx': 'preserve',
      'incremental': true,
      'forceConsistentCasingInFileNames': true,
    }

    Object.entries(essentialOptions).forEach(([option, expectedValue]) => {
      const regex = new RegExp(`"${option}"\\s*:\\s*${expectedValue}`, 'i')
      if (regex.test(tsconfigContent)) {
        log(`✓ ${option}: ${expectedValue}`, 'green')
      } else {
        log(`✗ ${option}: not found or incorrect value`, 'red')
      }
    })

    // Check strict type checking options
    const strictOptions = [
      'noImplicitAny',
      'strictNullChecks',
      'strictFunctionTypes',
      'strictBindCallApply',
      'strictPropertyInitialization',
      'noImplicitThis',
      'alwaysStrict',
      'noUnusedLocals',
      'noUnusedParameters',
      'noImplicitReturns',
      'noFallthroughCasesInSwitch',
    ]

    strictOptions.forEach(option => {
      const regex = new RegExp(`"${option}"\\s*:\\s*true`, 'i')
      if (regex.test(tsconfigContent)) {
        log(`✓ ${option} enabled`, 'green')
      } else {
        log(`✗ ${option} not enabled`, 'yellow')
      }
    })

    // Check path mapping
    const expectedPaths = [
      '@/*',
      '@/components/*',
      '@/lib/*',
      '@/hooks/*',
      '@/types/*',
      '@/utils/*',
      '@/styles/*',
      '@/animations/*',
      '@/app/*',
    ]

    expectedPaths.forEach(pathPattern => {
      const escapedPattern = pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`"${escapedPattern}"`, 'i')
      if (regex.test(tsconfigContent)) {
        log(`✓ Path mapping configured: ${pathPattern}`, 'green')
      } else {
        log(`✗ Path mapping missing: ${pathPattern}`, 'yellow')
      }
    })

    return true
  } catch (error) {
    log(`✗ Error reading tsconfig.json: ${error.message}`, 'red')
    return false
  }
}

function checkTypeDefinitions() {
  log('\n🔍 Checking type definitions...', 'blue')
  
  const typesDir = path.join(process.cwd(), 'types')
  if (!checkFileExists(typesDir, 'types directory exists')) {
    return false
  }

  const expectedTypeFiles = [
    'index.ts',
    'global.ts',
    'animations.ts',
    'components.ts',
    'hooks.ts',
    'next.ts',
    'nextjs15.ts',
    'animation-interfaces.ts',
    'performance.ts',
    'security.ts',
  ]

  expectedTypeFiles.forEach(file => {
    const filePath = path.join(typesDir, file)
    checkFileExists(filePath, `types/${file}`)
  })

  return true
}

function checkTypeScriptCompilation() {
  log('\n🔨 Checking TypeScript compilation...', 'blue')
  
  try {
    log('Running TypeScript type checking...', 'blue')
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    log('✓ TypeScript compilation successful', 'green')
    return true
  } catch (error) {
    log('✗ TypeScript compilation failed', 'red')
    
    // Try to extract useful error information
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || ''
    if (errorOutput) {
      const lines = errorOutput.split('\n').slice(0, 10) // Show first 10 lines
      lines.forEach(line => {
        if (line.trim()) {
          log(`  ${line}`, 'red')
        }
      })
    }
    
    return false
  }
}

function checkESLintTypeScriptIntegration() {
  log('\n🔧 Checking ESLint TypeScript integration...', 'blue')
  
  const eslintConfigPath = path.join(process.cwd(), '.eslintrc.json')
  const eslintConfigJsPath = path.join(process.cwd(), 'eslint.config.js')
  
  if (fs.existsSync(eslintConfigPath) || fs.existsSync(eslintConfigJsPath)) {
    log('✓ ESLint configuration found', 'green')
    
    try {
      execSync('npx eslint --ext .ts,.tsx --max-warnings 0 types/', { stdio: 'pipe' })
      log('✓ ESLint TypeScript validation passed', 'green')
      return true
    } catch (error) {
      log('✗ ESLint TypeScript validation failed', 'yellow')
      return false
    }
  } else {
    log('✗ ESLint configuration not found', 'yellow')
    return false
  }
}

function checkNextJsTypeIntegration() {
  log('\n⚡ Checking Next.js type integration...', 'blue')
  
  // Check for Next.js type files
  const nextEnvPath = path.join(process.cwd(), 'next-env.d.ts')
  checkFileExists(nextEnvPath, 'next-env.d.ts exists')

  // Check for .next/types directory (generated during build)
  const nextTypesPath = path.join(process.cwd(), '.next/types')
  if (fs.existsSync(nextTypesPath)) {
    log('✓ Next.js generated types found', 'green')
  } else {
    log('⚠ Next.js generated types not found (run build first)', 'yellow')
  }

  return true
}

function checkAnimationTypeDefinitions() {
  log('\n🎬 Checking animation type definitions...', 'blue')
  
  const animationTypesPath = path.join(process.cwd(), 'types/animations.ts')
  const animationInterfacesPath = path.join(process.cwd(), 'types/animation-interfaces.ts')
  
  if (checkFileExists(animationTypesPath, 'Animation types defined') &&
      checkFileExists(animationInterfacesPath, 'Animation interfaces defined')) {
    
    try {
      const animationTypes = fs.readFileSync(animationTypesPath, 'utf8')
      const animationInterfaces = fs.readFileSync(animationInterfacesPath, 'utf8')
      
      // Check for key animation interfaces
      const keyInterfaces = [
        'ParticleSystemInterface',
        'MorphingBackgroundInterface',
        'ScrollAnimationInterface',
        'MagneticEffectInterface',
        'GlassmorphismInterface',
        'AnimatedButtonInterface',
      ]
      
      keyInterfaces.forEach(interfaceName => {
        if (animationInterfaces.includes(interfaceName)) {
          log(`✓ ${interfaceName} defined`, 'green')
        } else {
          log(`✗ ${interfaceName} missing`, 'red')
        }
      })
      
      return true
    } catch (error) {
      log(`✗ Error reading animation type files: ${error.message}`, 'red')
      return false
    }
  }
  
  return false
}

function checkComponentTypeDefinitions() {
  log('\n🧩 Checking component type definitions...', 'blue')
  
  const componentTypesPath = path.join(process.cwd(), 'types/components.ts')
  
  if (checkFileExists(componentTypesPath, 'Component types defined')) {
    try {
      const componentTypes = fs.readFileSync(componentTypesPath, 'utf8')
      
      // Check for key component interfaces
      const keyInterfaces = [
        'ButtonProps',
        'InteractiveButtonProps',
        'CardProps',
        'GlassmorphicCardProps',
        'ModalProps',
        'NavigationProps',
        'OptimizedImageProps',
      ]
      
      keyInterfaces.forEach(interfaceName => {
        if (componentTypes.includes(interfaceName)) {
          log(`✓ ${interfaceName} defined`, 'green')
        } else {
          log(`✗ ${interfaceName} missing`, 'red')
        }
      })
      
      return true
    } catch (error) {
      log(`✗ Error reading component type files: ${error.message}`, 'red')
      return false
    }
  }
  
  return false
}

function generateTypeReport() {
  log('\n📊 Generating type coverage report...', 'blue')
  
  try {
    // Count type definitions
    const typesDir = path.join(process.cwd(), 'types')
    const typeFiles = fs.readdirSync(typesDir).filter(file => file.endsWith('.ts'))
    
    let totalInterfaces = 0
    let totalTypes = 0
    
    typeFiles.forEach(file => {
      const content = fs.readFileSync(path.join(typesDir, file), 'utf8')
      const interfaceMatches = content.match(/interface\s+\w+/g) || []
      const typeMatches = content.match(/type\s+\w+/g) || []
      
      totalInterfaces += interfaceMatches.length
      totalTypes += typeMatches.length
    })
    
    log(`📈 Type Coverage Summary:`, 'blue')
    log(`  • Type files: ${typeFiles.length}`, 'reset')
    log(`  • Interfaces: ${totalInterfaces}`, 'reset')
    log(`  • Type aliases: ${totalTypes}`, 'reset')
    log(`  • Total definitions: ${totalInterfaces + totalTypes}`, 'reset')
    
    return true
  } catch (error) {
    log(`✗ Error generating type report: ${error.message}`, 'red')
    return false
  }
}

function main() {
  log('🔍 TypeScript Configuration Validation for Next.js 15.5.0', 'blue')
  log('=========================================================', 'blue')

  const checks = [
    checkTsConfig,
    checkTypeDefinitions,
    checkTypeScriptCompilation,
    checkESLintTypeScriptIntegration,
    checkNextJsTypeIntegration,
    checkAnimationTypeDefinitions,
    checkComponentTypeDefinitions,
    generateTypeReport,
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
    log('✅ All TypeScript checks passed! Configuration is optimal.', 'green')
  } else {
    log('⚠️  Some TypeScript checks failed. Please review the configuration.', 'yellow')
  }

  log('\n💡 Next Steps:', 'blue')
  log('1. Run `npm run type-check` to validate types', 'reset')
  log('2. Run `npm run lint` to check code quality', 'reset')
  log('3. Run `npm run build` to test compilation', 'reset')
  log('4. Use IDE TypeScript integration for real-time checking', 'reset')
}

if (require.main === module) {
  main()
}

module.exports = {
  checkTsConfig,
  checkTypeDefinitions,
  checkTypeScriptCompilation,
  checkESLintTypeScriptIntegration,
  checkNextJsTypeIntegration,
  checkAnimationTypeDefinitions,
  checkComponentTypeDefinitions,
  generateTypeReport,
}