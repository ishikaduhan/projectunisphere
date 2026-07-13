## Overview
UniSphere is a full‑stack web application built with React + TailwindCSS (frontend), Node.js + Express.js (backend), MongoDB Atlas (database), JWT + Bcrypt (auth), plus QR-based workflows, email notifications, and an AI recommendation engine.
This Technical Design Document (TDD) describes the system architecture, code organization, data model, API surface, security posture, deployment approach, and operational strategies.
---
## 1) Architecture
### 1.1 High-level components
1. **Web Client (React + TailwindCSS)**
	- SPA (single-page application)
	- Communicates with backend via HTTPS REST APIs
	- Stores short-lived access token in memory; uses refresh token rotation for session continuity
2. **API Server (Node.js + Express.js)**
	- REST API layer
	- Authentication/authorization middleware
	- QR issuance/verification
	- Recommendation service endpoints
	- Email notification orchestration
3. **MongoDB Atlas**
	- Primary OLTP datastore
	- Indexed collections for users, sessions/tokens, QR entities, events, recommendations, etc.
4. **Email Provider (SMTP/transactional email API)**
	- Sending verification emails, password reset, alerts, transactional notifications
5. **AI Recommendation Engine**
	- Feature pipeline + model inference
	- Can begin as an in-process service module; later split into separate service
6. **Observability stack**
	- Structured logs, metrics, tracing
	- Error tracking
### 1.2 Logical architecture (request flow)
1. Client calls `api.unisphere.com` over HTTPS.
2. API gateway/load balancer routes to an Express instance.
3. Express performs:
	- Request validation
	- AuthN/AuthZ
	- Business logic
	- DB operations
	- Async side effects (email, logging, events)
4. For long-running tasks (recommendation refresh, bulk notifications), enqueue background jobs.
### 1.3 Suggested runtime topology
- **Frontend**: static hosting + CDN (immutable asset caching)
- **Backend**: containerized Node services behind load balancer
- **DB**: MongoDB Atlas cluster (multi-AZ)
- **Queue (recommended)**: Redis/BullMQ or managed queue (as workload grows)
- **Cache (recommended)**: Redis for rate limiting, token/session metadata, hot recommendations
### 1.4 Key design decisions
- REST over GraphQL for simplicity; versioned APIs.
- JWT access tokens + refresh token rotation with DB persistence.
- QR codes carry **non-PII**, short-lived signed payloads (or opaque IDs).
- Recommendation engine initially synchronous (simple rules/ML inference), gradually externalized.
---
## 2) Folder Structure
### 2.1 Monorepo (recommended)
```javascript
/unisphere
  /apps
    /web                # React app
    /api                # Express API
  /packages
    /shared             # shared types, utils
    /config             # env schema, constants
  /infra                # IaC, deployment manifests
  /docs                 # architecture docs
```
### 2.2 Frontend (`/apps/web`)
```javascript
/apps/web
  /src
    /assets
    /components
    /features           # domain feature modules
    /hooks
    /layouts
    /pages
    /routes
    /services
      apiClient.ts      # fetch/axios wrapper
      auth.ts
      qr.ts
      recommendations.ts
    /state              # Zustand/Redux/React Query config
    /styles
    /utils
  tailwind.config.js
  vite.config.ts (or CRA/Next config)
```
### 2.3 Backend (`/apps/api`)
```javascript
/apps/api
  /src
    /config
      env.ts            # zod/joi validation
      logger.ts
      db.ts
    /middlewares
      auth.ts
      rateLimit.ts
      validate.ts
      errorHandler.ts
    /modules
      /auth
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        token.service.ts
      /users
      /qr
        qr.routes.ts
        qr.service.ts
        qr.model.ts
      /notifications
        email.service.ts
        templates/
      /recommendations
        rec.routes.ts
        rec.service.ts
        features.service.ts
        model/
      /admin
    /models             # mongoose schemas OR separate per-module models
    /repositories       # db access abstraction
    /jobs               # BullMQ workers
    /utils
      crypto.ts
      time.ts
      pagination.ts
  server.ts
  app.ts
  package.json
```
---
## 3) Database Design (MongoDB Atlas)
### 3.1 Collections (core)
#### `users`
- `_id: ObjectId`
- `email: string` (unique index)
- `passwordHash: string`
- `name: string`
- `roles: string[]` (e.g., `user`, `admin`)
- `status: 'active' | 'disabled' | 'pending_verification'`
- `createdAt, updatedAt`
Indexes:
- `{ email: 1 }` unique
- `{ status: 1 }`
#### `refresh_tokens`
- `_id`
- `userId: ObjectId` (index)
- `tokenId: string` (UUID, unique) — stored server-side
- `tokenHash: string` (hash of refresh token, never store raw)
- `issuedAt, expiresAt`
- `revokedAt?: Date`
- `replacedByTokenId?: string`
- `device?: { userAgent, ip, lastSeenAt }`
Indexes:
- `{ userId: 1, expiresAt: 1 }`
- `{ tokenId: 1 }` unique
- TTL index on `expiresAt`
#### `qr_codes`
Represents a QR “artifact” or issuance.
- `_id`
- `type: 'checkin' | 'invite' | 'ticket' | 'asset'` (adapt to domain)
- `ownerId?: ObjectId`
- `payloadRef: string` (opaque reference) OR embedded minimal data
- `status: 'active' | 'expired' | 'revoked'`
- `issuedAt, expiresAt`
- `metadata?: object`
Indexes:
- `{ type: 1, status: 1 }`
- TTL on `expiresAt`
#### `qr_events`
Audit + analytics.
- `_id`
- `qrId: ObjectId`
- `eventType: 'scanned' | 'validated' | 'rejected'`
- `actorUserId?: ObjectId`
- `ip, userAgent`
- `createdAt`
Indexes:
- `{ qrId: 1, createdAt: -1 }`
#### `notifications`
- `_id`
- `userId: ObjectId`
- `channel: 'email'`
- `template: string`
- `to: string`
- `status: 'queued' | 'sent' | 'failed'`
- `error?: { code, message }`
- `createdAt, sentAt?`
Indexes:
- `{ userId: 1, createdAt: -1 }`
#### `recommendations`
Stores computed recommendations per user/entity.
- `_id`
- `subjectType: 'user' | 'item'`
- `subjectId: ObjectId`
- `items: Array<{ itemId: ObjectId, score: number, reason?: string }>`
- `modelVersion: string`
- `computedAt: Date`
- `expiresAt?: Date`
Indexes:
- `{ subjectType: 1, subjectId: 1 }` unique
- TTL on `expiresAt` (if used)
### 3.2 Data governance
- Avoid embedding sensitive info in QR payloads.
- Encrypt secrets at rest via cloud KMS where applicable; rely on Atlas encryption-at-rest.
- Add auditing collections for security-relevant events (auth failures, token revokes).
---
## 4) API Design
### 4.1 Conventions
- Base: `/api/v1`
- JSON request/response
- Standard envelope (recommended):
	- `data`: success payload
	- `error`: `{ code, message, details? }`
	- `requestId`: correlation id
