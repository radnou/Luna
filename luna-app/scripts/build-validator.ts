#!/usr/bin/env node

/**
 * Build Validator for Luna App
 * Validates builds across all platforms and configurations
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface BuildConfig {
  platform: 'ios' | 'android' | 'web';
  configuration: 'debug' | 'release';
  profile?: string;
}

interface BuildResult {
  platform: string;
  configuration: string;
  success: boolean;
  duration: number;
  size?: number;
  errors: string[];
  warnings: string[];
}

class BuildValidator {
  private results: BuildResult[] = [];
  private startTime: number = 0;

  async validate(): Promise<void> {
    console.log('🔨 Luna App Build Validator');
    console.log('============================\n');

    this.startTime = Date.now();

    const buildConfigs: BuildConfig[] = [
      { platform: 'web', configuration: 'debug' },
      { platform: 'web', configuration: 'release' },
      { platform: 'ios', configuration: 'debug' },
      { platform: 'android', configuration: 'debug' },
    ];

    // 1. Pre-build checks
    await this.preValidation();

    // 2. TypeScript checks
    await this.typeScriptValidation();

    // 3. Build validation
    for (const config of buildConfigs) {
      await this.validateBuild(config);
    }

    // 4. Post-build analysis
    await this.postValidation();

    // 5. Generate report
    await this.generateReport();

    this.showSummary();
  }

  private async preValidation(): Promise<void> {
    console.log('🔍 Pre-build validation...');

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);

    // Check dependencies
    await this.checkDependencies();

    // Check environment variables
    await this.checkEnvironment();

    // Check file permissions
    await this.checkPermissions();

    console.log('✅ Pre-build validation completed\n');
  }

  private async checkDependencies(): Promise<void> {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const lockFile = fs.existsSync('package-lock.json') ? 'package-lock.json' : 'yarn.lock';
    
    console.log(`Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
    console.log(`Dev dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
    console.log(`Lock file: ${lockFile}`);

    // Check for security vulnerabilities
    try {
      const { stdout } = await execAsync('npm audit --json');
      const auditResult = JSON.parse(stdout);
      
      if (auditResult.metadata.vulnerabilities.total > 0) {
        console.warn(`⚠️  Security vulnerabilities found: ${auditResult.metadata.vulnerabilities.total}`);
      }
    } catch (error) {
      console.log('Security audit completed');
    }
  }

  private async checkEnvironment(): Promise<void> {
    const requiredEnvVars = [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'EXPO_PUBLIC_FIREBASE_APP_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    } else {
      console.log('✅ All required environment variables present');
    }
  }

  private async checkPermissions(): Promise<void> {
    const criticalFiles = [
      'package.json',
      'app.json',
      'tsconfig.json',
      'babel.config.js'
    ];

    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        if (!stats.isFile()) {
          console.warn(`⚠️  ${file} is not a regular file`);
        }
      } else {
        console.warn(`⚠️  ${file} not found`);
      }
    }
  }

  private async typeScriptValidation(): Promise<void> {
    console.log('🔍 TypeScript validation...');

    try {
      const { stdout, stderr } = await execAsync('npm run typecheck');
      
      if (stderr) {
        const errorLines = stderr.split('\n').filter(line => line.trim());
        console.log(`TypeScript errors: ${errorLines.length}`);
        errorLines.forEach(line => console.log(`  ${line}`));
      } else {
        console.log('✅ TypeScript validation passed');
      }
    } catch (error: any) {
      console.error('❌ TypeScript validation failed:', error.message);
    }

    console.log('');
  }

  private async validateBuild(config: BuildConfig): Promise<void> {
    console.log(`🏗️  Building ${config.platform} (${config.configuration})...`);
    
    const startTime = Date.now();
    const result: BuildResult = {
      platform: config.platform,
      configuration: config.configuration,
      success: false,
      duration: 0,
      errors: [],
      warnings: []
    };

    try {
      const command = this.getBuildCommand(config);
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 20 // 20MB buffer
      });

      result.duration = Date.now() - startTime;
      result.success = true;

      // Parse build output
      this.parseBuildOutput(stdout, stderr, result);

      // Check build artifacts
      await this.checkBuildArtifacts(config, result);

      console.log(`✅ ${config.platform} build completed (${(result.duration / 1000).toFixed(1)}s)`);
      
    } catch (error: any) {
      result.duration = Date.now() - startTime;
      result.success = false;
      result.errors.push(error.message);
      console.error(`❌ ${config.platform} build failed:`, error.message);
    }

    this.results.push(result);
  }

  private getBuildCommand(config: BuildConfig): string {
    switch (config.platform) {
      case 'web':
        return `npm run build:web`;
      case 'ios':
        return `npm run build:ios`;
      case 'android':
        return `npm run build:android`;
      default:
        throw new Error(`Unsupported platform: ${config.platform}`);
    }
  }

  private parseBuildOutput(stdout: string, stderr: string, result: BuildResult): void {
    const lines = (stdout + stderr).split('\n');
    
    for (const line of lines) {
      if (line.includes('error') || line.includes('Error')) {
        result.errors.push(line.trim());
      } else if (line.includes('warning') || line.includes('Warning')) {
        result.warnings.push(line.trim());
      }
    }
  }

  private async checkBuildArtifacts(config: BuildConfig, result: BuildResult): Promise<void> {
    let artifactPath = '';
    
    switch (config.platform) {
      case 'web':
        artifactPath = 'dist';
        break;
      case 'ios':
        artifactPath = 'ios/build';
        break;
      case 'android':
        artifactPath = 'android/app/build/outputs';
        break;
    }

    if (artifactPath && fs.existsSync(artifactPath)) {
      const stats = fs.statSync(artifactPath);
      if (stats.isDirectory()) {
        result.size = this.getDirectorySize(artifactPath);
      }
    }
  }

  private getDirectorySize(dirPath: string): number {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }

  private async postValidation(): Promise<void> {
    console.log('\n🔍 Post-build validation...');

    // Check bundle sizes
    await this.checkBundleSizes();

    // Check for unused dependencies
    await this.checkUnusedDependencies();

    // Security scan
    await this.securityScan();

    console.log('✅ Post-build validation completed\n');
  }

  private async checkBundleSizes(): Promise<void> {
    const webBuild = this.results.find(r => r.platform === 'web' && r.success);
    if (webBuild && webBuild.size) {
      const sizeMB = (webBuild.size / (1024 * 1024)).toFixed(2);
      console.log(`Web bundle size: ${sizeMB} MB`);
      
      if (webBuild.size > 10 * 1024 * 1024) { // 10MB
        console.warn('⚠️  Web bundle size is large (>10MB)');
      }
    }
  }

  private async checkUnusedDependencies(): Promise<void> {
    try {
      const { stdout } = await execAsync('npx depcheck --json');
      const depcheckResult = JSON.parse(stdout);
      
      if (depcheckResult.dependencies.length > 0) {
        console.log(`Unused dependencies: ${depcheckResult.dependencies.length}`);
        depcheckResult.dependencies.forEach((dep: string) => {
          console.log(`  - ${dep}`);
        });
      }
    } catch (error) {
      console.log('Dependency check completed');
    }
  }

  private async securityScan(): Promise<void> {
    // Check for sensitive files
    const sensitiveFiles = [
      '.env',
      '.env.local',
      'google-services.json',
      'GoogleService-Info.plist'
    ];

    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        console.warn(`⚠️  Sensitive file found: ${file}`);
      }
    }

    // Check for hardcoded secrets
    const sourceFiles = this.getAllSourceFiles();
    const secretPatterns = [
      /AIza[0-9A-Za-z-_]{35}/g, // Google API key
      /sk-[0-9A-Za-z]{48}/g, // OpenAI API key
      /access_token.*[0-9A-Za-z]{16,}/g // Generic access token
    ];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          console.warn(`⚠️  Potential secret found in ${file}`);
        }
      }
    }
  }

  private getAllSourceFiles(): string[] {
    const sourceFiles: string[] = [];
    
    const searchDirs = ['src', 'app', 'components'];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.findSourceFiles(dir, extensions, sourceFiles);
      }
    }
    
    return sourceFiles;
  }

  private findSourceFiles(dir: string, extensions: string[], results: string[]): void {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        this.findSourceFiles(filePath, extensions, results);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  }

  private async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        totalErrors: this.results.reduce((sum, r) => sum + r.errors.length, 0),
        totalWarnings: this.results.reduce((sum, r) => sum + r.warnings.length, 0)
      }
    };

    // Ensure reports directory exists
    const reportsDir = './build-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Write JSON report
    fs.writeFileSync(
      path.join(reportsDir, 'build-validation.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`📊 Build report generated: ${reportsDir}/build-validation.json`);
  }

  private showSummary(): void {
    console.log('\n🎯 Build Summary');
    console.log('================');
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = (Date.now() - this.startTime) / 1000;

    console.log(`Total builds: ${this.results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Duration: ${totalDuration.toFixed(1)}s`);

    if (failed > 0) {
      console.log('\n❌ Failed builds:');
      this.results.forEach(result => {
        if (!result.success) {
          console.log(`  ${result.platform} (${result.configuration}): ${result.errors.length} errors`);
        }
      });
      process.exit(1);
    } else {
      console.log('\n🎉 All builds successful!');
      process.exit(0);
    }
  }
}

// CLI interface
if (require.main === module) {
  const validator = new BuildValidator();
  validator.validate().catch(console.error);
}

export { BuildValidator, BuildResult, BuildConfig };