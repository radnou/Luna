#!/usr/bin/env node

/**
 * Luna App E2E Test Runner
 * Automated test suite for comprehensive app testing
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  duration: number;
  failures: string[];
}

interface TestConfig {
  platform: 'ios' | 'android';
  configuration: 'debug' | 'release';
  device?: string;
  headless?: boolean;
  reportsDir?: string;
}

class TestRunner {
  private config: TestConfig;
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor(config: TestConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('🌙 Luna App E2E Test Suite');
    console.log(`Platform: ${this.config.platform}`);
    console.log(`Configuration: ${this.config.configuration}`);
    console.log('================================\n');

    this.startTime = Date.now();

    try {
      // 1. Build the app
      await this.buildApp();

      // 2. Run test suites
      await this.runTestSuites();

      // 3. Generate reports
      await this.generateReports();

      // 4. Show summary
      this.showSummary();

    } catch (error) {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    }
  }

  private async buildApp(): Promise<void> {
    console.log('🔨 Building app...');
    const buildCommand = this.getBuildCommand();
    
    try {
      const { stdout, stderr } = await execAsync(buildCommand, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      if (stderr && !stderr.includes('warning')) {
        console.error('Build stderr:', stderr);
      }

      console.log('✅ Build completed successfully\n');
    } catch (error) {
      console.error('❌ Build failed:', error);
      throw error;
    }
  }

  private async runTestSuites(): Promise<void> {
    const testSuites = [
      'onboarding.e2e.ts',
      'auth.e2e.ts',
      'journal.e2e.ts',
      'mood-tracking.e2e.ts',
      'ai-chat.e2e.ts',
      'profile.e2e.ts'
    ];

    console.log('🧪 Running test suites...\n');

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }
  }

  private async runTestSuite(suite: string): Promise<void> {
    console.log(`📋 Running ${suite}...`);
    const startTime = Date.now();

    try {
      const detoxCommand = this.getDetoxCommand(suite);
      const { stdout, stderr } = await execAsync(detoxCommand, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10
      });

      const result = this.parseTestOutput(stdout, suite);
      result.duration = Date.now() - startTime;
      this.results.push(result);

      if (result.failed > 0) {
        console.log(`❌ ${suite}: ${result.passed} passed, ${result.failed} failed`);
        result.failures.forEach(failure => console.log(`   - ${failure}`));
      } else {
        console.log(`✅ ${suite}: ${result.passed} passed`);
      }

    } catch (error: any) {
      console.error(`❌ ${suite} failed:`, error.message);
      this.results.push({
        suite,
        passed: 0,
        failed: 1,
        duration: Date.now() - startTime,
        failures: [error.message]
      });
    }
  }

  private getBuildCommand(): string {
    const platform = this.config.platform;
    const configuration = this.config.configuration;
    
    return `npm run test:e2e:build:${platform} -- --configuration ${platform}.${configuration}`;
  }

  private getDetoxCommand(suite: string): string {
    const platform = this.config.platform;
    const configuration = this.config.configuration;
    
    let command = `npx detox test e2e/${suite} --configuration ${platform}.sim.${configuration}`;
    
    if (this.config.headless) {
      command += ' --headless';
    }

    if (this.config.device) {
      command += ` --device-name "${this.config.device}"`;
    }

    return command;
  }

  private parseTestOutput(output: string, suite: string): TestResult {
    const result: TestResult = {
      suite,
      passed: 0,
      failed: 0,
      duration: 0,
      failures: []
    };

    // Parse Jest output
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('PASS')) {
        const match = line.match(/(\d+) passing/);
        if (match) {
          result.passed = parseInt(match[1]);
        }
      } else if (line.includes('FAIL')) {
        const match = line.match(/(\d+) failing/);
        if (match) {
          result.failed = parseInt(match[1]);
        }
      } else if (line.includes('✓') || line.includes('✗')) {
        if (line.includes('✗')) {
          result.failures.push(line.trim());
        }
      }
    }

    return result;
  }

  private async generateReports(): Promise<void> {
    console.log('\n📊 Generating reports...');

    const reportsDir = this.config.reportsDir || './test-reports';
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReport = {
      platform: this.config.platform,
      configuration: this.config.configuration,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: this.getSummary()
    };

    fs.writeFileSync(
      path.join(reportsDir, 'test-results.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(jsonReport);
    fs.writeFileSync(
      path.join(reportsDir, 'test-results.html'),
      htmlReport
    );

    console.log(`✅ Reports generated in ${reportsDir}`);
  }

  private generateHtmlReport(report: any): string {
    const totalTests = report.results.reduce((sum: number, r: TestResult) => sum + r.passed + r.failed, 0);
    const totalPassed = report.results.reduce((sum: number, r: TestResult) => sum + r.passed, 0);
    const totalFailed = report.results.reduce((sum: number, r: TestResult) => sum + r.failed, 0);
    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Luna App E2E Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .suite { margin: 20px 0; padding: 15px; border: 1px solid #dee2e6; border-radius: 8px; }
        .suite-header { font-weight: bold; margin-bottom: 10px; }
        .failure { color: #dc3545; margin-left: 20px; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌙 Luna App E2E Test Results</h1>
        <p>Platform: ${report.platform} | Configuration: ${report.configuration}</p>
        <p class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="stat">
            <div class="stat-value">${totalTests}</div>
            <div>Total Tests</div>
        </div>
        <div class="stat">
            <div class="stat-value passed">${totalPassed}</div>
            <div>Passed</div>
        </div>
        <div class="stat">
            <div class="stat-value failed">${totalFailed}</div>
            <div>Failed</div>
        </div>
        <div class="stat">
            <div class="stat-value">${successRate}%</div>
            <div>Success Rate</div>
        </div>
    </div>

    <h2>Test Suites</h2>
    ${report.results.map((result: TestResult) => `
        <div class="suite">
            <div class="suite-header">
                ${result.suite} 
                <span class="passed">✅ ${result.passed}</span>
                ${result.failed > 0 ? `<span class="failed">❌ ${result.failed}</span>` : ''}
                (${(result.duration / 1000).toFixed(1)}s)
            </div>
            ${result.failures.map(failure => `<div class="failure">${failure}</div>`).join('')}
        </div>
    `).join('')}

    <p><strong>Total Duration:</strong> ${(report.duration / 1000).toFixed(1)}s</p>
</body>
</html>`;
  }

  private getSummary() {
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';

    return {
      totalTests,
      totalPassed,
      totalFailed,
      successRate: `${successRate}%`,
      duration: Date.now() - this.startTime
    };
  }

  private showSummary(): void {
    console.log('\n🎯 Test Summary');
    console.log('================');
    
    const summary = this.getSummary();
    
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.totalPassed}`);
    console.log(`❌ Failed: ${summary.totalFailed}`);
    console.log(`Success Rate: ${summary.successRate}`);
    console.log(`Duration: ${(summary.duration / 1000).toFixed(1)}s`);

    if (summary.totalFailed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.forEach(result => {
        if (result.failed > 0) {
          console.log(`  ${result.suite}: ${result.failed} failed`);
          result.failures.forEach(failure => {
            console.log(`    - ${failure}`);
          });
        }
      });
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: TestConfig = {
    platform: 'ios',
    configuration: 'debug',
    headless: false
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--platform') {
      config.platform = args[i + 1] as 'ios' | 'android';
      i++;
    } else if (arg === '--configuration') {
      config.configuration = args[i + 1] as 'debug' | 'release';
      i++;
    } else if (arg === '--device') {
      config.device = args[i + 1];
      i++;
    } else if (arg === '--headless') {
      config.headless = true;
    } else if (arg === '--reports-dir') {
      config.reportsDir = args[i + 1];
      i++;
    }
  }

  const runner = new TestRunner(config);
  runner.run().catch(console.error);
}

export { TestRunner, TestConfig, TestResult };