- Pagination: `?limit=20&cursor=...`
- Idempotency (recommended for side-effect endpoints): `Idempotency-Key` header
### 4.2 Endpoints
#### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`
Example: Login
- Request: `{ "email": "...", "password": "..." }`
- Response:
	- `data.user`
	- `data.accessToken` (short-lived)
	- `data.refreshToken` (httpOnly cookie recommended)
#### Users
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
#### QR
- `POST /api/v1/qr/issue` (auth required)
- `POST /api/v1/qr/verify` (public or limited)
- `GET /api/v1/qr/:id` (auth/admin depending)
- `GET /api/v1/qr/:id/events` (auth/admin)
QR verify request options:
- `{ "qr": "<scannedString>" }`
- Response includes validation status, minimal domain data, and next actions.
#### Notifications
- `POST /api/v1/notifications/test-email` (admin)
#### Recommendations
- `GET /api/v1/recommendations/me`
- `POST /api/v1/recommendations/refresh` (async job)
### 4.3 Validation
- Use schema validation (Zod/Joi/Yup) in middleware.
- Reject unknown fields to reduce injection surface.
---
## 5) Authentication Flow (JWT + Bcrypt)
### 5.1 Password handling
- On register/reset: `bcrypt.hash(password, cost)` (cost tuned for infra)
- On login: `bcrypt.compare(password, passwordHash)`
- Enforce password policy and rate limits.
### 5.2 Token model
- **Access token (JWT)**: short TTL (e.g., 10–15 min)
	- Claims: `sub` (userId), `roles`, `iat`, `exp`, `jti`
- **Refresh token**: long TTL (e.g., 7–30 days)
	- Stored as httpOnly secure cookie (preferred) OR returned once then stored securely by client
	- Persist hashed refresh token in `refresh_tokens` for rotation + revocation
