#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function optimizeBundle() {
  console.log('🔍 Analyzing bundle size...');
  
  const nextDir = path.join(__dirname, '..', '.next');
  const staticDir = path.join(nextDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log('❌ Build directory not found. Run "pnpm build" first.');
    return;
  }
  
  // Analyze JavaScript bundles
  const jsFiles = [];
  const cssFiles = [];
  
  function analyzeDir(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        analyzeDir(fullPath, path.join(relativePath, item));
      } else {
        const filePath = path.join(relativePath, item);
        const size = stat.size;
        
        if (item.endsWith('.js')) {
          jsFiles.push({ path: filePath, size });
        } else if (item.endsWith('.css')) {
          cssFiles.push({ path: filePath, size });
        }
      }
    }
  }
  
  analyzeDir(staticDir);
  
  // Sort by size
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);
  
  // Calculate totals
  const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSize = totalJsSize + totalCssSize;
  
  console.log('\n📊 Bundle Analysis Results:');
  console.log('='.repeat(50));
  
  console.log('\n📦 JavaScript Files:');
  jsFiles.slice(0, 10).forEach((file, index) => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`${index + 1}. ${file.path} - ${sizeKB} KB`);
  });
  
  console.log('\n🎨 CSS Files:');
  cssFiles.forEach((file, index) => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`${index + 1}. ${file.path} - ${sizeKB} KB`);
  });
  
  console.log('\n📈 Summary:');
  console.log(`Total JS Size: ${(totalJsSize / 1024).toFixed(2)} KB`);
  console.log(`Total CSS Size: ${(totalCssSize / 1024).toFixed(2)} KB`);
  console.log(`Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
  
  // Check against targets
  const jsTarget = 200 * 1024; // 200KB
  const cssTarget = 50 * 1024;  // 50KB
  const totalTarget = 250 * 1024; // 250KB
  
  console.log('\n🎯 Performance Targets:');
  console.log(`JS Target: ${jsTarget / 1024} KB (${totalJsSize <= jsTarget ? '✅' : '❌'})`);
  console.log(`CSS Target: ${cssTarget / 1024} KB (${totalCssSize <= cssTarget ? '✅' : '❌'})`);
  console.log(`Total Target: ${totalTarget / 1024} KB (${totalSize <= totalTarget ? '✅' : '❌'})`);
  
  // Recommendations
  if (totalSize > totalTarget) {
    console.log('\n💡 Recommendations:');
    console.log('- Consider code splitting for large components');
    console.log('- Use dynamic imports for heavy libraries');
    console.log('- Optimize images and assets');
    console.log('- Remove unused dependencies');
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    jsFiles: jsFiles.map(f => ({ path: f.path, size: f.size, sizeKB: (f.size / 1024).toFixed(2) })),
    cssFiles: cssFiles.map(f => ({ path: f.path, size: f.size, sizeKB: (f.size / 1024).toFixed(2) })),
    totals: {
      jsSize: totalJsSize,
      cssSize: totalCssSize,
      totalSize: totalSize,
      jsSizeKB: (totalJsSize / 1024).toFixed(2),
      cssSizeKB: (totalCssSize / 1024).toFixed(2),
      totalSizeKB: (totalSize / 1024).toFixed(2),
    },
    targets: {
      jsTarget: jsTarget,
      cssTarget: cssTarget,
      totalTarget: totalTarget,
      jsTargetMet: totalJsSize <= jsTarget,
      cssTargetMet: totalCssSize <= cssTarget,
      totalTargetMet: totalSize <= totalTarget,
    }
  };
  
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'bundle-analysis.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n📄 Report saved to: reports/bundle-analysis.json`);
}

// Run if called directly
if (require.main === module) {
  optimizeBundle().catch(console.error);
}

module.exports = { optimizeBundle };
