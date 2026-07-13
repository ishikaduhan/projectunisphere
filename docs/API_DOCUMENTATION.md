**Assumptions**
- Base URL: `/api/v1`
- Auth: JWT Bearer in `Authorization: Bearer <token>`
- Content-Type: `application/json`
- Time: ISO 8601 UTC strings (e.g., `"2026-07-20T09:30:00Z"`)
- Standard error shape used across modules
**Common Objects**
- **Auth Header**: `Authorization: Bearer <accessToken>`
- **Standard Error Response**
json
```plain text
{"error":{"code":"VALIDATION_ERROR","message":"Invalid request body","details":[{"field":"email","issue":"required"}],"requestId":"req_9d2f1c..."}}
```
- Common error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`
## 1) Authentication Module
### 1.1 Register
- Method: POST
- Endpoint: `/auth/register`
- Authentication: None
- Request Body
json
```plain text
{"name":{"first":"Ishika","last":"B"},"email":"ishika@university.edu","password":"StrongPassword@123","universityId":"RA2211003012345","role":"student"}
```
- Response Body (201)
json
```plain text
{"user":{"id":"66a10a0f1f3d2b0012a11111","name":{"first":"Ishika","last":"B"},"email":"ishika@university.edu","roles":["student"],"status":"active","createdAt":"2026-07-12T10:30:00Z"}}
```
- Status Codes: 201, 400, 409, 500
- Example Error (409)
json
```plain text
{"error":{"code":"CONFLICT","message":"Email already exists"}}
```
### 1.2 Login
- Method: POST
- Endpoint: `/auth/login`
- Authentication: None
- Request Body
json
```plain text
{"email":"ishika@university.edu","password":"StrongPassword@123"}
```
- Response Body (200)
json
```plain text
{"accessToken":"eyJhbGciOiJIUzI1NiIs...","refreshToken":"rft_...","expiresIn":3600,"user":{"id":"66a10a0f1f3d2b0012a11111","roles":["student"]}}
```
- Status Codes: 200, 401, 400, 500
- Error (401)
json
```plain text
{"error":{"code":"UNAUTHORIZED","message":"Invalid credentials"}}
```
### 1.3 Refresh Token
- Method: POST
- Endpoint: `/auth/refresh`
- Authentication: None (uses refresh token)
- Request Body
json
```plain text
{"refreshToken":"rft_..."}
```
- Response Body (200)
json
```plain text
{"accessToken":"eyJ...","expiresIn":3600}
```
- Status Codes: 200, 401, 400, 500
### 1.4 Logout
- Method: POST
- Endpoint: `/auth/logout`
- Authentication: Bearer
- Request Body
json
```plain text
{"refreshToken":"rft_..."}
```
- Response Body (200)
json
```plain text
{"success":true}
```
- Status Codes: 200, 401, 400
## 2) Users Module
### 2.1 Get My Profile
- Method: GET
- Endpoint: `/users/me`
- Authentication: Bearer
- Response Body (200)
json
```plain text
{"id":"66a10a0f1f3d2b0012a11111","name":{"first":"Ishika","last":"B"},"email":"ishika@university.edu","roles":["student"],"profile":{"department":"CSE","year":2,"interests":["AI"]},"settings":{"notifyEmail":true,"notifyPush":true,"timezone":"Asia/Kolkata"}}
```
- Status Codes: 200, 401, 500
### 2.2 Update My Profile
- Method: PATCH
- Endpoint: `/users/me`
- Authentication: Bearer
- Request Body
json
```plain text
{"profile":{"year":3,"interests":["AI","Hackathons"]},"settings":{"notifyEmail":false}}
```
- Response Body (200)
json
```plain text
{"success":true,"user":{"id":"66a10a0f1f3d2b0012a11111"}}
```
- Status Codes: 200, 400, 401, 500
### 2.3 Admin: List Users
- Method: GET
- Endpoint: `/users?...`
- Authentication: Bearer (Admin)
- Response Body (200)
json
```plain text
{"items":[{"id":"66a10...","email":"ishika@university.edu","roles":["student"],"status":"active"}],"page":1,"limit":20,"total":1420}
```
### 2.4 Admin: Update User Roles/Status
- Method: PATCH
- Endpoint: `/users/{userId}`
- Authentication: Bearer (Admin)
- Request Body
json
```plain text
{"roles":["organizer"],"status":"active"}
```
- Response Body (200)
json
```plain text
{"success":true}
```
Status Codes: 200, 400, 401, 500<br><br>
## 3) Clubs Module
### 3.1 Create Club
- Method: POST
- Endpoint: `/clubs`
- Authentication: Bearer (Faculty/Admin)
- Request Body
json
```plain text
{"name":"UniSphere AI Club","slug":"unispher-ai-club","description":"Workshops and talks.","category":"Tech","visibility":"university_only","facultyAdvisorId":"66a10a0f1f3d2b0012a33333"}
```
- Response Body (201)
json
```plain text
{"club":{"id":"66a10a0f1f3d2b0012a22222","name":"UniSphere AI Club","slug":"unispher-ai-club"}}
```
- Status Codes: 201, 400, 401, 403, 409
- Error (409)
json
```plain text
{"error":{"code":"CONFLICT","message":"slug already exists"}}
```
### 3.2 List Clubs
- Method: GET
- Endpoint: `/clubs?category=Tech&visibility=university_only&q=AI&page=1&limit=20`
- Authentication: Bearer (or Public if allowed by policy)
- Response Body (200)
json
```plain text
{"items":[{"id":"66a10...","name":"UniSphere AI Club","category":"Tech","visibility":"university_only"}],"page":1,"limit":20,"total":12}
```
- Status Codes: 200, 401, 500
### 3.3 Get Club Details
- Method: GET
- Endpoint: `/clubs/{clubId}`
- Authentication: Bearer (depending on club visibility)
- Response Body (200)
json
```plain text
{"id":"66a10...","name":"UniSphere AI Club","membersCount":54,"facultyAdvisorId":"66a10...","visibility":"university_only"}
```
- Status Codes: 200, 401, 403, 404
### 3.4 Join Club
- Method: POST
- Endpoint: `/clubs/{clubId}/join`
- Authentication: Bearer (Student)
- Request Body
json
```plain text
{"role":"member"}
```
- Response Body (200)
json
```plain text
{"success":true,"membership":{"clubId":"66a10...","role":"member","status":"active"}}
```
- Status Codes: 200, 401, 404, 409
- Error (409)
json
```plain text
{"error":{"code":"CONFLICT","message":"Already a member"}}
```
### 3.5 Update Member Role
- Method: PATCH
- Endpoint: `/clubs/{clubId}/members/{userId}`
- Authentication: Bearer (Organizer/Club Lead/Admin)
- Request Body
json
```plain text
{"role":"lead","status":"active"}
```
- Response Body (200)
json
```plain text
{"success":true}
```
- Status Codes: 200, 401, 403, 404
## 4) Events Module
### 4.1 Create Event (Draft/Pending)
- Method: POST
- Endpoint: `/events`
- Authentication: Bearer (Organizer/Faculty/Admin)
- Request Body
json
```plain text
{"title":"AI Workshop: Intro to LLMs","description":"Hands-on session.","tags":["AI","Workshop"],"clubId":"66a10a0f1f3d2b0012a22222","schedule":{"startAt":"2026-07-20T09:30:00Z","endAt":"2026-07-20T12:00:00Z","timezone":"Asia/Kolkata"},"location":{"mode":"offline","venue":"Main Auditorium","room":"A1"},"capacity":{"limit":200,"waitlistEnabled":true},"registration":{"openAt":"2026-07-06T00:00:00Z","closeAt":"2026-07-20T09:00:00Z","requiresApproval":false}}
```
- Response Body (201)
json
```plain text
{"event":{"id":"66a10a0f1f3d2b0012a44444","approval":{"status":"pending"}}}
```
- Status Codes: 201, 400, 401, 403
### 4.2 List Events (Discover)
- Method: GET
- Endpoint: `/events?status=approved&from=2026-07-01&to=2026-08-01&tag=AI&q=workshop&page=1&limit=20`
- Authentication: Bearer (student feed) / Public optional
- Response Body (200)
json
```plain text
{"items":[{"id":"66a10...","title":"AI Workshop: Intro to LLMs","startAt":"2026-07-20T09:30:00Z","venue":"Main Auditorium"}],"page":1,"limit":20,"total":41}
```
- Status Codes: 200, 400
### 4.3 Get Event Details
- Method: GET
- Endpoint: `/events/{eventId}`
- Authentication: Bearer (respect visibility/approval)
- Response Body (200)
json
```plain text
{"id":"66a10...","title":"AI Workshop: Intro to LLMs","approval":{"status":"approved"},"schedule":{"startAt":"2026-07-20T09:30:00Z","endAt":"2026-07-20T12:00:00Z"},"capacity":{"limit":200},"analytics":{"registeredCount":120,"checkedInCount":0}}
```
- Status Codes: 200, 401, 403, 404
### 4.4 Update Event
- Method: PATCH
- Endpoint: `/events/{eventId}`
- Authentication: Bearer (Event Organizer/Admin)
- Request Body
json
```plain text
{"description":"Updated agenda","tags":["AI","Workshop","LLM"]}
```
- Response Body (200)
json
```plain text
{"success":true}
```
- Status Codes: 200, 400, 401, 403, 404
### 4.5 Submit for Approval
- Method: POST
- Endpoint: `/events/{eventId}/submit`
- Authentication: Bearer (Organizer/Faculty)
- Response Body (200)
json
```plain text
{"success":true,"approval":{"status":"pending"}}
```
- Status Codes: 200, 401, 403, 404, 409
- Error (409)
json
```plain text
{"error":{"code":"CONFLICT","message":"Event not in draft state"}}
```
### 4.6 Admin Approve/Reject
- Method: POST
- Endpoint: `/events/{eventId}/review`
- Authentication: Bearer (Admin/Faculty Approver)
- Request Body
json
```plain text
{"decision":"approved","reason":"Looks good"}
```
- Response Body (200)
json
```plain text
{"success":true,"approval":{"status":"approved","reviewedAt":"2026-07-05T08:00:00Z"}}
```
- Status Codes: 200, 401, 403, 404, 400<br><br>
## 5) Registrations Module
### 5.1 Register for Event
- Method: POST
- Endpoint: `/events/{eventId}/registrations`
- Authentication: Bearer (Student)
- Request Body
json
```plain text
{"answers":{"department":"CSE"}}
```
- Response Body (201)
json
```plain text
{"registration":{"id":"66a10a0f1f3d2b0012a66666","status":"registered","registeredAt":"2026-07-07T06:00:00Z"},"ticket":{"qrPassUrl":"https://unispher.app/passes/66a10..."}}
```
- Authentication: Bearer
- Status Codes: 201, 401, 404, 409, 400
- Error (409)
json
```plain text
{"error":{"code":"CONFLICT","message":"Already registered"}}
```
### 5.2 List My Registrations
- Method: GET
- Endpoint: `/registrations/me?from=2026-07-01&to=2026-08-01&status=registered`
- Authentication: Bearer
- Response Body (200)
json
```plain text
{"items":[{"eventId":"66a10...","eventTitle":"AI Workshop: Intro to LLMs","status":"registered"}],"total":3}
```
- Status Codes: 200, 401
### 5.3 Cancel Registration
- Method: DELETE
- Endpoint: `/registrations/{registrationId}`
- Authentication: Bearer (Owner/Admin)
- Request Body: None
- Response Body (200)
json
```plain text
{"success":true}
```
- Status Codes: 200, 401, 403, 404, 409
## 6) Attendance Module
### 6.1 Get Check-in QR Payload (optional design)
- Method: GET
- Endpoint: `/events/{eventId}/checkin/token`
- Authentication: Bearer (Registered Student)
- Response Body (200)
json
```plain text
{"eventId":"66a10...","qrToken":"chk_opaque_token","expiresAt":"2026-07-20T10:00:00Z"}
```
- Status Codes: 200, 401, 403, 404
### 6.2 Check-in (QR Scan)
- Method: POST
- Endpoint: `/events/{eventId}/attendance/checkin`
- Authentication: Bearer (Organizer/Admin scanning)
- Request Body
json
```plain text
{"qrToken":"chk_opaque_token","deviceId":"gate-tab-01"}
```
- Response Body (200)
json
```plain text
{"success":true,"attendance":{"id":"66a10a0f1f3d2b0012a77777","userId":"66a10a0f1f3d2b0012a11111","status":"checked_in","checkedInAt":"2026-07-20T09:40:00Z"}}
```
- Status Codes: 200, 400, 401, 403, 404, 409
- Error (400 invalid/expired token)
json
```plain text
{"error":{"code":"VALIDATION_ERROR","message":"Invalid or expired QR token"}}
```
- Error (409 already checked in)
json
```plain text
{"error":{"code":"CONFLICT","message":"Already checked in"}}
```
### 6.3 Manual Check-in
- Method: POST
- Endpoint: `/events/{eventId}/attendance/manual`
- Authentication: Bearer (Organizer/Admin)
- Request Body
json
```plain text
{"userId":"66a10a0f1f3d2b0012a11111","note":"ID verified manually"}
```
- Response Body (200)
json
```plain text
{"success":true,"attendance":{"userId":"66a10...","status":"manual"}}
```
- Status Codes: 200, 401, 403, 404, 409
### 6.4 Event Attendance List
- Method: GET
- Endpoint: `/events/{eventId}/attendance?status=checked_in&page=1&limit=50`
- Authentication: Bearer (Organizer/Admin)
- Response Body (200)
json
```plain text
{"items":[{"userId":"66a10...","checkedInAt":"2026-07-20T09:40:00Z","method":"qr"}],"total":120}
```
- Status Codes: 200, 401, 403, 404
## 7) Recommendations Module
### 7.1 Get My Recommendations
- Method: GET
- Endpoint: `/recommendations/me?limit=20`
- Authentication: Bearer
- Response Body (200)
json
```plain text
{"generatedAt":"2026-07-12T10:00:00Z","algorithm":{"name":"hybrid-cf-content","version":"1.0.0"},"items":[{"eventId":"66a10...","title":"AI Workshop: Intro to LLMs","score":0.91,"reasons":["interest:AI"]}]}
```
- Status Codes: 200, 401, 500
### 7.2 Feedback on Recommendation (improves model)
- Method: POST
- Endpoint: `/recommendations/feedback`
- Authentication: Bearer
- Request Body
json
```plain text
{"eventId":"66a10...","action":"like"}
```
- Response Body (200)
json
```plain text
{"success":true}
```
- Status Codes: 200, 400, 401
## 8) Analytics Module
### 8.1 Event Analytics (Organizer/Admin)
- Method: GET
- Endpoint: `/analytics/events/{eventId}`
- Authentication: Bearer (Organizer/Admin)
- Response Body (200)
json
```plain text
{"eventId":"66a10...","registeredCount":120,"checkedInCount":86,"noShowCount":34,"checkInRate":0.716,"timeline":[{"time":"2026-07-20T09:30:00Z","checkedInCumulative":10},{"time":"2026-07-20T10:00:00Z","checkedInCumulative":70}]}
```
- Status Codes: 200, 401, 403, 404
### 8.2 Club Analytics
- Method: GET
- Endpoint: `/analytics/clubs/{clubId}?from=2026-06-01&to=2026-08-01`
- Authentication: Bearer (Club Lead/Faculty/Admin)
- Response Body (200)
json
```plain text
{"clubId":"66a10...","eventsHosted":7,"totalRegistrations":860,"avgAttendanceRate":0.68,"topTags":[{"tag":"AI","count":4}]}
```
- Status Codes: 200, 401, 403, 404
### 8.3 Predict Attendance (Predictive Analytics)
- Method: POST
- Endpoint: `/analytics/events/{eventId}/forecast`
- Authentication: Bearer (Organizer/Admin)
- Request Body
json
```plain text
{"model":"baseline_v1"}
```
- Response Body (200)
json
```plain text
{"eventId":"66a10...","predictedAttendance":155,"confidence":0.74,"factors":["historical club attendance","time-of-day","tag popularity"]}
```
- Status Codes: 200, 401, 403, 404, 500<br>
## 9) Notifications Module
### 9.1 List My Notifications (In-app inbox)
- Method: GET
- Endpoint: `/notifications/me?status=unread&page=1&limit=20`
- Authentication: Bearer
- Response Body (200)
json
```plain text
{"items":[{"id":"66a10a0f1f3d2b0012a88888","type":"event_reminder","title":"Reminder: AI Workshop starts soon","status":"queued","createdAt":"2026-07-20T05:00:00Z"}],"total":5}
```
- Status Codes: 200, 401
### 9.2 Mark Notification Read
- Method: POST
- Endpoint: `/notifications/{notificationId}/read`
- Authentication: Bearer
- Request Body: None
- Response Body (200)
json
```plain text
{"success":true,"readAt":"2026-07-20T05:10:00Z"}
```
- Status Codes: 200, 401, 403, 404
### 9.3 Admin/System: Create Notification
- Method: POST
- Endpoint: `/notifications`
- Authentication: Bearer (Admin/System service account)
- Request Body
json
```plain text
{"userId":"66a10a0f1f3d2b0012a11111","type":"event_update","channel":"in_app","title":"Event updated","message":"Venue changed to Seminar Hall 2","data":{"eventId":"66a10..."},"scheduledFor":"2026-07-19T10:00:00Z"}
```
- Response Body (201)
json
```plain text
{"notification":{"id":"66a10...","status":"queued"}}
```
- Status Codes: 201, 400, 401, 403
##  Notes on Security & Roles (applies to all endpoints)
- **Student**: discover events, register, view own registrations/notifications
- **Organizer/Club Lead**: manage own club events, view attendance, analytics
- **Faculty/Approver**: approve events, oversee clubs
- **Admin**: full access