## Overview
UniSphere is a modular, cloud-native platform that unifies user identity, content/community, personalization, and messaging/notifications into a single product surface. The architecture below is designed for:
- **Scalability** (horizontal scaling, async processing)
- **Resilience** (bulkheads, retries, idempotency)
- **Security** (least privilege, zero-trust, auditable access)
- **Evolvability** (domain-driven modular services, contract-first APIs)
---
## 1) High-level architecture
### Logical domains
1. **Client Apps**: Web, iOS/Android, Admin Console
2. **Edge**: CDN + WAF + API Gateway
3. **Core Services** (modular monolith or microservices):
	- Identity & Access
	- User Profile
	- Content/Community
	- Search
	- Recommendations
	- Notifications
	- Payments/Billing (if needed)
4. **Data Platform**:
	- OLTP store(s)
	- Cache
	- Object storage
	- Search index
	- Event streaming
	- Analytics/Warehouse
5. **AI/ML Platform**:
	- Feature store
	- Model training
	- Online inference
	- Experimentation/A-B testing
6. **Observability & Ops**:
	- Logs, metrics, traces
	- CI/CD
	- Secrets/KMS
### Core communication patterns
- **North–South**: Clients → API Gateway → BFF/GraphQL → Domain services
- **East–West**: Service-to-service via gRPC/HTTP + event bus
- **Async-first** for fanout: notifications, feed updates, recommendation feature updates
### Reference tech stack (suggested)
- Frontend: React/Next.js (web), React Native/Flutter (mobile)
- Edge: CloudFront/Fastly + WAF + API Gateway
- Backend: Kotlin/Java (Spring), TypeScript (NestJS), or Go
- APIs: GraphQL for client aggregation + internal gRPC/REST
- Eventing: Kafka/Pulsar
- Datastores: Postgres (OLTP), Redis (cache), OpenSearch/Elastic (search), S3/GCS (objects)
- ML: Spark/Databricks, Feast (feature store), TensorFlow/PyTorch, BentoML/KServe (serving)
- Deployment: Kubernetes + GitOps
---
## 2) Frontend architecture
### Structure
- **Apps**
	- `web/` (Next.js)
	- `mobile/` (React Native/Flutter)
	- `admin/` (React)
- **Packages**
	- `ui/` (design system, tokens)
	- `api-client/` (typed clients, GraphQL codegen)
	- `auth/` (OIDC client, session management)
	- `observability/` (RUM, logging)
	- `shared/` (domain types, utilities)
### Patterns
- **BFF** to reduce chatty APIs and encapsulate backend evolution.
- **GraphQL** (or REST aggregation) for flexible screens.
- **State management**: server state via React Query/Apollo; local state via Zustand/Redux where needed.
- **Routing & rendering**: SSR/ISR for public pages, CSR for authenticated app areas.
### Key concerns
- Offline/poor network: request queue + optimistic UI (mobile)
- Performance: CDN caching, code splitting, image optimization
- Security: CSP, token storage strategy (httpOnly cookies for web), device-bound tokens for mobile
---
## 3) Backend architecture
### Service decomposition (recommended)
**Option A: Modular monolith (early stage)**
- Single deployable with strict module boundaries, separate schemas, internal events.
**Option B: Microservices (scale stage)**
- Split by domains:
	1. **Identity Service**: auth, sessions, MFA, token issuance
	2. **User Service**: profiles, preferences, settings
	3. **Content Service**: posts, comments, media metadata
	4. **Feed Service**: timeline assembly, ranking inputs
	5. **Recommendation Service**: candidate generation + ranking orchestration
	6. **Search Service**: indexing pipeline + query API
	7. **Notification Service**: templates, routing, delivery status
	8. **Analytics Service**: event ingestion + KPI computation
### API layer
- **API Gateway**: routing, rate limiting, DDoS protection, request validation
- **BFF/GraphQL Gateway**:
	- Aggregates calls to domain services
	- Enforces presentation-specific policies
	- Caches per-user responses (short TTL)
