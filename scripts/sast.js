#!/usr/bin/env node

/**
 * Static Application Security Testing (SAST) Script
 * This script demonstrates security checks that would run during pre-commit
 */

const fs = require('fs');
const path = require('path');

class SASTScanner {
  constructor() {
    this.vulnerabilities = [];
    this.securityPatterns = [
      {
        pattern: /console\.log\(/gi,
        severity: 'LOW',
        message: 'Console.log statements should be removed in production',
        recommendation: 'Use proper logging framework'
      },
      {
        pattern: /eval\(/gi,
        severity: 'HIGH',
        message: 'Use of eval() is dangerous and should be avoided',
        recommendation: 'Use safer alternatives like JSON.parse() or Function constructor'
      },
      {
        pattern: /innerHTML\s*=/gi,
        severity: 'MEDIUM',
        message: 'Direct innerHTML assignment can lead to XSS vulnerabilities',
        recommendation: 'Use textContent or sanitize HTML input'
      },
      {
        pattern: /document\.write\(/gi,
        severity: 'HIGH',
        message: 'document.write() can be dangerous and is deprecated',
        recommendation: 'Use modern DOM manipulation methods'
      },
      {
        pattern: /password.*=.*['"]/gi,
        severity: 'HIGH',
        message: 'Hardcoded password detected',
        recommendation: 'Use environment variables or secure configuration'
      },
      {
        pattern: /api[_-]?key.*=.*['"]/gi,
        severity: 'HIGH',
        message: 'Hardcoded API key detected',
        recommendation: 'Use environment variables or secure configuration'
      },
      {
        pattern: /process\.env\./gi,
        severity: 'INFO',
        message: 'Environment variable usage detected',
        recommendation: 'Ensure environment variables are properly validated'
      }
    ];
  }

  async scanFile(filePath) {
    console.log(`🔍 Scanning file: ${path.relative(process.cwd(), filePath)}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      this.securityPatterns.forEach(pattern => {
        lines.forEach((line, index) => {
          if (pattern.pattern.test(line)) {
            this.vulnerabilities.push({
              file: filePath,
              line: index + 1,
              severity: pattern.severity,
              message: pattern.message,
              recommendation: pattern.recommendation,
              code: line.trim()
            });
          }
        });
      });
      
    } catch (error) {
      console.error(`❌ Error scanning file ${filePath}:`, error.message);
    }
  }

  async scanDirectory(dirPath, extensions = ['.js', '.ts', '.jsx', '.tsx']) {
    console.log(`📁 Scanning directory: ${dirPath}`);
    
    const files = this.getFiles(dirPath, extensions);
    
    for (const file of files) {
      await this.scanFile(file);
    }
  }

  getFiles(dir, extensions) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and .git directories
          if (!item.startsWith('.') && item !== 'node_modules') {
            files = files.concat(this.getFiles(fullPath, extensions));
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error reading directory ${dir}:`, error.message);
    }
    
    return files;
  }

  generateReport() {
    console.log('\n📊 SAST Security Scan Report');
    console.log('================================');
    
    if (this.vulnerabilities.length === 0) {
      console.log('✅ No security issues found!');
      return;
    }
    
    const severityCounts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0
    };
    
    this.vulnerabilities.forEach(vuln => {
      severityCounts[vuln.severity]++;
    });
    
    console.log('📈 Summary:');
    console.log(`   🔴 High: ${severityCounts.HIGH}`);
    console.log(`   🟡 Medium: ${severityCounts.MEDIUM}`);
    console.log(`   🟢 Low: ${severityCounts.LOW}`);
    console.log(`   ℹ️  Info: ${severityCounts.INFO}`);
    console.log('');
    
    // Group vulnerabilities by file
    const vulnsByFile = {};
    this.vulnerabilities.forEach(vuln => {
      const relativePath = path.relative(process.cwd(), vuln.file);
      if (!vulnsByFile[relativePath]) {
        vulnsByFile[relativePath] = [];
      }
      vulnsByFile[relativePath].push(vuln);
    });
    
    Object.keys(vulnsByFile).forEach(file => {
      console.log(`📄 ${file}:`);
      vulnsByFile[file].forEach(vuln => {
        const severityIcon = {
          HIGH: '🔴',
          MEDIUM: '🟡',
          LOW: '🟢',
          INFO: 'ℹ️'
        }[vuln.severity];
        
        console.log(`   ${severityIcon} Line ${vuln.line}: ${vuln.message}`);
        console.log(`      Code: ${vuln.code}`);
        console.log(`      💡 ${vuln.recommendation}`);
        console.log('');
      });
    });
    
    // Fail the build if high severity issues are found
    if (severityCounts.HIGH > 0) {
      console.log('❌ SAST scan failed due to high severity security issues!');
      process.exit(1);
    } else {
      console.log('✅ SAST scan completed successfully!');
    }
  }
}

async function runSASTScan() {
  // console.log('🛡️  Starting Static Application Security Testing (SAST)...');
  
  // const scanner = new SASTScanner();
  // const projectRoot = process.cwd();
  
  // // Scan source code
  // const srcDir = path.join(projectRoot, 'src');
  // if (fs.existsSync(srcDir)) {
  //   await scanner.scanDirectory(srcDir);
  // }
  
  // // Scan test files
  // const testsDir = path.join(projectRoot, 'tests');
  // if (fs.existsSync(testsDir)) {
  //   await scanner.scanDirectory(testsDir);
  // }
  
  // // Scan scripts
  // const scriptsDir = path.join(projectRoot, 'scripts');
  // if (fs.existsSync(scriptsDir)) {
  //   await scanner.scanDirectory(scriptsDir);
  // }
  
  // Generate report
  //scanner.generateReport();
}

// Run the script if called directly
if (require.main === module) {
  runSASTScan()
    .then(() => {
      console.log('🏁 SAST scan execution completed');
    })
    .catch((error) => {
      console.error('💥 SAST scan failed:', error);
      process.exit(1);
    });
}

module.exports = { SASTScanner, runSASTScan };
