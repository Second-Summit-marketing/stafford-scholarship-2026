// USA Ninja Stafford Scholarship Landing Page
// Interactive functionality

// Configuration
const CONFIG = {
  API_ENDPOINT: '/api/submit', // This will be updated once backend is ready
  CAMPAIGN_END_DATE: new Date('2026-03-31T23:59:59'),
  SUPABASE_URL: '', // To be configured
  SUPABASE_KEY: '', // To be configured
};

// State
const state = {
  currentSection: 1,
  formData: {},
  submitTime: null,
  referralCode: null,
};

// Utility Functions
const utils = {
  // Format phone number as user types
  formatPhone: (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    
    const part1 = match[1] ? `(${match[1]}` : '';
    const part2 = match[2] ? `) ${match[2]}` : match[1] ? ')' : '';
    const part3 = match[3] ? `-${match[3]}` : '';
    
    return part1 + part2 + part3;
  },

  // Validate email format
  validateEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Validate phone number
  validatePhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  },

  // Get URL parameter
  getUrlParam: (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Smooth scroll to element
  scrollTo: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  },

  // Share via Web Share API
  shareNative: async (data) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
        return false;
      }
    }
    return false;
  },
};

// Countdown Timer
const countdown = {
  interval: null,

  init: () => {
    countdown.update();
    countdown.interval = setInterval(countdown.update, 1000);
  },

  update: () => {
    const now = new Date();
    const diff = CONFIG.CAMPAIGN_END_DATE - now;

    if (diff <= 0) {
      countdown.stop();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  },

  stop: () => {
    if (countdown.interval) {
      clearInterval(countdown.interval);
      countdown.interval = null;
    }
    document.getElementById('countdown').innerHTML = '<p style="color: var(--action-red); font-weight: 700;">Applications Closed</p>';
  },
};

// Testimonial Carousel
const testimonialCarousel = {
  currentIndex: 0,
  testimonials: [],
  interval: null,

  init: () => {
    testimonialCarousel.testimonials = document.querySelectorAll('.testimonial');
    if (testimonialCarousel.testimonials.length > 1) {
      testimonialCarousel.interval = setInterval(testimonialCarousel.next, 5000);
    }
  },

  next: () => {
    testimonialCarousel.testimonials[testimonialCarousel.currentIndex].classList.remove('testimonial--active');
    testimonialCarousel.currentIndex = (testimonialCarousel.currentIndex + 1) % testimonialCarousel.testimonials.length;
    testimonialCarousel.testimonials[testimonialCarousel.currentIndex].classList.add('testimonial--active');
  },
};

// Form Validation
const formValidation = {
  // Validate individual field
  validateField: (field) => {
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.error-message');
    const successElement = field.parentElement.querySelector('.success-message');
    let isValid = true;
    let errorMessage = '';

    // Clear previous states
    field.classList.remove('error', 'success');
    if (errorElement) {
      errorElement.classList.remove('show');
      errorElement.textContent = '';
    }
    if (successElement) {
      successElement.classList.remove('show');
      successElement.textContent = '';
    }

    // Required field check
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
      if (!utils.validateEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      } else if (successElement) {
        successElement.textContent = 'Looks good! ✓';
        successElement.classList.add('show');
      }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
      if (!utils.validatePhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid 10-digit phone number';
      } else if (successElement) {
        successElement.textContent = 'Looks good! ✓';
        successElement.classList.add('show');
      }
    }

    // Essay min length
    if (field.name === 'essay' && value) {
      if (value.length < 50) {
        isValid = false;
        errorMessage = `Please write at least 50 characters (currently ${value.length})`;
      }
    }

    // Checkbox validation
    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      isValid = false;
      errorMessage = 'You must agree to continue';
    }

    // Radio validation
    if (field.type === 'radio' && field.hasAttribute('required')) {
      const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
      const isChecked = Array.from(radioGroup).some(radio => radio.checked);
      if (!isChecked) {
        isValid = false;
        errorMessage = 'Please select an option';
      }
    }

    // Display error or success
    if (!isValid && errorElement) {
      field.classList.add('error');
      errorElement.textContent = errorMessage;
      errorElement.classList.add('show');
    } else if (isValid && value) {
      field.classList.add('success');
    }

    return isValid;
  },

  // Validate section
  validateSection: (sectionId) => {
    const section = document.getElementById(sectionId);
    const fields = section.querySelectorAll('input[required], select[required], textarea[required]');
    let allValid = true;

    fields.forEach(field => {
      if (!formValidation.validateField(field)) {
        allValid = false;
      }
    });

    return allValid;
  },
};

