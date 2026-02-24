# USA Ninja Stafford Scholarship Landing Page

Complete landing page with referral system for scholarship campaign.

## Live URL
https://second-summit-marketing.github.io/stafford-scholarship-2026/

## Features
- ✅ Mobile-first responsive design
- ✅ Progressive 3-section application form
- ✅ Real-time form validation
- ✅ Countdown timer to March 31, 2026
- ✅ Testimonial carousel
- ✅ Referral link generation & sharing
- ✅ FAQ accordion
- ✅ Copy-to-clipboard functionality
- ✅ Native share sheet integration
- ✅ Honeypot anti-spam field
- ✅ Character counter on essay field
- ✅ Success page with social sharing

## Tech Stack
- HTML5 / CSS3 / Vanilla JavaScript
- No frameworks (fast load times)
- GitHub Pages hosting
- Google Fonts (Montserrat + Open Sans)

## Structure
```
frontend/
├── index.html          # Main landing page
├── css/
│   └── style.css      # All styles
├── js/
│   └── app.js         # All functionality
└── assets/
    ├── logo.png       # USA Ninja logo
    ├── hero-image.jpg # Hero section image
    └── ...            # Other images
```

## API Integration
The form submission currently uses a placeholder API endpoint. Once backend is ready:

1. Update `CONFIG.API_ENDPOINT` in `/js/app.js`
2. Configure Supabase credentials if needed
3. Test form submission flow

## Local Development
```bash
# Serve locally (any HTTP server)
python3 -m http.server 8000

# Or use VS Code Live Server
# Open index.html and click "Go Live"
```

## Deployment
Automatically deployed via GitHub Pages when pushing to `main` branch.

```bash
git add .
git commit -m "Update landing page"
git push origin main
```

## Testing Checklist
- [ ] Mobile responsive (375px viewport)
- [ ] Form validation works on all fields
- [ ] Countdown timer updates every second
- [ ] Testimonial carousel rotates
- [ ] FAQ accordion expands/collapses
- [ ] Copy link button works
- [ ] Share buttons open correct modals
- [ ] Character counter updates on essay field
- [ ] Success page displays after submission
- [ ] All images load properly

## Images Needed
See `/assets/README.md` for list of required images and sourcing plan.

## Browser Support
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android

## Performance
- Target: <3s load time on 3G
- Optimized images (WebP with JPG fallback)
- Lazy loading for below-fold content
- Minified CSS/JS for production

## Contact
For questions or updates, contact dev-lead or Dan.

Last updated: 2026-02-24
