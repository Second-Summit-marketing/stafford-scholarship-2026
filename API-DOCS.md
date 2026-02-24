# API Documentation
# USA Ninja Stafford Scholarship Backend

**Base URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1`  
**Authentication:** Bearer token (Supabase anon key) in `Authorization` header  
**Content-Type:** `application/json`

---

## Endpoints

### 1. POST /submit
Submit scholarship application form.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_ANON_KEY
```

#### Request Body
```json
{
  "parentFirstName": "John",
  "parentLastName": "Doe",
  "parentEmail": "john.doe@example.com",
  "parentPhone": "(555) 123-4567",
  "kidFirstName": "Jane",
  "kidAge": 10,
  "ninjaExperience": "yes",
  "essay": "Essay text here (50-300 characters)...",
  "heardAbout": "Google Search",
  "referredByCode": "A3B4C5D6",
  "submissionTimeMs": 5000,
  "website": ""
}
```

#### Field Validation

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `parentFirstName` | string | Yes | 1-100 characters |
| `parentLastName` | string | Yes | 1-100 characters |
| `parentEmail` | string | Yes | Valid email format, unique, not disposable |
| `parentPhone` | string | Yes | Valid US phone number, unique |
| `kidFirstName` | string | Yes | 1-100 characters |
| `kidAge` | number | Yes | 6-13 |
| `ninjaExperience` | string | No | Any value |
| `essay` | string | Yes | 50-300 characters |
| `heardAbout` | string | No | Any value |
| `referredByCode` | string | No | Valid 8-character referral code |
| `submissionTimeMs` | number | No | Must be ≥3000 (3 seconds) |
| `website` | string | No | Must be empty (honeypot) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Application submitted successfully!",
  "referralCode": "A3B4C5D6",
  "referralUrl": "https://stafford-scholarship.usaninjagym.com/?ref=A3B4C5D6",
  "applicantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Error Responses

**400 Bad Request** - Validation error
```json
{
  "error": "Invalid email format"
}
```

