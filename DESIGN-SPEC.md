# USA Ninja Stafford Summer Camp Scholarship Landing Page - Design Specification

**Project:** Scholarship + Referral Landing Page  
**Campaign Period:** March 1-31, 2026  
**Target URL:** TBD (GitHub Pages subdomain)  
**Design Date:** February 24, 2026  
**Status:** APPROVED FOR BUILD

---

## Executive Summary

**Goal:** Create a mobile-first scholarship application landing page with viral referral system that generates 500+ quality applications and 40%+ referral participation.

**Success Metrics:**
- 500+ applications by March 31, 2026
- 40%+ applicants share referral link
- <5% fraud rate
- 70%+ form completion rate
- <3s page load time on mobile

**Brand Positioning:** Premium, energetic summer camp experience (not discount/charity). Empowering kids through ninja warrior training.

---

## 1. Visual Design Direction

### Color Palette (USA Ninja Challenge Branding)
```
PRIMARY COLORS:
- Ninja Blue: #0066CC (headers, CTAs, primary elements)
- Action Red: #E21A2C (accents, urgency elements, countdown)

SECONDARY COLORS:
- Energy Orange: #FF6B35 (achievement badges, highlights)
- Victory Yellow: #FFD23F (stars, celebration elements)

NEUTRAL COLORS:
- Pure White: #FFFFFF (background, cards)
- Charcoal: #2D3748 (body text)
- Light Gray: #F7FAFC (section backgrounds)
- Border Gray: #E2E8F0 (dividers, borders)

SEMANTIC COLORS:
- Success Green: #48BB78 (form success, referral count up)
- Error Red: #F56565 (validation errors)
```

### Typography
```
HEADINGS:
- Font: Montserrat, Bold (700-900 weight)
- H1: 36px mobile / 56px desktop
- H2: 28px mobile / 42px desktop
- H3: 22px mobile / 32px desktop

BODY TEXT:
- Font: Open Sans, Regular (400) / Semibold (600)
- Body: 16px (minimum for mobile readability)
- Small: 14px (disclaimers, fine print)

CTA BUTTONS:
- Font: Montserrat, Bold
- Size: 18px
- Letter-spacing: 0.5px
```

### Visual Style
- **Energy:** Dynamic angles (5-10° rotations), motion blur on hero images
- **Action:** Kids mid-obstacle, determination + joy on faces
- **Premium:** High-quality photography, generous white space, subtle shadows
- **Progression:** Visual metaphor of obstacle course = scholarship journey

### Photography Requirements
**Sources (Approved):**
1. ninjastafford.com website gallery
2. usaninjachallenge.com franchise pages
3. USA Ninja Challenge Facebook/Instagram
4. fal.ai for supplementary lifestyle imagery

**Photo Style:**
- High-energy action shots (kids climbing, jumping, succeeding)
- Diverse participants (age, gender, ethnicity)
- Authentic emotions (not staged/stock)
- Bright, natural lighting
- Stafford facility recognizable where possible

**Specific Shots Needed:**
- Hero: Kid triumphantly completing warped wall (wide, epic)
- Why Ninja: Coach high-fiving kid after obstacle
- How It Works: Team of kids cheering together
- Referral Section: Kids sharing/celebrating together
- Testimonial: Parent + kid smiling at camera
- Background Patterns: Obstacle silhouettes (subtle, 5% opacity)

---

## 2. Page Structure & Layout

### Overall Layout (Mobile-First)
```
┌─────────────────────────────────────────┐
│         📱 MOBILE (375px)                │
├─────────────────────────────────────────┤
│  1. Hero Section (fold)                 │
│     - Headline + Subhead                │
│     - Hero Image                        │
│     - Primary CTA                       │
│     - Countdown Timer                   │
├─────────────────────────────────────────┤
│  2. Social Proof                        │
│     - Testimonial Carousel              │
│     - Stats Counter                     │
├─────────────────────────────────────────┤
│  3. Why Ninja Camp Section              │
│     - 3 Benefits (cards)                │
├─────────────────────────────────────────┤
│  4. How It Works                        │
│     - 3-Step Process                    │
│     - Visual Timeline                   │
├─────────────────────────────────────────┤
│  5. Referral Boost Section              │
│     - "Double Your Chances" Headline    │
│     - Tier Visual                       │
│     - SMS Share Emphasis                │
├─────────────────────────────────────────┤
│  6. Application Form (Progressive)      │
│     - Section 1: Parent Info            │
│     - Section 2: Kid Info               │
│     - Section 3: Essay Question         │
│     - Submit Button                     │
├─────────────────────────────────────────┤
│  7. FAQ Accordion                       │
├─────────────────────────────────────────┤
│  8. Final CTA                           │
│     - Urgency Message                   │
│     - Apply Button                      │
├─────────────────────────────────────────┤
│  9. Footer                              │
│     - Contact Info                      │
│     - Links                             │
│     - Trust Badges                      │
└─────────────────────────────────────────┘
```

