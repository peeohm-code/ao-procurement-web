#!/bin/bash
echo "=== AO Procurement Web App — Push Phase 1 ==="
echo ""

# Add all changed files
git add package.json package-lock.json \
  src/app/\(app\)/dashboard/page.tsx \
  src/app/\(app\)/po/page.tsx \
  src/app/globals.css \
  src/components/EmptyState.tsx \
  src/components/OnboardingChecklist.tsx

echo "Files staged:"
git diff --cached --stat
echo ""

# Commit
git commit -m "Phase 1: Dashboard upgrade + Empty States + Onboarding Checklist

- Enhanced Dashboard: 6 stat cards with gradient icons, hover shadows
- Added monthly spending BarChart and PO status DonutChart (recharts)
- New EmptyState component with illustrations and CTA buttons
- New OnboardingChecklist component for new user guidance
- Improved PO page empty state with better UX
- UI polish: rounded-2xl cards, transitions, better spacing
- Installed recharts for data visualization

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo ""
echo "Pushing to GitHub..."
git push origin main

echo ""
echo "=== Done! Vercel will auto-deploy in 1-2 minutes ==="
echo "Check: https://ao-procurement-web.vercel.app"
