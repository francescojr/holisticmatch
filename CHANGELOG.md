# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-11-02

### Added
- 🎯 **TASK 5.1 - Testes Unitários Backend**: Comprehensive backend unit testing suite with 83 tests achieving 83% code coverage
- ✅ **Complete Test Coverage**: Unit tests for validators, serializers, models, permissions, filters, and views
- 🧪 **43 Validator Tests**: Comprehensive testing of phone, services, price, photo, state, name, and bio validators
- 📋 **17 Serializer Tests**: Full serializer validation including cross-field validation and edge cases
- 🗄️ **13 Model Tests**: Model validation, properties, ordering, and database constraints testing
- 🔐 **8 Permission Tests**: Access control testing for authenticated and owner-only operations
- 🔍 **16 Filter Tests**: QuerySet filtering logic for all professional search parameters
- 🎭 **6 View Tests**: ViewSet operations and custom actions testing
- 📊 **83% Code Coverage**: High coverage across all professional app components (models 100%, filters 100%, permissions 100%)
- 🧪 **Django Test Framework**: pytest with Django integration, coverage reporting, and database fixtures
- 🔧 **Test Infrastructure**: Comprehensive test fixtures, mocking, and validation error testing
- 🎯 **TASK 4.5 - DashboardPage Salvar Alterações**: Optimized save functionality with conflict detection and minimal data sending
- ✅ **PATCH Endpoint Optimization**: Send only changed fields via PATCH requests for efficient API usage
- 🔄 **Change Detection Algorithm**: `detectChanges()` function identifies modified fields before saving
- ⚡ **Minimal Data Payloads**: Only changed fields sent to server, reducing network traffic and processing
- 🔒 **Concurrent Edit Protection**: Timestamp-based conflict detection using `updated_at` field
- ⚠️ **Conflict Warning UI**: Visual yellow banner warning when concurrent modifications are detected
- 🛡️ **Enhanced Error Handling**: Specific messages for 409 (conflict) and 412 (precondition failed) HTTP status codes
- 🔄 **Conflict Resolution Flow**: Clear user guidance when conflicts occur with option to refresh and retry
- 📊 **State Management**: `hasConflicts` state and `originalPhotoUrl` tracking for robust conflict detection
- 🍞 **Conflict Notifications**: Toast messages for different conflict scenarios with actionable guidance
- 🎯 **TASK 4.4 - DashboardPage Upload de Foto**: Enhanced photo upload functionality with immediate upload and better UX
- ✅ **Immediate Photo Upload**: Photos uploaded immediately when selected, not during general save
- ⏳ **Dedicated Upload Loading State**: Specific `isUploadingPhoto` state with visual spinner overlay
- 🎨 **Upload Progress UI**: Animated spinner on photo area during upload with "Enviando foto..." message
- 🔄 **Upload/Save Separation**: Photo changes don't require saving other profile data
- 🛡️ **Enhanced Error Handling**: Specific error messages for 400 (invalid file), 413 (too large), 403 (permission denied)
- 📸 **Improved Photo Controls**: "Enviar Foto" and "Cancelar" buttons for selected photos
- 🍞 **Upload Success Notifications**: Toast notifications for successful photo uploads
- 🔄 **Real-time Photo Updates**: Photo updates immediately in UI after successful upload
- 🎯 **TASK 4.3 - DashboardPage Edição de Serviços**: Complete CRUD functionality for professional services management
- ✅ **AddServiceModal Component**: Modal for adding new services with form validation and duplicate prevention
- ✅ **ConfirmDialog Component**: Reusable confirmation dialog for destructive actions with customizable styling
- ✅ **useConfirm Hook**: Promise-based confirmation system for user actions requiring confirmation
- ⏳ **Service CRUD Operations**: Add, edit inline, remove with confirmation, and validation
- 🛡️ **Service Validation**: Minimum 1 service required, price > 0, name length validation, duplicate prevention
- 🎨 **Enhanced Service UI**: Improved service cards with borders, animations, and empty state
- 🍞 **Service Management Toasts**: Success/error notifications for all service operations
- 🔄 **Real-time Service Updates**: Immediate UI updates with smooth animations
- 📝 **Service Form Validation**: Client-side validation before API submission
- 🎯 **TASK 4.2 - DashboardPage Formulário de Edição**: Complete editable form implementation for professional profile data
- ✅ **PATCH /api/professionals/{id}/ Endpoint**: Full integration with professional profile update API
- 📝 **Editable Profile Fields**: Name, email, phone, bio, location with real-time validation
- 📸 **Photo Upload with Preview**: File validation (type, size), preview before saving, S3 integration
- 🔄 **Edit/Save/Cancel Controls**: Toggle between view and edit modes with proper state management
- 🛡️ **Form Validation Integration**: Real-time validation using useFormValidation hook
- 📱 **Brazilian Phone Validation**: Support for multiple phone formats with proper validation
- 🎨 **FormInput/FormTextarea Components**: Professional form components with validation display
- 💾 **Change Tracking**: Original data preservation for cancel functionality
- 🍞 **Success/Error Notifications**: Toast notifications for save operations and validation errors
- ⏳ **Loading States**: Save button loading state with spinner during API operations
- 🔄 **State Synchronization**: Form data sync with API responses and local state updates
- 🎯 **TASK 4.1 - DashboardPage Carregamento de Dados**: Complete data loading implementation for professional dashboard
- ✅ **GET /api/professionals/{id}/ Endpoint**: Full integration with professional data retrieval API
- ⏳ **Loading Skeleton Components**: DashboardSkeleton for improved UX during data loading
- 📊 **Professional Data Population**: Automatic form population with current professional data
- 🖼️ **Profile Photo Display**: Current professional photo display in sidebar with fallback
- 🛡️ **Comprehensive Error Handling**: 401 (expired session), 403 (access denied), 404 (not found), network errors
- 🍞 **Error Notifications**: Toast notifications for all error scenarios with user-friendly messages
- 🔐 **Ownership Validation**: Only profile owners can access their dashboard data
- 🎨 **Responsive Dashboard Layout**: Professional sidebar with navigation and main content area
- 📝 **Form State Management**: Pre-populated form fields ready for editing
- 🎯 **TASK 3.3 - RegisterPage API Integration**: Complete backend integration for professional registration
- ✅ **POST /api/professionals/ Endpoint**: Full integration with professional creation API
- 📸 **S3 Photo Upload**: Automatic photo upload to S3 storage before profile creation
- 🛡️ **Comprehensive Error Handling**: Email conflicts, validation errors, network issues, server errors
- ⏳ **Global Loading States**: Progressive loading messages during registration process
- 🍞 **Success Notifications**: Toast notifications for successful registration
- 🏠 **Dashboard Redirection**: Automatic navigation to dashboard after successful registration
- 🔐 **JWT Token Storage**: Secure storage of authentication tokens in localStorage
- 🔄 **End-to-End Registration Flow**: Complete user journey from form submission to dashboard
- 🧪 **API Integration Tests**: Maintained existing test suite compatibility (169 tests passing)
- 📊 **Progress Feedback**: Real-time status updates during multi-step registration process
- 🎯 **useFormValidation Hook**: Comprehensive reusable form validation hook for React frontend
- ✅ **Validation Rules**: Email, password (8+ chars, uppercase, lowercase, numbers), Brazilian phone formats, URL, required fields
- 🌎 **Brazilian Localization**: Portuguese error messages for all validation rules
- 📱 **Phone Validation**: Support for (11) 99999-9999, 11999999999, +5511999999999 formats
- 🔧 **Advanced Validation**: Min/max length, numeric ranges, regex patterns, custom error messages
- 🧪 **Unit Tests**: 48 comprehensive tests covering all validation scenarios with 100% coverage
- 🔄 **State Management**: React state integration with error clearing and field-specific operations
- 📋 **Multiple Validation**: Support for combining multiple validation rules per field
- ⚡ **Performance**: useMemo optimization for isValid property recalculation
- 🎨 **FormInput Component**: Reusable form input component with inline validation and status indicators
- ✅ **Input Validation States**: Error, success, and loading states with animated icons (✓, ✗, ⟳)
- 🌟 **Elegant Error Messages**: Animated error display with Material Symbols icons
- ♿ **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation support
- 🎭 **Framer Motion Animations**: Smooth transitions for status changes and error messages
- 🎨 **TailwindCSS Styling**: Consistent design system integration with custom color palette
- 📝 **TypeScript Support**: Full type safety with forwardRef and HTML input props extension
- 🧪 **Component Unit Tests**: 29 comprehensive tests covering all functionality and edge cases
- 📚 **Usage Example**: Complete example component demonstrating real-world usage patterns
- 📝 **FormTextarea Component**: Reusable textarea component with auto-resize, character counter, and validation
- 📏 **Auto-resize Functionality**: Automatically adjusts textarea height based on content
- 🔢 **Character Counter**: Real-time character count with color-coded limits (normal/yellow/red)
- ✅ **Length Validation**: Min/max length validation with Portuguese error messages
- 🎭 **Framer Motion Animations**: Smooth transitions for validation states and error messages
- ♿ **Accessibility**: Full ARIA support, proper labels, and keyboard navigation
- 🎨 **TailwindCSS Integration**: Consistent design system with custom color palette
- 📝 **TypeScript Support**: Complete type safety with forwardRef and HTML textarea props extension
- 🧪 **Component Unit Tests**: 33 comprehensive tests covering all functionality and edge cases
- 📚 **Component Documentation**: Complete README with usage examples and API reference
- 🍞 **Toast Notification System**: Elegant and accessible toast notifications with auto-dismiss and stacking
- ✅ **Multiple Toast Types**: Success, error, warning, and info notifications with distinct styling
- ⏰ **Auto-dismiss**: Configurable duration (default 3s) with automatic cleanup and timeout management
- 📚 **Stack Management**: Maximum 5 toasts with automatic removal of oldest notifications
- 🎭 **Framer Motion Animations**: Smooth slide-in/slide-out animations with spring physics
- ♿ **Accessibility**: Full ARIA support, keyboard navigation, and screen reader compatibility
- 🎨 **TailwindCSS Integration**: Consistent design system with semantic color tokens
- 📝 **TypeScript Support**: Complete type safety with proper interfaces and generic types
- 🧪 **Comprehensive Unit Tests**: 53 tests covering hook, components, and edge cases (19 hook + 34 component tests)
- 📚 **Complete Documentation**: Detailed README with usage examples, API reference, and accessibility guide
- 🔧 **useToast Hook**: Custom hook providing toast state management and creation methods
- 🎯 **Toast Component**: Individual notification component with dismiss functionality
- 📦 **ToastContainer Component**: Stack container with proper positioning and layout
- ✅ **Validation Rules**: Email, password (8+ chars, uppercase, lowercase, numbers), Brazilian phone formats, URL, required fields
- 🌎 **Brazilian Localization**: Portuguese error messages for all validation rules
- 📱 **Phone Validation**: Support for (11) 99999-9999, 11999999999, +5511999999999 formats
- 🔧 **Advanced Validation**: Min/max length, numeric ranges, regex patterns, custom error messages
- 🧪 **Unit Tests**: 48 comprehensive tests covering all validation scenarios with 100% coverage
- 🔄 **State Management**: React state integration with error clearing and field-specific operations
- 📋 **Multiple Validation**: Support for combining multiple validation rules per field
- ⚡ **Performance**: useMemo optimization for isValid property recalculation
- 🛡️ **Professional Model Validators**: Comprehensive validation system for Professional model
- ✅ **Custom Validators**: Created 7 custom validators (name, bio, services, phone, state, price, photo)
- 🧪 **Unit Tests**: Added 30 unit tests with 100% coverage for all validators
- 📱 **Brazilian Phone Validation**: Support for both mobile (11 digits) and landline (10 digits) numbers
- 🗺️ **State Code Validation**: Brazilian state codes with proper error messages
- 💰 **Price Range Validation**: Reasonable price limits (R$ 10.00 to R$ 5,000.00)
- 📸 **Photo Upload Validation**: File size (5MB max) and type validation (JPG/PNG only)
- 🎯 **Service Validation**: Required services with duplicate prevention and max limit (10)
- 🔄 **Enhanced Serializer Validations**: API-level validation using custom validators
- 📋 **Cross-Field Validation**: Business logic validation (phone/whatsapp uniqueness)
- 🧪 **Serializer Unit Tests**: 13 comprehensive tests for all serializer validation scenarios
- 🔐 **Professional CRUD API**: Complete REST API with authentication and ownership permissions
- 👤 **Custom Permissions**: IsAuthenticatedAndOwnerOrReadOnly permission class
- 📝 **API Endpoints**: POST/PATCH/PUT/DELETE operations with proper validation
- 🧪 **API Integration Tests**: 21 comprehensive tests covering all CRUD operations and security