// Form Navigation
const formNavigation = {
  // Show section
  showSection: (sectionNumber) => {
    document.querySelectorAll('.form-section').forEach(section => {
      section.classList.remove('form-section--active');
    });
    const targetSection = document.getElementById(`section-${sectionNumber}`);
    if (targetSection) {
      targetSection.classList.add('form-section--active');
      state.currentSection = sectionNumber;
      utils.scrollTo('application');
    }
  },

  // Next button handler
  handleNext: (e) => {
    const button = e.target;
    const nextSectionId = button.getAttribute('data-next');
    const currentSectionId = `section-${state.currentSection}`;

    if (formValidation.validateSection(currentSectionId)) {
      const nextSectionNumber = parseInt(nextSectionId.split('-')[1]);
      formNavigation.showSection(nextSectionNumber);
    }
  },
};

// Form Submission
const formSubmission = {
  // Collect form data
  collectFormData: () => {
    const form = document.getElementById('application-form');
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Add metadata
    data.submit_time = state.submitTime;
    data.referral_code = state.referralCode || '';
    data.timestamp = new Date().toISOString();

    return data;
  },

  // Submit to API (placeholder - will be updated with real endpoint)
  submitToAPI: async (data) => {
    try {
      // TODO: Replace with actual API call once backend is ready
      // For now, simulate successful submission
      console.log('Form data:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful response
      return {
        success: true,
        referralCode: 'X' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        referralUrl: `${window.location.origin}${window.location.pathname}?ref=X${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      };

      // Real implementation will look like:
      // const response = await fetch(CONFIG.API_ENDPOINT, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });
      // return await response.json();
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  },

  // Handle form submission
  handleSubmit: async (e) => {
    e.preventDefault();

    // Validate final section
    if (!formValidation.validateSection('section-3')) {
      return;
    }

    // Check honeypot
    const honeypot = document.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      console.warn('Honeypot triggered');
      return;
    }

    // Show loading state
    const submitButton = e.target.querySelector('.btn--submit');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
      // Collect form data
      const data = formSubmission.collectFormData();

      // Submit to API
      const response = await formSubmission.submitToAPI(data);

      if (response.success) {
        // Hide form
        document.getElementById('application-form').style.display = 'none';

        // Show success message
        formSubmission.showSuccess(data, response);
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      alert('There was an error submitting your application. Please try again or contact us directly.');
      console.error('Submission error:', error);
      submitButton.classList.remove('loading');
      submitButton.disabled = false;
    }
  },

  // Show success message
  showSuccess: (formData, response) => {
    const successElement = document.getElementById('success-message');
    
    // Populate success message
    document.getElementById('success-name').textContent = formData.parent_first_name;
    document.getElementById('success-kid').textContent = formData.kid_first_name;
    document.getElementById('success-email').textContent = formData.parent_email;
    
    // Set referral link
    const referralLink = response.referralUrl;
    document.getElementById('referral-link').value = referralLink;
    
    // Store referral code for share functions
    state.referralCode = response.referralCode;
    
    // Show success element
    successElement.style.display = 'block';
    utils.scrollTo('success-message');
    
    // Add confetti effect
    formSubmission.showConfetti();
  },

  // Simple confetti animation
  showConfetti: () => {
    // Simple implementation - could be enhanced with canvas animation
    const colors = ['#0066CC', '#E21A2C', '#FF6B35', '#FFD23F'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.opacity = '1';
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      
      document.body.appendChild(confetti);
      
      // Animate
      const fallDuration = 2000 + Math.random() * 1000;
      const fallDistance = window.innerHeight + 10;
      const horizontalDrift = (Math.random() - 0.5) * 200;
      
      confetti.animate([
        { 
          transform: 'translateY(0) translateX(0) rotate(0deg)',
          opacity: 1
        },
        { 
          transform: `translateY(${fallDistance}px) translateX(${horizontalDrift}px) rotate(${Math.random() * 720}deg)`,
          opacity: 0
        }
      ], {
        duration: fallDuration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      });
      
      // Remove after animation
      setTimeout(() => confetti.remove(), fallDuration);
    }
  },
};

// Share Functionality
const sharing = {
  // Get share message
  getShareMessage: (referralUrl) => {
    const kidName = state.formData.kid_first_name || 'my kid';
    return `Hey! I just applied for a free ninja camp scholarship for ${kidName} at USA Ninja Challenge Stafford. You should apply too! ${referralUrl}`;
  },

  // Copy link
  copyLink: async () => {
    const linkInput = document.getElementById('referral-link');
    const copyBtn = document.getElementById('copy-btn');
    
    const success = await utils.copyToClipboard(linkInput.value);
    
    if (success) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      copyBtn.classList.add('copied');
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
      }, 2000);
    } else {
      alert('Failed to copy link. Please select and copy manually.');
    }
  },

  // Share via SMS
  shareSMS: () => {
    const referralUrl = document.getElementById('referral-link').value;
    const message = encodeURIComponent(sharing.getShareMessage(referralUrl));
    window.open(`sms:?&body=${message}`, '_blank');
  },

  // Share via Email
  shareEmail: () => {
    const referralUrl = document.getElementById('referral-link').value;
    const subject = encodeURIComponent('Free Ninja Camp Scholarship - You Should Apply!');
    const body = encodeURIComponent(sharing.getShareMessage(referralUrl));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  },

  // Share via Facebook
  shareFacebook: () => {
    const referralUrl = document.getElementById('referral-link').value;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },

  // Share via Twitter
  shareTwitter: () => {
    const referralUrl = document.getElementById('referral-link').value;
    const text = encodeURIComponent('Just applied for a free ninja camp scholarship! Check it out:');
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },
};

// FAQ Accordion
const faq = {
  init: () => {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.addEventListener('click', faq.toggle);
    });
  },

  toggle: (e) => {
    const button = e.currentTarget;
    const faqItem = button.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');

    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
    });

    // Open clicked FAQ if it wasn't active
    if (!isActive) {
      faqItem.classList.add('active');
    }
  },
};

// Character Counter
const characterCounter = {
  init: () => {
    const essayField = document.getElementById('essay');
    if (essayField) {
      essayField.addEventListener('input', characterCounter.update);
    }
  },

  update: (e) => {
    const field = e.target;
    const count = field.value.length;
    const counter = document.getElementById('char-count');
    const counterElement = counter.parentElement;

    counter.textContent = count;

    // Update counter color based on count
    counterElement.classList.remove('warning', 'danger');
    if (count >= 250) {
      counterElement.classList.add('warning');
    }
    if (count >= 290) {
      counterElement.classList.add('danger');
    }
  },
};

// Smooth Scroll
const smoothScroll = {
  init: () => {
    document.querySelectorAll('a.smooth-scroll').forEach(link => {
      link.addEventListener('click', smoothScroll.handleClick);
    });
  },

  handleClick: (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1);
      utils.scrollTo(targetId);
    }
  },
};

// Phone Number Formatting
const phoneFormatting = {
  init: () => {
    const phoneInput = document.getElementById('parent_phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', phoneFormatting.format);
    }
  },

  format: (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const oldValue = input.value;
    const newValue = utils.formatPhone(oldValue);
    
    if (oldValue !== newValue) {
      input.value = newValue;
      
      // Adjust cursor position
      const diff = newValue.length - oldValue.length;
      input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    }
  },
};

// Field Validation on Blur
const blurValidation = {
  init: () => {
    const fields = document.querySelectorAll('.form-input');
    fields.forEach(field => {
      field.addEventListener('blur', blurValidation.handleBlur);
    });
  },

  handleBlur: (e) => {
    formValidation.validateField(e.target);
  },
};

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  // Record page load time for honeypot
  state.submitTime = Date.now();

  // Check for referral code in URL
  const refCode = utils.getUrlParam('ref');
  if (refCode) {
    state.referralCode = refCode;
    document.getElementById('referral_code').value = refCode;
  }

  // Initialize all modules
  countdown.init();
  testimonialCarousel.init();
  faq.init();
  characterCounter.init();
  smoothScroll.init();
  phoneFormatting.init();
  blurValidation.init();

  // Form navigation
  document.querySelectorAll('.btn--next').forEach(button => {
    button.addEventListener('click', formNavigation.handleNext);
  });

  // Form submission
  const form = document.getElementById('application-form');
  if (form) {
    form.addEventListener('submit', formSubmission.handleSubmit);
  }

  // Share buttons
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', sharing.copyLink);
  }

  const shareSMSBtn = document.getElementById('share-sms');
  if (shareSMSBtn) {
    shareSMSBtn.addEventListener('click', sharing.shareSMS);
  }

  const shareEmailBtn = document.getElementById('share-email');
  if (shareEmailBtn) {
    shareEmailBtn.addEventListener('click', sharing.shareEmail);
  }

  const shareFBBtn = document.getElementById('share-facebook');
  if (shareFBBtn) {
    shareFBBtn.addEventListener('click', sharing.shareFacebook);
  }

  const shareTwitterBtn = document.getElementById('share-twitter');
  if (shareTwitterBtn) {
    shareTwitterBtn.addEventListener('click', sharing.shareTwitter);
  }

  console.log('USA Ninja Scholarship page initialized successfully!');
});
