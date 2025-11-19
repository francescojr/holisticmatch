# 🌐 Domain Setup Status - hollisticmatch.online

**Last Check**: November 19, 2025
**Status**: ⏳ Awaiting DNS Propagation

---

## ✅ Completed Steps

### 1. Domain Configuration
- [x] Domain purchased: hollisticmatch.online
- [x] DNS A Record configured: @ → 44.197.112.222

### 2. EC2 Infrastructure Ready
- [x] Certbot installed: `certbot 2.9.0-1`
- [x] python3-certbot-nginx installed
- [x] UFW firewall configured:
  - Port 22 (SSH) ✅
  - Port 80 (HTTP) ✅
  - Port 443 (HTTPS) ✅
- [x] Nginx running and active

### 3. Django Backend Configuration
- [x] `settings.py` updated with:
  ```python
  ALLOWED_HOSTS = ['hollisticmatch.online', '44.197.112.222', 'localhost', '127.0.0.1']
  CORS_ALLOWED_ORIGINS = ['https://holisticmatch.vercel.app', 'https://hollisticmatch.online']
  CSRF_TRUSTED_ORIGINS = ['https://holisticmatch.vercel.app', 'https://hollisticmatch.online']
  ```
- [x] Changes committed and deployed via webhook
- [x] Gunicorn restarted with new configuration

### 4. Nginx SSL Configuration Prepared
- [x] Configuration file created: `nginx-hollisticmatch-ssl.conf`
- [x] Includes:
  - HTTP → HTTPS redirect
  - SSL certificate paths (Let's Encrypt)
  - Unix socket proxy to Gunicorn
  - CORS headers for Vercel
  - 100MB upload limit
  - Webhook endpoint preserved

---

## ⏳ Pending (Awaiting DNS)

### DNS Propagation Check
```powershell
# Windows PowerShell
Resolve-DnsName hollisticmatch.online

# From EC2
ssh -i "hollistickeypair.pem" ubuntu@44.197.112.222 "nslookup hollisticmatch.online 8.8.8.8"
```

**Expected Result**: 
```
Name:    hollisticmatch.online
Address: 44.197.112.222
```

**Current Result**: `NXDOMAIN` (domain not found - normal during propagation)

**Typical Propagation Time**: 5 minutes to 48 hours (usually under 1 hour)

---

## 🚀 Next Steps (After DNS Propagates)

### Step 1: Verify DNS Resolution
```bash
ssh -i "hollistickeypair.pem" ubuntu@44.197.112.222
nslookup hollisticmatch.online 8.8.8.8
```

### Step 2: Generate Let's Encrypt Certificate
```bash
sudo certbot --nginx -d hollisticmatch.online
```

**What to expect**:
- Certbot will ask for email (for renewal notifications)
- Agree to Terms of Service
- Choose whether to redirect HTTP → HTTPS (YES)
- Certificate valid for 90 days, auto-renewal configured

### Step 3: Apply Nginx Configuration
```bash
# Copy prepared config
scp -i "hollistickeypair.pem" nginx-hollisticmatch-ssl.conf ubuntu@44.197.112.222:/tmp/

# Apply config
ssh -i "hollistickeypair.pem" ubuntu@44.197.112.222
sudo cp /tmp/nginx-hollisticmatch-ssl.conf /etc/nginx/sites-available/hollisticmatch
sudo ln -sf /etc/nginx/sites-available/hollisticmatch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Test Backend HTTPS
```bash
# From your machine
curl -I https://hollisticmatch.online/api/v1/professionals/

# Expected: HTTP/2 200 OK
```

**Browser test**: https://hollisticmatch.online/api/v1/professionals/
- Should see JSON response
- Green padlock (valid SSL)
- No certificate warnings

### Step 5: Update Frontend (Vercel)

**Option A - Environment Variable** (Recommended):
1. Go to Vercel Project → Settings → Environment Variables
2. Add: `VITE_API_BASE_URL=https://hollisticmatch.online/api/v1`
3. Redeploy frontend

**Option B - Code Change**:
Update `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hollisticmatch.online/api/v1';
```

### Step 6: End-to-End Test
1. Open https://holisticmatch.vercel.app
2. Browse professional listings
3. Open DevTools → Network
4. Verify:
   - ✅ All API calls to `hollisticmatch.online`
   - ✅ Status 200 OK
   - ✅ No CORS errors
   - ✅ No Mixed Content warnings
   - ✅ Green padlock on all requests

---

## 🔍 Troubleshooting

### DNS Not Propagating?
```bash
# Check DNS from different providers
nslookup hollisticmatch.online 8.8.8.8        # Google DNS
nslookup hollisticmatch.online 1.1.1.1        # Cloudflare DNS
nslookup hollisticmatch.online 208.67.222.222 # OpenDNS
```

### Certbot Fails?
```bash
# Check Nginx config first
sudo nginx -t

# Ensure ports 80/443 are accessible
sudo ufw status
sudo systemctl status nginx

# Check DNS resolution from EC2
nslookup hollisticmatch.online
```

### HTTPS Not Working After Certbot?
```bash
# Check certificate files exist
sudo ls -la /etc/letsencrypt/live/hollisticmatch.online/

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Verify Gunicorn socket
sudo systemctl status gunicorn
ls -la /home/django/holisticmatch/backend/gunicorn.sock
```

---

## 📊 Monitoring Commands

### Check DNS Propagation
```bash
ssh -i "hollistickeypair.pem" ubuntu@44.197.112.222 "nslookup hollisticmatch.online 8.8.8.8"
```

### Check SSL Certificate
```bash
ssh -i "hollistickeypair.pem" ubuntu@44.197.112.222 "sudo certbot certificates"
```

### Test SSL Renewal
```bash
ssh -i "hollistickeypair.pem" ubuntu@44.197.112.222 "sudo certbot renew --dry-run"
```

### Monitor Logs
```bash
# Gunicorn logs
sudo journalctl -u gunicorn -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## ⚠️ Important Notes

1. **DNS Propagation is Required**: Cannot generate SSL certificate until domain resolves
2. **Certbot Needs Port 80**: Let's Encrypt verifies domain ownership via HTTP challenge
3. **Backup Current Config**: Nginx config will be replaced after certbot runs
4. **Auto-Renewal**: Certbot creates systemd timer for automatic renewal (every 12 hours)
5. **Certificate Expiry**: 90 days - renewal occurs automatically at 60 days
6. **Frontend Update Required**: Vercel needs new API URL after SSL is live

---

**Current Blocker**: DNS propagation (estimated wait: 5-60 minutes)

**When to Continue**: Run `nslookup hollisticmatch.online 8.8.8.8` from EC2. When it returns `44.197.112.222`, proceed with Step 2 (certbot).
