# Feature Specification: HolisticMatch Marketplace Platform

**Feature Branch**: `001-holistic-marketplace`  
**Created**: 2025-10-31  
**Status**: Draft  
**Input**: User description: "Plataforma marketplace onde profissionais de terapias holísticas se cadastram e usuários buscam por tipo de serviço, filtrando por localização, preço e tipo de atendimento. Foco em descoberta e contato direto entre profissional e cliente."

## Clarifications

### Session 2025-10-31

- Q: What are the password security requirements for professional registration? → A: Industry-standard: 8+ characters, must include letter and number
- Q: How should the system handle email service failures during registration? → A: Allow registration to succeed, log email failure, complete registration, retry email later
- Q: What observability and logging is required for production monitoring? → A: Log user actions (search, registration, login), API performance metrics, and all errors
- Q: What happens when a professional enters incorrect login credentials? → A: Allow 5 failed attempts, then 15-minute account lockout with clear error message
- Q: How should session timeout be handled for active users? → A: Automatically refresh access token before expiry if user is active, maintaining session seamlessly

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Client Search and Discovery (Priority: P1)

A client visits the platform to find holistic therapy professionals in their area by filtering through services, location, and price range, then contacts a professional directly.

**Why this priority**: This is the core value proposition - connecting clients with professionals. Without search and discovery, the marketplace cannot function. This is the primary user journey that generates value for both sides of the marketplace.

**Independent Test**: Can be fully tested by loading the homepage, entering search criteria (service type, city, max price), viewing filtered results, and verifying that contact information is accessible. Delivers immediate value by enabling service discovery.

**Acceptance Scenarios**:

1. **Given** a client lands on the homepage, **When** they select a service type from the dropdown and click search, **Then** they see a list of professionals offering that service with profile cards showing photo, name, services, price, and location
2. **Given** a client is viewing search results, **When** they apply filters for city "São Paulo" and max price R$200, **Then** only professionals matching those criteria appear in the results
3. **Given** a client sees search results, **When** they click on a professional's card, **Then** a detailed view opens showing full bio, all services, pricing, location, and contact buttons (WhatsApp, Email, Instagram)
4. **Given** a client is viewing a professional's details, **When** they click "Chamar no WhatsApp", **Then** their WhatsApp application opens with a pre-filled link to the professional's number
5. **Given** search results contain more than 12 professionals, **When** the client scrolls to the bottom, **Then** pagination controls appear allowing navigation to additional pages

---

### User Story 2 - Professional Registration (Priority: P2)

A holistic therapy professional creates an account on the platform by providing their credentials, profile information, services offered, pricing, and contact details to appear in the marketplace.

**Why this priority**: Without professionals, there's no marketplace. However, for MVP testing, a few manually created professional profiles can demonstrate P1. This is P2 because registration enables professionals to join autonomously, which is critical for scaling but not for initial platform validation.

**Independent Test**: Can be tested by accessing the registration page, filling out all required fields (email, password, name, photo, services, price, attendance type, location, bio, contacts), submitting the form, and verifying the account is created and the professional appears in search results.

**Acceptance Scenarios**:

1. **Given** a professional visits the registration page, **When** they fill in email, password, full name, select services (multi-select checkboxes), define price per session, choose attendance type, enter city and neighborhood, write a bio (max 500 characters), provide WhatsApp, optional Instagram, and upload a photo, **Then** clicking "Cadastrar" creates their account and redirects them to a dashboard
2. **Given** a professional is filling the registration form, **When** they enter an email already registered, **Then** an error message appears stating "Email já cadastrado"
3. **Given** a professional uploads a photo during registration, **When** the form is submitted, **Then** the photo is stored and a public URL is generated for display in their profile
4. **Given** a professional completes registration, **When** their account is created, **Then** they receive a confirmation email and a JWT token for authentication
5. **Given** a newly registered professional searches for their own profile, **When** they use filters matching their services and location, **Then** their profile appears in the search results

---

### User Story 3 - Professional Profile Management (Priority: P3)

