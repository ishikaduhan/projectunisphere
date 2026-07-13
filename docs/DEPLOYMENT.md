**1) Deployment Architecture**
**1.1 High-level overview**
- Frontend (React + TailwindCSS) hosted on Vercel
- Backend (Node.js + Express.js) hosted on Render
- Database hosted on MongoDB Atlas
- Media storage on Cloudinary (event posters, club logos, optional attachments)
- Email service via Nodemailer (SMTP credentials for Gmail/Outlook or transactional provider)
**1.2 Runtime components**
1. Client (Browser)
	- Loads React SPA from Vercel CDN
	- Calls backend REST APIs over HTTPS
2. API Server (Render Web Service)
	- Express app exposes `/api/v1/...`
	- Validates JWT for protected routes
	- Generates/validates QR tokens (attendance)
	- Sends emails (reminders, updates)
3. MongoDB Atlas Cluster
	- Stores users, clubs, events, registrations, attendance, notifications, recommendations
4. Cloudinary
	- Stores images; backend stores returned `public_id` and URL in MongoDB
5. Background Jobs (Render Cron Job / Scheduler)
	- Sends scheduled reminders
	- Optional: periodic recommendation regeneration / analytics rollups
**1.3 Request flow (typical)**
- Student opens Vercel URL → React app loads
- React calls Render API → API checks JWT → reads/writes Atlas
- For images: React uploads via signed upload (recommended) or backend proxy → Cloudinary
- For reminders: scheduler triggers backend job → backend sends email via Nodemailer
**2) Environment Setup**
**2.1 Prerequisites**
- Node.js LTS (18/20)
- npm / yarn / pnpm (choose one)
- Git
- MongoDB Atlas account
- Cloudinary account
- SMTP credentials for Nodemailer
- Vercel + Render accounts
**2.2 Local project structure (recommended)**
- `client/` → React + Tailwind
- `server/` → Express API
- `.env` files per module (never committed)
**2.3 Local installation**  <br>Frontend
Code
```plain text
cd client
npm install
npm run dev
```
Backend
Code
```plain text
cd server
npm install
npm run dev
```
**2.4 Local environment validation**
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:5000`
- Configure CORS in backend to allow local frontend origin
**3) Production Configuration**
**3.1 Production principles**
- All traffic over HTTPS
- Strict CORS (only Vercel domains)
- JWT secrets rotated and stored in Render env vars
- MongoDB IP access restricted
- Separate environments: dev, staging (optional), prod
**3.2 Recommended production settings (backend)**
- NODE_ENV=production
- Enable gzip/compression
- Set secure headers (Helmet)
- Rate limiting for auth endpoints
- Centralized error handler returning safe messages
- Request ID logging
**3.3 Recommended production settings (frontend)**
- Use environment-based API base URL
- Disable debug logs
- Build with minification
<empty-block/>
**4) Environment Variables**
**4.1 Frontend (Vercel) variables**
- `VITE_API_BASE_URL` (or `REACT_APP_API_BASE_URL`)
	- Example: `https://unisphere-api.onrender.com/api/v1`
- `VITE_CLOUDINARY_CLOUD_NAME` (if frontend directly references Cloudinary)
- `VITE_APP_ENV = production`
**4.2 Backend (Render) variables**
**Core**
- `NODE_ENV = production`
- `PORT` (Render sets; still support it)
- `API_BASE_URL` (optional; used in email links)
- `CLIENT_BASE_URL = Vercel URL (used for CORS + email links)`
**Database**
- `MONGODB_URI = Atlas connection string`
**Auth**
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET` (if refresh tokens are used)
- `JWT_ACCESS_EXPIRES_IN` (e.g., `1h`)
- `JWT_REFRESH_EXPIRES_IN` (e.g., `7d`)
**Email (Nodemailer)**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM` (e.g., `UniSphere <no-reply@unisphere.app>`)
**Cloudinary**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
**QR / Attendance**
- `QR_TOKEN_SECRET` (used to sign/verify QR payload)
- `QR_TOKEN_TTL_SECONDS` (e.g., `300`)
**Optional: Observability**
- `SENTRY_DSN` (if using Sentry)
- `LOG_LEVEL` (e.g., `info`)
**4.3 Example .env templates**  <br>client/.env.production
Code
```plain text
VITE_API_BASE_URL=https://unispher-api.onrender.com/api/v1
VITE_APP_ENV=production
```
server/.env.production
Code
```plain text
NODE_ENV=production
CLIENT_BASE_URL=https://unispher.vercel.app
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/unisphere
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=UniSphere <no-reply@unispher.app>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
QR_TOKEN_SECRET=...
```
**5) Frontend Deployment Process (Vercel)**
**5.1 Prepare the frontend for production**
- Set API base URL via environment variables
- Ensure `npm run build` succeeds locally
- Ensure routing strategy works (SPA fallback / rewrites)
**5.2 Deploy steps**
1. Push code to GitHub repository
2. In Vercel: New Project → Import Git Repository
3. Configure:
	- Framework preset: React/Vite (or CRA)
	- Build command: `npm run build`
	- Output directory: `dist` (Vite) / `build` (CRA)