### Desktop Layout (1200px+)
- Two-column layouts for form sections
- Hero image side-by-side with headline
- Cards displayed in 3-column grid
- Sticky CTA button in header on scroll

---

## 3. Section-by-Section Specifications

### SECTION 1: Hero (Above the Fold)

**Layout:**
```
┌────────────────────────────────────────────┐
│  [USA Ninja Challenge Stafford Logo]       │
│                                            │
│  🏆 WIN A FREE SUMMER                      │
│     CAMP WEEK!                             │
│                                            │
│  $349 Value • Ages 6-13 • Stafford, VA    │
│                                            │
│  [HERO IMAGE: Kid on warped wall]          │
│                                            │
│  [🎯 APPLY FOR SCHOLARSHIP - Big Button]   │
│                                            │
│  ⏰ Applications close in:                 │
│     [23 DAYS : 14 HRS : 32 MIN]           │
│                                            │
│  ✨ 247 families applied  •  12 spots left │
└────────────────────────────────────────────┘
```

**Copy:**
- **H1 (Main Headline):** "Win a FREE Summer Camp Week!"
  - Alt: "Your Kid Could Win a FREE Ninja Camp Week"
  - Alt: "Ninja Scholarship: One Week Free ($349 Value)"
  
- **H2 (Subheadline):** "$349 Value • Ages 6-13 • Stafford, VA"
  
- **CTA Button:** "Apply for Scholarship" (Ninja Blue, 60px height mobile)

- **Countdown Label:** "Applications close in:"

- **Social Proof Ticker:** "✨ [X] families applied  •  Only [Y] weeks available"

**Design Details:**
- Hero image: Full-width background (mobile), 50% width (desktop)
- Headline: Montserrat Black, 36px mobile / 56px desktop, Ninja Blue
- Button: Fixed to bottom on mobile (always visible), centered on desktop
- Countdown: Action Red, bold, tabular numbers
- Social proof: Small, scrolling marquee on mobile

**Interactions:**
- Button click → smooth scroll to form
- Countdown updates every second
- Hero image subtle parallax on desktop

---

### SECTION 2: Social Proof

**Layout:**
```
┌────────────────────────────────────────────┐
│  💬 "This changed my son's life..."        │
│     ⭐⭐⭐⭐⭐                               │
│     - Sarah M., Parent                     │
│                                            │
│  [← Swipe indicator →]                     │
│                                            │
│  📊 500+          🏆 15 Years        ⚡ 9am-3pm │
│     Kids Trained    Experience       Daily    │
└────────────────────────────────────────────┘
```

**Testimonials (Carousel - 3-5 quotes):**
1. "My daughter was shy before camp. Now she's unstoppable! The scholarship made this possible for our family." - **Lisa T., Fairfax**
   
2. "Best investment in our son's summer. He asks to go back every year. The coaches genuinely care." - **Marcus J., Stafford**
   
3. "I never thought we'd afford quality summer camp. Winning the scholarship was life-changing!" - **Amanda K., Fredericksburg**

**Stats Bar:**
- **500+ Kids Trained** (icon: group of kids)
- **15 Years Experience** (icon: trophy)
- **9am-3pm Daily** (icon: clock)
- **Ages 6-13** (icon: star)

**Design Details:**
- Testimonials: White cards with subtle shadow, auto-rotate every 5s
- 5-star rating visual (orange stars)
- Parent name in small gray text
- Stats: 3 columns mobile (stacked), 4 columns desktop
- Stats icons: Custom illustrated, Energy Orange

---

### SECTION 3: Why Ninja Camp?

**Headline:** "More Than Just a Summer Camp"

**Subheadline:** "Build Confidence, Strength, and Friendships That Last"

**3 Benefit Cards:**

**Card 1: 💪 Build Real Confidence**
- Icon: Flexed arm / climbing wall
- Copy: "Watch your kid tackle obstacles they never thought possible. Every challenge completed = confidence earned."
- Image: Kid successfully completing obstacle, coach celebrating

