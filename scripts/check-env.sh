#!/bin/bash

# Environment check script

echo "🔍 Checking Buzaglo Engine environment..."
echo ""

errors=0

# Check Node.js
echo -n "Node.js: "
if command -v node > /dev/null 2>&1; then
    version=$(node -v)
    echo "✅ $version"
else
    echo "❌ Not installed"
    errors=$((errors + 1))
fi

# Check npm
echo -n "npm: "
if command -v npm > /dev/null 2>&1; then
    version=$(npm -v)
    echo "✅ v$version"
else
    echo "❌ Not installed"
    errors=$((errors + 1))
fi

# Check PostgreSQL
echo -n "PostgreSQL: "
if command -v psql > /dev/null 2>&1; then
    version=$(psql --version | awk '{print $3}')
    echo "✅ $version"
else
    echo "❌ Not installed"
    errors=$((errors + 1))
fi

# Check if PostgreSQL is running
echo -n "PostgreSQL running: "
if pg_isready > /dev/null 2>&1; then
    echo "✅ Yes"
else
    echo "⚠️  No"
    errors=$((errors + 1))
fi

# Check database exists
echo -n "Database 'buzaglo': "
if psql -lqt | cut -d \| -f 1 | grep -qw buzaglo; then
    echo "✅ Exists"
else
    echo "❌ Not found"
    errors=$((errors + 1))
fi

# Check .env file
echo -n ".env file: "
if [ -f ".env" ]; then
    echo "✅ Exists"
else
    echo "❌ Not found"
    errors=$((errors + 1))
fi

# Check GEMINI_API_KEY
echo -n "GEMINI_API_KEY: "
if [ -f ".env" ] && grep -q "GEMINI_API_KEY=.*[^=]" .env; then
    echo "✅ Set"
else
    echo "❌ Not set"
    errors=$((errors + 1))
fi

# Check node_modules
echo -n "Dependencies installed: "
if [ -d "node_modules" ] && [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
    echo "✅ Yes"
else
    echo "❌ Run 'npm install'"
    errors=$((errors + 1))
fi

echo ""
if [ $errors -eq 0 ]; then
    echo "✅ All checks passed! You're ready to run 'npm run dev'"
else
    echo "⚠️  Found $errors issue(s). Please fix them before starting."
    echo ""
    echo "Quick fixes:"
    echo "  - Install Node.js: https://nodejs.org"
    echo "  - Install PostgreSQL: https://www.postgresql.org/download/"
    echo "  - Create database: createdb buzaglo"
    echo "  - Copy .env: cp .env.example .env"
    echo "  - Install deps: npm install"
fi

