# Scholarship Landing Page — Requirements Specification

## Business Requirements

### Primary Goal
Generate qualified leads for USA Ninja Challenge Stafford summer camp through a scholarship application that creates viral sharing through referral incentives.

### Campaign Details
- **Prize:** 1-2 winners get free week of camp ($349 value)
- **Runner-up offer:** All non-winners get $75 off discount code
- **Duration:** Entire month of March 2026
- **Target audience:** Parents of kids ages 6-13 in Stafford, VA area

### The Hormozi Play
Frame as exclusive/competitive scholarship (not a giveaway). Short answer question creates emotional investment. Referral system incentivizes viral sharing without making it feel transactional.

## Functional Requirements

### Application Form
**Required fields:**
1. Parent's full name (text)
2. Parent's email (email, validated)
3. Parent's phone (tel, US format validated)
4. Kid's first name (text)
5. Kid's age (number, 6-13)
6. Short answer: "Why does your kid deserve a ninja scholarship?" (textarea, 50-500 chars)
7. Honeypot field (hidden, bot trap)

**Validation:**
- Email: valid format, max 1 application per email
- Phone: valid US format, no duplicates
- Short answer: must be 50-500 characters
- Honeypot: if filled, reject silently
- Rate limiting: max 5 submissions per IP per hour

### Referral System
**Mechanics:**
1. Upon valid application submission → generate unique referral code (8-char alphanumeric)
2. Referral link format: `https://[domain]/apply?ref=ABC12XYZ`
3. When someone clicks referral link → store `ref` in session/cookie
4. When referred person submits VALID application → increment referrer's bonus entry count
5. Max 20 referrals per applicant (cap to prevent gaming)

**Anti-Gaming:**
- Referral only counts if referred person completes FULL valid application
- Same email/phone validation applies to referred applicants
- Fingerprinting: track IP + user agent, flag suspicious patterns
- No pre-filled form params (prevent ref link gaming)
- Leaderboard is NOT public (prevents competitive gaming)

**Applicant View:**
After submission, show:
- "Thank you! You're entered."
- Their unique referral link
- Current referral count: "You've referred X parents (X bonus entries)"
- Share buttons: Facebook, text message (SMS), copy link
- Prominent but not pushy CTA

### GHL Webhook Integration
**On valid submission, POST to GHL webhook:**
```json
{
  "parent_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+15555551234",
  "kid_name": "Tommy",
  "kid_age": 8,
  "short_answer": "...",
  "referral_code": "ABC12XYZ",
  "referred_by": "XYZ98DEF" // if applicable, else null
}
```

**GHL should:**
- Create/update contact
- Add tags: `camp-scholarship`, `scholarship-applicant`
- If referred: add tag `referral-source:{referrer_code}`
- Capture custom fields for kid name, kid age, short answer

## Technical Requirements

### Performance
- Mobile-first responsive design
- Page load < 2 seconds on 3G
- Lighthouse score: 90+ mobile performance
- Works on iOS Safari, Chrome Android, Chrome/Firefox/Safari desktop

### Security
- HTTPS only
- Rate limiting at API + server level
- Input sanitization (XSS prevention)
- CSRF protection
- Environment variables for secrets
- No API keys in frontend code

### Data Storage
**Applicants table:**
- id (PK)
- created_at (timestamp)
- parent_name (string)
- email (string, unique)
- phone (string, unique)
- kid_name (string)
- kid_age (integer)
- short_answer (text)
- referral_code (string, unique, indexed)
- referred_by (string, nullable, FK to referral_code)
- referral_count (integer, default 0, max 20)
- ip_address (string, for rate limiting)
- user_agent (string, for fingerprinting)
- webhook_sent (boolean, default false)
- webhook_sent_at (timestamp, nullable)

**Indexes:**
- email (unique)
- phone (unique)
- referral_code (unique)
- referred_by (FK)
- ip_address (rate limiting queries)

## Design Requirements

### Brand Alignment
- USA Ninja Challenge branding (ninjastafford.com style)
- Summer colors: bright, energetic (oranges, yellows, blues, greens)
- Not corporate, not sterile — fun, active, kid-friendly
- Premium feel (not cheap funnel page)

### Hero Section
- fal.ai generated image: kids doing ninja obstacles, summer camp vibes, energetic
- H1: "USA Ninja Challenge Summer Camp Scholarship"
- Subhead: "Win a Free Week of Ninja Camp for Your Child"
- Value prop: "$349 value • Ages 6-13 • Applications close March 31"

