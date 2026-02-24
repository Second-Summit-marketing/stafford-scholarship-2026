# USA Ninja Stafford Scholarship - Supabase Backend

**Status:** Ready for Deployment  
**Created:** February 24, 2026  
**Tech Stack:** Supabase (PostgreSQL + Edge Functions), GoHighLevel Integration

---

## 📋 Project Overview

Complete backend infrastructure for the USA Ninja Stafford Summer Camp Scholarship landing page with:

- ✅ **PostgreSQL Database** with applicants table and referral tracking
- ✅ **Edge Functions** (Deno) for form submission and referral stats
- ✅ **Anti-Spam Measures** (rate limiting, honeypot, validation)
- ✅ **GHL Integration** (automatic contact creation with custom fields)
- ✅ **Referral System** (unique codes, tier-based bonus entries)
- ✅ **Comprehensive Testing** (automated test suite)

---

## 📂 Project Structure

```
stafford-scholarship/
├── database-schema.sql              # PostgreSQL schema (tables, indexes, functions)
├── supabase-functions/
│   ├── submit/
│   │   └── index.ts                # Form submission endpoint
│   └── referral-stats/
│       └── index.ts                # Referral stats endpoint
├── SETUP-INSTRUCTIONS.md            # Step-by-step setup guide
├── API-DOCS.md                      # Complete API documentation
├── test-backend.sh                  # Automated test suite
├── supabase-credentials.template.json  # Template for credentials
├── DESIGN-SPEC.md                   # Frontend design specification
├── INFRA-SPEC.md                    # Infrastructure specification
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Supabase account (free tier)
- Node.js 18+ and npm
- Supabase CLI (`npm install -g supabase`)
- `curl` and `jq` (for testing)

### Setup Steps

1. **Create Supabase Project** (5 minutes)
   - Follow instructions in `SETUP-INSTRUCTIONS.md`
   - Save credentials to `supabase-credentials.json`

2. **Deploy Database Schema** (5 minutes)
   ```bash
   # Copy database-schema.sql contents
   # Paste into Supabase SQL Editor
   # Click "Run"
   ```

3. **Deploy Edge Functions** (10 minutes)
   ```bash
   # Login to Supabase
   supabase login
   
   # Link project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Set secrets
   supabase secrets set GHL_API_TOKEN=pit-178e9278-6414-4381-8ba6-3413d6f75e05
   supabase secrets set GHL_LOCATION_ID=YDOoobeB3OVivHXdXYJY
   # ... (see SETUP-INSTRUCTIONS.md for all secrets)
   
   # Deploy functions
   supabase functions deploy submit
   supabase functions deploy referral-stats
   ```

4. **Test Everything** (5 minutes)
   ```bash
   # Set environment variables
   export SUPABASE_PROJECT_REF=your_project_ref
   export SUPABASE_ANON_KEY=your_anon_key
   
   # Run test suite
   ./test-backend.sh
   ```

---

## 📊 Database Schema

### Tables

#### `applicants`
- Stores all scholarship applications
- Tracks parent/guardian info, kid details, essay
- Includes referral code relationships
- Metadata: IP address, user agent, submission time

#### `rate_limits`
- Tracks submission attempts by IP
- Enforces 3 submissions per IP per hour

#### `disposable_email_domains`
- Blacklist of disposable email providers
- Prevents spam signups

### Views

#### `referral_stats`
- Real-time aggregation of referral counts
- Calculates bonus entries based on tiers
- Used by `/referral-stats` endpoint

### Functions

#### `check_rate_limit(ip, action, max_attempts, window_minutes)`
- Returns TRUE if under limit, FALSE if exceeded

#### `record_rate_limit_attempt(ip, action)`
- Logs an attempt for rate limiting

#### `generate_referral_code()`
- Generates unique 8-character alphanumeric code
- Excludes confusing characters (0, O, 1, I)

---

## 🔌 API Endpoints

### POST /functions/v1/submit
Submit scholarship application form.

**Example:**
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "parentFirstName": "John",
    "parentLastName": "Doe",
    "parentEmail": "john@example.com",
    "parentPhone": "(555) 123-4567",
    "kidFirstName": "Jane",
    "kidAge": 10,
    "essay": "Essay text here (50-300 characters)...",
    "submissionTimeMs": 5000
  }'
```

