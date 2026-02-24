# Supabase Backend - Deployment Checklist

**Project:** USA Ninja Stafford Scholarship Landing Page  
**Status:** Ready for Deployment  
**Estimated Time:** 30-45 minutes

---

## ✅ Pre-Deployment (Complete)

- [x] Database schema designed and tested
- [x] Edge Functions written and validated
- [x] API endpoints documented
- [x] Anti-spam measures implemented
- [x] GHL integration configured
- [x] Referral system built
- [x] Test suite created
- [x] Setup instructions written
- [x] Frontend integration example provided

---

## 📋 Deployment Steps

### Step 1: Create Supabase Project (5 min)
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Name: `stafford-scholarship`
- [ ] Region: `East US (North Virginia)`
- [ ] Pricing: Free tier
- [ ] **Save database password securely**
- [ ] Wait for project to provision (2-3 min)

### Step 2: Copy Credentials (2 min)
- [ ] Go to Project Settings → API
- [ ] Copy **Project URL** → Save to credentials file
- [ ] Copy **anon public key** → Save to credentials file
- [ ] Copy **service_role key** → Save to credentials file (KEEP SECRET!)
- [ ] Note **Project Ref** (from URL: https://[PROJECT_REF].supabase.co)

### Step 3: Deploy Database Schema (5 min)
- [ ] In Supabase Dashboard, go to SQL Editor
- [ ] Click "New Query"
- [ ] Open `database-schema.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run" (bottom right)
- [ ] Verify: "Success. No rows returned"
- [ ] Go to Table Editor → Verify `applicants` table exists

### Step 4: Install Supabase CLI (5 min)
```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version

# Login
supabase login
```
- [ ] Supabase CLI installed
- [ ] Login successful (browser auth)

### Step 5: Link Project (2 min)
```bash
cd /root/.openclaw/workspace/dev/stafford-scholarship

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```
- [ ] Project linked successfully

### Step 6: Set Environment Secrets (5 min)
```bash
# Set all required secrets
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
supabase secrets set GHL_WEBHOOK_URL=https://rest.gohighlevel.com/v1/contacts/
supabase secrets set GHL_API_TOKEN=pit-178e9278-6414-4381-8ba6-3413d6f75e05
supabase secrets set GHL_LOCATION_ID=YDOoobeB3OVivHXdXYJY

# Verify secrets
supabase secrets list
```
- [ ] All 6 secrets set
- [ ] Secrets list shows all keys (values hidden)

### Step 7: Deploy Edge Functions (5 min)
```bash
# Deploy submit function
supabase functions deploy submit

# Deploy referral-stats function
supabase functions deploy referral-stats

# Verify deployment
supabase functions list
```
- [ ] `submit` function deployed
- [ ] `referral-stats` function deployed
- [ ] Both functions show status: "ACTIVE"

### Step 8: Test Submission Endpoint (5 min)
```bash
# Test with curl
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "parentFirstName": "Test",
    "parentLastName": "Parent",
    "parentEmail": "test@example.com",
    "parentPhone": "(555) 123-4567",
    "kidFirstName": "TestKid",
    "kidAge": 10,
    "essay": "This is a test essay with more than fifty characters to meet the minimum requirement.",
    "submissionTimeMs": 5000
  }'
```
Expected response:
```json
{
  "success": true,
  "referralCode": "XXXXXXXX",
  "referralUrl": "https://...",
  "applicantId": "uuid-here"
}
```
- [ ] Test submission successful
- [ ] Referral code generated
- [ ] Response contains all expected fields

### Step 9: Verify in Database (2 min)
- [ ] Go to Supabase → Table Editor → `applicants`
- [ ] Test submission visible
- [ ] All fields populated correctly
- [ ] `referral_code` is 8 characters, unique
- [ ] `submitted_to_ghl` is `true` (if GHL working) or `false`

### Step 10: Test Referral Stats Endpoint (2 min)
```bash
# Use referral code from test submission
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/referral-stats?code=XXXXXXXX" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```
Expected response:
```json
{
  "success": true,
  "referralCode": "XXXXXXXX",
  "referralCount": 0,
  "bonusEntries": 0,
  "totalEntries": 1
}
```
- [ ] Referral stats endpoint working
- [ ] Returns correct data for test applicant

