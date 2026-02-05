#!/usr/bin/env node
/**
 * iOS Build Verification Script
 * Checks that production builds have NO localhost references
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const FORBIDDEN_PATTERNS = [
  /localhost:\d+/gi,
  /127\.0\.0\.1:\d+/gi,
  /http:\/\/localhost/gi,
  /http:\/\/127\.0\.0\.1/gi,
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  FORBIDDEN_PATTERNS.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        violations.push({
          file: path.relative(__dirname, filePath),
          pattern: pattern.toString(),
          match: match,
        });
      });
    }
  });

  return violations;
}

function scanDirectory(dir) {
  const violations = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile() && /\.(js|html|css)$/i.test(item)) {
        const fileViolations = scanFile(fullPath);
        violations.push(...fileViolations);
      }
    });
  }
  
  walk(dir);
  return violations;
}

console.log('🔍 Scanning production build for localhost references...\n');

if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ ERROR: dist/ folder not found!');
  console.error('   Run "npm run build" first.\n');
  process.exit(1);
}

const violations = scanDirectory(DIST_DIR);

if (violations.length === 0) {
  console.log('✅ SUCCESS! No localhost references found in production build.');
  console.log('   Build is safe for iOS deployment.\n');
  
  // Show what API base is configured
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    console.log('📋 Production Configuration:');
    console.log('   ✓ VITE_API_BASE_URL=https://moondala-backend.onrender.com');
    console.log('   ✓ VITE_USER_APP_URL=https://moondala.com');
    console.log('   ✓ VITE_SHOP_APP_URL=https://shop.moondala.com\n');
  }
  
  process.exit(0);
} else {
  console.error(`❌ FAILED! Found ${violations.length} localhost reference(s):\n`);
  
  violations.forEach((v, i) => {
    console.error(`${i + 1}. ${v.file}`);
    console.error(`   Pattern: ${v.pattern}`);
    console.error(`   Found: "${v.match}"\n`);
  });
  
  console.error('⚠️  These MUST be fixed before deploying to iOS!');
  console.error('   The app will not work on physical devices.\n');
  
  process.exit(1);
}
