# Admin Dashboard Requirements

## Purpose
Simple admin interface for Dan/staff to monitor scholarship applications during March 2026 campaign.

## Core Features

### 1. Application Stats (Dashboard Home)
- **Total Applications:** [count]
- **Applications Today:** [count]
- **Average Referrals per Applicant:** [X.X]
- **Top Referrer:** [name] ([count] referrals)
- **Last Application:** [time ago]
- **GHL Webhook Success Rate:** [XX%]

### 2. Applicant List
Table view with:
- Parent Name
- Email
- Phone
- Kid Name
- Kid Age
- Submitted (date/time)
- Referral Count
- Referred By (if applicable)
- GHL Sent (✓/✗)

**Features:**
- Sortable columns (default: newest first)
- Search by name, email, or phone
- Filter: GHL sent/failed, has referrals, was referred
- Pagination (50 per page)

### 3. Applicant Detail View
Click on any applicant to see:
- All form fields (including short answer)
- Referral code + link
- Referral count + list of people they referred
- Referred by (if applicable) with link to referrer's detail
- Submission metadata (IP, timestamp, user agent)
- GHL webhook status + retry log

### 4. Referral Leaderboard (Internal Only)
Top 20 referrers:
- Rank
- Parent Name
- Email
- Referral Count
- Link to their detail page

**Note:** This is INTERNAL only — never expose publicly (prevents gaming).

### 5. Export to CSV
Button: "Export All Applicants"

CSV columns:
- submission_date
- parent_name
- email
- phone
- kid_name
- kid_age
- short_answer
- referral_code
- referred_by_code
- referral_count
- ghl_webhook_sent
- ip_address

**Use case:** Winner selection at end of campaign.

### 6. Manual GHL Webhook Retry
For applicants where GHL webhook failed:
- List all `webhook_sent = false` records
- Button: "Retry Webhook" (attempts to resend)
- Shows success/failure result
- Logs retry attempts

## Technical Approach

### Option A: Simple Read-Only API
No UI — just API endpoints for Dan to query via curl or Postman:
- `GET /api/admin/stats` → JSON stats
- `GET /api/admin/applicants` → JSON list with query params
- `GET /api/admin/applicants/:id` → JSON detail
- `GET /api/admin/export` → CSV download
- `POST /api/admin/webhook-retry/:id` → retry webhook

**Pros:** Fast to build, no frontend work
**Cons:** Less user-friendly (Dan needs technical knowledge)

### Option B: Simple HTML Dashboard
Single-page HTML dashboard that calls the API:
- Built with vanilla JS + Tailwind CSS (no framework overhead)
- Client-side rendering (fetch data from API)
- Basic auth (username/password in env vars)
- No database required for dashboard itself

**Pros:** User-friendly, works in browser
**Cons:** More work to build, requires auth

### Recommendation
**Option B (HTML Dashboard)** — this is a month-long campaign, Dan should be able to check stats without needing curl commands. Keep it simple but functional.

## Authentication
Since this is admin-only:
- HTTP Basic Auth (username/password)
- Credentials in environment variables:
  - `ADMIN_USERNAME=admin`
  - `ADMIN_PASSWORD=[strong password]`
- No user management needed (single admin account)

Alternative: No auth, but use obscure URL (e.g., `/admin-[random-string]`) — security through obscurity (not ideal but acceptable for short campaign).

## Security Notes
- Admin dashboard should NOT be linked from public landing page
- Use HTTPS only
- Rate limit admin endpoints (10 req/min per IP)
- No applicant PII in public-facing API endpoints
- Only admin endpoints have access to full data

## Implementation Checklist
- [ ] API endpoints for stats, list, detail, export
- [ ] CSV export function
- [ ] GHL webhook retry logic
- [ ] Basic auth middleware
- [ ] Simple HTML dashboard (single page)
- [ ] Responsive design (mobile admin access)
- [ ] Test with real data

## MVP Scope
For launch, bare minimum is:
1. Applicant list (sortable, searchable)
2. CSV export
3. Basic auth

Nice-to-haves (can add later):
- Pretty dashboard stats
- Referral leaderboard view
- Webhook retry UI
- Applicant detail page

---
Last updated: 2026-02-24
