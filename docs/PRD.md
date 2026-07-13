# UniSphere – Smart Campus Events & Clubs Hub (PRD)
## 1. Problem Statement
Campus events and club activities are fragmented across posters, social groups, and word-of-mouth. Students miss relevant opportunities, clubs struggle to drive attendance, and administrators lack reliable participation data. Universities need a single, trustworthy hub that helps students discover and register for events, enables clubs to manage operations efficiently, and provides verifiable attendance and analytics.
## 2. Goals
1. Centralize discovery, registration, and attendance for campus events and clubs.
2. Increase student participation through personalized recommendations and timely notifications.
3. Reduce operational load for club leaders via streamlined event and membership workflows.
4. Provide accurate, privacy-aware analytics for clubs and university admins.
## 3. Objectives
1. Launch an MVP enabling authenticated users to browse events/clubs, register, and check in via QR.
2. Support club role-based management (create events, manage registrations, communicate updates).
3. Deliver push/email/in-app notifications for key lifecycle moments (registration confirmed, reminders, changes).
4. Provide AI-driven recommendations for events and clubs based on interests and behavior.
5. Provide analytics dashboards for clubs and admins (attendance, conversion, engagement trends).
## 4. User Personas
1. **Student (Attendee)**
	- Needs: discover relevant events, quick registration, reminders, proof of participation.
	- Pain points: information overload, last-minute changes, complicated sign-ups.
2. **Club Leader (Organizer/Admin of a club)**
	- Needs: create/manage events, track registrations, check-in attendees, communicate quickly.
	- Pain points: manual spreadsheets, no-show uncertainty, limited outreach.
3. **Club Member (Core team)**
	- Needs: manage tasks and attendance at club events (depending on permissions).
	- Pain points: unclear roles, scattered tools.
4. **University Admin (Student Affairs/Engagement Office)**
	- Needs: overview of engagement, compliance/approval visibility, aggregated reporting.
	- Pain points: low data quality, inconsistent reporting, difficulty measuring impact.
5. **Faculty/Staff Host (Optional)**
	- Needs: host departmental events, manage capacity and attendance.
	- Pain points: administrative overhead, low visibility.
## 5. User Stories
### Authentication
- As a student, I want to sign in using my university identity so that my profile is trusted and personalized.
- As an admin, I want to restrict access to verified campus users so that external users cannot register.
### Event Management
- As a club leader, I want to create an event with details (time, venue, capacity) so that students can register.
- As a club leader, I want to edit/cancel an event and notify registrants so that changes are communicated.
### Event Registration
- As a student, I want to register in one tap so that I can secure a spot quickly.
- As a student, I want to see my upcoming registrations so that I can plan my week.
- As an organizer, I want a waitlist so that I can fill capacity if spots open.
### QR Attendance
- As an organizer, I want to generate a QR code for an event so that check-in is fast and verifiable.
- As a student, I want to check in with a QR scan so that my attendance is recorded accurately.
### Notifications
- As a student, I want reminders before an event so that I don’t forget.
- As an organizer, I want to notify attendees of updates so that people arrive at the right place/time.
### Club Management
- As a student, I want to join/follow a club so that I can receive updates.
- As a club leader, I want to manage members and roles so that responsibilities are controlled.
### AI Recommendations
- As a student, I want recommended events/clubs based on my interests so that discovery feels relevant.
- As an admin, I want recommendations to respect privacy and avoid sensitive inferences.
### Analytics Dashboard
- As a club leader, I want to see registration-to-attendance conversion so that I can improve planning.
- As a university admin, I want campus-wide engagement trends so that I can allocate resources.
## 6. Functional Requirements
### 6.1 Authentication
1. **University SSO login** (e.g., SAML/OAuth via university IdP).
2. **Profile creation** on first login:
	- Name, email (from IdP), department/program (if available), graduation year (optional), interests (optional).
3. **Role-based access control (RBAC)**:
	- Roles: Student, Club Leader, Club Member (privileged), University Admin.
