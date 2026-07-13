## 1) Project overview
UniSphere – Smart Campus Events & Clubs Hub is a full-stack web platform that centralizes university event and club activity management in one place. It enables students to discover and register for events, receive digital QR-based entry passes, and track participation, while allowing faculty and club organizers to create, publish, and manage events with streamlined approvals and analytics. The system also supports intelligent personalization through AI-driven event recommendations and uses predictive analytics to help organizers forecast attendance and plan resources.
## 2) Problem statement
Campus events and club activities are often managed through fragmented tools (posters, social media, spreadsheets, multiple forms, and ad-hoc messaging). This creates several issues:
- Low visibility and discoverability of events for students.
- Manual and error-prone registration and attendee verification.
- Limited accountability and inconsistent attendance tracking.
- Difficulty sending timely reminders and updates.
- Lack of unified club management, roles, and governance.
- Minimal data to evaluate engagement, optimize scheduling, or forecast attendance.
## 3) Solution statement
UniSphere provides a unified, role-based platform for creating, approving, managing, and attending campus events and club activities. It digitizes the full lifecycle—from publishing and registration to QR pass check-in and attendance tracking—while automating communication via email reminders. Organizers and admins gain dashboards with engagement insights, AI-powered recommendations improve event discovery for students, and predictive attendance analytics help stakeholders plan effectively.
## 4) Objectives
1. Centralize campus events and club activities into a single, searchable hub.
2. Simplify event creation, management, and admin approvals for organizers and administrators.
3. Enable seamless event registration with digital QR passes for entry.
4. Provide reliable attendance tracking through QR-based check-ins.
5. Automate email reminders and notifications to reduce no-shows and improve communication.
6. Support structured club management (members, roles, permissions, and activity history).
7. Deliver role-based dashboards for students, organizers, faculty, and admins.
8. Improve event discovery using AI recommendations based on interests and behavior.
9. Forecast participation using predictive analytics to support better planning and resource allocation.
## 5) Scope
### In scope
- User authentication and role-based access (student, faculty/organizer, club admin, platform admin).
- Club management:
	- Club profiles, member management, role assignment.
	- Club activity/event listings.
- Event management:
	- Create/edit/publish events, capacity limits, registration windows.
	- Admin approval workflow (approve/reject with feedback).
- Event registration:
	- Registration confirmation and attendee lists.
	- Digital QR passes per registration.
- Attendance tracking:
	- QR scan check-in (and optional manual override).
	- Attendance export/reporting.
- Communications:
	- Email reminders (pre-event) and updates (changes/cancellations).
- Dashboards:
	- Student dashboard (discover, register, passes, history).
	- Organizer dashboard (event management, registrations, attendance).
	- Admin dashboard (approvals, moderation, analytics).
- Intelligence & analytics:
	- AI event recommendations.
	- Predictive attendance analytics (forecasting attendance, no-show probability, capacity guidance).
### Out of scope (for initial release; can be future work)
- Ticketing payments and refunds.
- Native mobile apps (if web-first; responsive web included).
- Cross-campus multi-tenant support across multiple universities (unless explicitly required).
- Deep integration with university SIS/LMS (unless explicitly required).
## 6) Success metrics
- Adoption & engagement:
	- Number of registered users (students/faculty) and active monthly users.
	- Number of active clubs onboarded.
	- Number of events created per month.
- Conversion & attendance:
	- Registration-to-attendance rate.
	- Reduction in no-show rate after email reminders.
	- Average check-in time per attendee (QR scan efficiency).
- Operational efficiency:
	- Time to publish an event (creation → approval → live).
	- Reduction in manual work for organizers/admins (self-reported or measured workflow steps).
- Recommendation performance:
	- Click-through rate (CTR) on recommended events.
	- Registration rate from recommendations.
- Forecasting accuracy:
	- Mean absolute percentage error (MAPE) or similar metric for predicted vs actual attendance.
	- Accuracy of no-show predictions (precision/recall if classification-based).
- Satisfaction & reliability:
	- User satisfaction rating (survey/NPS-style).
	- System uptime and error rates during high-traffic event periods.