**Response:**
```json
{
  "success": true,
  "referralCode": "A3B4C5D6",
  "referralUrl": "https://stafford-scholarship.usaninjagym.com/?ref=A3B4C5D6"
}
```

### GET /functions/v1/referral-stats?code=XXXXXXXX
Get referral statistics for an applicant.

**Example:**
```bash
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/referral-stats?code=A3B4C5D6" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Response:**
```json
{
  "success": true,
  "referralCode": "A3B4C5D6",
  "referralCount": 5,
  "bonusEntries": 2,
  "totalEntries": 3
}
```

Full API documentation: [API-DOCS.md](API-DOCS.md)

---

## 🛡️ Security & Anti-Spam

### Client-Side Protection
- **Honeypot field:** Hidden field that bots fill out
- **Submission timer:** Rejects forms submitted in <3 seconds
- **Input validation:** Real-time feedback on email, phone, essay

### Server-Side Protection
- **Rate limiting:** 3 submissions per IP per hour
- **Email validation:** Format + disposable domain blacklist
- **Phone validation:** US format only (libphonenumber-js)
- **Duplicate prevention:** Unique email and phone constraints
- **Referral cap:** Maximum 20 referrals per applicant

### Database Protection
- **Unique constraints:** Prevent duplicates at DB level
- **Foreign key constraints:** Ensure referral code validity
- **Check constraints:** Enforce age range (6-13), essay length (50-300)

---

## 🔗 GoHighLevel Integration

Every successful submission automatically:
1. Creates/updates contact in GHL Stafford location
2. Applies tags: `camp-scholarship`, `scholarship-applicant`
3. Populates custom fields:
   - `kid_first_name`, `kid_age`, `ninja_experience`
   - `essay`, `referral_code`, `referred_by_code`, `heard_about`

**GHL Configuration Required:**
- Create custom fields in GHL Settings → Custom Fields
- Verify API token has write permissions

**Error Handling:**
- If GHL webhook fails, application still saved to Supabase
- `submitted_to_ghl` flag set to `false` for manual follow-up
- User always receives success response (no error shown)

---

## 🎯 Referral System

### Tier Structure
- **0 referrals:** 1 entry (baseline)
- **3 referrals:** +2 bonus entries (3 total)
- **10 referrals:** +5 bonus entries (6 total)
- **20 referrals (max):** +10 bonus entries (11 total)

### How It Works
1. Every applicant gets unique 8-character referral code
2. Code can be shared via custom URL: `?ref=CODE`
3. When friend applies with code, relationship stored
4. Referral count updates in real-time via `/referral-stats`
5. Bonus entries calculated automatically

### Fraud Prevention
- Referral cap: 20 per applicant (prevents gaming)
- Self-referrals blocked: Can't use your own code
- Invalid codes: Treated as organic (no error shown)
- Duplicate detection: Email/phone must be unique

---

## 🧪 Testing

### Automated Test Suite

Run comprehensive tests:
```bash
export SUPABASE_PROJECT_REF=your_project_ref
export SUPABASE_ANON_KEY=your_anon_key

./test-backend.sh
```

Tests include:
- ✅ Valid submission
- ✅ Duplicate email/phone rejection
- ✅ Honeypot triggering
- ✅ Submission time validation
- ✅ Email/phone format validation
- ✅ Essay length validation
- ✅ Age range validation
- ✅ Referral tracking
- ✅ Referral stats retrieval
- ✅ Rate limiting (optional)

### Manual Testing

Submit test application:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d @test-application.json
```

View in Supabase:
1. Go to Table Editor → applicants
2. Verify all fields populated
3. Check `submitted_to_ghl` flag
4. Verify referral code generated

---

## 📈 Admin Queries

Run in Supabase SQL Editor:

**Total Applicants:**
```sql
SELECT COUNT(*) as total_applicants FROM applicants;
```

**Top Referrers Leaderboard:**
```sql
SELECT 
  parent_first_name || ' ' || parent_last_name as name,
  referral_code,
  referral_count,
  bonus_entries,
  total_entries
FROM referral_stats
ORDER BY referral_count DESC
LIMIT 20;
```