Common error messages:
- `"Invalid submission"` (honeypot triggered)
- `"Please take your time filling out the form"` (submitted too fast)
- `"Invalid email format"`
- `"Disposable email addresses not allowed"`
- `"Invalid US phone number"`
- `"Only US phone numbers accepted"`
- `"Essay must be at least 50 characters"`
- `"Essay must not exceed 300 characters"`
- `"This email has already been used to apply"`
- `"This phone number has already been used to apply"`
- `"Kid's age must be between 6 and 13"`

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "Too many submissions. Please try again in an hour."
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Failed to save application. Please try again."
}
```

---

### 2. GET /referral-stats?code={REFERRAL_CODE}
Get referral statistics for an applicant.

#### Request Headers
```
Authorization: Bearer YOUR_ANON_KEY
```

#### Query Parameters
- `code` (required): 8-character referral code (e.g., `A3B4C5D6`)

#### Success Response (200 OK)
```json
{
  "success": true,
  "referralCode": "A3B4C5D6",
  "parentName": "John Doe",
  "referralCount": 5,
  "bonusEntries": 2,
  "totalEntries": 3,
  "nextTier": {
    "threshold": 10,
    "bonusEntries": 5,
    "remaining": 5
  },
  "appliedAt": "2026-02-24T12:00:00Z"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `referralCode` | string | Applicant's unique referral code |
| `parentName` | string | Full name of parent/guardian |
| `referralCount` | number | Number of successful referrals |
| `bonusEntries` | number | Bonus entries earned from referrals |
| `totalEntries` | number | Total entries (1 base + bonus) |
| `nextTier.threshold` | number | Referrals needed for next tier |
| `nextTier.bonusEntries` | number | Bonus entries at next tier |
| `nextTier.remaining` | number | Referrals remaining to reach tier |
| `appliedAt` | string | ISO 8601 timestamp of application |

#### Referral Tier System
- **0 referrals:** 0 bonus entries (1 total)
- **3 referrals:** 2 bonus entries (3 total)
- **10 referrals:** 5 bonus entries (6 total)
- **20 referrals (max):** 10 bonus entries (11 total)

#### Error Responses

**400 Bad Request** - Missing code parameter
```json
{
  "error": "Missing referral code parameter"
}
```

**404 Not Found** - Invalid referral code
```json
{
  "error": "Referral code not found"
}
```

---

## Rate Limiting

**Submission Endpoint:** 3 requests per IP address per hour

When rate limit is exceeded:
- Returns **429 Too Many Requests**
- User must wait 1 hour before submitting again
- Rate limits reset on a rolling window basis

**Referral Stats Endpoint:** No rate limiting

---

## CORS Configuration

All endpoints support CORS with the following headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

---

## Anti-Spam Measures

### Client-Side (Frontend)
1. **Honeypot field:** Hidden field named `website` that bots fill out
2. **Submission timer:** Track time from page load to submit (min 3 seconds)

### Server-Side (Edge Functions)
1. **Rate limiting:** 3 submissions per IP per hour
2. **Email validation:** Format check + disposable domain blacklist
3. **Phone validation:** US format only, verified with libphonenumber
4. **Duplicate prevention:** Email and phone must be unique
5. **Referral cap:** Maximum 20 referrals per applicant
6. **IP + User-Agent logging:** For forensics and fraud detection

### Database Level
1. **Unique constraints:** Prevent duplicate emails/phones at DB level
2. **Foreign key constraint:** Ensure referral codes are valid

---

## GHL Integration

Every successful submission is automatically forwarded to GoHighLevel:

**Endpoint:** `https://rest.gohighlevel.com/v1/contacts/`  
**Method:** POST  
**Authentication:** Bearer token

### Data Mapping

| Frontend Field | GHL Field |
|----------------|-----------|
| `parentFirstName` | `firstName` |
| `parentLastName` | `lastName` |
| `parentEmail` | `email` |
| `parentPhone` | `phone` |
| `kidFirstName` | `customFields.kid_first_name` |
| `kidAge` | `customFields.kid_age` |
| `ninjaExperience` | `customFields.ninja_experience` |
| `essay` | `customFields.essay` |
| `referralCode` | `customFields.referral_code` |
| `referredByCode` | `customFields.referred_by_code` |
| `heardAbout` | `customFields.heard_about` |

### Tags Applied
- `camp-scholarship`
- `scholarship-applicant`

### Error Handling
If GHL webhook fails:
- Application still saved to Supabase
- `submitted_to_ghl` flag set to `false`
- Error logged for manual follow-up
- User receives success response (no error shown)

---

## Frontend Integration Example

### Form Submission
```javascript
// Track form load time for submission timer
const formLoadTime = Date.now();

// On form submit
async function submitApplication(formData) {
  const submissionTimeMs = Date.now() - formLoadTime;
  
  const payload = {
    parentFirstName: formData.parentFirstName,
    parentLastName: formData.parentLastName,
    parentEmail: formData.parentEmail,
    parentPhone: formData.parentPhone,
    kidFirstName: formData.kidFirstName,
    kidAge: parseInt(formData.kidAge),
    ninjaExperience: formData.ninjaExperience,
    essay: formData.essay,
    heardAbout: formData.heardAbout,
    referredByCode: new URLSearchParams(window.location.search).get('ref') || null,
    submissionTimeMs: submissionTimeMs,
    website: formData.website // Honeypot (should be empty)
  };
  
  const response = await fetch('https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_ANON_KEY'
    },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Show success message with referral link
    showSuccessPage(result.referralCode, result.referralUrl);
  } else {
    // Show error message
    showError(result.error);
  }
}
```

### Get Referral Stats
```javascript
async function getMyReferralStats(referralCode) {
  const response = await fetch(
    `https://YOUR_PROJECT_REF.supabase.co/functions/v1/referral-stats?code=${referralCode}`,
    {
      headers: {
        'Authorization': 'Bearer YOUR_ANON_KEY'
      }
    }
  );
  
  const stats = await response.json();
  
  if (stats.success) {
    // Update UI with stats
    document.getElementById('referral-count').textContent = stats.referralCount;
    document.getElementById('bonus-entries').textContent = stats.bonusEntries;
    document.getElementById('total-entries').textContent = stats.totalEntries;
    document.getElementById('next-tier').textContent = 
      `${stats.nextTier.remaining} more referrals to earn ${stats.nextTier.bonusEntries} bonus entries`;
  }
}
```

---

## Testing

### Test Accounts
Use these for testing (won't count as real submissions):

**Email:** Use `+test` before `@` to create unique test emails:
- `parent+test1@example.com`
- `parent+test2@example.com`

**Phone:** Use test numbers:
- `(555) 000-0001`
- `(555) 000-0002`

### Clearing Test Data
```sql
-- Run in Supabase SQL Editor to delete test submissions
DELETE FROM applicants WHERE parent_email LIKE '%+test%';
DELETE FROM applicants WHERE parent_phone LIKE '%555-000-%';
```

---

## Admin Queries

Run these in Supabase SQL Editor for reporting:

### Total Applicants
```sql
SELECT COUNT(*) as total_applicants FROM applicants;
```

### Top Referrers Leaderboard
```sql
SELECT 
  parent_first_name || ' ' || parent_last_name as name,
  parent_email,
  referral_code,
  referral_count,
  bonus_entries,
  total_entries
FROM referral_stats
ORDER BY referral_count DESC
LIMIT 20;
```

### Recent Submissions (Last 24 Hours)
```sql
SELECT 
  parent_first_name || ' ' || parent_last_name as parent_name,
  kid_first_name,
  kid_age,
  parent_email,
  parent_phone,
  referred_by_code,
  created_at
FROM applicants
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### GHL Sync Issues
```sql
SELECT * FROM applicants WHERE submitted_to_ghl = FALSE;
```

### Potential Spam
```sql
SELECT 
  ip_address,
  COUNT(*) as submission_count,
  MIN(created_at) as first_submission,
  MAX(created_at) as last_submission
FROM applicants
GROUP BY ip_address
HAVING COUNT(*) > 2
ORDER BY submission_count DESC;
```

---

## Support

For issues or questions:
- **Technical:** Contact dev-api agent
- **Business Logic:** Contact dev-lead agent
- **GHL Integration:** Verify API keys in `/root/.openclaw/workspace/shared/config/api-keys.json`

---

**Last Updated:** February 24, 2026  
**Version:** 1.0  
**Status:** Production Ready
