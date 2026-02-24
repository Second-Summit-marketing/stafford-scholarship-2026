# Supabase Backend Setup Instructions
# USA Ninja Stafford Scholarship Landing Page

## Step 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com and sign in (or create free account)
2. Click "New Project"
3. Configure project:
   - **Organization:** Create new or use existing
   - **Project Name:** `stafford-scholarship`
   - **Database Password:** Generate strong password (SAVE THIS!)
   - **Region:** `East US (North Virginia)` (closest to VA)
   - **Pricing Plan:** Free

4. Wait 2-3 minutes for project to provision

5. Once ready, go to Project Settings → API
   - Copy **Project URL** (e.g., https://xxxxx.supabase.co)
   - Copy **anon public** key
   - Copy **service_role** key (keep this SECRET!)

## Step 2: Run Database Schema (5 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `database-schema.sql` file
4. Paste into SQL Editor
5. Click "Run" (bottom right)
6. Verify success (should show "Success. No rows returned")

## Step 3: Deploy Edge Functions (10 minutes)

### Install Supabase CLI
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login
```

### Link Project
```bash
cd /root/.openclaw/workspace/dev/stafford-scholarship

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
# (Project ref is the xxxxx part from your Project URL: https://xxxxx.supabase.co)
```

### Set Environment Variables
```bash
# Create .env file for Edge Functions
cat > .env.local << EOF
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GHL_WEBHOOK_URL=https://rest.gohighlevel.com/v1/contacts/
GHL_API_TOKEN=pit-178e9278-6414-4381-8ba6-3413d6f75e05
GHL_LOCATION_ID=YDOoobeB3OVivHXdXYJY
EOF

# Set secrets in Supabase (for production)
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
supabase secrets set GHL_WEBHOOK_URL=https://rest.gohighlevel.com/v1/contacts/
supabase secrets set GHL_API_TOKEN=pit-178e9278-6414-4381-8ba6-3413d6f75e05
supabase secrets set GHL_LOCATION_ID=YDOoobeB3OVivHXdXYJY
```

### Deploy Functions
```bash
# Deploy both functions at once
supabase functions deploy submit
supabase functions deploy referral-stats

# Verify deployment
supabase functions list
```

## Step 4: Test Functions (5 minutes)

### Test Submission Function
```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "parentFirstName": "John",
    "parentLastName": "Doe",
    "parentEmail": "john.doe@example.com",
    "parentPhone": "(555) 123-4567",
    "kidFirstName": "Jane",
    "kidAge": 10,
    "ninjaExperience": "yes",
    "essay": "My daughter would love this camp because she is very active and loves challenges. She has been watching ninja warrior shows for years and this would be a dream come true for her.",
    "heardAbout": "Google Search",
    "submissionTimeMs": 5000
  }'

# Expected response:
# {
#   "success": true,
#   "message": "Application submitted successfully!",
#   "referralCode": "A3B4C5D6",
#   "referralUrl": "https://stafford-scholarship.usaninjagym.com/?ref=A3B4C5D6",
#   "applicantId": "uuid-here"
# }
```

### Test Referral Stats Function
```bash
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/referral-stats?code=A3B4C5D6" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Expected response:
# {
#   "success": true,
#   "referralCode": "A3B4C5D6",
#   "parentName": "John Doe",
#   "referralCount": 0,
#   "bonusEntries": 0,
#   "totalEntries": 1,
#   "nextTier": {
#     "threshold": 3,
#     "bonusEntries": 2,
#     "remaining": 3
#   }
# }
```

## Step 5: Verify in Supabase Dashboard

1. Go to **Table Editor** → **applicants**
2. Should see your test submission
3. Verify all fields populated correctly
4. Note the `referral_code` generated

## Step 6: Save Credentials

Save the following to `supabase-credentials.json`:

```json
{
  "projectName": "stafford-scholarship",
  "projectRef": "YOUR_PROJECT_REF",
  "projectUrl": "https://YOUR_PROJECT_REF.supabase.co",
  "anonKey": "your_anon_key_here",
  "serviceRoleKey": "your_service_role_key_here",
  "databasePassword": "your_database_password",
  "region": "us-east-1",
  "endpoints": {
    "submit": "https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit",
    "referralStats": "https://YOUR_PROJECT_REF.supabase.co/functions/v1/referral-stats"
  },
  "ghl": {
    "webhookUrl": "https://rest.gohighlevel.com/v1/contacts/",
    "apiToken": "pit-178e9278-6414-4381-8ba6-3413d6f75e05",
    "locationId": "YDOoobeB3OVivHXdXYJY"
  },
  "setupDate": "2026-02-24",
  "status": "production-ready"
}
```

## Step 7: Configure GHL Custom Fields (5 minutes)

In GoHighLevel Stafford location:

1. Go to **Settings** → **Custom Fields**
2. Add the following custom fields:
   - `kid_first_name` (Text)
   - `kid_age` (Number)
   - `ninja_experience` (Text)
   - `essay` (Long Text)
   - `referral_code` (Text)
   - `referred_by_code` (Text)
   - `heard_about` (Text)

## Troubleshooting

### Function deployment fails
```bash
# Check Supabase CLI version
supabase --version

# Update if needed
npm install -g supabase@latest

# Re-login
supabase login
```

### Database connection issues
- Verify project is fully provisioned (wait 5 minutes)
- Check Project URL and keys are correct
- Ensure no typos in SQL schema

### GHL webhook not receiving data
- Verify API token is correct and has permissions
- Check location ID matches Stafford location
- View GHL API logs in Dashboard → Settings → API

### Rate limiting triggered during testing
```sql
-- Clear rate limits in Supabase SQL Editor
DELETE FROM rate_limits WHERE ip_address = 'YOUR_IP';
```

## Next Steps

1. ✅ Supabase project created
2. ✅ Database schema deployed
3. ✅ Edge Functions deployed
4. ✅ Test submission successful
5. ⏳ Integrate with frontend
6. ⏳ Configure custom domain
7. ⏳ Launch campaign!

## Monthly Maintenance

- Check free tier usage (should be well within limits)
- Review spam submissions (honeypot triggered, rate limited IPs)
- Export data backup (SQL Editor → Export to CSV)
- Update Edge Functions if changes needed

## Questions?

Contact dev-api agent or dev-lead for support.