### Cross-cutting
- **Service mesh** (Istio/Linkerd) for mTLS, retries, circuit breaking
- **Idempotency keys** for POST endpoints
- **Outbox pattern** for reliable event publishing
---
## 4) Database architecture
### OLTP
- **PostgreSQL** as primary transactional store.
- Choose one:
	- **Single Postgres with schemas per service** (modular monolith)
	- **Database-per-service** (microservices) with strict ownership
### Suggested primary tables (conceptual)
- `users(id, email, created_at, status)`
- `profiles(user_id, display_name, bio, avatar_url, ...)`
- `content_items(id, author_id, type, body, media_refs, created_at, visibility)`
- `follows(follower_id, followee_id, created_at)`
- `reactions(user_id, content_id, type, created_at)`
- `events(id, user_id, name, payload_json, occurred_at)`
- `notifications(id, user_id, channel, template, payload_json, status, created_at, sent_at)`
### Caching
- **Redis** for:
	- Session cache (if using opaque tokens)
	- Hot profile lookups
	- Feed page caching (short TTL)
	- Rate-limit counters
### Search
- **OpenSearch/Elastic** index for:
	- Content full-text
	- User/profile search
	- Autocomplete/suggestions
### Object storage
- **S3/GCS** for:
	- Images/videos
	- Model artifacts
	- Batch exports
### Analytics
- Event stream → lake/warehouse (BigQuery/Snowflake) for BI and model training.
---
## 5) AI recommendation architecture
### Goals
- Personalized feeds, “who/what to follow”, content discovery, notifications prioritization.
### Core components
1. **Event instrumentation**
	- Client + backend emit events: impressions, clicks, dwell time, likes, follows, hides, reports.
2. **Streaming ingestion**
	- Kafka topics per event family.
3. **Feature pipelines**
	- **Real-time features**: recent interactions, trending signals (Flink/Kafka Streams)
	- **Batch features**: long-term affinity, embeddings (Spark)
4. **Feature store**
	- Online (Redis/Dynamo/Bigtable) + offline (warehouse)
5. **Candidate generation**
	- Heuristics + retrieval models (ANN via Faiss/ScaNN/OpenSearch kNN)
6. **Ranking service**
	- Online inference (KServe/BentoML) returns ranked list with scores
7. **Re-ranking & policy filters**
	- Diversity, freshness, safety, business rules, user blocks
8. **Experimentation**
	- Feature flags + A/B testing framework with metric logging
### Online request flow (feed)
- Feed Service requests candidates → Recommendation Service
- Recommendation Service:
	- Fetch user/context features from feature store
	- Retrieve candidates (ANN/search/graph)
	- Call ranking model
	- Apply filters/diversity
	- Return ranked IDs + explanations (optional)
### Model lifecycle
- Training jobs produce model + metrics → register model → canary deploy → full rollout.
---
## 6) Notification architecture
### Channels
- Push (FCM/APNS)
- Email (SendGrid/SES)
- SMS/WhatsApp (Twilio) (optional)
- In-app notification center
### Key components
- **Notification Orchestrator**
	- Consumes domain events
	- Applies user preferences + quiet hours
	- Deduplicates and batches
	- Selects channel(s)
- **Template service**
	- Versioned templates + localization
- **Delivery workers**
	- Channel-specific providers, retries with backoff
- **Tracking**
	- Sent/open/click, failure reasons
### Reliability patterns
- At-least-once delivery with idempotent send
- DLQ for poison messages
---
## 7) Authentication flow (OIDC + JWT/opaque sessions)
### Recommended approach
- Use **OAuth 2.1 / OpenID Connect** with Authorization Code + PKCE.
### Web (httpOnly cookie session) flow
1. Client → `/auth/login`
2. Redirect to IdP (or UniSphere Identity) with PKCE
3. User authenticates (password/MFA)
4. Callback → exchange code for tokens
5. Server sets **httpOnly, Secure** session cookie (or stores refresh token server-side)
6. Client calls APIs with cookie; gateway validates session
### Mobile flow
1. App uses system browser / ASWebAuthenticationSession with PKCE
2. Receives auth code → exchange → tokens stored in secure enclave/keystore
3. API calls use bearer token; refresh token rotates
### Authorization
- RBAC/ABAC hybrid:
	- Roles: user, moderator, admin
	- Attributes: tenant, org, content visibility