### Fixed
- 🛡️ **Model Validation Gaps**: Replaced basic MinValueValidator with comprehensive business logic validation
- 📝 **Data Integrity**: Ensured all Professional model fields have proper validation rules
- 🔗 **API Validation Layer**: Added serializer-level validations complementing model validations

### Fixed
- 🛡️ **Model Validation Gaps**: Replaced basic MinValueValidator with comprehensive business logic validation
- 📝 **Data Integrity**: Ensured all Professional model fields have proper validation rules
- 🔗 **API Validation Layer**: Added serializer-level validations complementing model validations

### Fixed
- 🛡️ **Model Validation Gaps**: Replaced basic MinValueValidator with comprehensive business logic validation
- 📝 **Data Integrity**: Ensured all Professional model fields have proper validation rules

### Technical Details

#### Professional Model Validators Implementation
1. **Custom Validators Module**: Created `professionals/validators.py` with 7 validation functions
2. **Phone Number Validation**: Supports Brazilian format (mobile: 11 digits starting with 9, landline: 10 digits)
3. **State Validation**: Validates against all 27 Brazilian states with case-insensitive input
4. **Service Validation**: Requires at least 1 service, max 10 services, prevents duplicates
5. **Price Validation**: Minimum R$ 10.00, maximum R$ 5,000.00 with reasonable error messages
6. **Photo Validation**: 5MB size limit, JPG/PNG formats, dimension validation
7. **Name/Bio Validation**: Length limits and character restrictions

