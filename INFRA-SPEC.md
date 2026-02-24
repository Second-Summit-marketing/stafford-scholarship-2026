# USA Ninja Stafford Scholarship Landing Page - Infrastructure Specification

**Project:** Scholarship Landing Page with Referral Tracking  
**Target Launch:** March 2026  
**Last Updated:** February 24, 2026  
**Status:** Architecture Design Phase

---

## Executive Summary

**Recommended Architecture:** Netlify + Netlify Functions + Supabase PostgreSQL

**Rationale:** Zero infrastructure cost, minimal maintenance, production-ready in 1-2 days, 99.9% uptime SLA, auto-scaling, and simple enough for Dan's team to update independently.

**Estimated Setup Time:** 6-8 hours for full production deployment with all anti-spam measures

**Monthly Cost:** $0 (within free tier limits for expected traffic)

---

## Architecture Options Evaluated

### Option 1: Netlify + Netlify Functions + Supabase ⭐ RECOMMENDED

#### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare DNS                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Netlify CDN                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Static Landing Page (React/Next.js or HTML/CSS)   │     │
│  │  - Application form                                │     │
│  │  - Referral link display                           │     │
│  │  - Client-side validation                          │     │
│  │  - Honeypot field                                  │     │
│  └────────────────────────┬───────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐     │
│  │         Netlify Serverless Functions               │     │
│  │                                                     │     │
│  │  /api/submit                                       │     │
│  │    - Rate limiting check                           │     │
│  │    - Email/phone validation                        │     │
│  │    - Duplicate check                               │     │
│  │    - Insert to Supabase                            │     │
│  │    - Generate referral code                        │     │
│  │    - POST to GHL webhook                           │     │
│  │                                                     │     │
│  │  /api/get-applicant?code=XXX                       │     │
│  │    - Retrieve applicant referral link              │     │
│  │    - Return referral count                         │     │
│  └─────────────────────┬───────┬───────────────────────┘     │
└─────────────────────────┼───────┼───────────────────────────┘
                          │       │
         ┌────────────────┘       └──────────────────┐
         │                                           │
┌────────▼──────────┐                    ┌───────────▼────────┐
│  Supabase         │                    │  GoHighLevel       │
│  (PostgreSQL DB)  │                    │  Webhook API       │
│                   │                    │                    │
│  Tables:          │                    │  POST form data    │
│  - applicants     │                    │  on submission     │
│  - referrals      │                    └────────────────────┘
└───────────────────┘
```

#### Tech Stack Details
- **Frontend:** 
  - Option A: Next.js 14 (static export) - recommended for dynamic OG images
  - Option B: Plain HTML/CSS/JS - simpler, faster for single page
- **Backend:** Netlify Functions (Node.js 18+)
- **Database:** Supabase PostgreSQL (free tier: 500MB storage, 2GB transfer)
- **Hosting:** Netlify (free tier: 100GB bandwidth/month, 300 build minutes)
- **DNS:** Cloudflare (free tier)

#### Database Schema
```sql
-- applicants table
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by_code VARCHAR(10), -- NULL if organic
  
  -- Application data
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  age INTEGER,
  guardian_name VARCHAR(200),
  guardian_email VARCHAR(255),
  essay TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  submitted_to_ghl BOOLEAN DEFAULT FALSE,
  
  -- Indexes
  CONSTRAINT fk_referrer 
    FOREIGN KEY (referred_by_code) 
    REFERENCES applicants(referral_code)
);

CREATE INDEX idx_referral_code ON applicants(referral_code);
CREATE INDEX idx_referred_by ON applicants(referred_by_code);
CREATE INDEX idx_email ON applicants(email);
CREATE INDEX idx_phone ON applicants(phone);
CREATE INDEX idx_created_at ON applicants(created_at);

-- Referral stats view
CREATE VIEW referral_stats AS
SELECT 
  a.id,
  a.referral_code,
  a.first_name,
  a.last_name,
  COUNT(r.id) as referral_count
