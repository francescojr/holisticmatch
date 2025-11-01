# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-01

### Added
- ✅ Complete API endpoints for professionals listing with pagination
- ✅ Professional detail view with full information
- ✅ Service types enumeration endpoint
- ✅ Comprehensive filtering system (service, city, state, price range, attendance type)
- ✅ Backend deployment on AWS Elastic Beanstalk (holisticmatch-env)
- ✅ Frontend deployment on Vercel with SPA routing and API proxy
- ✅ PostgreSQL integration with Supabase (db.vdlakxelygfsqyolhaea.supabase.co)
- ✅ React 18 + TypeScript + Vite 5 frontend with TailwindCSS
- ✅ Framer Motion animations for smooth UI transitions
- ✅ React Query for server state management and caching
- ✅ Axios API client with JWT interceptors
- ✅ 12 professionals seeded in database with complete information
- ✅ Professional card UI with image, services, location, pricing

### Fixed

#### Network & Infrastructure
- 🔧 **EC2 Database Connectivity**: Configured IPv6 support in AWS VPC/Subnet (CIDR: 2600:1f16:1749:9300::/56)
- 🔧 **ENI IPv6 Assignment**: Assigned IPv6 address (2600:1f16:1749:9300:b8b9:9b58:5a2c:edbf) to EC2 instance
- 🔧 **Security Group**: Added egress rules for TCP (5432, 80, 443), UDP (53) on both IPv4 and IPv6
- 🔧 **Internet Gateway Routes**: Added IPv4 (0.0.0.0/0) and IPv6 (::/0) routes to IGW
- 🔧 **Supabase Connectivity**: Fixed "Network is unreachable" errors via proper IPv6 configuration

#### Backend API
- 🔧 **Gunicorn Binding**: Changed from `0.0.0.0:8000` to `127.0.0.1:8000` for Nginx proxy compatibility
- 🔧 **ALLOWED_HOSTS**: Set to "*" for multi-host support (via environment variable)
- 🔧 **Django Settings**: Configured CORS, DEBUG=False for production

#### Frontend & Deployment
- 🔧 **Vercel Routes Configuration**: Fixed SPA routing and API proxy with proper asset serving:
  - `/assets/*` → Serve static files (JS/CSS)
  - `/api/*` → Proxy to backend `/api/v1/*`
  - `/*` → SPA fallback to `/index.html`
- 🔧 **API Endpoint Paths**: Removed duplicate `/v1` prefix from frontend service calls
- 🔧 **Price Formatting**: Converted `price_per_session` from string to number with Brazilian currency format (R$)
- 🔧 **Null Safety**: Added proper checks for `professionalsData.results` to prevent render errors
- 🔧 **Error Handling**: Improved error states and empty states in HomePage component
- 🔧 **Debug Logging**: Added console.log for API responses to track issues

### Technical Details

#### The 404 Journey (Production Bug Fix)
1. **Symptom**: Frontend showed "Failed to load resource: 404" despite backend working
2. **Root Cause**: Vercel rewrite rule `/api/:path*` → `/api/v1/:path*` was double-nesting:
   - Frontend called: `/api/v1/professionals/` 
   - Vercel rewrote to: `/api/v1/v1/professionals/` (no route!)
3. **Solution**: Removed `/v1` from frontend paths, letting Vercel rewrite add it:
   - Frontend now calls: `/api/professionals/`
   - Vercel rewrites to: `/api/v1/professionals/` ✅

#### The HTML Response Issue
1. **Symptom**: JavaScript modules returned as `text/html` instead of `application/javascript`
2. **Root Cause**: Catch-all SPA route `/(.*) → /index.html` was intercepting asset requests
3. **Solution**: Reordered Vercel routes to handle `/assets/*` before the catch-all

#### The Type Mismatch Bug
1. **Symptom**: `price_per_session.toFixed is not a function` error
2. **Root Cause**: Backend returned price as string, frontend expected number
3. **Solution**: Added `Number()` conversion and Brazilian currency formatting

### Infrastructure
- **VPC**: vpc-0647ba35575ff426c (IPv6: 2600:1f16:1749:9300::/56)
- **Subnet**: subnet-04795168bb879cfca (IPv6: 2600:1f16:1749:9300::/64)
- **Security Group**: sg-0493dc3af04293337
- **EC2 Instance**: t3.micro (2 vCPU, 1GB RAM)
- **Load Balancer**: Classic LB via Elastic Beanstalk
- **Frontend**: https://holisticmatch.vercel.app/
- **Backend**: http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/

### Database
- **Provider**: Supabase PostgreSQL
- **Host**: db.vdlakxelygfsqyolhaea.supabase.co:5432
- **Version**: PostgreSQL 15
- **Tables**: professionals, services, authentication
- **Records**: 12 professionals with complete profiles

### Known Limitations
- No authentication/authorization yet (all endpoints public)
- No image upload (using placeholder URLs)
- No payment integration
- No messaging system between professionals and clients

### Infrastructure
- ✅ Backend Health: Ready (AWS EB - holisticmatch-env)
- ✅ Database: Connected (Supabase PostgreSQL - 12 professionals)
- ✅ Frontend: Deployed (Vercel - holisticmatch.vercel.app)
- ✅ API Connectivity: Working (100% 2xx response rate)
- ✅ Network: IPv4 + IPv6 support enabled

### Technical Details
- Backend: Django 4.2 REST Framework
- Frontend: React 18 + TypeScript + Vite 5
- Database: PostgreSQL (Supabase Cloud)
- Hosting: AWS Elastic Beanstalk (backend), Vercel (frontend)
- Infrastructure: AWS VPC, Security Groups, Internet Gateway