#### Unit Testing Coverage
1. **Validator Tests**: 19 tests covering all validation edge cases
2. **Model Tests**: 11 tests validating model-level integration
3. **Test Fixtures**: Proper database fixtures for model validation testing
4. **Coverage**: 100% test coverage for all validation functions

#### Serializer Validation Implementation
1. **Enhanced Field Validations**: All serializer methods now use custom validators from validators.py
2. **Cross-Field Validation**: Business logic validation for phone/whatsapp uniqueness
3. **Error Message Consistency**: Proper error conversion from Django ValidationError to DRF ValidationError
4. **Optional Field Handling**: Proper validation of optional fields (whatsapp, phone) when provided
5. **Serializer Unit Tests**: 13 comprehensive tests covering all validation scenarios and edge cases

#### Professional CRUD API Implementation
1. **Custom Permissions**: Created `IsAuthenticatedAndOwnerOrReadOnly` permission class combining authentication and ownership checks
2. **ModelViewSet**: Expanded `ProfessionalViewSet` from ReadOnlyModelViewSet to full ModelViewSet with CRUD operations
3. **Permission Logic**: Read operations allow anonymous access, write operations require authentication and ownership
4. **User Association**: `perform_create()` method automatically associates new professionals with authenticated users
5. **API Endpoints**: Complete REST API with POST (create), PATCH (partial update), PUT (full update), DELETE (destroy)
6. **Security**: Proper permission checks prevent unauthorized access and ensure data integrity

