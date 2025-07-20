#!/usr/bin/env node

/**
 * Performance Analyzer for Luna App
 * Analyzes app performance metrics and bundle sizes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface PerformanceMetrics {
  bundleSize: {
    total: number;
    js: number;
    css: number;
    images: number;
    fonts: number;
    other: number;
  };
  loadTime: {
    initial: number;
    interactive: number;
    complete: number;
  };
  memory: {
    heap: number;
    used: number;
    total: number;
  };
  rendering: {
    fps: number;
    frames: number;
    dropped: number;
  };
}

interface BundleAnalysis {
  file: string;
  size: number;
  gzipSize: number;
  type: string;
  percentage: number;
}

class PerformanceAnalyzer {
  private metrics: PerformanceMetrics;
  private bundleAnalysis: BundleAnalysis[] = [];
  private startTime: number = 0;

  constructor() {
    this.metrics = {
      bundleSize: {
        total: 0,
        js: 0,
        css: 0,
        images: 0,
        fonts: 0,
        other: 0
      },
      loadTime: {
        initial: 0,
        interactive: 0,
        complete: 0
      },
      memory: {
        heap: 0,
        used: 0,
        total: 0
      },
      rendering: {
        fps: 0,
        frames: 0,
        dropped: 0
      }
    };
  }

  async analyze(): Promise<void> {
    console.log('⚡ Luna App Performance Analyzer');
    console.log('================================\n');

    this.startTime = Date.now();

    try {
      // 1. Bundle analysis
      await this.analyzeBundleSize();

      // 2. Code analysis
      await this.analyzeCodeQuality();

      // 3. Asset optimization
      await this.analyzeAssets();

      // 4. Dependency analysis
      await this.analyzeDependencies();

      // 5. Performance recommendations
      await this.generateRecommendations();

      // 6. Generate report
      await this.generateReport();

      this.showSummary();

    } catch (error) {
      console.error('❌ Performance analysis failed:', error);
      process.exit(1);
    }
  }

  private async analyzeBundleSize(): Promise<void> {
    console.log('📦 Analyzing bundle size...');

    try {
      // Build for analysis
      await execAsync('npm run build:web');

      // Analyze dist folder
      const distPath = './dist';
      if (fs.existsSync(distPath)) {
        await this.analyzeDistFolder(distPath);
      }

      console.log(`Total bundle size: ${this.formatSize(this.metrics.bundleSize.total)}`);
      console.log(`JavaScript: ${this.formatSize(this.metrics.bundleSize.js)}`);
      console.log(`CSS: ${this.formatSize(this.metrics.bundleSize.css)}`);
      console.log(`Images: ${this.formatSize(this.metrics.bundleSize.images)}`);
      console.log(`Fonts: ${this.formatSize(this.metrics.bundleSize.fonts)}`);
      console.log(`Other: ${this.formatSize(this.metrics.bundleSize.other)}`);

    } catch (error) {
      console.error('Bundle analysis failed:', error);
    }

    console.log('');
  }

  private async analyzeDistFolder(distPath: string): Promise<void> {
    const files = this.getAllFiles(distPath);
    
    for (const file of files) {
      const stats = fs.statSync(file);
      const size = stats.size;
      const relativePath = path.relative(distPath, file);
      const extension = path.extname(file).toLowerCase();

      // Categorize by file type
      if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
        this.metrics.bundleSize.js += size;
      } else if (['.css', '.scss', '.sass'].includes(extension)) {
        this.metrics.bundleSize.css += size;
      } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(extension)) {
        this.metrics.bundleSize.images += size;
      } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(extension)) {
        this.metrics.bundleSize.fonts += size;
      } else {
        this.metrics.bundleSize.other += size;
      }

      this.metrics.bundleSize.total += size;

      // Add to bundle analysis
      this.bundleAnalysis.push({
        file: relativePath,
        size: size,
        gzipSize: 0, // TODO: Calculate gzip size
        type: this.getFileType(extension),
        percentage: 0 // Will be calculated later
      });
    }

    // Calculate percentages
    this.bundleAnalysis.forEach(item => {
      item.percentage = (item.size / this.metrics.bundleSize.total) * 100;
    });

    // Sort by size (largest first)
    this.bundleAnalysis.sort((a, b) => b.size - a.size);
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private getFileType(extension: string): string {
    const typeMap: { [key: string]: string } = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sass': 'SASS',
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.gif': 'Image',
      '.svg': 'SVG',
      '.webp': 'Image',
      '.woff': 'Font',
      '.woff2': 'Font',
      '.ttf': 'Font',
      '.eot': 'Font',
      '.json': 'JSON',
      '.html': 'HTML',
      '.map': 'Source Map'
    };

    return typeMap[extension] || 'Other';
  }

  private async analyzeCodeQuality(): Promise<void> {
    console.log('🔍 Analyzing code quality...');

    try {
      // Count lines of code
      const sourceFiles = this.getSourceFiles();
      let totalLines = 0;
      let totalSize = 0;
      const complexityScores: number[] = [];

      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        const size = Buffer.byteLength(content, 'utf8');
        
        totalLines += lines;
        totalSize += size;

        // Basic complexity analysis
        const complexity = this.calculateComplexity(content);
        complexityScores.push(complexity);
      }

      const avgComplexity = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length;

      console.log(`Source files: ${sourceFiles.length}`);
      console.log(`Total lines: ${totalLines.toLocaleString()}`);
      console.log(`Total size: ${this.formatSize(totalSize)}`);
      console.log(`Average complexity: ${avgComplexity.toFixed(2)}`);

      // Check for potential issues
      await this.checkCodeIssues(sourceFiles);

    } catch (error) {
      console.error('Code quality analysis failed:', error);
    }

    console.log('');
  }

  private getSourceFiles(): string[] {
    const sourceFiles: string[] = [];
    const searchDirs = ['src', 'app'];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];

    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.findFiles(dir, extensions, sourceFiles);
      }
    }

    return sourceFiles;
  }

  private findFiles(dir: string, extensions: string[], results: string[]): void {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findFiles(fullPath, extensions, results);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  private calculateComplexity(content: string): number {
    let complexity = 1; // Base complexity
    
    // Count decision points
    const decisionPoints = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*:/g, // Ternary operator
      /&&/g,
      /\|\|/g
    ];

    for (const pattern of decisionPoints) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private async checkCodeIssues(sourceFiles: string[]): Promise<void> {
    const issues = {
      longFiles: 0,
      duplicateImports: 0,
      unusedImports: 0,
      complexFunctions: 0,
      magicNumbers: 0
    };

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Check file length
      if (lines.length > 300) {
        issues.longFiles++;
      }

      // Check for duplicate imports
      const imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
      if (imports) {
        const importSources = imports.map(imp => imp.match(/from\s+['"]([^'"]+)['"]/)?.[1]);
        const uniqueImports = new Set(importSources);
        if (imports.length !== uniqueImports.size) {
          issues.duplicateImports++;
        }
      }

      // Check for magic numbers
      const magicNumbers = content.match(/\b(?!0|1|2|100)\d{2,}\b/g);
      if (magicNumbers) {
        issues.magicNumbers += magicNumbers.length;
      }

      // Check for complex functions
      const functionComplexity = this.calculateComplexity(content);
      if (functionComplexity > 10) {
        issues.complexFunctions++;
      }
    }

    console.log('Code quality issues:');
    console.log(`  Long files (>300 lines): ${issues.longFiles}`);
    console.log(`  Files with duplicate imports: ${issues.duplicateImports}`);
    console.log(`  Complex functions: ${issues.complexFunctions}`);
    console.log(`  Magic numbers: ${issues.magicNumbers}`);
  }

  private async analyzeAssets(): Promise<void> {
    console.log('🖼️  Analyzing assets...');

    const assetDirs = ['assets', 'src/assets', 'public'];
    let totalAssets = 0;
    let totalSize = 0;
    let unoptimizedImages = 0;

    for (const dir of assetDirs) {
      if (fs.existsSync(dir)) {
        const assets = this.getAllFiles(dir);
        
        for (const asset of assets) {
          const stats = fs.statSync(asset);
          const extension = path.extname(asset).toLowerCase();
          
          totalAssets++;
          totalSize += stats.size;

          // Check for unoptimized images
          if (['.png', '.jpg', '.jpeg'].includes(extension)) {
            if (stats.size > 500 * 1024) { // 500KB
              unoptimizedImages++;
            }
          }
        }
      }
    }

    console.log(`Total assets: ${totalAssets}`);
    console.log(`Total size: ${this.formatSize(totalSize)}`);
    console.log(`Large images (>500KB): ${unoptimizedImages}`);
    console.log('');
  }

  private async analyzeDependencies(): Promise<void> {
    console.log('📦 Analyzing dependencies...');

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    console.log(`Production dependencies: ${Object.keys(dependencies).length}`);
    console.log(`Development dependencies: ${Object.keys(devDependencies).length}`);

    // Analyze dependency sizes
    try {
      const nodeModulesSize = this.getDirectorySize('node_modules');
      console.log(`Node modules size: ${this.formatSize(nodeModulesSize)}`);
    } catch (error) {
      console.log('Could not analyze node_modules size');
    }

    // Check for outdated dependencies
    try {
      const { stdout } = await execAsync('npm outdated --json');
      const outdated = JSON.parse(stdout);
      const outdatedCount = Object.keys(outdated).length;
      console.log(`Outdated dependencies: ${outdatedCount}`);
    } catch (error) {
      console.log('All dependencies are up to date');
    }

    console.log('');
  }

  private getDirectorySize(dirPath: string): number {
    let totalSize = 0;
    
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(fullPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Directory not accessible
    }
    
    return totalSize;
  }

  private async generateRecommendations(): Promise<void> {
    console.log('💡 Performance recommendations...');

    const recommendations: string[] = [];

    // Bundle size recommendations
    if (this.metrics.bundleSize.total > 5 * 1024 * 1024) { // 5MB
      recommendations.push('Bundle size is large. Consider code splitting and lazy loading.');
    }

    if (this.metrics.bundleSize.js > 2 * 1024 * 1024) { // 2MB
      recommendations.push('JavaScript bundle is large. Consider tree shaking and dead code elimination.');
    }

    if (this.metrics.bundleSize.images > 1 * 1024 * 1024) { // 1MB
      recommendations.push('Image assets are large. Consider WebP format and image optimization.');
    }

    // Code quality recommendations
    const largeFiles = this.bundleAnalysis.filter(item => item.size > 100 * 1024); // 100KB
    if (largeFiles.length > 5) {
      recommendations.push('Multiple large files detected. Consider code splitting.');
    }

    // Asset recommendations
    const pngFiles = this.bundleAnalysis.filter(item => item.file.endsWith('.png'));
    if (pngFiles.length > 10) {
      recommendations.push('Many PNG files detected. Consider converting to WebP for better compression.');
    }

    if (recommendations.length === 0) {
      console.log('✅ No performance issues detected!');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log('');
  }

  private async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      metrics: this.metrics,
      bundleAnalysis: this.bundleAnalysis.slice(0, 20), // Top 20 files
      summary: {
        totalBundleSize: this.metrics.bundleSize.total,
        largestFiles: this.bundleAnalysis.slice(0, 5).map(item => ({
          file: item.file,
          size: item.size,
          percentage: item.percentage
        }))
      }
    };

    // Ensure reports directory exists
    const reportsDir = './performance-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Write JSON report
    fs.writeFileSync(
      path.join(reportsDir, 'performance-analysis.json'),
      JSON.stringify(report, null, 2)
    );

    // Write HTML report
    const htmlReport = this.generateHtmlReport(report);
    fs.writeFileSync(
      path.join(reportsDir, 'performance-analysis.html'),
      htmlReport
    );

    console.log(`📊 Performance report generated: ${reportsDir}/performance-analysis.html`);
  }

  private generateHtmlReport(report: any): string {
    const bundleData = report.bundleAnalysis.slice(0, 10);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Luna App Performance Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #495057; }
        .chart { margin: 20px 0; }
        .file-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
        .file-name { font-weight: bold; }
        .file-size { color: #666; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 5px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚡ Luna App Performance Analysis</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="metric-value">${this.formatSize(report.metrics.bundleSize.total)}</div>
            <div>Total Bundle Size</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.formatSize(report.metrics.bundleSize.js)}</div>
            <div>JavaScript</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.formatSize(report.metrics.bundleSize.css)}</div>
            <div>CSS</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.formatSize(report.metrics.bundleSize.images)}</div>
            <div>Images</div>
        </div>
    </div>

    <h2>Largest Files</h2>
    <div class="chart">
        ${bundleData.map((item: any) => `
            <div class="file-item">
                <span class="file-name">${item.file}</span>
                <span class="file-size">${this.formatSize(item.size)} (${item.percentage.toFixed(1)}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(item.percentage, 100)}%"></div>
            </div>
        `).join('')}
    </div>

    <h2>Bundle Breakdown</h2>
    <div class="metrics">
        <div class="metric">
            <div class="metric-value">${((report.metrics.bundleSize.js / report.metrics.bundleSize.total) * 100).toFixed(1)}%</div>
            <div>JavaScript</div>
        </div>
        <div class="metric">
            <div class="metric-value">${((report.metrics.bundleSize.css / report.metrics.bundleSize.total) * 100).toFixed(1)}%</div>
            <div>CSS</div>
        </div>
        <div class="metric">
            <div class="metric-value">${((report.metrics.bundleSize.images / report.metrics.bundleSize.total) * 100).toFixed(1)}%</div>
            <div>Images</div>
        </div>
        <div class="metric">
            <div class="metric-value">${((report.metrics.bundleSize.other / report.metrics.bundleSize.total) * 100).toFixed(1)}%</div>
            <div>Other</div>
        </div>
    </div>
</body>
</html>`;
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showSummary(): void {
    console.log('🎯 Performance Summary');
    console.log('======================');
    
    const duration = (Date.now() - this.startTime) / 1000;
    
    console.log(`Analysis duration: ${duration.toFixed(1)}s`);
    console.log(`Total bundle size: ${this.formatSize(this.metrics.bundleSize.total)}`);
    console.log(`Largest file: ${this.bundleAnalysis[0]?.file || 'N/A'} (${this.formatSize(this.bundleAnalysis[0]?.size || 0)})`);
    console.log(`Files analyzed: ${this.bundleAnalysis.length}`);
    
    // Performance grade
    const grade = this.calculateGrade();
    console.log(`Performance grade: ${grade}`);
  }

  private calculateGrade(): string {
    let score = 100;
    
    // Deduct points for large bundle
    if (this.metrics.bundleSize.total > 5 * 1024 * 1024) score -= 20;
    if (this.metrics.bundleSize.total > 10 * 1024 * 1024) score -= 20;
    
    // Deduct points for large individual files
    const largeFiles = this.bundleAnalysis.filter(item => item.size > 500 * 1024);
    score -= largeFiles.length * 5;
    
    // Deduct points for too many files
    if (this.bundleAnalysis.length > 100) score -= 10;
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.analyze().catch(console.error);
}

export { PerformanceAnalyzer, PerformanceMetrics, BundleAnalysis };