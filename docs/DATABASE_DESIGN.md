## 1) users Collection
**Fields + Data Types**
- `_id`: ObjectId
- `universityId`: String (roll number / employee ID)
- `name`: \{ first: String, last: String \}
- `email`: String
- `phone`: String (optional)
- `passwordHash`: String (if not OAuth/SSO)
- `roles`: \[String\] ("student" \| "faculty" \| "organizer" \| "admin")
- `status`: String ("active" \| "suspended" \| "deleted")
- `profile`:
	- department: String
	- year: Number (students)
	- interests: \[String\] (tags used for recommendations)
- `settings`:
	- notifyEmail: Boolean
	- notifyPush: Boolean
	- timezone: String
- `createdAt`, `updatedAt`: Date
**Validation Rules**
- `email` required, lowercase, unique
- `roles` must be non-empty array; only allowed enum values
- `status` enum
- `profile.interests` max length (e.g., 50)
**Relationships**
- Users ↔ Clubs via `clubs.members.userId`
- Users ↔ Events via `events.createdBy`, `events.organizers[]`
- Users ↔ Registrations via `registrations.userId`
- Users ↔ Notifications via `notifications.userId`
**Indexes**
- `{ email: 1 }` unique
- `{ universityId: 1 }` unique
- `{ roles: 1, status: 1 }`
**Sample Document**
json
```plain text
{
  "_id": { "$oid": "66a10a0f1f3d2b0012a11111" },
  "universityId": "RA2211003012345",
  "name": { "first": "Ishika", "last": "B" },
  "email": "ishika@university.edu",
  "roles": ["student"],
  "status": "active"
}

```
## 2) clubs Collection
**Fields + Data Types**
- `_id`: ObjectId
- `name`: String
- `slug`: String (URL-safe unique)
- `description`: String
- `category`: String (Tech/Cultural/Sports)
- `visibility`: String ("public" \| "university_only" \| "private")
- `facultyAdvisorId`: ObjectId (ref users)
- `members`: \[\{ userId: ObjectId, role: String, joinedAt: Date, status: String \}\]
- `createdBy`: ObjectId (ref users)
- `createdAt`, `updatedAt`: Date
**Validation Rules**
- `name`, `slug` required; `slug` unique
- `visibility` enum
**Relationships**
- Clubs → Users (facultyAdvisorId, members.userId)
- Clubs → Events (`events.clubId`)
**Indexes**
- `{ slug: 1 }` unique
- `{ category: 1, visibility: 1 }`
**Sample Document**
json
```plain text
{
  "_id": { "$oid": "66a10a0f1f3d2b0012a22222" },
  "name": "UniSphere AI Club",
  "slug": "unispher-ai-club",
  "category": "Tech",
  "visibility": "university_only"
}

```
## 3) events Collection
**Fields + Data Types**
- `_id`: ObjectId
- `title`: String
- `description`: String
- `tags`: \[String\]
- `clubId`: ObjectId (ref clubs)
- `createdBy`: ObjectId (ref users)
- `organizers`: \[ObjectId\]
- `approval`: \{ status: String, reviewedBy: ObjectId, reviewedAt: Date \}
- `schedule`: \{ startAt: Date, endAt: Date, timezone: String \}
- `location`: \{ mode: String, venue: String, room: String, meetingUrl: String \}
- `capacity`: \{ limit: Number, waitlistEnabled: Boolean \}
- `registration`: \{ openAt: Date, closeAt: Date, requiresApproval: Boolean \}
- `qr`: \{ checkInEnabled: Boolean, secretVersion: Number \}
- `analytics`: \{ registeredCount: Number, checkedInCount: Number \}
- `createdAt`, `updatedAt`: Date
**Validation Rules**
- `title`, `schedule.startAt`, `schedule.endAt` required
- `schedule.endAt > schedule.startAt`
- `approval.status` enum
**Relationships**
- Event → Club (`clubId`)
- Event → Registrations (`registrations.eventId`)
- Event → Attendance (`attendance.eventId`)
**Indexes**
- `{ "approval.status": 1, "schedule.startAt": 1 }`
**Sample Document**
json
```plain text
{
  "_id": { "$oid": "66a10a0f1f3d2b0012a44444" },
  "title": "AI Workshop: Intro to LLMs",
  "tags": ["AI", "Workshop"],
  "approval": { "status": "approved" }
}

```
## 4) registrations Collection
**Fields + Data Types**
- `_id`: ObjectId
- `eventId`: ObjectId (ref events)
- `userId`: ObjectId (ref users)
- `status`: String ("registered" \| "cancelled" \| "waitlisted" \| "rejected")
- `registeredAt`: Date
- `ticket`: \{ qrTokenHash: String, issuedAt: Date \}
- `meta`: \{ source: String, answers: Object \}
**Validation Rules**
- `(eventId, userId)` unique
- `status` enum
**Relationships**
- Registration → Event/User
**Indexes**
- `{ eventId: 1, userId: 1 }` unique
**Sample Document**
json
```plain text
{
  "_id": { "$oid": "66a10a0f1f3d2b0012a66666" },
  "eventId": { "$oid": "66a10a0f1f3d2b0012a44444" },
  "userId": { "$oid": "66a10a0f1f3d2b0012a11111" },
  "status": "registered"
}

```
## 5) attendance Collection
**Fields + Data Types**
- `_id`: ObjectId
- `eventId`: ObjectId (ref events)
- `userId`: ObjectId (ref users)
- `registrationId`: ObjectId (ref registrations)
- `checkIn`: \{ status: String, checkedInAt: Date, method: String, scannedBy: ObjectId \}
- `checkOut`: \{ checkedOutAt: Date \}
- `createdAt`: Date
**Validation Rules**
- Unique `(eventId, userId)`
- `checkIn.status` enum
**Relationships**
- Attendance → Event/User/Registration
**Indexes**
- `{ eventId: 1, userId: 1 }` unique
**Sample Document**
json
```plain text
{
  "_id": { "$oid": "66a10a0f1f3d2b0012a77777" },
  "eventId": { "$oid": "66a10a0f1f3d2b0012a44444" },
  "userId": { "$oid": "66a10a0f1f3d2b0012a11111" },
  "checkIn": { "status": "checked_in" }
}

```
## 6) notifications Collection
**Fields + Data Types**
- `_id`: ObjectId
- `userId`: ObjectId (ref users)
- `type`: String ("event_reminder" \| "club_announcement" \| "system")
- `channel`: String ("email" \| "push" \| "in_app")
- `title`: String
- `message`: String
- `data`: \{ eventId: ObjectId, eventTitle: String, clubId: ObjectId \}
- `status`: String ("queued" \| "sent" \| "failed" \| "read")
- `scheduledFor`: Date
- `createdAt`: Date
**Validation Rules**
- `userId`, `type`, `channel`, `status`, `createdAt` required
**Relationships**
- Notification → User; optional Event/Club
**Indexes**
- `{ userId: 1, status: 1, scheduledFor: 1 }`
**Sample Document**
json
```plain text
{
  "_id": { "$oid": "66a10a0f1f3d2b0012a88888" },
  "userId": { "$oid": "66a10a0f1f3d2b0012a11111" },
  "type": "event_reminder",
  "channel": "email",
  "title": "Reminder: AI Workshop starts soon",
  "message": "Your event 'AI Workshop: Intro to LLMs' starts at 3:00 PM.",
  "data": { "eventId": { "$oid": "66a10a0f1f3d2b0012a44444" }, "eventTitle": "AI Workshop: Intro to LLMs" },
  "status": "queued",
  "scheduledFor": { "$date": "2026-07-20T08:30:00Z" },
  "createdAt": { "$date": "2026-07-20T05:00:00Z" }
}
```
## 7) recommendations Collection
**Fields + Data Types**
- `_id`: ObjectId
- `userId`: ObjectId (ref users)
- `generatedAt`: Date
- `algorithm`: \{ name: String, version: String \}
- `items`: \[<br>\{<br>eventId: ObjectId,<br>score: Number,<br>reasons: \[String\],<br>expiresAt: Date<br>\}<br>\]
- `context` (optional):
	- interestTags: \[String\]
	- recentActions: \[String\]