- Fine-grained permissions enforced in domain services.
---
## 8) Deployment architecture
### Environments
- Dev → Staging → Prod
### Runtime
- **Kubernetes**
	- Separate namespaces per environment
	- HPA autoscaling
	- Pod disruption budgets
### CI/CD
- Build: unit/integration tests, SAST, container scanning
- Deploy: GitOps (ArgoCD/Flux), progressive delivery (Argo Rollouts)
### Secrets
- KMS + secret manager (AWS Secrets Manager/GCP Secret Manager)
- Rotate credentials; short-lived service tokens
### Observability
- OpenTelemetry instrumentation
- Centralized logs (ELK/Loki)
- Metrics (Prometheus + Grafana)
- Tracing (Jaeger/Tempo)
---
# Diagrams
Below are text-based diagrams you can later convert to Mermaid/PlantUML.
## A) Sequence diagram — User loads personalized feed
1. User → Client App: Open Home
2. Client App → Edge/CDN: GET app shell/assets
3. Client App → BFF/API Gateway: `GET /feed`
4. BFF → Identity Service: validate session / token introspection
5. BFF → Feed Service: request feed page
6. Feed Service → Cache (Redis): check cached feed slice
7. Cache miss → Feed Service → Recommendation Service: get ranked candidates
8. Recommendation Service → Feature Store: fetch user/context features
9. Recommendation Service → Candidate Retrieval: ANN/search/graph query
10. Recommendation Service → Ranking Model (online inference): score candidates
11. Recommendation Service → Policy Filter: blocklists/diversity/freshness
12. Recommendation Service → Feed Service: return ranked IDs
13. Feed Service → Content Service: hydrate items by IDs
14. Feed Service → Cache: store feed slice (TTL)
15. Feed Service → BFF: response
16. BFF → Client App: feed payload
## B) Sequence diagram — Notification on new follower
1. User A → Follow API: follow User B
2. Follow API → User Service: persist follow edge
3. User Service → Outbox: write `UserFollowed` event
4. Event Publisher → Kafka: publish `UserFollowed`
5. Notification Orchestrator → Kafka: consume
6. Notification Orchestrator → Preferences Store: check User B settings
7. Notification Orchestrator → Template Service: render message
8. Notification Orchestrator → Delivery Worker: enqueue
9. Delivery Worker → Push Provider (FCM/APNS): send
10. Provider → Delivery Worker: delivery receipt
11. Delivery Worker → Notification DB: update status
---
## C) Component diagram — UniSphere services (logical)
- Client Apps
	- Web
	- Mobile
	- Admin
- Edge
	- CDN/WAF
	- API Gateway
- BFF Layer
	- GraphQL/BFF
- Core Services
	- Identity Service
	- User Service
	- Content Service
	- Feed Service
	- Recommendation Service
	- Notification Service
	- Search Service
- Data Stores
	- Postgres
	- Redis
	- OpenSearch
	- Object Storage
	- Kafka
	- Warehouse
- ML Platform
	- Feature Store
	- Training Pipeline
	- Model Registry
	- Online Serving
- Observability
	- Logs
	- Metrics
	- Tracing
---
## D) Data flow diagram — Events to recommendations
1. Client/Backend emit events → Kafka
2. Stream processor computes real-time aggregates → Online feature store
3. Batch ETL writes historical features/labels → Warehouse + Offline feature store
4. Training job reads offline features → produces model artifact
5. Model registry approves version → deploy to online serving
6. Online serving + online feature store → ranking API used by Recommendation Service
---
## E) Data flow diagram — Notifications
1. Domain event (e.g., comment) → Outbox → Kafka
2. Notification Orchestrator consumes → preference check → dedupe
3. Template render → channel selection
4. Delivery worker sends → provider callbacks
5. Update notification status + emit delivery analytics events