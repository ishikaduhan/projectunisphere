# Professional Software Testing Documentation
**UniSphere – Smart Campus Events & Clubs Hub**
## 1) Testing Strategy
### Scope (Modules)
- Authentication
- Student Dashboard
- Faculty Dashboard
- Admin Dashboard
- Event CRUD
- Event Registration
- QR Attendance
- Notifications
- Club Management
- AI Recommendations
- Analytics
### Test Levels
1. **Unit Tests**
	- Services (auth, events, registrations, attendance, notifications, recommendations, analytics)
	- Validation (schemas, DTOs), utilities (QR token verification), permission guards (RBAC)
2. **API / Contract Tests**
	- REST endpoints: request/response contracts, status codes, pagination, error schema
3. **Integration Tests**
	- DB integration (MongoDB)
	- Email provider integration (sandbox)
	- Background jobs (reminders, digest)
	- Recommendation generation pipeline (offline/online)
4. **End-to-End (E2E)**
	- Browser flows (student discovery → registration → QR pass)
	- Organizer check-in and admin approval flows
5. **Regression**
	- Automated suite executed on every release
6. **UAT**
	- Faculty/admin workflow sign-off in staging
### Test Approach
- Risk-based prioritization (P0/P1 for core flows and security)
- Shift-left security (SAST + dependency scanning early)
- Automation-first for stable flows; manual exploratory for UI/edge cases
- Idempotency & concurrency testing for registrations and check-in endpoints
- Observability-driven verification: logs, requestId correlation, metrics
### Entry Criteria
- Stable build deployed to staging
- API documentation available (endpoints, auth)
- Seed test data prepared
- Test accounts created (Student/Faculty/Organizer/Admin)
### Exit Criteria
- 100% pass on P0 scenarios
- No open Critical/High security findings
- Performance targets met (Section 5)
- Final test report approved
## 2) Functional Test Cases
> Format: Each test has **Preconditions**, **Steps**, **Expected Result**
### 2.1 Authentication
- **AUTH-F-001 — Student login**
	- Preconditions: Student account exists
	- Steps: Login with valid credentials
	- Expected: Access token issued; Student dashboard loads
- **AUTH-F-002 — Role-based access**
	- Steps: Login as Student → attempt to access Admin dashboard route/API
	- Expected: UI blocks access; API returns 403 FORBIDDEN
- **AUTH-F-003 — Refresh token**
	- Steps: Use refresh endpoint after access token expires
	- Expected: New access token returned; old token rejected as expired
### 2.2 Student Dashboard
- **STD-F-001 — Event discovery widgets**
	- Steps: Open dashboard
	- Expected: Upcoming approved events displayed; filters work (tag/date)
- **STD-F-002 — My registrations**
	- Steps: Navigate to “My Events”
	- Expected: Registered events list matches backend; shows QR pass link
### 2.3 Faculty Dashboard
- **FAC-F-001 — View club events**
	- Steps: Faculty opens dashboard → club events
	- Expected: Events list filtered by clubs advised/managed
- **FAC-F-002 — Approve event (if faculty approver role enabled)**
	- Steps: Open pending event → approve
	- Expected: Status becomes approved; organizer notified
### 2.4 Admin Dashboard
- **ADM-F-001 — Pending approvals queue**
	- Expected: Shows pending events sorted by submitted time
- **ADM-F-002 — Manage users**
	- Steps: Update a user role to organizer
	- Expected: Role updated; audit trail captured
### 2.5 Event CRUD
- **EVT-F-001 — Create event draft**
	- Expected: Event saved with status draft/pending and correct fields
- **EVT-F-002 — Edit event**
	- Expected: Only organizer/admin can edit; changes persist
- **EVT-F-003 — Cancel event**
	- Expected: Event status cancelled; registrants notified
### 2.6 Event Registration
- **REG-F-001 — Register for approved event**
	- Expected: Registration created; QR pass generated
- **REG-F-002 — Prevent duplicate registration**
	- Steps: Register twice
	- Expected: Second attempt blocked (409 conflict)
- **REG-F-003 — Capacity + waitlist**
	- Preconditions: Event capacity full, waitlist enabled
	- Expected: New registration becomes waitlisted
### 2.7 QR Attendance
- **ATT-F-001 — QR scan check-in**
	- Expected: Attendance record created; checkedInAt set