4. Add environment variables in Vercel (prod)
5. Deploy
**5.3 Post-deploy validation**
- Open the Vercel URL and verify:
	- Login works
	- Event list renders
	- API calls succeed (check network tab)
**6) Backend Deployment Process (Render)**
**6.1 Prepare backend**
- Ensure server listens on `process.env.PORT`
- Configure CORS for Vercel domain
- Add health endpoint: `GET /health` returning `{ status: "ok" }`
**6.2 Deploy steps**
1. Push backend to GitHub
2. Render: New → Web Service → Connect repository
3. Configuration:
	- Environment: Node
	- Build command: `npm install && npm run build` (or `npm install`)
	- Start command: `npm start` (or `node dist/index.js`)
4. Add environment variables in Render
5. Deploy
**6.3 Post-deploy validation**
- Check `GET /health`
- Test auth endpoints and protected routes
- Verify emails send in sandbox mode first
**7) Database Deployment Process (MongoDB Atlas)**
**7.1 Create cluster**
1. Create an Atlas cluster (M0 free tier for academic demo or paid tier for production)
2. Create database user with least privilege (readWrite on UniSphere DB)
3. Configure Network Access:
	- Prefer allowing only Render outbound IPs (if available)
	- Otherwise temporarily allow `0.0.0.0/0` for demo with strong credentials (not recommended long-term)
**7.2 Collections and indexes**
- Create collections via application migrations/seed scripts
- Ensure indexes exist for:
	- `users.email` unique
	- `registrations (eventId, userId)` unique
	- `attendance (eventId, userId)` unique
	- event discovery indexes (status + startAt + tags)
**7.3 Seeding (staging/prod)**
- Provide `npm run seed` script that inserts:
	- admin/faculty/organizer test accounts
	- sample clubs/events
**8) Monitoring Strategy**
**Application monitoring**
- Render logs for API server
- Structured logging (JSON) including `requestId`, route, status, latency
- Track key metrics:
	- request latency (p95)
	- error rate (5xx)
	- registration conflict rate (409 duplicates)
	- check-in throughput
**Service monitoring**
- Atlas monitoring for CPU, connections, slow queries
- Alerts for:
	- high error rate
	- database connection failures
	- email send failures
**Optional tooling**
- Sentry for frontend + backend error tracking
- Uptime monitor for `/health`
**9) Backup and Recovery**
**MongoDB Atlas backups**
- Enable automated backups (paid tiers) or scheduled exports
- Define backup frequency (daily) and retention (7–30 days)
**Disaster recovery (DR) plan**
- Restore procedure:
	1. Restore Atlas snapshot to new cluster
	2. Update `MONGODB_URI` in Render
	3. Run smoke tests
**Cloudinary backups**
- Keep asset metadata (`public_id`) in DB
- Optional periodic export of asset list
**10) Security Measures**
**Backend security**
- Helmet security headers
- CORS allowlist (Vercel domains)
- Rate limiting for login/register
- Input validation (Joi/Zod) and sanitization
- Password hashing (bcrypt) if password auth used
- JWT:
	- short-lived access tokens
	- refresh token rotation (recommended)
**Secrets management**
- Never commit `.env`
- Use Vercel/Render environment variable stores
- Rotate secrets before final submission if exposed
**QR check-in security**
- Opaque tokens + short TTL
- Replay protection
- Organizer-only scanning endpoints
**11) Deployment Checklist**
**Pre-deployment**  <br>☐ `npm test` passes (frontend + backend)<br>☐ Lint/format checks pass<br>☐ Env vars set in Vercel and Render<br>☐ CORS configured for production domain<br>☐ DB indexes created<br>☐ Email provider verified (sandbox → production)
**Deployment**  <br>☐ Deploy backend on Render<br>☐ Validate `/health` and key APIs<br>☐ Deploy frontend on Vercel<br>☐ Validate full user flow end-to-end
**Post-deployment**  <br>☐ Enable monitoring/alerts<br>☐ Run smoke test suite<br>☐ Confirm backups enabled
**12) Final Production Readiness Report (Academic Submission)**
**System Information**
- Project: UniSphere – Smart Campus Events & Clubs Hub
- Frontend: React + TailwindCSS (Vercel)
- Backend: Node.js + Express.js (Render)
- Database: MongoDB Atlas
- Integrations: Nodemailer, Cloudinary, QR check-in, JWT Auth
**Readiness Summary**
- Functional readiness: Ready (core flows verified)
- Security readiness: Ready with controls (RBAC + rate limiting + secret management)
- Performance readiness: Meets target for academic scale
- Operational readiness: Ready (monitoring + backup plan)
**Evidence (to attach)**
- Deployment screenshots (Vercel + Render dashboards)
- Atlas cluster configuration screenshots
- Environment variable screenshots (redacted)
- Smoke test results
- Optional: load test report (k6/JMeter)