/**
 * Enhanced Webpack Configuration for Next.js 15.5.0
 * Optimized for performance, animations, and modern web features
 */

const path = require('path')

/**
 * Enhanced bundle splitting configuration
 */
function createOptimizedSplitChunks() {
  return {
    chunks: 'all',
    minSize: 20000,
    maxSize: 244000,
    minRemainingSize: 0,
    minChunks: 1,
    maxAsyncRequests: 30,
    maxInitialRequests: 30,
    enforceSizeThreshold: 50000,
    cacheGroups: {
      // Framework chunk (React, Next.js)
      framework: {
        name: 'framework',
        test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
        priority: 50,
        chunks: 'all',
        enforce: true,
        reuseExistingChunk: true,
      },

      // Animation libraries chunk
      animations: {
        name: 'animations',
        test: /[\\/]node_modules[\\/](framer-motion|gsap|three|lottie-react|use-gesture)[\\/]/,
        priority: 45,
        chunks: 'all',
        enforce: true,
        reuseExistingChunk: true,
      },

      // UI libraries chunk
      ui: {
        name: 'ui',
        test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|lucide-react|clsx|tailwind-merge)[\\/]/,
        priority: 40,
        chunks: 'all',
        reuseExistingChunk: true,
      },

      // Utilities chunk
      utils: {
        name: 'utils',
        test: /[\\/]node_modules[\\/](dompurify|markdown-it|gray-matter)[\\/]/,
        priority: 35,
        chunks: 'all',
        reuseExistingChunk: true,
      },

      // Common vendor chunk
      vendor: {
        name: 'vendor',
        test: /[\\/]node_modules[\\/]/,
        priority: 20,
        chunks: 'all',
        minChunks: 2,
        reuseExistingChunk: true,
      },

      // Default chunk
      default: {
        minChunks: 2,
        priority: 10,
        reuseExistingChunk: true,
      },
    },
  }
}

/**
 * Enhanced module resolution configuration
 */
function createModuleResolution() {
  return {
    alias: {
      '@': path.resolve(process.cwd()),
      '@/components': path.resolve(process.cwd(), 'components'),
      '@/lib': path.resolve(process.cwd(), 'lib'),
      '@/hooks': path.resolve(process.cwd(), 'hooks'),
      '@/types': path.resolve(process.cwd(), 'types'),
      '@/app': path.resolve(process.cwd(), 'app'),
      '@/styles': path.resolve(process.cwd(), 'styles'),
      '@/utils': path.resolve(process.cwd(), 'utils'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: ['node_modules', path.resolve(process.cwd(), 'node_modules')],
    symlinks: false,
  }
}

/**
 * Performance optimizations for production builds
 */
function createProductionOptimizations(config, { dev, isServer }) {
  if (!dev && !isServer) {
    // Enhanced tree shaking
    config.optimization.usedExports = true
    config.optimization.sideEffects = false
    config.optimization.providedExports = true
    config.optimization.innerGraph = true
    config.optimization.mangleExports = true

    // Enhanced minification
    config.optimization.minimize = true
    config.optimization.concatenateModules = true

    // Enhanced module concatenation
    config.optimization.flagIncludedChunks = true
    config.optimization.mergeDuplicateChunks = true
    config.optimization.removeAvailableModules = true
    config.optimization.removeEmptyChunks = true

    // Enhanced runtime chunk
    config.optimization.runtimeChunk = {
      name: 'runtime',
    }
  }

  return config
}

/**
 * Client-side fallbacks for Node.js modules
 */
function createClientFallbacks(config, { isServer }) {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
      util: false,
      url: false,
      querystring: false,
      buffer: false,
      events: false,
      string_decoder: false,
    }
  }

  return config
}

/**
 * Enhanced loader configurations
 */
function createLoaderConfigurations(config) {
  // SVG loader configuration
  config.module.rules.push({
    test: /\.svg$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          prettier: false,
          svgo: true,
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
            ],
          },
          titleProp: true,
        },
      },
    ],
  })

  // Enhanced CSS loader for animations
  config.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          modules: {
            auto: true,
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        },
      },
      'postcss-loader',
    ],
  })

  return config
}

/**
 * Development-specific optimizations
 */
function createDevelopmentOptimizations(config, { dev }) {
  if (dev) {
    // Enhanced source maps for debugging
    config.devtool = 'eval-cheap-module-source-map'

    // Faster rebuilds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    }

    // Enhanced hot reloading
    config.optimization.removeAvailableModules = false
    config.optimization.removeEmptyChunks = false
    config.optimization.splitChunks = false
  }

  return config
}

/**
 * Bundle analysis configuration
 */
function createBundleAnalysis(config, { dev, isServer, webpack }) {
  if (process.env.ANALYZE === 'true') {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: isServer 
          ? '../analyze/server.html' 
          : './analyze/client.html',
        defaultSizes: 'gzip',
        generateStatsFile: true,
        statsFilename: isServer 
          ? '../analyze/server-stats.json' 
          : './analyze/client-stats.json',
      })
    )
  }

  // Performance monitoring
  if (!dev) {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_RUNTIME': JSON.stringify(isServer ? 'nodejs' : 'edge'),
        'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
        'process.env.BUILD_ID': JSON.stringify(process.env.BUILD_ID || 'development'),
      })
    )
  }

  return config
}

/**
 * Main webpack configuration function
 */
function enhanceWebpackConfig(config, context) {
  const { dev, isServer, webpack } = context

  // Apply optimizations
  config.optimization.splitChunks = createOptimizedSplitChunks()
  config.resolve = { ...config.resolve, ...createModuleResolution() }

  // Apply environment-specific optimizations
  config = createProductionOptimizations(config, context)
  config = createDevelopmentOptimizations(config, context)
  config = createClientFallbacks(config, context)
  config = createLoaderConfigurations(config)
  config = createBundleAnalysis(config, context)

  // Enhanced performance monitoring
  if (!dev && !isServer) {
    config.stats = {
      ...config.stats,
      chunks: false,
      modules: false,
      assets: true,
      assetsSort: 'size',
      performance: true,
      timings: true,
    }
  }

  return config
}

module.exports = {
  enhanceWebpackConfig,
  createOptimizedSplitChunks,
  createModuleResolution,
  createProductionOptimizations,
  createClientFallbacks,
  createLoaderConfigurations,
  createDevelopmentOptimizations,
  createBundleAnalysis,
}