- **ATT-F-002 — Replay protection**
	- Steps: Scan same QR twice
	- Expected: Second scan rejected (409 already checked in)
- **ATT-F-003 — Manual check-in**
	- Expected: Organizer can check-in manually with justification note (if required)
### 2.8 Notifications
- **NOTIF-F-001 — Reminder notification**
	- Steps: Registered user; reminder time reached
	- Expected: In-app notification created; email sent if enabled
- **NOTIF-F-002 — Event update**
	- Steps: Organizer changes venue/time
	- Expected: Registrants notified; message contains updated values
### 2.9 Club Management
- **CLUB-F-001 — Join club**
	- Expected: Membership created; shows in “My Clubs”
- **CLUB-F-002 — Change member role**
	- Expected: Only lead/admin can assign roles; reflected immediately
### 2.10 AI Recommendations
- **REC-F-001 — Personalized feed**
	- Preconditions: User interests configured
	- Expected: Recommendations include relevant tags/clubs with explanations (reasons)
- **REC-F-002 — Cold start**
	- Preconditions: New user, no behavior history
	- Expected: Popular + interest-based defaults without errors
### 2.11 Analytics
- **ANL-F-001 — Event analytics counts**
	- Preconditions: N registrations, M check-ins
	- Expected: registeredCount=N, checkedInCount=M, checkInRate=M/N
- **ANL-F-002 — Forecast endpoint**
	- Expected: Returns predictedAttendance + confidence; handles missing data gracefully
## 3) Integration Test Cases
- **INT-001** Auth ↔ Users ↔ RBAC: Token contains correct userId and roles; revoked users blocked.
- **INT-002** Events ↔ Approvals ↔ Notifications: Submitting for approval creates approval record and notifies approver.
- **INT-003** Approve/reject triggers correct notification to organizer.
- **INT-004** Events ↔ Registrations: Concurrent registrations do not exceed capacity (atomic enforcement).
- **INT-005** Registrations ↔ QR Pass ↔ Attendance: QR token validates against registration and event secretVersion.
- **INT-006** Attendance updates analytics counters consistently.
- **INT-007** Notifications ↔ Email Provider: Email send success marks notification sent; failures retry with backoff.
- **INT-008** Recommendations ↔ Events/Interests: Recommendation generator excludes cancelled/unapproved events.
## 4) Security Tests
- **Authentication & Session**: Brute force protection, refresh token rotation, password policy enforcement.
- **Authorization (RBAC) / IDOR**: Students cannot read other students’ data; organizers limited to own events; approver-only access enforced.
- **Input Validation / Injection**: Prevent NoSQL injection, sanitize event/club descriptions, validate file uploads.
- **Data Protection**: No sensitive data in logs, HTTPS enforced, secure headers applied.
- **QR Threat Model**: Token expiration, hash-only storage, secretVersion rotation.
## 5) Performance Tests
- **Targets**: Event list p95 \< 500ms, Register \< 800ms, Check-in \< 300ms, Recommendations \< 700ms.
- **Types**: Load, spike, soak, DB index validation.
- **Scenarios**:
	- PERF-001: 200 req/s check-in for 5 minutes
	- PERF-002: 100 req/s registrations with 10% duplicates
	- PERF-003: 50 req/s event search with tag filters
	## 6) Test Data
	### Test Accounts
	- Student: `student1@...`
	- Faculty: `faculty1@...`
	- Organizer: `organizer1@...`
	- Admin: `admin1@...`
	### Seed Data (Minimum)
	- Clubs: 3 (Tech, Cultural, Sports)
	- Events:
		- 2 approved upcoming
		- 1 pending approval
		- 1 cancelled
		- 1 at capacity with waitlist enabled
	- Users:
		- 10 students with varying interests/tags
	- Registrations:
		- N registrations per event (include waitlisted and cancelled)
	- Attendance:
		- Partial check-ins for analytics validation
	### Edge-case Data
	- Event with missing optional fields (online-only, no venue)
	- Event spanning midnight
	- Very long description (max length boundary)
	- Duplicate-like names/tags to test search
	## 7) Bug Tracking Table
	<table header-row="true" header-column="true">
