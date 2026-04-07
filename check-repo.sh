#!/bin/bash

echo "🔍 Checking Virtual Cosmos Repository..."
echo "========================================"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Run 'git init' first."
    exit 1
fi

echo "✅ Git repository detected"
echo ""

# Check for required files
echo "📋 Checking Required Files:"
echo "----------------------------"

required_files=(
    "README.md"
    "LICENSE"
    ".gitignore"
    "backend/package.json"
    "backend/server.js"
    "backend/.env.example"
    "frontend/package.json"
    "frontend/src/App.jsx"
    "frontend/.env.example"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
    fi
done

echo ""
echo "🚫 Checking for Files That Should NOT Be Pushed:"
echo "------------------------------------------------"

unwanted_files=(
    "backend/.env"
    "frontend/.env"
    "backend/node_modules"
    "frontend/node_modules"
    "frontend/dist"
    ".DS_Store"
)

for file in "${unwanted_files[@]}"; do
    if [ -e "$file" ]; then
        echo "⚠️  FOUND (should not push): $file"
    else
        echo "✅ Not present: $file"
    fi
done

echo ""
echo "📊 Repository Statistics:"
echo "------------------------"
echo "Total files tracked: $(git ls-files | wc -l)"
echo "Total commits: $(git rev-list --count HEAD 2>/dev/null || echo '0')"
echo "Current branch: $(git branch --show-current)"
echo ""

# Check if .gitignore is working
echo "🔍 Checking .gitignore effectiveness:"
echo "------------------------------------"
if git ls-files | grep -q "node_modules"; then
    echo "❌ WARNING: node_modules is being tracked!"
else
    echo "✅ node_modules is properly ignored"
fi

if git ls-files | grep -q "\.env$"; then
    echo "❌ WARNING: .env files are being tracked!"
else
    echo "✅ .env files are properly ignored"
fi

echo ""
echo "📁 Files currently tracked by git:"
echo "----------------------------------"
git ls-files | head -20
echo "... (showing first 20 files)"
echo ""

echo "✅ Check complete!"
