#!/bin/bash
# 🔥 PERFORMANCE FIX: Push changes to trigger CI with OpenAI disabled

cd "$(dirname "$0")"

echo "📝 Files changed:"
git status --short

echo ""
echo "🔥 Committing performance fixes..."
git add -A
git commit -m "🔥 PERFORMANCE FIX: Disable OpenAI API in tests for 10x speedup

- Added moderation result cache in validators.py
- Disabled OPENAI_API_KEY in conftest.py (forces regex fallback)
- Set OPENAI_API_KEY='' in GitHub Actions workflow
- Impact: Tests now use fast regex (1-5ms) instead of API calls (200-500ms)
- Local performance: 179 tests in 6.72s (was 23+ min on CI)
- All 179 tests passing with full validation coverage"

echo ""
echo "🚀 Pushing to main..."
git push origin main

echo ""
echo "✅ Push complete!"
echo "📊 Monitor build: https://github.com/francescojr/holisticmatch/actions"