FROM applicants a
LEFT JOIN applicants r ON r.referred_by_code = a.referral_code
GROUP BY a.id, a.referral_code, a.first_name, a.last_name;
```

#### Anti-Spam Implementation

**1. Rate Limiting**
```javascript
// netlify/functions/submit.js
import { rateLimit } from './utils/rate-limit.js';

export const handler = async (event) => {
  const ip = event.headers['x-nf-client-connection-ip'];
  
  // Check rate limit: 3 submissions per IP per hour
  const rateLimitKey = `submit:${ip}`;
  const isAllowed = await rateLimit(rateLimitKey, 3, 3600);
  
  if (!isAllowed) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many submissions. Try again later.' })
    };
  }
  
  // ... rest of submission logic
};
```

**2. Phone Validation**
- Use `libphonenumber-js` for format validation
- Check against Supabase for duplicates
- Require US phone numbers only

**3. Email Validation**
- Regex validation + DNS MX record check
- Supabase unique constraint prevents duplicates
- Block disposable email domains (use `disposable-email-domains` package)

**4. Honeypot Field**
```html
<!-- Invisible to humans, visible to bots -->
<input 
  type="text" 
  name="website" 
  tabindex="-1" 
  autocomplete="off"
  style="position:absolute;left:-9999px"
/>
```
```javascript
// Reject if honeypot filled
if (formData.website) {
  return { statusCode: 400, body: 'Invalid submission' };
}
```

**5. Additional Measures**
- CAPTCHA (optional): Cloudflare Turnstile (free, privacy-friendly)
- Form submission time check (reject if submitted <3 seconds)
- User-Agent validation (block empty or suspicious UAs)

#### GHL Webhook Integration
```javascript
// netlify/functions/submit.js
import fetch from 'node-fetch';