### Step 11: Verify GHL Integration (3 min)
- [ ] Go to GoHighLevel Stafford location
- [ ] Navigate to Contacts
- [ ] Search for test email: `test@example.com`
- [ ] Verify contact created (or check why not)
- [ ] Verify tags applied: `camp-scholarship`, `scholarship-applicant`
- [ ] Verify custom fields populated

**If GHL contact not found:**
- Check `applicants` table: `submitted_to_ghl` should be `false`
- Check Supabase Logs → Edge Functions → `submit` for errors
- Verify GHL API token has write permissions
- Verify GHL location ID is correct

### Step 12: Run Automated Test Suite (5 min)
```bash
# Set environment variables
export SUPABASE_PROJECT_REF=your_project_ref
export SUPABASE_ANON_KEY=your_anon_key

# Run test suite
./test-backend.sh
```
- [ ] All tests passed (or review failures)
- [ ] Duplicate email rejection working
- [ ] Honeypot detection working
- [ ] Validation working correctly

### Step 13: Save Credentials (2 min)
- [ ] Copy `supabase-credentials.template.json`
- [ ] Rename to `supabase-credentials.json`
- [ ] Fill in all credentials
- [ ] Save securely (NOT in git if public repo)

### Step 14: Configure GHL Custom Fields (5 min)
In GoHighLevel Stafford location:
- [ ] Go to Settings → Custom Fields
- [ ] Create: `kid_first_name` (Text)
- [ ] Create: `kid_age` (Number)
- [ ] Create: `ninja_experience` (Text)
- [ ] Create: `essay` (Long Text)
- [ ] Create: `referral_code` (Text)
- [ ] Create: `referred_by_code` (Text)
- [ ] Create: `heard_about` (Text)

---

## ✅ Post-Deployment Verification

### Functional Tests
- [ ] Submit valid application → Success
- [ ] Submit duplicate email → Rejected
- [ ] Submit invalid email → Rejected
- [ ] Submit invalid phone → Rejected
- [ ] Submit short essay → Rejected
- [ ] Submit with referral code → Relationship tracked
- [ ] Get referral stats → Correct count returned
- [ ] Submit 4 times rapidly → Rate limited

### Data Verification
- [ ] All test data in `applicants` table
- [ ] Referral relationships correct in `referred_by_code`
- [ ] Rate limits recorded in `rate_limits` table
- [ ] GHL contacts created (check manually)

### Documentation
- [ ] README.md reviewed and updated
- [ ] API-DOCS.md accurate for live endpoints
- [ ] SETUP-INSTRUCTIONS.md followed successfully
- [ ] Credentials saved securely

---

## 🚀 Ready for Frontend Integration

Once all checks pass:
1. Share `supabase-credentials.json` with frontend dev (dev-browser agent)
2. Provide `API-DOCS.md` for endpoint specifications
3. Share `frontend-integration-example.html` as reference
4. Coordinate on:
   - Landing page URL structure
   - Referral link format
   - Success page design
   - Error handling UI

---

## 📊 Monitoring Setup (Optional)

- [ ] Set up Supabase webhook for new submissions (notify Slack/email)
- [ ] Configure UptimeRobot to monitor endpoints
- [ ] Create admin dashboard link for Dan's team
- [ ] Set calendar reminder for monthly data backup

---

## 🎯 Launch Checklist

Before campaign goes live (March 1, 2026):
- [ ] All deployment steps completed
- [ ] Frontend integrated and tested end-to-end
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] GHL integration confirmed working
- [ ] Social sharing tested
- [ ] Mobile devices tested (iOS + Android)
- [ ] Dan's team has admin access
- [ ] Backup plan documented

---

## 📝 Notes

**Estimated Total Time:** 30-45 minutes (depending on CLI familiarity)

**Prerequisites:**
- Supabase account
- Node.js 18+ and npm
- `curl` and `jq` for testing
- GHL access for verification

**Troubleshooting:**
- If function deploy fails → Update Supabase CLI (`npm install -g supabase@latest`)
- If GHL webhook fails → Check API token permissions
- If rate limiting issues → Clear test data: `DELETE FROM rate_limits WHERE ip_address = 'YOUR_IP'`

**Support:**
- Technical issues: Contact dev-api agent
- GHL setup: Contact Dan's team
- Frontend integration: Contact dev-browser agent

---

**Last Updated:** February 24, 2026  
**Version:** 1.0  
**Status:** Ready for Deployment