#### API Integration Testing
1. **Comprehensive Test Suite**: 21 API tests covering all CRUD operations and security scenarios
2. **Authentication Tests**: Verify that write operations require authentication
3. **Ownership Tests**: Ensure users can only modify their own professional profiles
4. **Validation Tests**: Test serializer validation works correctly in API context
5. **CRUD Operations**: Full coverage of create, read, update, delete operations
6. **Edge Cases**: Invalid IDs, permission denied scenarios, validation errors

#### Photo Upload Endpoint Implementation
1. **Custom Action Method**: Added `upload_photo` action to `ProfessionalViewSet` with `@action` decorator
2. **File Validation**: Comprehensive validation for file type (JPG/PNG only) and size (5MB maximum)
3. **Ownership Verification**: Custom permission check ensuring users can only upload to their own profiles
4. **S3 Integration**: Fixed ProfilePhotoStorage to work with modern S3 buckets (removed ACLs for compatibility)
5. **Error Handling**: Proper HTTP status codes and error messages for all failure scenarios
6. **Photo Replacement**: Automatic deletion of old photos when uploading new ones
7. **URL Generation**: Returns S3 photo URL in successful response for immediate frontend use

#### Photo Upload Testing
1. **Success Scenarios**: 8 comprehensive tests covering all upload scenarios
2. **Authentication Tests**: Verify unauthenticated users cannot upload photos
3. **Ownership Tests**: Ensure users cannot upload to other users' profiles
4. **Validation Tests**: File type validation, size limits, and missing file handling
5. **Error Handling**: Proper 400/403/404/500 status codes for different error conditions
6. **Photo Replacement**: Test that old photos are replaced when uploading new ones
7. **Integration**: Full end-to-end testing with S3 storage backend