## 7) Project summary
UniSphere is a smart, full-stack campus engagement platform that streamlines how universities run events and clubs. It combines event creation, admin approvals, registration, QR-based entry passes, and attendance tracking with automated email reminders. Role-based dashboards provide clear workflows for students, organizers, and admins, while AI recommendations and predictive analytics improve event discovery, boost participation, and support data-driven planning.
Below is a practical, production-oriented MongoDB schema design for an event + clubs platform (campus-style). It uses a hybrid model: embed small “snapshot” subdocuments for read speed, and reference (ObjectId) for integrity and scalability.<br>Assumptions:
- Users can join clubs, create events, register for events, and check in (attendance).
- Events belong to a club (optional, but recommended).
- A registration can exist without attendance; attendance implies a successful check-in.
- Notifications are delivered to users; recommendations store “why” and “what” was recommended.
1. users Collection<br>Fields + Data Types
- _id : ObjectId
- email: string
- phone: string?
- passwordHash: string (if not using external auth)
- name: \{ first: string, last: string \}
- username: string?
- role: "student" \| "club_admin" \| "staff" \| "super_admin"
- status: "active" \| "blocked" \| "deleted"
- profile:
- avatarUrl: string?
- department: string?
- year: int?
- interests: string\[\]
- clubMemberships: array of embedded membership records (small + frequently read)
- \{ clubId: ObjectId, role: "member" \| "officer" \| "admin", joinedAt: Date, status: "active" \| "left" \}
- settings:
- notificationPrefs: \{ email: bool, push: bool, inApp: bool \}
- createdAt : Date
- updatedAt : Date
- lastLoginAt: Date?<br>Validation Rules (MongoDB JSON Schema)
- email required, normalized (store lowercase), must match email regex
- role enum
- profile.interests max length (e.g., 50 items), each string length limit
- clubMemberships.clubId required when membership exists
- timestamps required (createdAt, updatedAt)<br>Relationships
- clubs via clubMemberships.clubId
- events as organizer/creator references (usually stored on event)
- registrations.userId, attendance.userId, notifications.userId, recommendations.userId<br>Indexes
- Unique: \{ email: 1 \}
- Optional unique sparse: \{ username: 1 \} with sparse: true
- Search/filter: \{ "profile.department": 1, "profile.year": 1 \}
- Membership lookup: \{ "clubMemberships.clubId": 1 \}<br>Sample Document<br>\{<br>"_id": \{ "\$oid": "66b9f0011111111111111111" \},<br>"email": "[ishika@example.edu](mailto:ishika@example.edu)",<br>"passwordHash": "\$2b\$10\$....",<br>"name": \{ "first": "Ishika", "last": "B" \},<br>"role": "student",<br>"status": "active",<br>"profile": \{<br>"avatarUrl": "[https://cdn.app/u/ishika.png](https://cdn.app/u/ishika.png)",<br>"department": "CSE",<br>"year": 2,<br>"interests": \["ai", "web", "hackathons"\]<br>\},<br>"clubMemberships": \[<br>\{<br>"clubId": \{ "\$oid": "66b9f1002222222222222222" \},<br>"role": "member",<br>"joinedAt": \{ "\$date": "2026-06-01T00:00:00.000Z" \},<br>"status": "active"<br>\}<br>\],<br>"settings": \{ "notificationPrefs": \{ "email": true, "push": true, "inApp": true \} \},<br>"createdAt": \{ "\$date": "2026-05-10T10:00:00.000Z" \},<br>"updatedAt": \{ "\$date": "2026-07-12T10:00:00.000Z" \}<br>\}
1. clubs Collection<br>Fields + Data Types
- _id : ObjectId
- name : string
- slug : string (URL-friendly, unique)
- description : string
- category : string (e.g., “tech”, “cultural”, “sports”)
- visibility : "public" \| "private"
- logoUrl : string?
- contact :
- email : string?
- socialLinks : \{ instagram?: string, discord?: string, website?: string \}
- admins : ObjectId\[\] (user ids)
- officers : ObjectId\[\]
- createdBy : ObjectId
- status : "active" \| "archived"
- createdAt : Date
- updatedAt : Date<br>Validation Rules
- name, slug, createdBy, status, timestamps required
- slug lowercase pattern \^\[a-z0-9-\]+\$
- admins non-empty for active clubs (business rule)<br>Relationships
- users via admins, officers, and users’ clubMemberships
- events.clubId references club<br>Indexes
- Unique: \{ slug: 1 \}
- Unique (optional): \{ name: 1 \} if you want global unique names
- Filter: \{ category: 1, status: 1, visibility: 1 \}<br>Sample Document<br>\{<br>"_id": \{ "\$oid": "66b9f1002222222222222222" \},<br>"name": "AI & Coding Club",<br>"slug": "ai-coding-club",<br>"description": "Workshops, hackathons and projects.",<br>"category": "tech",<br>"visibility": "public",<br>"logoUrl": "[https://cdn.app/clubs/aicc.png](https://cdn.app/clubs/aicc.png)",<br>"contact": \{ "email": "[aicc@univ.edu](mailto:aicc@univ.edu)", "socialLinks": \{ "instagram": "[https://instagram.com/aicc](https://instagram.com/aicc)" \} \},<br>"admins": \[\{ "\$oid": "66b9f0011111111111111111" \}\],<br>"officers": \[\],<br>"createdBy": \{ "\$oid": "66b9f0011111111111111111" \},<br>"status": "active",<br>"createdAt": \{ "\$date": "2026-05-01T00:00:00.000Z" \},<br>"updatedAt": \{ "\$date": "2026-07-01T00:00:00.000Z" \}<br>\}
1. events Collection<br>Fields + Data Types
- _id : ObjectId
- clubId: ObjectId (recommended)
- title: string
- description : string
- type: "workshop" \| "seminar" \| "competition" \| "meetup" \| "other"
- status: "draft" \| "published" \| "cancelled" \| "completed"
- visibility: "public" \| "club_only" \| "invite_only"
- location:
- mode: "offline" \| "online" \| "hybrid"
- venue: string?
- room: string?
- meetingUrl: string?
- geo: \{ type: "Point", coordinates: \[double, double\] \}?
- schedule:
- startAt: Date
- endAt: Date
- timezone: string (e.g. "Asia/Kolkata")
- capacity:
- limit: int? (null = unlimited)
- waitlistEnabled: bool
- registration:
- openAt: Date?
- closeAt: Date?
- requiresApproval: bool
- tags: string\[\]
- organizers: ObjectId\[\] (userIds)
- createdBy : ObjectId
- checkIn:
- enabled: bool
- method: "qr" \| "manual" \| "geo" \| "code"
- secret: string? (store hashed if it’s a code)
- opensAt: Date?
- closesAt: Date?
- stats (denormalized for quick dashboards; updated by app/jobs)
- registrationsCount: int
- attendanceCount: int
- createdAt : Date
- updatedAt : Date<br>Validation Rules
- title, status, schedule.startAt required
- schedule.endAt must be \>= startAt
- capacity.limit if present must be \> 0
- If location.mode is "online" then meetingUrl required (rule at app layer or \$jsonSchema with oneOf)<br>Relationships
- clubId -\> clubs._id
- registrations.eventId, attendance.eventId
- notifications can reference eventId
- recommendations reference eventId<br>Indexes
- Main feed: \{ status: 1, "schedule.startAt": 1 \}
- Club events: \{ clubId: 1, "schedule.startAt": -1 \}
- Search: text index on \{ title: "text", description: "text" \}
- Geo (optional): \{ "location.geo": "2dsphere" \}<br>Sample Document<br>\{<br>"_id": \{ "\$oid": "66b9f2003333333333333333" \},<br>"clubId": \{ "\$oid": "66b9f1002222222222222222" \},<br>"title": "Intro to MongoDB",<br>"description": "Hands-on session covering schema design and indexing.",<br>"type": "workshop",<br>"status": "published",<br>"visibility": "public",<br>"location": \{<br>"mode": "offline",<br>"venue": "Main Block",<br>"room": "B-201"<br>\},<br>"schedule": \{<br>"startAt": \{ "\$date": "2026-07-20T09:30:00.000Z" \},<br>"endAt": \{ "\$date": "2026-07-20T11:30:00.000Z" \},<br>"timezone": "Asia/Kolkata"<br>\},<br>"capacity": \{ "limit": 120, "waitlistEnabled": true \},<br>"registration": \{ "openAt": \{ "\$date": "2026-07-12T00:00:00.000Z" \}, "closeAt": null, "requiresApproval": false \},<br>"tags": \["mongodb", "database"\],<br>"organizers": \[\{ "\$oid": "66b9f0011111111111111111" \}\],<br>"createdBy": \{ "\$oid": "66b9f0011111111111111111" \},<br>"checkIn": \{ "enabled": true, "method": "qr", "opensAt": \{ "\$date": "2026-07-20T09:00:00.000Z" \}, "closesAt": \{ "\$date": "2026-07-20T12:00:00.000Z" \} \},<br>"stats": \{ "registrationsCount": 42, "attendanceCount": 0 \},<br>"createdAt": \{ "\$date": "2026-07-10T10:00:00.000Z" \},<br>"updatedAt": \{ "\$date": "2026-07-12T10:00:00.000Z" \}<br>\}
1. registrations Collection<br>Fields + Data Types
- _id : ObjectId
- eventId: ObjectId
- userId: ObjectId
- clubId: ObjectId? (denormalize from event for fast filtering)
- status: "registered" \| "waitlisted" \| "cancelled" \| "rejected"
- source: "app" \| "admin" \| "import"
- answers: array for custom questions (optional)
- \{ questionId: string, value: string \}
- registeredAt: Date
- cancelledAt: Date?
- meta: \{ ip?: string, userAgent?: string \}?<br>Validation Rules
- eventId, userId, status, registeredAt required
- Enforce one registration per user per event (unique index)<br>Relationships
- Many-to-one to events
- Many-to-one to users
- Attendance usually references registration by (eventId,userId) or registrationId<br>Indexes
- Unique: \{ eventId: 1, userId: 1 \}
- Event roster: \{ eventId: 1, status: 1, registeredAt: 1 \}
- User history: \{ userId: 1, registeredAt: -1 \}
- Club-level analytics: \{ clubId: 1, registeredAt: -1 \} (if using clubId denorm)<br>Sample Document<br>\{<br>"_id": \{ "\$oid": "66b9f3004444444444444444" \},<br>"eventId": \{ "\$oid": "66b9f2003333333333333333" \},<br>"userId": \{ "\$oid": "66b9f0011111111111111111" \},<br>"clubId": \{ "\$oid": "66b9f1002222222222222222" \},<br>"status": "registered",<br>"source": "app",<br>"answers": \[\{ "questionId": "exp_level", "value": "beginner" \}\],<br>"registeredAt": \{ "\$date": "2026-07-12T12:00:00.000Z" \}<br>\}
1. attendance Collection<br>Fields + Data Types
- _id : ObjectId
- eventId: ObjectId
- userId: ObjectId
- registrationId: ObjectId? (optional but useful)
- clubId: ObjectId? (denormalized)
- status: "present" \| "absent" \| "excused" (often only “present” is recorded)
- checkInAt: Date
- method: "qr" \| "manual" \| "geo" \| "code"
- checkedInBy: ObjectId? (userId of admin/officer)
- notes: string?<br>Validation Rules
- Require eventId, userId, checkInAt, method
- Enforce one attendance record per user per event (unique index)<br>Relationships
- Many-to-one to events
- Many-to-one to users
- Optional link to registrations<br>Indexes
- Unique: \{ eventId: 1, userId: 1 \}
- Event attendance list: \{ eventId: 1, checkInAt: 1 \}
- User attendance history: \{ userId: 1, checkInAt: -1 \}<br>Sample Document<br>\{<br>"_id": \{ "\$oid": "66b9f4005555555555555555" \},<br>"eventId": \{ "\$oid": "66b9f2003333333333333333" \},<br>"userId": \{ "\$oid": "66b9f0011111111111111111" \},<br>"registrationId": \{ "\$oid": "66b9f3004444444444444444" \},<br>"clubId": \{ "\$oid": "66b9f1002222222222222222" \},<br>"status": "present",<br>"checkInAt": \{ "\$date": "2026-07-20T09:40:00.000Z" \},<br>"method": "qr",<br>"checkedInBy": null<br>\}
1. notifications Collection<br>Fields + Data Types
- _id : ObjectId
- userId: ObjectId
- type: "event_update" \| "event_reminder" \| "club_announcement" \| "recommendation" \| "system"
- title: string
- body: string
- channels: \{ inApp: bool, email: bool, push: bool \}
- data: flexible payload (keep small)
- eventId: ObjectId?
- clubId: ObjectId?
- deepLink: string?
- status:
- inApp: \{ deliveredAt?: Date, readAt?: Date \}
- email: \{ deliveredAt?: Date \}
- push: \{ deliveredAt?: Date \}
- priority: "low" \| "normal" \| "high"
- createdAt : Date
- expiresAt: Date?<br>Validation Rules
- userId, type, title, createdAt required
- expiresAt \> createdAt if present
- type enum; channels booleans<br>Relationships
- Many-to-one to users
- Optional references to events/clubs via data.eventId / data.clubId<br>Indexes
- Inbox: \{ userId: 1, "status.inApp.readAt": 1, createdAt: -1 \}
- TTL (optional): TTL index on \{ expiresAt: 1 \} (only if you want auto-delete)
- Filter by type: \{ userId: 1, type: 1, createdAt: -1 \}<br>Sample Document<br>\{<br>"_id": \{ "\$oid": "66b9f5006666666666666666" \},<br>"userId": \{ "\$oid": "66b9f0011111111111111111" \},<br>"type": "event_reminder",<br>"title": "Reminder: Intro to MongoDB",<br>"body": "Starts in 30 minutes at Main Block B-201.",<br>"channels": \{ "inApp": true, "email": false, "push": true \},<br>"data": \{<br>"eventId": \{ "\$oid": "66b9f2003333333333333333" \},<br>"clubId": \{ "\$oid": "66b9f1002222222222222222" \},<br>"deepLink": "app://events/66b9f2003333333333333333"<br>\},<br>"status": \{ "inApp": \{\}, "push": \{ "deliveredAt": \{ "\$date": "2026-07-20T09:00:00.000Z" \} \}, "email": \{\} \},<br>"priority": "normal",<br>"createdAt": \{ "\$date": "2026-07-20T09:00:00.000Z" \},<br>"expiresAt": \{ "\$date": "2026-08-20T00:00:00.000Z" \}<br>\}
1. recommendations Collection<br>Fields + Data Types
- _id : ObjectId
- userId: ObjectId
- entityType: "event" \| "club"
- entityId: ObjectId (eventId or clubId)
- score: double (0–1 or 0–100; pick one standard)
- reasons: array of short explainers
- \{ code: "interest_match" \| "friends_attending" \| "similar_events" \| "club_member" \| "trending", detail?: string \}
- context (optional model inputs snapshot; keep minimal)
- interestsMatched: string\[\]
- generatedBy: "content_based" \| "collab_filter" \| "rules"
- modelVersion: string?
- createdAt : Date
- validUntil: Date?
- actedAt: Date? (user clicked/registered/joined)<br>Validation Rules
- userId, entityType, entityId, score, createdAt required
- entityType enum
- Optional unique constraint to avoid duplicates per user per entity<br>Relationships
- Many-to-one to users
- Polymorphic reference to events or clubs<br>Indexes
- Unique (recommended): \{ userId: 1, entityType: 1, entityId: 1 \}
- Feed retrieval: \{ userId: 1, createdAt: -1 \}
- Ranking: \{ userId: 1, score: -1, createdAt: -1 \}
- TTL optional on validUntil<br>Sample Document<br>\{<br>"_id": \{ "\$oid": "66b9f6007777777777777777" \},<br>"userId": \{ "\$oid": "66b9f0011111111111111111" \},<br>"entityType": "event",<br>"entityId": \{ "\$oid": "66b9f2003333333333333333" \},<br>"score": 0.87,<br>"reasons": \[<br>\{ "code": "interest_match", "detail": "Matched: mongodb, database" \},<br>\{ "code": "trending" \}<br>\],<br>"context": \{<br>"interestsMatched": \["mongodb", "database"\],<br>"generatedBy": "content_based",<br>"modelVersion": "v1.2.0"<br>\},<br>"createdAt": \{ "\$date": "2026-07-12T12:30:00.000Z" \},<br>"validUntil": \{ "\$date": "2026-07-21T00:00:00.000Z" \},<br>"actedAt": null<br>\}
Cross-Collection Relationship Summary (Cardinality)
- Club 1 → N Events (events.clubId)
- User N ↔️ N Club (via embedded users.clubMemberships and/or separate membership collection if needed)
- User N ↔️ N Event via:
- registrations (user registers)
- attendance (user attends/checks in)
- User 1 → N Notifications
- User 1 → N Recommendations (and each rec points to one event/club)
Notes on Scaling / Optional Improvements
- If club membership grows large, replace users.clubMemberships with a dedicated club_memberships collection (but for most campus apps embedding is fine).
- Keep denormalized counters ( events.stats ) updated with transactions or idempotent background jobs.
- Use unique compound indexes to enforce “one per event per user” constraints reliably.<br>If you share expected query patterns (e.g., “events feed by interests”, “club admin dashboard”, “attendance export”), I can tune indexes and denormalizations to match them exactly.