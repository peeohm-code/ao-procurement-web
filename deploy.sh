#!/bin/bash
# AO Procurement Web - Deploy Script
# Run this from the ao-procurement-web folder

set -e

echo "🚀 AO Procurement Web - Deploy to GitHub"
echo "========================================="

# Step 1: Remove corrupted .git
echo "1. Removing old .git directory..."
rm -rf .git
echo "   ✅ Done"

# Step 2: Init fresh repo
echo "2. Initializing fresh git repo..."
git init -b main
echo "   ✅ Done"

# Step 3: Add files (exclude .env.local)
echo "3. Adding files..."
git add -A
git reset HEAD .env.local 2>/dev/null || true
echo "   ✅ Done"

# Step 4: Commit
echo "4. Creating commit..."
git commit -m "Initial commit: AO Construction Procurement Web App

Next.js 14 + Supabase Auth + Google OAuth
- Dashboard, PO management, project overview
- Role-based access (owner/procurement/manager/viewer)
- AO Construction brand theme"
echo "   ✅ Done"

# Step 5: Push to GitHub
echo "5. Pushing to GitHub..."
git remote add origin https://github.com/peeohm-code/ao-procurement-web.git
git push -u origin main
echo "   ✅ Done"

echo ""
echo "========================================="
echo "🎉 Code pushed to GitHub successfully!"
echo "Repository: https://github.com/peeohm-code/ao-procurement-web"