**Card 2: 🤝 Make Lifelong Friends**
- Icon: Handshake / group
- Copy: "No screens, no pressure. Just kids being kids, cheering each other on, and forming real friendships."
- Image: Group of kids in team huddle

**Card 3: 🏋️ Safe, Professional Training**
- Icon: Shield / coach whistle
- Copy: "Certified coaches, age-appropriate challenges, and a focus on growth mindset. Safety first, always."
- Image: Coach spotting kid on balance obstacle

**Design Details:**
- Cards: White background, 16px padding, rounded corners (12px)
- Icons: 48px, Energy Orange
- Headlines: Montserrat Semibold, 20px, Charcoal
- Body: Open Sans, 16px, Gray
- Images: Rounded top corners, 16:9 aspect ratio
- Layout: Stacked mobile, 3-column desktop
- Hover: Subtle lift shadow (desktop only)

---

### SECTION 4: How It Works

**Headline:** "3 Simple Steps to Your Scholarship"

**Visual:** Horizontal timeline (mobile scrolls, desktop full-width)

**Step 1: 📝 Apply (2 Minutes)**
- Icon: Document with checkmark
- Copy: "Fill out the quick application below. Tell us why your kid would thrive at ninja camp."
- Visual: Form icon with progress bar

**Step 2: 📲 Share Your Link (Optional)**
- Icon: Network/share symbol
- Copy: "Get a unique referral link. Every friend who applies = bonus entry for you! (Not required to win)"
- Visual: Phone with share buttons

**Step 3: 🎉 Win & Train (April 2026)**
- Icon: Trophy with confetti
- Copy: "Winners announced first week of April. All other applicants get $75 off any camp week!"
- Visual: Kid celebrating on podium

**Design Details:**
- Timeline: Dotted line connecting steps (Action Red)
- Step numbers: Large circles, Ninja Blue background, white text (64px diameter)
- Icons: 56px, inside step circles
- Copy: Headlines 18px bold, body 16px regular
- Layout: Vertical stack mobile, horizontal desktop
- Animation: Steps fade in on scroll (mobile)