**Recent Submissions (Last 24 Hours):**
```sql
SELECT * FROM applicants
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**GHL Sync Issues:**
```sql
SELECT * FROM applicants WHERE submitted_to_ghl = FALSE;
```

More queries in [API-DOCS.md](API-DOCS.md#admin-queries)

---

## 🔧 Maintenance

### Daily
- Monitor submission count (should be growing)
- Check for GHL sync failures (`submitted_to_ghl = false`)

### Weekly
- Review top referrers leaderboard
- Check for spam patterns (same IP multiple submissions)
- Verify free tier usage not exceeded

### Monthly
- Export data backup (SQL Editor → Export CSV)
- Update disposable email blacklist if needed
- Review and optimize database indexes

### Cleanup Old Data
```sql
-- Clear rate limits older than 24 hours
DELETE FROM rate_limits WHERE attempted_at < NOW() - INTERVAL '24 hours';

-- Archive applicants older than 1 year (if campaign repeats)
-- (Create archive table first)
```

---

## 🚨 Troubleshooting

### Function deployment fails
```bash
# Update Supabase CLI
npm install -g supabase@latest

# Re-login
supabase logout
supabase login

# Re-link project
supabase link --project-ref YOUR_PROJECT_REF
```

### GHL webhook not working
- Verify API token has write permissions
- Check location ID matches Stafford
- Test directly with curl:
  ```bash
  curl -X POST https://rest.gohighlevel.com/v1/contacts/ \
    -H "Authorization: Bearer YOUR_API_TOKEN" \
    -d '{"email":"test@example.com","locationId":"YOUR_LOCATION_ID"}'
  ```

### Rate limiting triggered during testing
```sql
-- Clear test IP from rate limits
DELETE FROM rate_limits WHERE ip_address = 'YOUR_IP';
```

### Database migration errors
- Ensure no typos in SQL
- Run in transaction to rollback on error:
  ```sql
  BEGIN;
  -- Your SQL here
  COMMIT; -- or ROLLBACK; if error
  ```

---

## 📦 Production Checklist

Before launch:

- [ ] Supabase project created and credentials saved
- [ ] Database schema deployed successfully
- [ ] Edge Functions deployed and tested
- [ ] GHL custom fields created
- [ ] GHL webhook tested and confirmed working
- [ ] Test submission from frontend
- [ ] Verify referral tracking works end-to-end
- [ ] Rate limiting tested (optional)
- [ ] Spam submissions rejected properly
- [ ] Admin queries saved for reporting
- [ ] Backup plan documented
- [ ] Monitor dashboard set up (Supabase + GHL)

---

## 📞 Support

**Technical Issues:**
- Check [API-DOCS.md](API-DOCS.md) for API details
- Check [SETUP-INSTRUCTIONS.md](SETUP-INSTRUCTIONS.md) for setup help
- Contact dev-api agent for backend issues

**Business Logic:**
- Contact dev-lead agent for requirements changes
- Contact Dan's team for GHL configuration

**Frontend Integration:**
- See [DESIGN-SPEC.md](DESIGN-SPEC.md) for UI requirements
- Contact dev-browser agent for frontend development

---

## 📝 Next Steps

1. **Create Supabase project** following SETUP-INSTRUCTIONS.md
2. **Deploy database and functions** (20 minutes total)
3. **Test everything** with test-backend.sh
4. **Save credentials** to supabase-credentials.json
5. **Configure GHL custom fields**
6. **Integrate with frontend** (dev-browser agent)
7. **Launch campaign** March 1, 2026!

---

## 📄 License & Credits

**Project:** USA Ninja Challenge - Stafford Scholarship Campaign  
**Company:** Second Summit Marketing  
**Built by:** OpenClaw dev-api agent  
**Date:** February 24, 2026  

**Tech Stack:**
- Supabase (PostgreSQL + Edge Functions)
- Deno (Edge Function runtime)
- GoHighLevel (CRM integration)
- libphonenumber-js (phone validation)

---

**Status:** ✅ Production Ready (awaiting Supabase project creation)  
**Last Updated:** February 24, 2026
