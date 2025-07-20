#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface BuildResult {
  platform: 'ios' | 'android' | 'web';
  success: boolean;
  output?: string;
  error?: string;
  buildTime?: number;
}

class LunaBuildTester {
  private results: BuildResult[] = [];
  private startTime: number = Date.now();

  constructor(private projectDir: string) {}

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  private async execCommand(command: string, cwd: string = this.projectDir): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      try {
        const result = execSync(command, { 
          cwd, 
          encoding: 'utf8', 
          timeout: 300000, // 5 minutes timeout
          stdio: 'pipe' 
        });
        resolve({ stdout: result, stderr: '' });
      } catch (error: any) {
        reject({
          stdout: error.stdout || '',
          stderr: error.stderr || error.message || 'Unknown error'
        });
      }
    });
  }

  async validateDependencies(): Promise<boolean> {
    this.log('🔍 Validating project dependencies...');
    
    try {
      // Check if package.json exists
      const packageJsonPath = join(this.projectDir, 'package.json');
      if (!existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      // Check if node_modules exists
      const nodeModulesPath = join(this.projectDir, 'node_modules');
      if (!existsSync(nodeModulesPath)) {
        this.log('📦 Installing dependencies...');
        await this.execCommand('npm install');
      }

      // Validate Expo CLI
      await this.execCommand('npx expo --version');
      
      this.log('✅ Dependencies validated successfully');
      return true;
    } catch (error: any) {
      this.log(`❌ Dependency validation failed: ${error.stderr || error.message}`);
      return false;
    }
  }

  async runTypeScriptCheck(): Promise<boolean> {
    this.log('🔧 Running TypeScript checks...');
    
    try {
      await this.execCommand('npx tsc --noEmit --skipLibCheck');
      this.log('✅ TypeScript checks passed');
      return true;
    } catch (error: any) {
      this.log(`❌ TypeScript checks failed: ${error.stderr || error.message}`);
      return false;
    }
  }

  async buildForPlatform(platform: 'ios' | 'android' | 'web'): Promise<BuildResult> {
    const buildStart = Date.now();
    this.log(`🏗️  Building for ${platform}...`);
    
    const result: BuildResult = {
      platform,
      success: false,
      buildTime: 0
    };

    try {
      let buildCommand: string;
      let outputPath: string;

      switch (platform) {
        case 'web':
          buildCommand = 'npx expo export:web';
          outputPath = join(this.projectDir, 'dist');
          break;
        case 'ios':
          buildCommand = 'npx expo build:ios --type simulator';
          outputPath = join(this.projectDir, 'ios-build');
          break;
        case 'android':
          buildCommand = 'npx expo build:android --type apk';
          outputPath = join(this.projectDir, 'android-build');
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      const { stdout, stderr } = await this.execCommand(buildCommand);
      
      result.success = true;
      result.output = stdout;
      result.buildTime = Date.now() - buildStart;

      // Check if build output exists
      if (existsSync(outputPath)) {
        this.log(`✅ ${platform} build completed successfully in ${result.buildTime}ms`);
      } else {
        this.log(`⚠️  ${platform} build completed but output not found at ${outputPath}`);
      }

    } catch (error: any) {
      result.success = false;
      result.error = error.stderr || error.message;
      result.buildTime = Date.now() - buildStart;
      this.log(`❌ ${platform} build failed: ${result.error}`);
    }

    this.results.push(result);
    return result;
  }

  async validateBuildOutputs(): Promise<boolean> {
    this.log('🔍 Validating build outputs...');
    
    let allValid = true;
    
    for (const result of this.results) {
      if (!result.success) {
        allValid = false;
        continue;
      }

      const { platform } = result;
      let outputPath: string;
      let expectedFiles: string[];

      switch (platform) {
        case 'web':
          outputPath = join(this.projectDir, 'dist');
          expectedFiles = ['index.html', 'static'];
          break;
        case 'ios':
          outputPath = join(this.projectDir, 'ios-build');
          expectedFiles = ['Luna.app'];
          break;
        case 'android':
          outputPath = join(this.projectDir, 'android-build');
          expectedFiles = ['app-release.apk'];
          break;
        default:
          continue;
      }

      const exists = existsSync(outputPath);
      if (!exists) {
        this.log(`❌ Build output not found for ${platform}: ${outputPath}`);
        allValid = false;
      } else {
        this.log(`✅ Build output validated for ${platform}`);
      }
    }

    return allValid;
  }

  async generateBuildReport(): Promise<string> {
    const totalTime = Date.now() - this.startTime;
    const successfulBuilds = this.results.filter(r => r.success).length;
    const failedBuilds = this.results.filter(r => !r.success).length;

    const report = `
# Luna App Build Report
Generated: ${new Date().toISOString()}
Total Time: ${totalTime}ms

## Summary
- Total Builds: ${this.results.length}
- Successful: ${successfulBuilds}
- Failed: ${failedBuilds}
- Success Rate: ${((successfulBuilds / this.results.length) * 100).toFixed(1)}%

## Build Results
${this.results.map(result => `
### ${result.platform.toUpperCase()}
- Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
- Build Time: ${result.buildTime}ms
${result.error ? `- Error: ${result.error}` : ''}
${result.output ? `- Output: ${result.output.substring(0, 200)}...` : ''}
`).join('\n')}

## Next Steps
${failedBuilds > 0 ? `
⚠️  Some builds failed. Review the errors above and:
1. Check dependency versions
2. Verify Firebase configuration
3. Ensure all required certificates are available
4. Check platform-specific requirements
` : `
🎉 All builds successful! Ready for E2E testing.
`}
    `;

    const reportPath = join(this.projectDir, 'build-report.md');
    writeFileSync(reportPath, report);
    
    return report;
  }

  async runFullBuildCycle(): Promise<void> {
    this.log('🚀 Starting Luna app build and test cycle...');

    // 1. Validate dependencies
    const depsValid = await this.validateDependencies();
    if (!depsValid) {
      this.log('❌ Build cycle aborted due to dependency issues');
      return;
    }

    // 2. Run TypeScript checks
    const tsValid = await this.runTypeScriptCheck();
    if (!tsValid) {
      this.log('⚠️  TypeScript issues found, but continuing with build...');
    }

    // 3. Build for all platforms
    const platforms: ('ios' | 'android' | 'web')[] = ['web', 'android', 'ios'];
    
    for (const platform of platforms) {
      try {
        await this.buildForPlatform(platform);
      } catch (error) {
        this.log(`❌ Failed to build for ${platform}: ${error}`);
      }
    }

    // 4. Validate build outputs
    await this.validateBuildOutputs();

    // 5. Generate report
    const report = await this.generateBuildReport();
    this.log('📋 Build report generated');
    console.log(report);

    this.log('🏁 Build cycle completed');
  }
}

// Main execution
if (require.main === module) {
  const projectDir = process.cwd();
  const tester = new LunaBuildTester(projectDir);
  
  tester.runFullBuildCycle().catch(error => {
    console.error('Build cycle failed:', error);
    process.exit(1);
  });
}

export { LunaBuildTester };