async function submitToGHL(applicantData) {
  const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
  
  const payload = {
    firstName: applicantData.first_name,
    lastName: applicantData.last_name,
    email: applicantData.email,
    phone: applicantData.phone,
    customFields: {
      age: applicantData.age,
      guardianName: applicantData.guardian_name,
      guardianEmail: applicantData.guardian_email,
      essay: applicantData.essay,
      referralCode: applicantData.referral_code,
      referredBy: applicantData.referred_by_code || 'organic'
    }
  };
  
  const response = await fetch(ghlWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GHL_API_KEY}` // if needed
    },
    body: JSON.stringify(payload),
    timeout: 10000 // 10 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`GHL webhook failed: ${response.status}`);
  }
  
  return response.json();
}

// In main handler, after DB insert:
try {
  await submitToGHL(newApplicant);
  await supabase
    .from('applicants')
    .update({ submitted_to_ghl: true })
    .eq('id', newApplicant.id);
} catch (error) {
  console.error('GHL submission failed:', error);
  // Still return success to user, log for manual follow-up
}
```

#### Referral Tracking Implementation
```javascript
// Generate unique 8-character referral code
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

function generateReferralCode() {
  return nanoid(); // e.g., "X4K9N2P7"
}

// On application submission:
const referredByCode = event.queryStringParameters.ref || null;

// Validate referrer exists if code provided
if (referredByCode) {
  const { data: referrer } = await supabase
    .from('applicants')
    .select('id')
    .eq('referral_code', referredByCode)
    .single();
    
  if (!referrer) {
    // Invalid code, treat as organic
    referredByCode = null;
  }
}

// Insert new applicant
const { data: newApplicant } = await supabase
  .from('applicants')
  .insert({
    referral_code: generateReferralCode(),
    referred_by_code: referredByCode,
    // ... other fields
  })
  .select()
  .single();

// Return referral link to user
const referralUrl = `https://stafford-scholarship.usaninjagym.com/?ref=${newApplicant.referral_code}`;
```

**Frontend Referral Display (after submission)**
```html
<div class="success-message">
  <h2>Thank you for applying!</h2>
  <p>Share your unique referral link:</p>
  <div class="referral-box">
    <input type="text" readonly value="https://stafford-scholarship.usaninjagym.com/?ref=X4K9N2P7">
    <button onclick="copyToClipboard()">Copy</button>
  </div>
  <p>Every friend who applies using your link will be tracked!</p>
  <p>Your current referrals: <strong id="referral-count">0</strong></p>
</div>
```

#### Deployment Process

**Initial Setup (one-time)**
1. Create Supabase project → get DB URL and anon key
2. Run schema migration in Supabase SQL editor
3. Create Netlify account, connect to GitHub repo
4. Configure environment variables in Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GHL_WEBHOOK_URL`
   - `GHL_API_KEY` (if needed)
5. Configure custom domain in Netlify + Cloudflare DNS
6. Enable Netlify Forms bot filtering

**Continuous Deployment**
```bash
# .gitignore
node_modules/
.env
.netlify/

# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

**Deploy Commands**
```bash
# Local development
npm install
netlify dev  # runs at localhost:8888

# Deploy to production
git push origin main  # auto-deploys via Netlify

# Manual deploy
netlify deploy --prod
```

#### Pros
✅ **Zero cost** for expected traffic (<10k visits, <1k applications)  
✅ **99.9% uptime** SLA from Netlify  
✅ **Auto-scaling** - handles traffic spikes automatically  
✅ **Zero server maintenance** - no OS updates, no security patches  
✅ **Git-based deployment** - push to main = instant deploy  
✅ **Rollback in 1 click** - every deploy saved  
✅ **Built-in CDN** - fast globally, mobile-optimized  
✅ **Easy updates** - Dan's team can edit and deploy  
✅ **Mature ecosystem** - Netlify + Supabase both battle-tested  

#### Cons
❌ **Cold starts** - first serverless function call in 5 mins ~500ms slower  
❌ **Vendor lock-in** - tied to Netlify/Supabase (but easy to migrate)  
❌ **Free tier limits** - need to monitor (unlikely to hit for this project)  
❌ **Less control** - can't customize server config  

#### Cost Estimate
- **Netlify:** $0 (free tier: 100GB bandwidth, 125k function invocations/month)
- **Supabase:** $0 (free tier: 500MB DB, 2GB transfer, 50k monthly active users)
- **Domain:** $12/year (if new)
- **Total:** ~$1/month

**Traffic assumptions:**
- 5,000 page visits/month
- 1,000 applications/month
- Well within free tier limits

---

### Option 2: Node.js App on Render with PostgreSQL

#### Architecture
```
┌──────────────────────────────────────────────────┐
│             Render.com Platform                  │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Express.js Web Service                │     │
│  │  - Static file serving (public/)       │     │
│  │  - API routes (/api/submit)            │     │
│  │  - Rate limiting middleware            │     │
│  │  - Form validation                     │     │
│  │  - GHL webhook caller                  │     │
│  └────────────┬───────────────────────────┘     │
│               │                                  │
│  ┌────────────▼───────────────────────────┐     │
│  │  Render PostgreSQL Database            │     │
│  │  - Managed Postgres                    │     │
│  │  - Auto backups                        │     │
│  └────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

#### Tech Stack Details
- **Framework:** Express.js
- **Database:** Render PostgreSQL (managed)
- **Hosting:** Render Web Service
- **Rate Limiting:** express-rate-limit + Redis (optional) or in-memory
- **Phone Validation:** libphonenumber-js
- **Email Validation:** validator.js + dns.promises

#### Implementation Highlights
```javascript
// server.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const app = express();

// Rate limiting
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per IP
  message: 'Too many submissions from this IP'
});

// Submission endpoint
app.post('/api/submit',
  submitLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone('en-US'),
    body('website').isEmpty() // honeypot
  ],
  async (req, res) => {
    // Validation, DB insert, GHL webhook
  }
);

app.listen(process.env.PORT || 3000);
```

#### Deployment Process
1. Create GitHub repo
2. Connect to Render → auto-deploy on push
3. Add PostgreSQL database (auto-connected)
4. Set environment variables
5. Deploy

#### Pros
✅ **No cold starts** - server always running  
✅ **Full control** - customize everything  
✅ **Simple stack** - one codebase, one deploy  
✅ **Can use SQLite** - even simpler (no separate DB service)  
✅ **Easy debugging** - traditional server logs  

#### Cons
❌ **Costs money** - $7/month for web service + $7/month for DB  
❌ **Single server** - not auto-scaling (but fine for this traffic)  
❌ **More maintenance** - need to update dependencies, monitor uptime  
❌ **Manual scaling** - if traffic spikes, need to upgrade plan  
❌ **Less fault-tolerant** - one service failure = site down  

#### Cost Estimate
- **Render Web Service (Starter):** $7/month
- **Render PostgreSQL (Starter):** $7/month
- **Total:** $14/month = $168/year

---

### Option 3: GitHub Pages + Supabase (No Backend Functions)

#### Architecture
```
┌─────────────────────────────────────────┐
│       GitHub Pages (Static Site)        │
│  - Form HTML                            │
│  - Client-side JS                       │
└────────────┬────────────────────────────┘
             │
             │ Direct API calls from browser
             │
┌────────────▼────────────────────────────┐
│          Supabase                       │
│  - PostgreSQL Database                  │
│  - Edge Functions (for GHL webhook)     │
│  - Row Level Security (anti-spam)       │
└─────────────────────────────────────────┘
```

#### Tech Stack Details
- **Frontend:** Static HTML/CSS/JS on GitHub Pages
- **Backend:** Supabase Edge Functions (Deno)
- **Database:** Supabase PostgreSQL
- **Rate Limiting:** Supabase RLS + custom function

#### Implementation Highlights
```javascript
// Client-side JS (runs in browser)
async function submitForm(formData) {
  const { data, error } = await supabase
    .from('applicants')
    .insert([{
      first_name: formData.firstName,
      email: formData.email,
      // ... other fields
    }]);
    
  if (error) {
    alert('Error submitting form');
  } else {
    // Show success + referral link
  }
}

// Supabase Edge Function (for GHL webhook)
// Called via database trigger on new insert
Deno.serve(async (req) => {
  const applicant = await req.json();
  
  // POST to GHL
  await fetch(GHL_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(applicant)
  });
  
  return new Response('OK');
});
```

#### Pros
✅ **Free GitHub Pages** hosting  
✅ **Free Supabase** tier  
✅ **Simple deployment** - just push to gh-pages branch  
✅ **Leverages Supabase RLS** for security  

#### Cons
❌ **API keys exposed** - Supabase anon key visible in client JS (this is OK for public data, but less ideal)  
❌ **Rate limiting harder** - need complex RLS rules  
❌ **Less flexible** - client-side only, can't do server-side validation  
❌ **GHL webhook complex** - requires Supabase Edge Functions + DB trigger  
❌ **Harder to debug** - issues happen in browser or edge functions  

#### Cost Estimate
- **GitHub Pages:** $0
- **Supabase:** $0
- **Total:** $0/month

**Not recommended** due to complexity of implementing proper anti-spam and webhook integration without a backend layer.

---

### Option 4: Cloudflare Pages + Workers + D1

#### Architecture
```
┌──────────────────────────────────────────────────┐
│         Cloudflare Global Network                │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Cloudflare Pages (Static Site)        │     │
│  │  - Form HTML, CSS, JS                  │     │
│  └────────────┬───────────────────────────┘     │
│               │                                  │
│  ┌────────────▼───────────────────────────┐     │
│  │  Cloudflare Workers (Edge Functions)   │     │
│  │  - /api/submit handler                 │     │
│  │  - Rate limiting                       │     │
│  │  - Validation                          │     │
│  │  - GHL webhook                         │     │
│  └────────────┬───────────────────────────┘     │
│               │                                  │
│  ┌────────────▼───────────────────────────┐     │
│  │  Cloudflare D1 (SQLite at Edge)        │     │
│  │  - Applicants table                    │     │
│  │  - Referrals                           │     │
│  └────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

#### Tech Stack Details
- **Frontend:** Static site on Cloudflare Pages
- **Backend:** Cloudflare Workers (JavaScript at edge)
- **Database:** Cloudflare D1 (distributed SQLite)
- **Rate Limiting:** Cloudflare built-in

#### Pros
✅ **Completely free** for this scale  
✅ **Fastest performance** - edge compute globally  
✅ **Integrated platform** - all in Cloudflare  
✅ **Best rate limiting** - Cloudflare's infrastructure  
✅ **SQLite simplicity** - no PostgreSQL complexity  

#### Cons
❌ **D1 still beta** - not fully production-ready (though close)  
❌ **Smaller ecosystem** - fewer examples, libraries  
❌ **Learning curve** - Workers API different from Express  
❌ **Limited queries** - D1 has some limitations vs full PostgreSQL  

#### Cost Estimate
- **Cloudflare Pages:** $0
- **Cloudflare Workers:** $0 (free tier: 100k requests/day)
- **Cloudflare D1:** $0 (free tier: 5M reads/month, 100k writes/month)
- **Total:** $0/month

**Good alternative** if Dan's team is comfortable with Cloudflare ecosystem and wants cutting-edge performance.

---

## Final Recommendation: Option 1 (Netlify + Supabase)

### Why This Wins

1. **Production-Ready NOW**: Netlify and Supabase are mature, battle-tested platforms. March 2026 deadline is tight - need zero surprises.

2. **Zero Ops Burden**: Dan's company is budget-conscious. DevOps time = money. This requires zero server maintenance, auto-scales, auto-deploys.

3. **Reliability**: 99.9% uptime SLA from Netlify + Supabase's robust infrastructure = scholarship site won't go down.

4. **Developer Experience**: Any developer can clone the repo, run `netlify dev`, and have it running locally in 2 minutes. Updates deploy automatically on git push.

5. **Cost**: $0/month for years (unless the scholarship gets 100k+ applicants, which would be a good problem).

6. **Security Built-In**: Netlify handles SSL, DDoS protection, and security headers automatically. Supabase has built-in auth and RLS if ever needed.

### When to Reconsider

- **If traffic >> 10k visits/month**: Upgrade to Netlify Pro ($19/month) or switch to Option 2
- **If D1 goes GA**: Option 4 becomes equally attractive
- **If need complex server logic**: Option 2 gives more control
- **If budget increases**: Consider Next.js on Vercel with Vercel Postgres for even better DX

---

## Security & Anti-Spam Implementation Plan

### Layer 1: Client-Side (UX-Friendly)
- Real-time field validation (email format, phone format)
- Honeypot field (hidden from users)
- Form submission time tracking (reject <3s)
- Visual feedback on validation errors

### Layer 2: Server-Side (Netlify Functions)
```javascript
// Validation pipeline
async function validateSubmission(data, context) {
  const checks = [
    checkHoneypot(data),           // Instant bot reject
    checkRateLimit(context.ip),    // 3/hour per IP
    validateEmail(data.email),     // Format + MX record
    validatePhone(data.phone),     // libphonenumber
    checkEmailUnique(data.email),  // Supabase query
    checkPhoneUnique(data.phone),  // Supabase query
    checkSubmissionTime(data._submitTime) // >3s since load
  ];
  
  const results = await Promise.all(checks);
  return results.every(r => r.valid);
}
```

### Layer 3: Database (Supabase)
- UNIQUE constraints on email and phone
- Row-level security policies (if needed later)
- IP address logging for forensics
- User-Agent logging

### Layer 4: Optional (If Spam Persists)
- Cloudflare Turnstile (invisible CAPTCHA, free)
- Email verification step (send confirmation link)
- Admin review queue for flagged submissions

### Monitoring & Alerts
```javascript
// Set up Supabase webhook to Slack/email
// Alert on:
// - >10 submissions in 1 minute
// - Multiple submissions from same IP
// - Submissions with empty required fields (shouldn't happen)
// - GHL webhook failures
```

---

## Deployment Steps (Production Ready)

### Phase 1: Repository Setup (30 mins)
```bash
# Create repo in Second-Summit-marketing org
gh repo create Second-Summit-marketing/stafford-scholarship --private

# Clone and init
git clone git@github.com:Second-Summit-marketing/stafford-scholarship.git
cd stafford-scholarship

# Init project
npm init -y
npm install @supabase/supabase-js nanoid libphonenumber-js validator

# Create structure
mkdir -p netlify/functions public
touch netlify.toml public/index.html netlify/functions/submit.js
```

### Phase 2: Supabase Setup (30 mins)
1. Go to supabase.com → New Project
2. Choose region closest to users (us-east-1)
3. Copy connection details
4. Run schema migration (SQL from above)
5. Test connection with sample insert
6. Enable Row Level Security (optional, for future admin panel)

### Phase 3: Build Application (3-4 hours)
1. Create landing page HTML/CSS
   - Mobile-first responsive design
   - Application form fields
   - Referral link display on success
   - Copy-to-clipboard functionality
2. Create Netlify Function `/api/submit`
   - Implement all validation layers
   - Database insert logic
   - Referral code generation
   - GHL webhook call
3. Create Netlify Function `/api/get-referral-count`
   - Query referral stats
   - Return JSON for applicant
4. Test locally with `netlify dev`

### Phase 4: Deploy & Configure (1 hour)
```bash
# Push to GitHub
git add .
git commit -m "Initial deployment"
git push origin main

# Connect to Netlify
netlify init

# Set environment variables
netlify env:set SUPABASE_URL "https://xxx.supabase.co"
netlify env:set SUPABASE_KEY "your-anon-key"
netlify env:set GHL_WEBHOOK_URL "https://ghl.webhook.url"

# Deploy to production
netlify deploy --prod
```

### Phase 5: Custom Domain (30 mins)
1. In Netlify: Add custom domain `stafford-scholarship.usaninjagym.com`
2. In Cloudflare: Add CNAME record pointing to Netlify
3. Wait for SSL certificate (auto-provisioned)
4. Test HTTPS

### Phase 6: Testing & QA (1-2 hours)
- [ ] Submit test application (organic)
- [ ] Verify referral code generated
- [ ] Submit second application with referral link
- [ ] Verify referral relationship in Supabase
- [ ] Check GHL webhook received data
- [ ] Test rate limiting (submit 4 times quickly)
- [ ] Test duplicate email/phone rejection
- [ ] Test honeypot (fill hidden field)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Load test with 50 concurrent submissions
- [ ] Verify all data in Supabase correct

### Phase 7: Monitoring Setup (30 mins)
1. Set up Supabase webhook to Slack for new submissions
2. Configure Netlify deploy notifications
3. Add UptimeRobot monitor (free, checks every 5 mins)
4. Create simple admin dashboard (optional):
   ```sql
   -- Quick query for Dan to check stats
   SELECT 
     COUNT(*) as total_applicants,
     COUNT(DISTINCT referred_by_code) as applicants_with_referrers,
     MAX(referral_count) as max_referrals
   FROM referral_stats;
   ```

---

## Estimated Timeline

**Total: 6-8 hours for production-ready deployment**

| Phase | Task | Time |
|-------|------|------|
| 1 | Repository & project setup | 30 mins |
| 2 | Supabase database setup | 30 mins |
| 3 | Build frontend & backend | 3-4 hours |
| 4 | Deploy & configure | 1 hour |
| 5 | Custom domain & SSL | 30 mins |
| 6 | Testing & QA | 1-2 hours |
| 7 | Monitoring setup | 30 mins |

**Comfortable deadline for March 2026: 1 week (with buffer for revisions)**

---

## Maintenance & Updates

### Monthly (5 mins)
- Check Netlify/Supabase usage (ensure within free tier)
- Review submission logs for spam patterns
- Verify GHL webhook success rate

### Quarterly (30 mins)
- Update npm dependencies (`npm audit fix`)
- Review and optimize database indexes if slow
- Check Supabase backups enabled

### As Needed
- Update form fields (just edit HTML, push to GitHub)
- Adjust rate limiting if spam increases
- Add new features (admin dashboard, export to CSV, etc.)

---

## Backup & Disaster Recovery

### Automated Backups
- **Supabase:** Daily automatic backups (retained 7 days on free tier)
- **Netlify:** Every deploy saved, instant rollback available
- **Code:** In GitHub (private repo)

### Manual Backup (Monthly)
```sql
-- Export all applicants to CSV
COPY (
  SELECT * FROM applicants
) TO STDOUT WITH CSV HEADER;
```
Save to Google Drive or similar.

### Disaster Recovery Steps
1. **Site goes down**: Check Netlify status page, rollback deploy if needed
2. **Database corruption**: Restore from Supabase backup (click in dashboard)
3. **Accidental deletion**: Supabase retains deleted data for 7 days
4. **Complete loss**: Redeploy from GitHub in <30 mins, restore DB from manual backup

---

## Future Enhancements (Post-Launch)

### Phase 2 (Optional)
- **Admin Dashboard**: View all applications, export CSV, see referral leaderboard
- **Email Notifications**: Send confirmation email to applicants
- **Social Sharing**: Pre-filled tweets/Facebook posts with referral link
- **Analytics**: Google Analytics or Plausible for traffic insights
- **A/B Testing**: Test different form layouts for better conversion

### Scalability Path
If scholarship grows significantly:
1. Upgrade to Netlify Pro ($19/month) for 400GB bandwidth
2. Upgrade to Supabase Pro ($25/month) for better performance
3. Add Redis for distributed rate limiting
4. Add Cloudflare in front for additional DDoS protection
5. Consider dedicated domain for scholarship (shorter referral links)

---

## Questions for Dan's Team

Before starting implementation, confirm:

1. **GHL Webhook Format**: What exact field names does GHL expect in the POST body?
2. **Domain**: Will this be subdomain of usaninjagym.com or separate domain?
3. **Form Fields**: Confirmed list of required fields for scholarship application?
4. **Application Period**: When does it open/close? (for date validation)
5. **Success Criteria**: How will we measure referral program success?
6. **Admin Access**: Who needs access to view applications in real-time?

---

## Conclusion

The **Netlify + Netlify Functions + Supabase** architecture provides the optimal balance of:
- **Zero cost** (critical for Dan's budget)
- **Zero maintenance** (no servers to manage)
- **Production reliability** (99.9% uptime)
- **Fast deployment** (production-ready in 1 week)
- **Easy updates** (git push = deployed)
- **Built-in security** (SSL, DDoS protection, headers)
- **Scalability** (handles traffic spikes automatically)

This is the architecture I would choose for a client project with these exact requirements. It's boring, proven technology that just works - which is exactly what a scholarship site needs.

**Next Step:** Get approval from Dan's team, then start Phase 1 (Repository Setup).

---

**Document maintained by:** dev-ops agent  
**For questions contact:** Dan or dev-lead agent  
**Last reviewed:** February 24, 2026