An authenticated professional accesses their dashboard to view and edit their profile information, including services, pricing, bio, photo, and contact details.

**Why this priority**: Profile editing is important for professionals to keep information current, but for initial MVP, profiles can be created once and remain static. This becomes critical as the platform grows and professionals need to update availability, pricing, or services.

**Independent Test**: Can be tested by logging in as a professional, accessing the dashboard, modifying any profile field (services, price, bio, photo), saving changes, and verifying updates appear immediately in public search results.

**Acceptance Scenarios**:

1. **Given** an authenticated professional accesses their dashboard, **When** the page loads, **Then** they see a pre-filled form with all their current profile data
2. **Given** a professional is viewing their dashboard, **When** they modify any field (add/remove services, change price, update bio, change attendance type, update contacts), **Then** clicking "Salvar" persists the changes and displays a success message
3. **Given** a professional wants to update their photo, **When** they upload a new photo and save, **Then** the old photo is replaced, the new photo is stored, and the updated photo appears in their profile
4. **Given** a professional saves profile changes, **When** they search for themselves in the marketplace, **Then** the updated information appears immediately in search results
5. **Given** a professional is on their dashboard, **When** they click the logout button, **Then** they are logged out and redirected to the homepage

---

### User Story 4 - Smooth Animations and Visual Feedback (Priority: P4)

Users experience smooth, purposeful animations throughout the interface that provide visual feedback and enhance the professional feel of the platform.

**Why this priority**: While animations improve user experience and perception of quality, the core marketplace functionality (search, contact, registration) must work first. Animations are valuable for differentiation and user satisfaction but not blocking for MVP validation.

**Independent Test**: Can be tested by navigating through the platform and observing that professional cards fade in with stagger effect, hover states provide scale feedback, modals open with smooth transitions, and buttons respond to interactions with visual feedback.

**Acceptance Scenarios**:

1. **Given** search results are loaded, **When** professional cards appear, **Then** they animate in with a fade-in and slide-up effect, staggered by 0.1 seconds between each card
2. **Given** a user hovers over a professional card, **When** the cursor enters the card area, **Then** the card scales to 1.03x and the shadow increases smoothly
3. **Given** a user clicks on a professional card, **When** the detail modal opens, **Then** it animates from scale 0.8 to 1.0 with an opacity fade-in
4. **Given** a user interacts with any button, **When** hovering, **Then** the button scales to 1.05x, and **When** clicking, **Then** it scales to 0.95x providing tactile feedback
5. **Given** a user navigates between pages, **When** the route changes, **Then** transitions occur smoothly without layout jumps or blank screens

---

### Edge Cases