**Important Callout Box:**
```
┌─────────────────────────────────────────┐
│  ⚡ EVERYONE WINS SOMETHING! ⚡         │
│                                         │
│  Even if you don't win the scholarship, │
│  all applicants get $75 OFF any 2026   │
│  summer camp week. Apply risk-free!     │
└─────────────────────────────────────────┘
```
- Background: Light yellow (#FFF9E5)
- Border: 2px dashed Victory Yellow
- Position: Below Step 3

---

### SECTION 5: Referral Boost

**Headline:** "Double Your Chances: Share & Win"

**Subheadline:** "Every friend who applies using your link = bonus entry. It's that simple."

**Visual: Referral Tier Display**
```
┌─────────────────────────────────────────┐
│  YOUR REFERRAL IMPACT                   │
│                                         │
│  🎯 0 referrals  = 1 entry (baseline)   │
│  🚀 3 referrals  = 2 bonus entries      │
│  ⚡ 10 referrals = 5 bonus entries      │
│  🏆 20 referrals = 10 bonus entries     │
│                                         │
│  [Progress Bar: 0/3 to next reward]    │
└─────────────────────────────────────────┘
```

**SMS Share Emphasis Box:**
```
┌─────────────────────────────────────────┐
│  📱 TEXT WINS!                          │
│                                         │
│  Parents trust texts 10x more than     │
│  social media. After applying, text    │
│  your link to friends & family!         │
│                                         │
│  [Example preview of text message]      │
└─────────────────────────────────────────┘
```

**Text Message Preview (Visual):**
```
┌────────────────────────┐
│ iMessage               │
├────────────────────────┤
│ Hey! I just applied    │
│ for a free ninja camp  │
│ scholarship for my kid.│
│ You should too! 👇     │
│                        │
│ [link preview card]    │
│ USA Ninja Stafford     │
│ Win Free Camp Week     │
│ stafford.camp/ref/ABC  │
└────────────────────────┘
```

**Design Details:**
- Section background: Very light blue (#F0F7FF)
- Tier display: Card with gradient border (blue → orange)
- Icons: Progressively larger and more vibrant per tier
- Progress bar: Ninja Blue fill, gray background
- SMS Box: White card with phone mockup
- Text preview: Authentic iOS iMessage styling

**Copy Variants for A/B Testing:**
- Variant A (Competition): "Climb the Leaderboard"
- Variant B (Community): "Help Friends Discover Ninja Camp"
- Variant C (Benefit): "More Referrals = Better Chances"

---

### SECTION 6: Application Form

**Headline:** "Ready to Apply? Let's Go! 🚀"

**Subheadline:** "Takes 2-3 minutes. No essay required (but sharing your story helps!)"

**Form Layout (Progressive Disclosure - 3 Sections):**

#### Section 1: Parent/Guardian Info
```
┌─────────────────────────────────────────┐
│  Parent/Guardian Information            │
│  ────────────────────────────────────   │
│                                         │
│  Your Name *                            │
│  [First Name]         [Last Name]       │
│                                         │
│  Your Email *                           │
│  [example@email.com]                    │
│                                         │
│  Your Phone Number *                    │
│  [(555) 555-5555]                       │
│                                         │
│  [Continue to Kid Info →]               │
└─────────────────────────────────────────┘
```

#### Section 2: Kid's Information
```
┌─────────────────────────────────────────┐
│  About Your Ninja Warrior 🥷            │
│  ────────────────────────────────────   │
│                                         │
│  Kid's First Name *                     │
│  [_________________]                    │
│                                         │
│  Kid's Age *                            │
│  [Dropdown: 6, 7, 8, 9, 10, 11, 12, 13] │
│                                         │
│  Has your kid tried ninja/obstacle      │
│  training before? *                     │
│  ○ Yes, they love it!                   │
│  ○ No, but they're excited to try       │
│  ○ Not sure, but they're active         │
│                                         │
│  [Continue to Story →]                  │
└─────────────────────────────────────────┘
```

#### Section 3: The Important Part (Essay)
```
┌─────────────────────────────────────────┐
│  Tell Us Your Story 💙                  │
│  ────────────────────────────────────   │
│                                         │
│  Why would this scholarship be          │
│  meaningful for your family? *          │
│                                         │
│  [Text area: 50-300 words]              │
│  [Character counter: 0/300]             │
│                                         │
│  💡 Tip: Be authentic! We want to hear  │
│  your kid's dreams, your family's story,│
│  or why summer camp matters to you.     │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  How did you hear about us?             │
│  ○ Facebook/Instagram                   │
│  ○ Google Search                        │
│  ○ Friend/Family Referral               │
│  ○ Current/Past USA Ninja Family        │
│  ○ Other: [_______]                     │
│                                         │
│  [Honeypot field - hidden]              │
│  [Submission timestamp - hidden]        │
│                                         │
│  [ ] I agree to receive follow-up       │
│      communication about the scholarship│
│      and camp programs *                │
│                                         │
│  [🚀 Submit Application (Big Button)]   │
│                                         │
│  By submitting, you agree to our        │
│  scholarship terms and privacy policy.  │
└─────────────────────────────────────────┘
```

**Form Design Details:**
- **Field styling:** 
  - Border: 2px solid #E2E8F0 (gray)
  - Focus: 2px solid #0066CC (blue) + subtle blue shadow
  - Error: 2px solid #F56565 (red) + error message below
  - Success: Green checkmark icon on right
  
- **Labels:** 
  - Montserrat Semibold, 16px, Charcoal
  - Required asterisk in Action Red
  
- **Inputs:** 
  - Open Sans Regular, 16px, min-height 48px (tap-friendly)
  - Placeholder text: Light gray (#A0AEC0)
  
- **Text Area:** 
  - Min-height: 120px (mobile), 160px (desktop)
  - Character counter: Small, gray, bottom-right
  - Turns orange at 250, red at 290
  
- **Continue Buttons:** 
  - Secondary style (white bg, blue border, blue text)
  - Disabled until section valid
  - Smooth scroll to next section
  
- **Submit Button:** 
  - Full-width mobile, centered desktop
  - Ninja Blue background, white text, 56px height
  - Hover: Darker blue + subtle lift
  - Loading state: Spinner + "Submitting..."
  - Success: Green + checkmark + "Success!"

**Validation (Real-Time):**
- Email: Format check + "Looks good! ✓"
- Phone: US format required + auto-format as typing
- Essay: Minimum 50 characters + encouragement ("You're doing great! Keep going...")
- All fields: Validate on blur, show errors immediately

**Honeypot Field (Hidden):**
```html
<input 
  type="text" 
  name="website" 
  tabindex="-1" 
  autocomplete="off"
  style="position:absolute;left:-9999px;top:-9999px"
  aria-hidden="true"
/>
```

---

### SECTION 7: Success State (After Submission)

**Layout:**
```
┌─────────────────────────────────────────┐
│  🎉 Application Submitted!              │
│                                         │
│  Thanks [Parent Name]! We received your │
│  application for [Kid Name].            │
│                                         │
│  📧 Check your email ([email]) for      │
│     confirmation and next steps.        │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  📲 BOOST YOUR CHANCES!                 │
│                                         │
│  Share your unique referral link:       │
│                                         │
│  [https://stafford.camp/ref/X4K9N2P7]   │
│  [📋 Copy Link Button]                  │
│                                         │
│  Every friend who applies = bonus entry!│
│                                         │
│  Current referrals: 0                   │
│  Next reward: 3 referrals = 2 bonus     │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  Share via:                             │
│  [📱 Text Message] [📧 Email]           │
│  [fb] [ig] [twitter]                    │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  What happens next?                     │
│  • March 31: Applications close         │
│  • April 1-5: Winners selected          │
│  • April 7: Winners notified by email   │
│  • All applicants get $75 off code      │
└─────────────────────────────────────────┘
```

**Design Details:**
- Confetti animation on page load (3 seconds)
- Success icon: Large (80px) green circle with checkmark
- Referral link: Light gray box, monospace font, click to select all
- Copy button: Turns green on successful copy + "Copied! ✓"
- Share buttons: Large (60px height), icon + text
- SMS button: Prominently sized (2x others), orange background
- Social buttons: Brand colors, open share dialogs
- Timeline: Vertical, with checkmarks + dates

**Share Button Actions:**
- **Text Message:** Opens native SMS with pre-filled message:
  ```
  Hey! I just applied for a free summer camp week for [Kid Name] at USA Ninja Challenge. You should apply too! [referral link]
  ```
- **Email:** Opens mailto with subject + body pre-filled
- **Facebook:** Share dialog with OG tags
- **Instagram:** Copy link + encouragement to DM

---

### SECTION 8: FAQ Accordion

**Headline:** "Questions? We've Got Answers."

**FAQs (Accordion - Expand/Collapse):**

1. **Who can apply for the scholarship?**
   - Any family with a kid ages 6-13 in the Stafford, VA area. Financial need is considered but not required.

2. **When will winners be announced?**
   - Winners will be selected April 1-5 and notified by email by April 7, 2026.

3. **How many scholarships will you award?**
   - We're awarding 1-2 full-week scholarships ($349 value each), depending on application quality.

4. **What if I don't win?**
   - Every applicant receives a $75 off coupon code for any 2026 summer camp week. Everyone wins something!

5. **Do referrals increase my chances?**
   - Yes! Each valid referral earns you bonus entries. 3 referrals = 2 bonus entries, 10 referrals = 5 bonus entries, etc.

6. **What counts as a "valid" referral?**
   - A referral is valid when someone uses your unique link and completes their application. Self-referrals and duplicate emails don't count.

7. **Is there a limit to referrals?**
   - You can share with as many people as you'd like, but bonus entries cap at 20 referrals (10 bonus entries) to keep it fair.

8. **What if my kid hasn't done ninja training before?**
   - No experience necessary! Our camp is designed for all skill levels, from first-timers to experienced ninjas.

9. **What are the camp dates and times?**
   - Summer 2026 camps run weekly, June-August, Monday-Friday, 9am-3pm. Scholarship winners choose their preferred week (subject to availability).

10. **How is the winner selected?**
    - Applications are reviewed based on: (1) essay quality/authenticity, (2) demonstrated interest in ninja training, (3) family circumstances, and (4) number of referrals (bonus entries).

**Design Details:**
- Accordion: Closed by default, expands on click
- Question: Montserrat Semibold, 18px, Charcoal, + icon (→ becomes ↓)
- Answer: Open Sans Regular, 16px, Gray, padding-left for indent
- Dividers: 1px solid light gray between items
- Animation: Smooth expand/collapse (300ms ease)
- Mobile: Full-width, stack vertically
- Desktop: Two columns if space allows

---

### SECTION 9: Final CTA

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Background: Energetic photo of kids]  │
│                                         │
│  Don't Miss Out on This Opportunity     │
│                                         │
│  Applications close March 31, 2026      │
│                                         │
│  [🎯 Apply Now (Large Button)]          │
│                                         │
│  ✨ 247 families applied  •  12 spots   │
└─────────────────────────────────────────┘
```

**Design Details:**
- Background: Hero-quality image with dark overlay (50% opacity)
- Text: White, centered, over image
- Headline: Montserrat Bold, 32px
- Subheadline: Open Sans, 18px, slightly transparent white
- Button: White background, blue text (inverted from primary)
- Button click: Smooth scroll to form at top
- Padding: 80px vertical (mobile), 120px vertical (desktop)

---

### SECTION 10: Footer

**Layout:**
```
┌─────────────────────────────────────────┐
│  USA Ninja Challenge - Stafford, VA     │
│                                         │
│  📍 455 Garrisonville Rd, Stafford      │
│  📞 (540) 123-4567                      │
│  📧 info@ninjastafford.com              │
│                                         │
│  [ninjastafford.com] [Instagram] [FB]   │
│                                         │
│  Terms & Conditions  •  Privacy Policy  │
│  Scholarship Rules                      │
│                                         │
│  © 2026 USA Ninja Challenge. All rights │
│  reserved. Part of the USA Ninja        │
│  Challenge franchise network.           │
│                                         │
│  🔒 Secure • 🛡️ Privacy Protected       │
└─────────────────────────────────────────┘
```

**Design Details:**
- Background: Dark charcoal (#2D3748)
- Text: Light gray (#CBD5E0)
- Links: Underline on hover, white
- Social icons: White, 32px, horizontal row
- Mobile: Stacked layout, center-aligned
- Desktop: 3-column layout (info, links, legal)

---

## 4. Mobile-Specific Optimizations

### Performance
- **Target:** <3s load time on 3G
- **Techniques:**
  - Lazy load images below fold
  - WebP format with JPG fallback
  - Inline critical CSS
  - Defer non-critical JS
  - CDN delivery (GitHub Pages automatic)

### Touch Interactions
- **Minimum tap target:** 44x44px (Apple HIG standard)
- **Spacing:** 8px minimum between tappable elements
- **Swipe:** Testimonial carousel swipeable
- **Scroll:** Smooth scrolling to form sections
- **Copy button:** Large, easy to tap (full-width on mobile)

### Form Experience
- **Auto-advance:** After each section validated, smooth scroll to next
- **Native inputs:** Use `type="email"`, `type="tel"` for better keyboards
- **Autofill:** Enable browser autofill attributes
- **Progress indicator:** "Step 1 of 3" at top of form
- **Save & Resume:** Optional (could store in localStorage)

### Share Experience
- **Native share sheet:** Use Web Share API where supported
- **SMS pre-filled:** Native SMS app with message ready to send
- **Copy feedback:** Large "Copied!" toast notification
- **One-tap social:** No login required (use share dialogs)

---

## 5. Copy & Messaging

### Voice & Tone
- **Parent-facing:** Professional, empowering, trustworthy
- **Kid-facing:** Exciting, challenging, fun
- **Overall:** Warm, inclusive, community-focused (not transactional)

### Key Messages
1. **This is valuable** ($349 value, professional training, real opportunity)
2. **Everyone wins** (All applicants get $75 off)
3. **Community, not competition** (Help friends discover ninja camp)
4. **No experience needed** (All skill levels welcome)
5. **Safe & professional** (Certified coaches, proven track record)

### Emotional Triggers
- **Pride:** "Watch your kid do things they never thought possible"
- **Belonging:** "Join 500+ families who've discovered ninja camp"
- **FOMO:** "Only 12 spots left" / "Applications close March 31"
- **Empowerment:** "Give your kid a summer they'll never forget"
- **Relief:** "Quality camp without the price tag"

### Words to Use
- Confidence, challenge, growth, community, empower, achieve, overcome, thrive, discover, unlock, transform

### Words to Avoid
- Charity, free (use "scholarship"), deserving, need, poor, struggle, cheap

---

## 6. Technical Implementation Notes

### Required Integrations
1. **Supabase Database:**
   - Store applicant data
   - Track referral relationships
   - Generate unique referral codes

2. **GHL Webhook:**
   - POST form data on submission
   - Tag: `camp-scholarship`, `scholarship-applicant`
   - Include referral code in custom field

3. **Referral System:**
   - Generate 8-character unique code (alphanumeric, uppercase)
   - Track via URL parameter `?ref=CODE`
   - Store referrer relationship in database
   - Display referral count in real-time

4. **Anti-Abuse:**
   - Rate limiting: 3 submissions per IP per hour
   - Email uniqueness: Database constraint
   - Phone uniqueness: Database constraint
   - Honeypot field: Reject if filled
   - Submission time: Reject if <3 seconds
   - Referral cap: Max 20 referrals per applicant

### Analytics Events to Track
- Page view
- Form started (clicked apply)
- Section 1 completed
- Section 2 completed
- Form submitted
- Referral link copied
- Share button clicked (by type: SMS, email, social)
- FAQ expanded
- External links clicked

### SEO Requirements
```html
<title>Win a Free Ninja Camp Scholarship | USA Ninja Stafford</title>
<meta name="description" content="Apply for a free summer camp week at USA Ninja Challenge Stafford. $349 value, ages 6-13. Applications close March 31, 2026.">

<meta property="og:title" content="Win a Free Ninja Summer Camp Week!">
<meta property="og:description" content="I just applied for a scholarship to USA Ninja Challenge. Your kid should too!">
<meta property="og:image" content="[URL to hero image]">
<meta property="og:url" content="[landing page URL]">

<meta name="twitter:card" content="summary_large_image">
```

### Accessibility (WCAG 2.1 AA)
- Semantic HTML5 (header, nav, main, section, footer)
- ARIA labels on form fields
- Focus indicators on all interactive elements (keyboard nav)
- Alt text on all images
- Color contrast ratio ≥4.5:1 for text
- Form validation announces to screen readers

---

## 7. Content Assets Needed

### Images (High Priority)
1. **Hero Image** (1920x1080px)
   - Kid triumphantly completing warped wall
   - Wide shot, epic feeling
   - Source: ninjastafford.com or fal.ai

2. **Why Ninja Cards** (3 images, 800x600px each)
   - Build Confidence: Kid completing obstacle
   - Make Friends: Group of kids team huddle
   - Safe Training: Coach spotting kid

3. **Testimonial Photos** (3-5 images, 400x400px)
   - Parent + kid smiling at camera
   - Diverse families
   - Authentic, not stock

4. **Background Patterns**
   - Obstacle course silhouettes (SVG)
   - 5% opacity for section backgrounds

5. **Icons** (32px, 48px, 64px sizes)
   - Trophy, checkmark, share, phone, email, clock, group, obstacle

### Copy (High Priority)
- Final headline (A/B test 3 variants)
- Testimonial quotes (verify authenticity)
- FAQ answers (review with Dan for accuracy)
- Legal copy (terms, privacy, scholarship rules)
- Email confirmation template (sent after submission)

### Video (Optional, Low Priority)
- 30-second camp highlight reel for hero background
- Auto-play, muted, looping
- Fallback to static image

---

## 8. Testing Checklist

### Pre-Launch Testing
- [ ] Submit form with valid data (organic)
- [ ] Submit form with referral code
- [ ] Verify referral relationship in Supabase
- [ ] Confirm GHL webhook receives data
- [ ] Test rate limiting (submit 4 times quickly)
- [ ] Test duplicate email rejection
- [ ] Test duplicate phone rejection
- [ ] Test honeypot (fill hidden field)
- [ ] Test form validation (each field)
- [ ] Test character counter (essay field)
- [ ] Verify countdown timer accuracy
- [ ] Test referral link copy button
- [ ] Test SMS share (pre-filled message)
- [ ] Test social share buttons
- [ ] Verify success page displays correctly
- [ ] Test FAQ accordion expand/collapse
- [ ] Test scroll-to-form CTA buttons
- [ ] Load test (50 concurrent submissions)

### Device Testing
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (notch)
- [ ] Samsung Galaxy S22 (Android)
- [ ] iPad (tablet)
- [ ] Desktop Chrome (1920x1080)
- [ ] Desktop Safari (Mac)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)

### Performance Testing
- [ ] Google PageSpeed Insights (>90 mobile score)
- [ ] Lighthouse audit (accessibility, performance, SEO)
- [ ] 3G throttling test (<3s load time)
- [ ] Image optimization check (all WebP with fallback)

### Accessibility Testing
- [ ] Keyboard navigation (tab through entire form)
- [ ] Screen reader test (NVDA or VoiceOver)
- [ ] Color contrast check (all text ≥4.5:1)
- [ ] Focus indicators visible
- [ ] Form errors announced

---

## 9. Launch Checklist

### Pre-Launch (1 Week Before)
- [ ] Design approved by Dan's team
- [ ] All copy finalized and approved
- [ ] Images sourced and optimized
- [ ] Supabase database schema created
- [ ] GHL webhook URL confirmed and tested
- [ ] GitHub Pages repository created
- [ ] Domain/subdomain configured
- [ ] SSL certificate active
- [ ] Analytics tracking installed (if using)
- [ ] Staging site QA complete

### Launch Day (March 1, 2026)
- [ ] Deploy to production (GitHub Pages)
- [ ] Verify DNS propagation
- [ ] Test live site (full submission flow)
- [ ] Verify GHL webhook live
- [ ] Post announcement to social media
- [ ] Email existing customer list
- [ ] Monitor error logs (Supabase, browser console)
- [ ] Monitor submission rate (first hour)

### Post-Launch (Week 1)
- [ ] Daily submission count check
- [ ] Referral system working correctly
- [ ] No spam/fraud patterns detected
- [ ] GHL integration 100% success rate
- [ ] Page load time <3s
- [ ] No critical errors reported
- [ ] Social share tracking (which channels working)

---

## 10. Success Metrics

### Primary KPIs
- **Total Applications:** Target 500+ by March 31
- **Form Completion Rate:** Target 70%+ (started → submitted)
- **Referral Participation:** Target 40%+ (submitted → shared link)
- **Viral Coefficient:** Target >0.8 (each applicant brings 0.8 new applicants)
- **Fraud Rate:** Target <5% (flagged submissions / total)

### Secondary Metrics
- Page load time: <3s on mobile
- Bounce rate: <40%
- Time on page: >2 minutes average
- Share button clicks: SMS should be 10x social
- Referral link clicks: >60% of shares result in click
- Mobile traffic: Expected >60%

### Qualitative Metrics
- Essay quality (manually reviewed sample)
- Testimonial collection (follow-up with winners)
- Parent feedback (email survey post-campaign)

---

## 11. Appendix: Technical Specifications

### Responsive Breakpoints
```css
/* Mobile First */
:root {
  --mobile: 375px;
  --tablet: 768px;
  --desktop: 1024px;
  --wide: 1440px;
}
```

### Color Variables
```css
:root {
  --ninja-blue: #0066CC;
  --action-red: #E21A2C;
  --energy-orange: #FF6B35;
  --victory-yellow: #FFD23F;
  --white: #FFFFFF;
  --charcoal: #2D3748;
  --light-gray: #F7FAFC;
  --border-gray: #E2E8F0;
  --success-green: #48BB78;
  --error-red: #F56565;
}
```

### Typography Scale
```css
:root {
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Open Sans', sans-serif;
  
  --h1-mobile: 36px;
  --h1-desktop: 56px;
  --h2-mobile: 28px;
  --h2-desktop: 42px;
  --h3-mobile: 22px;
  --h3-desktop: 32px;
  --body: 16px;
  --small: 14px;
}
```

### Spacing Scale
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

### Component Specifications

**Button (Primary CTA)**
```css
.btn-primary {
  background: var(--ninja-blue);
  color: white;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 18px;
  padding: 16px 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
  width: 100%; /* mobile */
}

.btn-primary:hover {
  background: #0052A3; /* darker blue */
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,102,204,0.3);
}
```

**Form Input**
```css
.form-input {
  font-family: var(--font-body);
  font-size: 16px;
  padding: 14px 16px;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  min-height: 48px;
  width: 100%;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--ninja-blue);
  box-shadow: 0 0 0 3px rgba(0,102,204,0.1);
}

.form-input.error {
  border-color: var(--error-red);
}
```

**Card Component**
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
```

---

## Document Status

**Version:** 1.0  
**Date:** February 24, 2026  
**Status:** APPROVED FOR BUILD  
**Next Review:** After initial build for feedback iteration

**Approved By:** [Dev Lead]  
**For Questions:** Contact dev-lead agent or Dan's team

---

## NEXT STEPS

1. ✅ Design spec complete
2. ⏳ Source images from approved websites + fal.ai
3. ⏳ Set up Supabase project + schema
4. ⏳ Build frontend (HTML/CSS/JS)
5. ⏳ Build backend API (GitHub Actions or Supabase Edge Functions)
6. ⏳ Deploy to GitHub Pages
7. ⏳ Test full flow
8. ⏳ Screenshot for review
9. ⏳ Launch March 1, 2026

**Estimated Build Time:** 1-2 days with team delegation