### Social Proof Section
- 3-5 testimonials (placeholder from "existing camp parents")
- Format: quote + parent name + kid age
- Photos optional (could use fal.ai for visual diversity)

### Form Section
- Clean, spacious design
- Progress indicator if multi-step (or single page with clear sections)
- Short answer question prominent (this is the engagement hook)
- Submit button: "Submit Application" (not "Enter" or "Sign Up")

### Thank You Page
- Confirmation: "You're entered! Good luck!"
- Referral box (prominent):
  - "Earn Bonus Entries — Share with Other Parents"
  - Unique referral link (click to copy)
  - Your referrals: X (updates live if possible, or on page refresh)
  - Share buttons: Facebook ("Share on Facebook"), Text message ("Text to a Friend"), Copy Link
- Runner-up offer: "All applicants receive a $75 discount code (sent April 1)"
- Camp details: location, website, phone

### Countdown Element
- "Applications close March 31, 2026 at 11:59 PM ET"
- Live countdown timer (days, hours, mins)
- Creates urgency without being scammy

## Copy Direction

### Tone
- Aspirational but accessible
- Parent-to-parent (not corporate marketing)
- Emphasize: kids having fun, building confidence, staying active
- Frame as opportunity, not sales pitch

### Key Messages
1. "Your kid deserves an amazing summer"
2. "Limited spots — apply now"
3. "Every applicant gets a runner-up discount"
4. "Share with friends to earn bonus entries"

### Terminology
- "Apply" not "sign up" or "enter"
- "Scholarship" not "giveaway" or "contest"
- "Your child" or "your kid" (not "children")
- "Ninja camp" not "gymnastics" or "obstacle course" (brand-aligned)

## Testing Requirements

### Pre-Launch Checklist
- [ ] Form validation works (all required fields, email/phone format)
- [ ] Honeypot catches bots (test by filling hidden field)
- [ ] Rate limiting works (try 6+ submissions from same IP)
- [ ] Email uniqueness enforced (try duplicate email)
- [ ] Phone uniqueness enforced (try duplicate phone)
- [ ] Referral link generation works
- [ ] Referral tracking works (submit with ?ref=CODE)
- [ ] Referral count increments correctly
- [ ] Max 20 referrals enforced
- [ ] GHL webhook fires on valid submission
- [ ] GHL contact created with correct tags
- [ ] Mobile responsive (test on iPhone, Android)
- [ ] Page load speed < 2s on 3G
- [ ] All links work (camp website, social share)
- [ ] Countdown timer displays correctly
- [ ] Thank you page shows referral stats

### Test Scenarios
1. **Normal application:** Submit valid form → verify in DB + GHL
2. **Duplicate email:** Submit same email twice → reject second
3. **Duplicate phone:** Submit same phone twice → reject second
4. **Bot submission:** Fill honeypot → silent rejection
5. **Rate limit:** Submit 6 times from same IP → 6th blocked
6. **Referral tracking:** Click ref link → submit form → verify referrer count +1
7. **Invalid ref code:** Click /apply?ref=INVALID → form loads normally, no error
8. **Max referrals:** Create applicant with 20 refs → new ref doesn't count
9. **Share buttons:** Click Facebook/SMS/copy → verify correct behavior

## Deployment Requirements

### Domain
- Subdomain of existing site (e.g., scholarship.ninjastafford.com) OR
- Standalone domain (e.g., ninjastaffordscholarship.com)
- Decision: Dev Ops to recommend based on DNS access

### Hosting
- Production-ready (not dev/staging URL)
- Uptime monitoring
- SSL certificate (auto-renew)
- Backup strategy for database

### Admin Access
- Read-only API endpoint or dashboard to view:
  - Total applicants
  - Referral leaderboard (internal only)
  - Applicant details (for manual review)
- Export to CSV functionality (for winner selection)

### Handoff
Dan needs:
1. Live URL
2. GHL webhook setup instructions
3. Admin access credentials (if dashboard exists)
4. CSV export of all applicants at month end
5. How to select winner (can be manual from CSV)

## Success Metrics

### Campaign Goals
- Target: 200+ applications in March 2026
- Avg 2-3 referrals per applicant (40%+ referral rate)
- 30%+ mobile traffic (expecting Facebook ads)
- < 5% form abandonment rate
- 0 successful bot submissions

### Technical Goals
- 99.9% uptime during March
- 0 security incidents
- < 50ms backend API response time
- GHL webhook success rate > 98%

---
Last updated: 2026-02-24