4. **Session management**:
	- Secure refresh tokens, logout, device/session revoke.
### 6.2 Event Management
1. **Create event** with:
	- Title, description, date/time, venue (building/room + map link optional), category/tags, club/host, capacity, registration deadline, visibility (public-to-campus / club-only), approval requirement (admin optional), cover image.
2. **Edit event** with change tracking and automatic notifications to registered attendees.
3. **Cancel event** with reason and attendee notification.
4. **Event status**: Draft, Published, Full, Waitlist, Cancelled, Completed.
5. **Moderation/approval workflow (configurable)**:
	- Admin can require approval before publishing for certain categories/venues.
### 6.3 Event Registration
1. **Register/unregister** with confirmation.
2. **Capacity enforcement** with waitlist:
	- Auto-promote from waitlist when a spot opens.
3. **Registration types**:
	- Free (default), ticketed (future), invite-only (club-only event).
4. **Registrant list view** for organizers with export (CSV) and privacy controls.
5. **Calendar integration**:
	- Add to calendar (ICS) and optional Google/Outlook deep links.
### 6.4 QR Attendance
1. **Generate event QR code**:
	- Time-bound rotating QR or signed token to prevent reuse.
2. **Check-in scanner**:
	- Organizer app mode to scan attendee QR or attendee scans event QR.
3. **Attendance rules**:
	- Grace windows, multiple entry points, manual override with audit log.
4. **Attendance proofs**:
	- Show attendance status in student profile (optional badges/certificates in future).
### 6.5 Notifications
1. **Notification channels**:
	- In-app, push (mobile), email (configurable).
2. **Notification triggers**:
	- Registration confirmation, reminders (e.g., 24h and 1h), event updates (time/venue), waitlist promotion, cancellation, club announcements.
3. **Preferences**:
	- Per-category and per-club subscription controls; quiet hours.
### 6.6 Club Management
1. **Club directory**:
	- Club profile (description, categories, leadership, social links, meeting cadence).
2. **Join/follow**:
	- Follow for updates; membership request/approval (optional).
3. **Role management within club**:
	- Owner/Leader, Officer, Member, Viewer.
4. **Club announcements**:
	- Post updates to followers; optionally cross-post as events.
5. **Club verification**:
	- Admin verified badge for official clubs.
### 6.7 AI Recommendations
1. **Recommendation surfaces**:
	- Home feed (events), “Recommended clubs,” and “Because you attended…” suggestions.
2. **Signals (configurable)**:
	- Explicit interests, registrations, attendance history, club follows, peer trends (aggregated), event tags.
3. **Explainability**:
	- Short “why recommended” text.
4. **Controls**:
	- User can adjust interests, hide an event, and opt out of personalization.
5. **Safety/privacy**:
	- Avoid sensitive attribute inference; no individualized recommendations based on protected categories.
### 6.8 Analytics Dashboard
1. **Club dashboard**:
	- Event performance: views → registrations → attendance, no-show rate, peak check-in time, attendee segments (aggregated).
2. **Admin dashboard**:
	- Campus-wide engagement: active clubs, event volume, attendance by category, utilization by venue/time, trend over time.
3. **Data export**:
	- CSV export for authorized roles.
4. **Audit logs**:
	- Changes to events, check-ins, role changes (admin view).
## 7. Non-functional Requirements
1. **Security & Privacy**
	- Encrypt data in transit (TLS) and at rest.
	- RBAC enforced at API and UI.
	- QR tokens signed and time-limited.
	- Compliance with institutional policies (e.g., FERPA-like requirements where applicable).
2. **Performance**
	- Feed load: p95 \< 2.0s on campus Wi‑Fi and typical mobile networks.
	- Check-in throughput: support at least 10 scans/second per scanner with offline queueing.
3. **Availability & Reliability**
	- 99.9% uptime target for core features during semester.
	- Graceful degradation for recommendations and analytics if downstream services fail.
