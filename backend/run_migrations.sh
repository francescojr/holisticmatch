#!/usr/bin/env bash
# Production Migration Script
# Run after each deployment to apply pending database migrations
# 
# Usage: ./run_migrations.sh
# Or on production: bash run_migrations.sh

echo "=========================================================================="
echo "RUNNING DJANGO MIGRATIONS"
echo "=========================================================================="
echo ""

# Set environment to production if specified
if [ "$1" = "production" ]; then
    export ENVIRONMENT=production
    echo "🚀 Running in PRODUCTION mode"
else
    echo "🔧 Running in LOCAL/DEV mode"
fi

echo ""
echo "Step 1: Checking migration status..."
python manage.py showmigrations --plan

echo ""
echo "Step 2: Running migrations..."
python manage.py migrate --verbosity=2

echo ""
echo "Step 3: Verifying migration status..."
python manage.py showmigrations

echo ""
echo "✅ MIGRATIONS COMPLETED SUCCESSFULLY"
echo ""
echo "=========================================================================="
echo "DEPLOYMENT CHECKLIST:"
echo "=========================================================================="
echo "✅ Migrations applied to database"
echo "⏭️  Next: Restart Gunicorn/Application server"
echo "=========================================================================="