<tr>
<td>Bug ID</td>
<td>Title</td>
<td>Module</td>
<td>Severity</td>
<td>Priority</td>
<td>Environment</td>
<td>Steps</td>
<td>Expected</td>
<td>Actual</td>
<td>Status</td>
<td>Assignee</td>
<td>Created At</td>
</tr>
<tr>
<td>BUG-001</td>
<td>Duplicate registration allowed</td>
<td>Registration</td>
<td>S1</td>
<td>P0</td>
<td>Staging</td>
<td>Register twice quickly</td>
<td>409 conflict</td>
<td>Two rows created</td>
<td>New</td>
<td></td>
<td></td>
</tr>
	</table>
	**Severity**
	- S0 Blocker
	- S1 Critical
	- S2 Major
	- S3 Minor
	**Workflow**  <br>New → Triaged → In Progress → Fixed → Retest → Closed
	## 8) Final Test Report (Template)
	### Release
	- Version/Build:
	- Environment:
	- Test Window:
	- QA Owner:
	### Summary
	- Total test cases executed:
	- Passed:
	- Failed:
	- Blocked:
	- Pass rate:
	- Defects opened (by severity):
		- S0:
		- S1:
		- S2:
		- S3:
	### Key Results (Highlights)
	- Core flows (Register + QR Check-in + Approvals): ✅/❌
	- RBAC checks: ✅/❌
	- Email notifications: ✅/❌
	- Recommendations sanity: ✅/❌
	- Analytics correctness: ✅/❌
	### Performance Results
	- Event list p95:
	- Register p95:
	- Check-in p95:
	- Recommendations p95:
	### Risks / Known Issues
	- List any remaining limitations, mitigations, and rollback plan.
	### Conclusion
	- **Go/No-Go:** Go / No-Go
	- Notes:
### Test Data Metadata<br><br>
```plain text
test_data = [
  {
    "section":"Test Accounts",
    "accounts":[
      {"role":"Student","email":"student1@..."},
      {"role":"Faculty","email":"faculty1@..."},
      {"role":"Organizer","email":"organizer1@..."},
      {"role":"Admin","email":"admin1@..."}
    ]
  },
  {
    "section":"Seed Data (Minimum)",
    "clubs":["Tech","Cultural","Sports"],
    "events":[
      {"status":"approved","count":2},
      {"status":"pending","count":1},
      {"status":"cancelled","count":1},
      {"status":"capacity_full_waitlist_enabled","count":1}
    ],
    "users":{"students":10,"interests":"varied tags"}
  },
  {
    "section":"Edge-case Data",
    "cases":[
      "Event with missing optional fields (online-only, no venue)",
      "Event spanning midnight",
      "Very long description (max length boundary)",
      "Duplicate-like names/tags to test search"
    ]
  }
]

```
#### Bug Tracking Metadata
<empty-block/>
```plain text
bug_tracking = [
  {
    "bugId":"BUG-001",
    "title":"Duplicate registration allowed",
    "module":"Registration",
    "severity":"S1 Critical",
    "priority":"P0",
    "environment":"Staging",
    "steps":"Register twice quickly",
    "expected":"409 conflict",
    "actual":"Two rows created",
    "status":"New",
    "assignee":"",
    "createdAt":""
  }
]

severity_levels = {
  "S0":"Blocker",
  "S1":"Critical",
  "S2":"Major",
  "S3":"Minor"
}

workflow = [
  "New",
  "Triaged",
  "In Progress",
  "Fixed",
  "Retest",
  "Closed"
]

```
#### Final Test Report Metadata
<empty-block/>
```plain text
final_test_report = {
  "release":{
    "version":"",
    "environment":"",
    "testWindow":"",
    "qaOwner":""
  },
  "summary":{
    "totalCases":"",
    "passed":"",
    "failed":"",
    "blocked":"",
    "passRate":"",
    "defectsBySeverity":{"S0":"","S1":"","S2":"","S3":""}
  },
  "keyResults":{
    "coreFlows":"✅/❌",
    "rbacChecks":"✅/❌",
    "emailNotifications":"✅/❌",
    "recommendationsSanity":"✅/❌",
    "analyticsCorrectness":"✅/❌"
  },
  "performanceResults":{
    "eventListP95":"",
    "registerP95":"",
    "checkInP95":"",
    "recommendationsP95":""
  },
  "risksKnownIssues":"List limitations, mitigations, rollback plan",
  "conclusion":{"goNoGo":"Go/No-Go","notes":""}
}

```