- `createdAt`: Date
**Validation Rules**
- `userId`, `generatedAt`, `items` required
- `items.score` between 0 and 1 (or 0–100, choose one)
- `items` max length (e.g., 100)
**Relationships**
- Recommendation → User
- Recommendation items → Event
**Indexes**
- `{ userId: 1, generatedAt: -1 }`
- Optional TTL for stale recs: add `expiresAt: Date` at root and TTL index on it
**Sample Document**
json
```plain text
{
  "_id": { "$oid": "66a10a0f1f3d2b0012a99999" },
  "userId": { "$oid": "66a10a0f1f3d2b0012a11111" },
  "generatedAt": { "$date": "2026-07-12T10:00:00Z" },
  "algorithm": { "name": "hybrid-cf-content", "version": "1.0.0" },
  "items": [
    {
      "eventId": { "$oid": "66a10a0f1f3d2b0012a44444" },
      "score": 0.91,
      "reasons": ["interest:AI", "tag:LLM", "popular_this_week"],
      "expiresAt": { "$date": "2026-07-19T10:00:00Z" }
    }
  ],
  "context": { "interestTags": ["AI", "Hackathons"] },
  "createdAt": { "$date": "2026-07-12T10:00:00Z" }
}
```
## 🔗 Relationship Summary (at a glance)
- `users._id` referenced by: `clubs.members.userId`, `events.createdBy`, `events.organizers[]`, `registrations.userId`, `attendance.userId`, `notifications.userId`, `recommendations.userId`
- `clubs._id` referenced by: `events.clubId`
- `events._id` referenced by: `registrations.eventId`, `attendance.eventId`, `notifications.data.eventId`, `recommendations.items.eventId`
- `registrations._id` referenced by: `attendance.registrationId`
## ⚖️ Core Constraints You Should Enforce
1. No duplicate registration: unique `(eventId, userId)` in `registrations`.
2. No duplicate check-in record: unique `(eventId, userId)` in `attendance`.
3. Approval gates publishing: only `approval.status="approved"` should appear in public discovery queries.
4. QR security: store hashed token, rotate via `events.qr.secretVersion`.