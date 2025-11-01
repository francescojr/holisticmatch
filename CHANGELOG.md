# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-01

### Added
- Complete API endpoints for professionals listing with pagination
- Professional detail view with full information
- Service types enumeration endpoint
- Comprehensive filtering system (service, city, state, price range, attendance type)
- Backend deployment on AWS Elastic Beanstalk
- Frontend deployment on Vercel with API proxy
- PostgreSQL integration with Supabase
- IPv6 network support for cloud database connectivity
- Security group configuration for EC2 instance
- Docker-ready deployment configuration

### Fixed
- API endpoint paths in frontend service (`/v1/professionals/` instead of `/professionals/`)
- Supabase PostgreSQL connectivity via IPv6 configuration
- AWS EC2 networking (added routes to Internet Gateway)
- VPC and subnet IPv6 CIDR block associations
- ENI IPv6 address assignment for proper database connectivity
- Procfile gunicorn binding (changed from `0.0.0.0:8000` to `127.0.0.1:8000`)
- ALLOWED_HOSTS configuration for multi-host support

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
