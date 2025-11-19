#!/bin/bash
set -e

echo "========================================="
echo "Starting backend deployment at $(date)"
echo "========================================="

cd /home/django/holisticmatch

echo "→ Pulling latest code from GitHub..."
git fetch origin main
git reset --hard origin/main

echo "→ Activating virtual environment..."
source backend/venv/bin/activate

echo "→ Installing dependencies..."
cd backend
pip install -r requirements.txt --quiet

echo "→ Running database migrations..."
python manage.py migrate --noinput

echo "→ Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "→ Restarting Gunicorn..."
sudo systemctl restart gunicorn
sleep 3

if sudo systemctl is-active --quiet gunicorn; then
  echo "✓ Gunicorn is active and running"
else
  echo "✗ Gunicorn failed to start"
  sudo systemctl status gunicorn
  exit 1
fi

echo "→ Running API health check..."
curl -f http://localhost/api/v1/professionals/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✓ API health check passed"
else
  echo "⚠ API health check failed (non-blocking)"
fi

echo "========================================="
echo "Backend deployment completed at $(date)"
echo "========================================="