- What happens when a user searches for a service type with no available professionals? Display "Nenhum profissional encontrado" with suggestion to broaden search criteria
- What happens when a professional uploads a photo larger than 5MB? Show validation error: "Foto deve ser menor que 5MB"
- What happens when a professional's WhatsApp number is invalid or missing? Disable WhatsApp button and show only available contact methods
- What happens when multiple professionals have the same price and services? Order by registration date (newest first) as a tiebreaker
- What happens when a user tries to access the professional dashboard without authentication? Redirect to login page with message "Faça login para acessar o dashboard"
- What happens when a professional exceeds 5 failed login attempts? Account is temporarily locked for 15 minutes with message "Conta temporariamente bloqueada. Tente novamente em 15 minutos"
- What happens when search filters return more than 1000 results? Implement cursor-based pagination and encourage more specific filters
- What happens if image upload to S3 fails during registration? Rollback account creation and show error: "Erro ao fazer upload da foto. Tente novamente"
- What happens when a professional marks themselves as inactive? Their profile disappears from search results but account data is retained
- What happens if email delivery fails during registration? Registration completes successfully, failure is logged, and email delivery is retried in the background

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow clients to search for professionals by selecting service type from a predefined list (Reiki, Acupuntura, Aromaterapia, Massagem, Meditação Guiada, Tai Chi, Reflexologia, Cristaloterapia, Florais, Yoga, Pilates Holístico)
- **FR-002**: System MUST allow clients to filter search results by city (text input with case-insensitive matching), maximum price per session (R$50-R$500 range), and attendance type (home visits, professional space, or both)
- **FR-003**: System MUST display search results as cards showing professional's photo, name, services offered, price per session, city, and neighborhood with pagination (12 results per page)
- **FR-004**: System MUST allow clients to view detailed professional profiles including full bio (max 500 characters), all services, pricing, location, attendance type icons, and contact methods
- **FR-005**: System MUST provide direct contact mechanisms: WhatsApp link (wa.me format), email client link, and Instagram handle copy functionality
- **FR-006**: System MUST allow professionals to register with email/password authentication, providing full name, photo upload, multi-select services, price per session, attendance type, city, neighborhood, bio, WhatsApp number, optional Instagram handle, and email
- **FR-007**: System MUST validate unique email addresses during registration and return appropriate error messages for duplicates
- **FR-007a**: System MUST enforce password requirements: minimum 8 characters including at least one letter and one number
- **FR-008**: System MUST authenticate users using JWT tokens with 24-hour access token expiry and 7-day refresh token validity
- **FR-008a**: System MUST limit login attempts to 5 failed attempts per account within a 15-minute window, after which the account is temporarily locked for 15 minutes with error message "Conta temporariamente bloqueada. Tente novamente em 15 minutos"
- **FR-008b**: System MUST automatically refresh access tokens before expiry when user is actively using the platform, maintaining seamless session continuity until refresh token expires (7 days of inactivity)
- **FR-009**: System MUST store uploaded professional photos securely and generate publicly accessible URLs
- **FR-010**: System MUST allow authenticated professionals to edit all profile fields (services, price, bio, photo, contacts, location) through a dashboard interface
- **FR-011**: System MUST update professional profiles in real-time so changes appear immediately in public search results
- **FR-012**: System MUST support photo replacement with automatic cleanup of old images when professionals update their photo
- **FR-013**: System MUST send confirmation emails to professionals upon successful registration
- **FR-013a**: System MUST allow registration to complete successfully even if email delivery fails, logging the failure and queuing for retry
- **FR-014**: System MUST restrict dashboard access to authenticated professionals only, redirecting unauthenticated users to login
- **FR-015**: System MUST filter search results to show only active professional profiles (is_active=true)
- **FR-016**: System MUST implement smooth animations: card stagger on load (0.1s intervals), hover scale effects (1.03x), modal transitions (scale 0.8→1.0), and button interactions (hover 1.05x, tap 0.95x)
- **FR-017**: System MUST provide mobile-responsive layouts that work on screens 320px and wider
- **FR-018**: System MUST validate photo file size (max 5MB) and display appropriate error messages
- **FR-019**: System MUST validate bio character limit (500 characters) during profile creation and editing
- **FR-020**: System MUST format WhatsApp numbers in international format (+55 for Brazil) for link generation
- **FR-021**: System MUST log all user actions including search queries, professional registrations, login attempts, profile updates, and contact button clicks for troubleshooting and analytics
- **FR-022**: System MUST log API performance metrics including response times and error rates to track success criteria compliance
- **FR-023**: System MUST log all errors with sufficient context (user action, timestamp, error details) to enable debugging

### Key Entities

