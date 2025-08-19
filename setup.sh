#!/bin/bash

# Setup script for git-backlog pre-commit hooks
# This script installs dependencies and configures pre-commit hooks

echo "🚀 Setting up git-backlog project with pre-commit hooks..."

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the git-backlog directory."
    exit 1
fi

print_status "Installing npm dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Setting up Husky git hooks..."
if npx husky install; then
    print_success "Husky installed successfully"
else
    print_warning "Husky installation failed, using manual git hooks"
fi

# Make sure scripts are executable
print_status "Making scripts executable..."
chmod +x scripts/database.js
chmod +x scripts/sast.js
chmod +x .git/hooks/pre-commit
if [ -f ".husky/pre-commit" ]; then
    chmod +x .husky/pre-commit
fi

print_success "Scripts are now executable"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file from example..."
    cp .env.example .env
    print_success ".env file created"
    print_warning "Please update .env file with your actual configuration"
else
    print_warning ".env file already exists"
fi

# Test the setup
print_status "Testing the setup..."

echo ""
echo "Running a quick test of each component:"

print_status "Testing linter..."
if npm run lint > /dev/null 2>&1; then
    print_success "Linter works"
else
    print_warning "Linter has some issues (this is normal for initial setup)"
fi

print_status "Testing unit tests..."
if npm run test:unit > /dev/null 2>&1; then
    print_success "Unit tests work"
else
    print_warning "Unit tests need attention"
fi

print_status "Testing database script..."
if npm run db:migrate > /dev/null 2>&1; then
    print_success "Database script works"
else
    print_warning "Database script needs attention"
fi

print_status "Testing SAST scanner..."
if npm run sast > /dev/null 2>&1; then
    print_success "SAST scanner works"
else
    print_warning "SAST scanner found issues (this might be expected)"
fi

print_status "Testing integration tests..."
if npm run test:integration > /dev/null 2>&1; then
    print_success "Integration tests work"
else
    print_warning "Integration tests need attention"
fi

echo ""
print_success "Setup completed! 🎉"
echo ""
echo "📋 What's configured:"
echo "   ✅ ESLint for code linting"
echo "   ✅ Prettier for code formatting"
echo "   ✅ Jest for unit and integration testing"
echo "   ✅ Coverage reporting with thresholds"
echo "   ✅ Database migration script"
echo "   ✅ SAST security scanning"
echo "   ✅ Pre-commit hooks (git + husky)"
echo ""
echo "🔧 Available commands:"
echo "   npm run lint         - Run linter"
echo "   npm run lint:fix     - Fix linting issues"
echo "   npm run test         - Run tests with coverage"
echo "   npm run test:unit    - Run unit tests only"
echo "   npm run test:integration - Run integration tests only"
echo "   npm run db:migrate   - Run database migrations"
echo "   npm run sast         - Run security scan"
echo "   npm run precommit    - Run full pre-commit pipeline"
echo ""
echo "🚀 Next steps:"
echo "   1. Update .env file with your configuration"
echo "   2. Make your first commit to test the pre-commit hooks"
echo "   3. Check the generated coverage report in coverage/ directory"
echo ""
print_success "Happy coding! 🚀"