### 5.3 Login sequence
1. Client sends credentials.
2. Server verifies password.
3. Server issues:
	- Access JWT
	- Refresh token (random secret), stored hashed in DB
4. Client uses access token for API calls.
### 5.4 Refresh sequence (rotation)
1. Client calls `/auth/refresh` with refresh cookie/token.
2. Server verifies token hash + not revoked + not expired.
3. Server revokes old token record, issues new refresh token.
4. Server returns new access token.
### 5.5 Logout sequence
- Revoke current refresh token (and optionally all user sessions).
---
## 6) Security Design
### 6.1 Transport & headers
- Enforce HTTPS everywhere; HSTS.
- Security headers: CSP, X-Content-Type-Options, X-Frame-Options/Frame-ancestors.
### 6.2 API protection
- Rate limit by IP + userId (especially auth endpoints).
- CORS allowlist for frontend origins.
- Input validation on every endpoint.
### 6.3 JWT security
- Use strong signing secret (or asymmetric keys if needed).
- Validate `aud/iss` if you set them.
- Use `jti` to support token invalidation lists (optional).
### 6.4 QR security
- Prefer **opaque QR**: QR contains `qrId` + signature, server looks up details.
- If embedding payload:
	- Keep minimal, non-sensitive
	- Include `exp`, `nonce`, and signature (HMAC)
- Log scan/verify events for anomaly detection.
### 6.5 Data security
- Encrypt secrets in environment (secret manager).
- Principle of least privilege for DB users.
- PII minimization; redact logs.
### 6.6 OWASP controls
- Prevent NoSQL injection: never pass raw objects from request into Mongo queries.
- Prevent XSS: sanitize user-generated HTML; prefer plain text rendering.
- Prevent CSRF: if using cookies for refresh token, use SameSite + CSRF token or double-submit.
---
## 7) Deployment Design
### 7.1 Environments
- `dev`, `staging`, `prod`
- Separate MongoDB Atlas projects/clusters per env (recommended).
### 7.2 Build & release
- Frontend:
	- Build static assets
	- Deploy to CDN-backed hosting
- Backend:
	- Build container image
	- Deploy to managed container runtime (e.g., Kubernetes, ECS, Cloud Run)
### 7.3 Configuration
- Environment variables validated at boot.
- Secrets from secret manager.
### 7.4 CI/CD (recommended)
1. Lint + unit tests
2. Build
3. Security scan (deps)
4. Deploy to staging
5. Smoke tests
6. Promote to prod
---
## 8) Scalability Strategy
### 8.1 Horizontal scaling
- Stateless API instances behind load balancer.
- Store sessions/refresh token state in DB/Redis.
### 8.2 Database scaling
- Proper indexing + query patterns.
- Use read replicas (Atlas) as needed.
- Consider sharding for large event/recommendation collections.
### 8.3 Caching
- Cache hot reads (e.g., recommendations) with TTL.
- Use CDN for frontend and public assets.
### 8.4 Async processing
- Background jobs for:
	- Recommendation recomputation
	- Email sending
	- QR batch issuance
---
## 9) Error Handling Strategy
### 9.1 Error model
- Central Express error middleware maps exceptions to:
	- HTTP status
	- `error.code` (stable)
	- `error.message` (safe)
	- `error.details` (non-sensitive)
### 9.2 Categories
- **400** validation errors
- **401** unauthenticated
- **403** unauthorized
- **404** not found
- **409** conflict (e.g., duplicate email)
- **429** rate limit
- **5xx** unexpected
### 9.3 Implementation guidelines
- Never leak stack traces to client in prod.
- Always log full error with requestId.
- Use idempotency keys for operations that can be retried.
---
## 10) Monitoring and Logging Strategy
### 10.1 Logging
- Structured JSON logs (pino/winston).
- Include: `timestamp`, `level`, `requestId`, `userId?`, `route`, `latencyMs`, `statusCode`.
- Redact: passwords, tokens, authorization headers, PII.
### 10.2 Metrics
- Request rate, error rate, latency percentiles.
- DB operation latency, connection pool health.
- Queue depth and job failure rate.
### 10.3 Tracing
- Distributed tracing (OpenTelemetry) across API + worker.
### 10.4 Alerting
- Alerts on:
	- Elevated 5xx rate
	- Auth endpoint failures
	- Email provider failures
	- DB saturation / slow queries
	- Recommendation refresh job backlog
### 10.5 Audit & security monitoring
- Track login failures, token revocations, suspicious QR verification patterns.
- Periodic review of access logs and admin actions.