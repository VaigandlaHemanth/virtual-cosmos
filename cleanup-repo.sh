#!/bin/bash

echo "🧹 Cleaning Up Virtual Cosmos Repository..."
echo "==========================================="
echo ""

# Function to remove file from git if tracked
remove_if_tracked() {
    if git ls-files --error-unmatch "$1" 2>/dev/null; then
        echo "🗑️  Removing $1 from git..."
        git rm -r --cached "$1"
    fi
}

# Remove node_modules if accidentally tracked
echo "Checking for node_modules..."
remove_if_tracked "backend/node_modules"
remove_if_tracked "frontend/node_modules"
remove_if_tracked "node_modules"

# Remove .env files if accidentally tracked
echo "Checking for .env files..."
remove_if_tracked "backend/.env"
remove_if_tracked "frontend/.env"
remove_if_tracked ".env"

# Remove dist/build folders if tracked
echo "Checking for build outputs..."
remove_if_tracked "frontend/dist"
remove_if_tracked "frontend/build"
remove_if_tracked "backend/dist"
remove_if_tracked "backend/build"

# Remove log files if tracked
echo "Checking for log files..."
git ls-files | grep "\.log$" | while read file; do
    remove_if_tracked "$file"
done

# Remove OS files
echo "Checking for OS files..."
remove_if_tracked ".DS_Store"
remove_if_tracked "Thumbs.db"

# Remove package-lock.json if you want (optional)
echo ""
read -p "Remove package-lock.json files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    remove_if_tracked "backend/package-lock.json"
    remove_if_tracked "frontend/package-lock.json"
fi

# Remove unnecessary documentation files
echo ""
echo "Checking for unnecessary documentation..."
unnecessary_docs=(
    "FIXES_APPLIED_V2.md"
    "PROJECT_SUMMARY.md"
    "DOCUMENTATION_INDEX.md"
    "FILES_TO_PUSH.md"
    "GITHUB_PUSH_GUIDE.md"
    "check-repo.sh"
    "cleanup-repo.sh"
)

for doc in "${unnecessary_docs[@]}"; do
    if [ -f "$doc" ]; then
        read -p "Remove $doc? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            remove_if_tracked "$doc"
            rm -f "$doc"
        fi
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Commit changes: git commit -m 'Clean up repository'"
echo "3. Push to GitHub: git push origin main"
