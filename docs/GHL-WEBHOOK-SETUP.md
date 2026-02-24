# GHL Webhook Integration — Stafford Scholarship Landing Page

## Overview
When an applicant submits a valid application, the backend POSTs their data to a GHL webhook URL. GHL captures the lead and creates/updates a contact with relevant tags and custom fields.

## Webhook Setup in GHL

### Step 1: Create Custom Fields (if not already exist)
Navigate to: Settings → Custom Fields

Create the following custom fields for Contacts:
- **Kid First Name** (type: text)
- **Kid Age** (type: number)
- **Scholarship Answer** (type: text area)
- **Referral Code** (type: text) — applicant's own code
- **Referred By Code** (type: text) — who referred them (if applicable)

### Step 2: Create Webhook URL
Navigate to: Settings → Integrations → Webhooks → Create Webhook

1. **Type:** Incoming Webhook
2. **Name:** "Scholarship Application Submissions"
3. **Method:** POST
4. **URL:** (GHL will generate this — save it)

The webhook URL will look like:
```
https://hooks.gohighlevel.com/webhook/[location_id]/[webhook_id]
```

**Save this URL.** It will be configured in the landing page backend as an environment variable.

### Step 3: Create Workflow to Process Webhook Data
Navigate to: Automation → Workflows → Create Workflow

**Trigger:** Webhook received (select the webhook created above)

**Workflow steps:**

1. **Create/Update Contact**
   - Email: `{{webhook.email}}`
   - Phone: `{{webhook.phone}}`
   - First Name: `{{webhook.parent_name}}` (or split if full name)
   - Custom Field "Kid First Name": `{{webhook.kid_name}}`
   - Custom Field "Kid Age": `{{webhook.kid_age}}`
   - Custom Field "Scholarship Answer": `{{webhook.short_answer}}`
   - Custom Field "Referral Code": `{{webhook.referral_code}}`
   - Custom Field "Referred By Code": `{{webhook.referred_by}}`

2. **Add Tags**
   - `camp-scholarship`
   - `scholarship-applicant`
   - `march-2026-scholarship` (for campaign tracking)
   - IF `{{webhook.referred_by}}` exists: `referral` tag

3. **Optional: Send Confirmation Email**
   - Template: "Thank you for applying! You're entered to win..."
   - Include: referral link for sharing
   - CTA: "Share with other parents to earn bonus entries"

4. **Optional: Notify Dan**
   - Internal notification: "New scholarship applicant"
   - Only if you want real-time alerts

5. **Optional: Add to Pipeline**
   - Pipeline: "Scholarship Funnel" (if you create one)
   - Stage: "Applied"

### Step 4: Test the Webhook
Use the landing page test form or send a manual POST:

```bash
curl -X POST https://hooks.gohighlevel.com/webhook/[location_id]/[webhook_id] \
  -H "Content-Type: application/json" \
  -d '{
    "parent_name": "Jane Smith",
    "email": "test@example.com",
    "phone": "+15555551234",
    "kid_name": "Tommy",
    "kid_age": 8,
    "short_answer": "My son loves obstacle courses and building confidence!",
    "referral_code": "ABC12XYZ",
    "referred_by": null
  }'
```

Verify:
- Contact created in GHL
- Tags applied correctly
- Custom fields populated
- Email sent (if configured)

## Payload Structure

The landing page backend will POST this JSON structure:

```json
{
  "parent_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+15555551234",
  "kid_name": "Tommy",
  "kid_age": 8,
  "short_answer": "He loves climbing and being active! This would be an amazing opportunity for him to make friends and build confidence.",
  "referral_code": "ABC12XYZ",
  "referred_by": "XYZ98DEF"
}
```

**Field notes:**
- `phone`: E.164 format (e.g., `+15555551234`)
- `kid_age`: integer between 6-13
- `short_answer`: 50-500 characters
- `referral_code`: 8-character alphanumeric (unique per applicant)
- `referred_by`: null if not referred, otherwise referrer's code

## Error Handling

The landing page backend will:
1. Submit application to database first
2. THEN attempt GHL webhook
3. If webhook fails (timeout, 500 error, etc.):
   - Log the error
   - Mark contact as `webhook_sent: false` in DB
   - Retry up to 3 times with exponential backoff
   - If still fails: flag for manual review

**Manual review process:**
- Admin can query DB for `webhook_sent = false`
- Export those records to CSV
- Manually import to GHL OR re-trigger webhook

## Monitoring

Recommended monitoring in GHL:
- Check webhook logs daily during March campaign
- Alert if webhook failure rate > 5%
- Weekly export of all applicants (backup)

## Backup Plan

If GHL webhook is down or broken:
1. Applications still save to DB (landing page works)
2. Export DB to CSV at end of day
3. Bulk import CSV to GHL manually

**CSV columns for GHL import:**
- First Name (parent_name)
- Email
- Phone
- Custom Field: Kid First Name
- Custom Field: Kid Age
- Custom Field: Scholarship Answer
- Custom Field: Referral Code
- Custom Field: Referred By Code
- Tags: camp-scholarship, scholarship-applicant

## Security Notes

- **Webhook URL is a secret.** Don't commit it to public repos.
- Store it as environment variable: `GHL_WEBHOOK_URL`
- The webhook should accept POST from any IP (landing page origin)
- GHL doesn't require authentication for incoming webhooks (they're secret URLs)
- If webhook URL leaks, regenerate it in GHL

## Post-Campaign

After March 31, 2026:
1. Export all applicants from DB
2. Cross-check against GHL contacts (verify 100% capture)
3. Identify winner(s) from applicants
4. Send runner-up discount codes to all non-winners
5. Archive webhook workflow (or delete if one-time use)

---
**Configuration Required:**
Backend env var: `GHL_WEBHOOK_URL=https://hooks.gohighlevel.com/webhook/[location_id]/[webhook_id]`

**GHL Location:** Stafford (YDOoobeB3OVivHXdXYJY)

---
Last updated: 2026-02-24