4. **Scalability**
	- Support 30k–100k users, 5k clubs, and peak event check-in spikes.
5. **Usability & Accessibility**
	- WCAG 2.1 AA for web; mobile accessibility support.
	- Simple, low-step registration and check-in.
6. **Maintainability**
	- Modular services, documented APIs, automated tests, CI/CD.
7. **Observability**
	- Centralized logging, metrics, tracing; alerting for check-in failures and notification delays.
## 8. Success Metrics
1. **Adoption**
	- % of active students monthly (MAU/Total students)
	-
		# of clubs onboarded and verified
2. **Engagement**
	- Event view → registration conversion rate
	- Registration → attendance conversion rate (no-show reduction)
	- Avg events attended per active student per month
3. **Operational Efficiency**
	- Time to create/publish an event (median)
	- Reduction in manual check-in issues (support tickets)
4. **Recommendation Quality**
	- CTR on recommended items
	- Save/register rate from recommendations
	- User feedback (thumbs up/down, “not interested” rates)
5. **Notification Effectiveness**
	- Reminder open rates, reduction in missed events
6. **Data Quality**
	- % of events with attendance captured via QR
	- Discrepancy rate between registrations and check-ins (expected vs anomalies)
## 9. Assumptions
1. University provides an identity provider for SSO (or a verified email domain approach for MVP).
2. Clubs and admin stakeholders will maintain accurate event details.
3. Students have smartphones capable of scanning QR codes (provide manual fallback).
4. Campus policies permit storing attendance records for engagement purposes with clear retention policies.
5. Push notifications are permitted and opt-in rates are sufficient.
## 10. Risks
1. **Privacy concerns** around tracking attendance and personalization.
	- Mitigation: clear consent, opt-outs, retention limits, aggregated reporting by default.
2. **Low organizer adoption** if setup feels heavy.
	- Mitigation: templates, quick-create, minimal required fields, import from CSV.
3. **QR abuse/fraud** (sharing QR screenshots).
	- Mitigation: rotating/time-bound codes, signed tokens, scanner-only mode.
4. **Notification fatigue** leading to opt-outs.
	- Mitigation: preference center, quiet hours, batching.
5. **Data integrity** issues (manual overrides, duplicate accounts).
	- Mitigation: audit logs, SSO, dedup rules, admin review tools.
6. **Dependence on campus infrastructure** (Wi‑Fi outages during events).
	- Mitigation: offline scanning queue + later sync.
## 11. Milestones (Proposed)
1. **Discovery & Alignment (Weeks 1–2)**
	- Stakeholder interviews (students, club leaders, admin)
	- Finalize scope, policies, and success metrics
2. **Design (Weeks 3–5)**
	- UX flows: discovery, registration, check-in, club admin
	- Data model and RBAC definition
3. **MVP Build (Weeks 6–12)**
	- Authentication + profiles
	- Event creation/publishing + registration
	- QR check-in
	- Basic notifications (confirmation + reminders)
4. **Beta (Weeks 13–16)**
	- Club management roles
	- Recommendation v1 (interests + behavior)
	- Club analytics dashboard v1
5. **Campus Rollout (Weeks 17–20)**
	- Admin analytics, moderation workflow
	- Performance hardening, accessibility review
	- Training + onboarding materials
## 12. Future Scope
1. **Ticketing/payments** for paid events.
2. **Room/venue booking integration** with campus scheduling systems.
3. **Volunteer hours and certificates** with verified exports.
4. **Social features** (friends attending, group planning) with privacy controls.
5. **In-app messaging** for clubs (or integration with existing platforms).
6. **Advanced recommendation models** (context-aware, time/venue preference) with stronger explainability.
7. **Integrations**
	- LMS (Canvas/Moodle) announcements
	- Calendar sync at org-level
	- Student ID card/NFC check-in
8. **Forms and feedback**
	- Post-event surveys, NPS, and sentiment analysis.
---
**Document Owner:** Product Management
**Last Updated:** 2026-07-12