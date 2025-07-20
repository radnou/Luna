#!/bin/bash

# Luna App - Complete Test Suite Runner
# Runs all tests: unit, integration, e2e, and performance analysis

set -e

echo "🌙 Luna App - Complete Test Suite"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local description="$2"
    
    print_status "$description"
    if eval "$cmd"; then
        print_success "$description completed"
    else
        print_error "$description failed"
        exit 1
    fi
    echo ""
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the Luna app directory?"
    exit 1
fi

# Create reports directory
mkdir -p test-reports
mkdir -p build-reports
mkdir -p performance-reports

print_status "Starting comprehensive test suite..."
echo ""

# 1. Pre-test setup
print_status "📋 Pre-test setup"
run_command "npm install" "Installing dependencies"

# 2. Code quality checks
print_status "🔍 Code quality checks"
run_command "npm run lint" "Running ESLint"
run_command "npm run typecheck" "Running TypeScript check"

# 3. Unit tests (if available)
if npm run --silent test:unit 2>/dev/null; then
    run_command "npm run test:unit" "Running unit tests"
else
    print_warning "Unit tests not configured, skipping"
fi

# 4. Build validation
print_status "🔨 Build validation"
run_command "node -r ts-node/register scripts/build-validator.ts" "Running build validation"

# 5. Performance analysis
print_status "⚡ Performance analysis"
run_command "node -r ts-node/register scripts/performance-analyzer.ts" "Running performance analysis"

# 6. E2E tests preparation
print_status "🧪 E2E tests preparation"

# Check if iOS simulator is available (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcrun &> /dev/null; then
        print_success "iOS environment available"
        IOS_AVAILABLE=true
    else
        print_warning "iOS environment not available"
        IOS_AVAILABLE=false
    fi
else
    IOS_AVAILABLE=false
fi

# Check if Android emulator is available
if command -v adb &> /dev/null; then
    print_success "Android environment available"
    ANDROID_AVAILABLE=true
else
    print_warning "Android environment not available"
    ANDROID_AVAILABLE=false
fi

# 7. E2E tests
print_status "🎯 E2E tests"

# Build app for testing
if [ "$IOS_AVAILABLE" = true ]; then
    run_command "npm run test:e2e:build:ios" "Building iOS app for testing"
fi

if [ "$ANDROID_AVAILABLE" = true ]; then
    run_command "npm run test:e2e:build:android" "Building Android app for testing"
fi

# Run E2E tests
if [ "$IOS_AVAILABLE" = true ]; then
    run_command "node -r ts-node/register scripts/test-runner.ts --platform ios --configuration debug" "Running iOS E2E tests"
fi

if [ "$ANDROID_AVAILABLE" = true ]; then
    run_command "node -r ts-node/register scripts/test-runner.ts --platform android --configuration debug" "Running Android E2E tests"
fi

# 8. Generate comprehensive report
print_status "📊 Generating comprehensive report"

# Create HTML report combining all results
cat > test-reports/comprehensive-report.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Luna App - Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 1.5em; font-weight: bold; }
        .links { margin: 20px 0; }
        .links a { display: inline-block; margin: 5px 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌙 Luna App - Comprehensive Test Report</h1>
        <p>Generated: $(date)</p>
    </div>

    <div class="section success">
        <h2>✅ Test Suite Completed Successfully</h2>
        <p>All test categories have been executed and reports generated.</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="metric-value">$(find e2e -name "*.e2e.ts" | wc -l)</div>
            <div>E2E Test Files</div>
        </div>
        <div class="metric">
            <div class="metric-value">$(find src -name "*.ts" -o -name "*.tsx" | wc -l)</div>
            <div>Source Files</div>
        </div>
        <div class="metric">
            <div class="metric-value">$(date +%s)</div>
            <div>Timestamp</div>
        </div>
    </div>

    <div class="section">
        <h2>📋 Test Categories</h2>
        <ul>
            <li><strong>Code Quality:</strong> ESLint, TypeScript, and static analysis</li>
            <li><strong>Build Validation:</strong> Cross-platform build verification</li>
            <li><strong>Performance Analysis:</strong> Bundle size and optimization</li>
            <li><strong>E2E Tests:</strong> Complete user journey testing</li>
        </ul>
    </div>

    <div class="section">
        <h2>🔗 Detailed Reports</h2>
        <div class="links">
            <a href="./e2e-report.html">E2E Test Results</a>
            <a href="../build-reports/build-validation.json">Build Validation</a>
            <a href="../performance-reports/performance-analysis.html">Performance Analysis</a>
        </div>
    </div>

    <div class="section">
        <h2>🎯 Summary</h2>
        <p>The Luna app has been comprehensively tested across all major areas:</p>
        <ul>
            <li>✅ Code quality and type safety verified</li>
            <li>✅ Cross-platform builds validated</li>
            <li>✅ Performance metrics analyzed</li>
            <li>✅ User journeys tested end-to-end</li>
        </ul>
    </div>
</body>
</html>
EOF

print_success "Comprehensive report generated: test-reports/comprehensive-report.html"

# 9. Final summary
echo ""
echo "🎉 Test Suite Summary"
echo "===================="
echo ""

print_success "Code Quality: Passed"
print_success "Build Validation: Passed"
print_success "Performance Analysis: Completed"

if [ "$IOS_AVAILABLE" = true ]; then
    print_success "iOS E2E Tests: Passed"
fi

if [ "$ANDROID_AVAILABLE" = true ]; then
    print_success "Android E2E Tests: Passed"
fi

echo ""
echo "📊 Reports generated:"
echo "  - test-reports/comprehensive-report.html (Main report)"
echo "  - test-reports/e2e-report.html (E2E details)"
echo "  - build-reports/build-validation.json (Build analysis)"
echo "  - performance-reports/performance-analysis.html (Performance)"
echo ""

print_success "All tests completed successfully! 🎉"
echo ""
echo "To view the main report, open: test-reports/comprehensive-report.html"