- **Professional**: Represents a holistic therapy service provider with profile information (name, bio, photo), service offerings (multiple therapy types), pricing (per session in R$), location (city, neighborhood), attendance preferences (home, office, both), contact details (WhatsApp, Instagram, email), and account status (active/inactive)
- **User**: Represents authentication credentials and account information linked to a professional profile (one-to-one relationship)
- **Service Type**: Represents available holistic therapy categories that professionals can offer and clients can search for (predefined list of 12 therapy types)
- **Search Filter**: Represents client search criteria combining service type, location (city), price range (max), and attendance type requirement
- **Authentication Session**: Represents JWT-based authentication with access and refresh tokens for professional account access

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clients can discover relevant professionals in under 30 seconds from landing on homepage to viewing detailed profile and contact information
- **SC-002**: Professional registration completes in under 3 minutes including photo upload
- **SC-003**: Search results display within 2 seconds for queries returning up to 100 professionals
- **SC-004**: 90% of client searches return at least one matching professional (assuming database has reasonable coverage)
- **SC-005**: Professional profile updates appear in search results within 5 seconds of saving changes
- **SC-006**: Platform supports at least 100 concurrent users searching and browsing without performance degradation
- **SC-007**: Mobile users on 3G connections can complete primary tasks (search, view profile, initiate contact) within acceptable time (under 5 seconds for critical interactions)
- **SC-008**: 95% of WhatsApp contact attempts successfully open the WhatsApp application with pre-filled professional number
- **SC-009**: Photo uploads complete successfully in under 10 seconds for images under 5MB on typical broadband connections
- **SC-010**: Zero layout shifts or janky animations during normal user interactions (measured by Cumulative Layout Shift < 0.1)
- **SC-011**: All interactive elements respond to user input within 100ms (button presses, form inputs, navigation)
- **SC-012**: Platform maintains 99% uptime during business hours (9 AM - 9 PM Brazil time)

## Assumptions

- Clients do not need accounts to search and view professional profiles; anonymous browsing is sufficient
- Only professionals need authentication; clients interact as unauthenticated users
- Email confirmation is informational only; professionals can use their account immediately after registration without email verification
- Service type list is predefined and fixed for MVP; no custom service types can be added by professionals
- Pricing is always per session with no support for package deals, hourly rates, or variable pricing
- City filtering uses exact text matching (case-insensitive); no geographic distance calculations or ZIP code searches
- WhatsApp is the primary contact method; all professionals must have WhatsApp, while Instagram is optional
- Professional photos are required for registration; profiles without photos are not allowed
- Platform serves Brazilian market exclusively (Portuguese language, R$ currency, +55 phone format)
- No payment processing within platform; all financial transactions occur directly between client and professional
- No reviews, ratings, or messaging system; clients contact professionals through external channels (WhatsApp, Email)
- Professionals manage their own availability and booking; platform does not handle scheduling
- One professional per user account; no support for practices with multiple practitioners sharing one account
- Search results are publicly accessible; no sensitive information is hidden behind authentication
- Professional profiles are either fully active or fully inactive; no partial visibility or draft states

## Out of Scope for MVP

- Client user accounts and saved favorites
- In-platform messaging between clients and professionals
- Booking and scheduling system
- Payment processing or transaction management
- Reviews and rating system
- Advanced location features (map view, distance calculation, GPS)
- Professional availability calendar
- Multiple photos per professional (gallery)
- Video introductions or virtual tour capabilities
- Promotional features (featured listings, paid ads)
- Professional verification or certification validation
- Multi-language support
- Admin dashboard for platform management
- Analytics dashboard for professionals (profile views, contact rate)
- Referral or affiliate program
- Mobile native applications (iOS/Android)
- Social media integration beyond Instagram handle display
- Email notifications for professionals (new clients viewing profile)
- Professional network or community features

## Dependencies

- Email delivery service for registration confirmation emails
- External WhatsApp application for client-professional messaging
- External email clients for email contact functionality
- Reliable internet connection for photo uploads and search operations
- Modern web browsers supporting JavaScript and CSS animations (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Security Considerations

- User passwords must be hashed before storage (never stored in plain text)
- Passwords must meet minimum requirements: 8+ characters with at least one letter and one number
- JWT tokens must be transmitted securely and validated on every authenticated request
- Photo uploads must validate file types (JPEG, PNG only) to prevent malicious file uploads
- Email addresses must be validated to prevent fake registrations
- API endpoints must implement rate limiting to prevent abuse (search spam, registration flooding)
- Professional dashboard must verify token ownership matches the profile being edited (authorization check)
- All user inputs must be sanitized to prevent XSS attacks
- CORS must be properly configured to only allow requests from authorized frontend domains
- Photo URLs must be publicly accessible but file storage must prevent directory traversal attacks
- WhatsApp numbers must be validated for format to prevent injection attacks through malformed links