### Phase 2 Progress
- ✅ **TASK 1.1 COMPLETED**: Professional model validators with comprehensive testing
- ✅ **TASK 1.2 COMPLETED**: Enhanced serializer validations with cross-field validation and 13 unit tests
- ✅ **TASK 1.3 COMPLETED**: Professional CRUD API with authentication, permissions, and 21 integration tests
- ✅ **TASK 1.4 COMPLETED**: Photo upload endpoint with S3 integration and comprehensive validation
- 🔄 **Next**: TASK 2.1-2.4 - Frontend validation hooks and form components
- 🖼️ **AWS S3 Image Storage**: Complete S3 integration for professional profile photos
- 📸 **Image Upload System**: Configured ProfilePhotoStorage with public-read ACL
- 🔗 **CDN Image URLs**: Direct S3 URLs for fast image loading (no signed URLs)
- 🎨 **Hero Section**: Added parallax hero images with random selection
- ✨ **Spring Animations**: Enhanced hover effects with spring physics (stiffness: 88, damping: 5)

### Fixed
- 🖼️ **Image URL Generation**: Fixed S3 URL paths and removed duplicate prefixes
- 🎨 **Photo Field Storage**: Corrected database photo field values (removed full URLs)
- 🔄 **Scroll Behavior**: Fixed page scroll starting position (now starts at top)
- 🎯 **Button Positioning**: Adjusted "Voltar" button spacing from header
- 🎨 **Service Tags Contrast**: Improved readability with dark text on colored backgrounds
- 📱 **Login Card Position**: Moved login card up by ~200px for better visual balance
- 🎯 **Profile Button**: Made "Ver Perfil" button illustrative (visual feedback only)

### Enhanced
- 📸 **Profile Photo Display**: Increased profile photo size from 160px to 224px (40% larger)
- 🎨 **UI Polish**: Refined spacing and positioning across all pages
- ⚡ **Performance**: Optimized image loading with direct S3 URLs
- 🎭 **Animation System**: Applied spring physics to professional cards and interactions

### Technical Details

#### S3 Image Storage Implementation
1. **Storage Backend**: Created `ProfilePhotoStorage` class extending `S3Boto3Storage`
2. **Configuration**: Set `location=''`, `default_acl='public-read'`, `querystring_auth=False`
3. **URL Generation**: Direct S3 URLs without signature parameters for public images
4. **Database Fix**: Corrected photo field values from full URLs to filenames only

#### Hero Section with Parallax
1. **Random Image Selection**: Implemented useState with useEffect for random hero images
2. **Parallax Effect**: Used Framer Motion's `useScroll` and `useTransform` hooks
3. **Image Assets**: Added hero01.jpg and hero02.jpg to public assets
4. **Responsive Design**: Maintained aspect ratio across different screen sizes

#### Animation Enhancements
1. **Spring Physics**: Applied exact configuration (stiffness: 88, damping: 5, mass: 1.1)
2. **Scroll Triggers**: Implemented IntersectionObserver for card reveal animations
3. **Hover Effects**: Enhanced card interactions with smooth spring transitions
4. **Performance**: Optimized animation performance with proper cleanup

## [Unreleased] - 2025-11-01

### Fixed
- 🔧 **Service Type Filters**: Fixed JSON array filtering in SQLite for service type searches - filters now work correctly in production
- 🎨 **Background Colors**: Standardized background color to #f6f8f7 across all pages for consistent design
- 🎯 **Logo Display**: Fixed missing logo symbols in LoginPage and RegisterProfessionalPage
- ✨ **Framer Motion Animations**: Enhanced animations with smoother easing curves, spring physics, and longer durations for premium UX

### Enhanced
- 🎭 **Animation System**: Upgraded Framer Motion animations with:
  - Custom cubic-bezier easing: `[0.25, 0.46, 0.45, 0.94]`
  - Spring physics for interactive elements (stiffness: 300-400, damping: 17-25)
  - Improved durations (0.6-0.8s) and y-offsets (30px)
  - New animation variants: `pageVariants`, `itemVariants`, `cardHoverVariants`, `listItemVariants`
- 🎨 **UI Polish**: Applied enhanced animations to all major pages (Dashboard, ProfessionalDetail, Login, Register)

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
