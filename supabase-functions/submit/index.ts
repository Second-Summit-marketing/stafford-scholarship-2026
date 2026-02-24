// Supabase Edge Function: Form Submission Handler
// Endpoint: /functions/v1/submit
// Method: POST

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parsePhoneNumber } from "https://esm.sh/libphonenumber-js@1.10.44";

// =====================================================
// CONFIGURATION
// =====================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GHL_WEBHOOK_URL = Deno.env.get("GHL_WEBHOOK_URL")!;
const GHL_API_TOKEN = Deno.env.get("GHL_API_TOKEN")!;
const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID")!;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =====================================================
// CORS HEADERS
// =====================================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

// Email validation (format + disposable domain check)
async function validateEmail(email: string): Promise<{ valid: boolean; error?: string }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  const domain = email.split("@")[1].toLowerCase();
  
  // Check against disposable domains
  const { data: disposableDomains } = await supabase
    .from("disposable_email_domains")
    .select("domain")
    .eq("domain", domain)
    .single();

  if (disposableDomains) {
    return { valid: false, error: "Disposable email addresses not allowed" };
  }

  return { valid: true };
}

// Phone validation (US format only)
function validatePhone(phone: string): { valid: boolean; formatted?: string; error?: string } {
  try {
    const phoneNumber = parsePhoneNumber(phone, "US");
    
    if (!phoneNumber || !phoneNumber.isValid()) {
      return { valid: false, error: "Invalid US phone number" };
    }

    if (phoneNumber.country !== "US") {
      return { valid: false, error: "Only US phone numbers accepted" };
    }

    return { valid: true, formatted: phoneNumber.format("E.164") };
  } catch (error) {
    return { valid: false, error: "Invalid phone number format" };
  }
}

// Essay validation
function validateEssay(essay: string): { valid: boolean; error?: string } {
  const length = essay.trim().length;
  
  if (length < 50) {
    return { valid: false, error: "Essay must be at least 50 characters" };
  }
  
  if (length > 300) {
    return { valid: false, error: "Essay must not exceed 300 characters" };
  }

  return { valid: true };
}

// Rate limiting check (3 submissions per IP per hour)
async function checkRateLimit(ipAddress: string): Promise<{ allowed: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_ip_address: ipAddress,
    p_action: "submit_form",
    p_max_attempts: 3,
    p_window_minutes: 60,
  });

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true }; // Fail open if DB error
  }

  if (!data) {
    return { 
      allowed: false, 
      error: "Too many submissions. Please try again in an hour." 
    };
  }

  return { allowed: true };
}

// Record rate limit attempt
async function recordRateLimitAttempt(ipAddress: string): Promise<void> {
  await supabase.rpc("record_rate_limit_attempt", {
    p_ip_address: ipAddress,
    p_action: "submit_form",
  });
}

// Check for duplicate email/phone
async function checkDuplicates(email: string, phone: string): Promise<{ isDuplicate: boolean; error?: string }> {
  const { data: emailCheck } = await supabase
    .from("applicants")
    .select("id")
    .eq("parent_email", email)
    .single();

  if (emailCheck) {
    return { isDuplicate: true, error: "This email has already been used to apply" };
  }

  const { data: phoneCheck } = await supabase
    .from("applicants")
    .select("id")
    .eq("parent_phone", phone)
    .single();

  if (phoneCheck) {
    return { isDuplicate: true, error: "This phone number has already been used to apply" };
  }

  return { isDuplicate: false };
}

// Validate referral code exists
async function validateReferralCode(code: string | null): Promise<string | null> {
  if (!code) return null;

  const { data: referrer } = await supabase
    .from("applicants")
    .select("id, referral_code")
    .eq("referral_code", code)
    .single();

  if (!referrer) {
    console.warn(`Invalid referral code: ${code}`);
    return null; // Treat as organic if invalid
  }

  // Check referral cap (max 20 referrals)
  const { count } = await supabase
    .from("applicants")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_code", code);

  if (count && count >= 20) {
    console.warn(`Referral code ${code} has reached maximum (20) referrals`);
    return null; // Don't count towards referrer if they hit cap
  }

  return code;
}

// =====================================================
// GHL WEBHOOK INTEGRATION
// =====================================================
async function submitToGHL(applicant: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Format data for GHL API
    const ghlPayload = {
      locationId: GHL_LOCATION_ID,
      firstName: applicant.parent_first_name,
      lastName: applicant.parent_last_name,
      email: applicant.parent_email,
      phone: applicant.parent_phone,
      tags: ["camp-scholarship", "scholarship-applicant"],
      customFields: [
        { key: "kid_first_name", value: applicant.kid_first_name },
        { key: "kid_age", value: applicant.kid_age.toString() },
        { key: "ninja_experience", value: applicant.ninja_experience || "none" },
        { key: "essay", value: applicant.essay },
        { key: "referral_code", value: applicant.referral_code },
        { key: "referred_by_code", value: applicant.referred_by_code || "organic" },
        { key: "heard_about", value: applicant.heard_about || "unknown" },
      ],
      source: "scholarship_landing_page",
    };

    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GHL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ghlPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GHL webhook failed:", response.status, errorText);
      return { success: false, error: `GHL API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("GHL webhook error:", error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// MAIN HANDLER
// =====================================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get IP address
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Parse request body
    const body = await req.json();

    // =====================================================
    // VALIDATION PIPELINE
    // =====================================================

    // 1. Honeypot check
    if (body.website) {
      console.warn("Honeypot triggered:", ipAddress);
      return new Response(
        JSON.stringify({ error: "Invalid submission" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Submission time check (reject if < 3 seconds)
    if (body.submissionTimeMs && body.submissionTimeMs < 3000) {
      console.warn("Submission too fast:", ipAddress, body.submissionTimeMs);
      return new Response(
        JSON.stringify({ error: "Please take your time filling out the form" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Rate limiting
    const rateLimitCheck = await checkRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: rateLimitCheck.error }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record rate limit attempt
    await recordRateLimitAttempt(ipAddress);

    // 4. Email validation
    const emailValidation = await validateEmail(body.parentEmail);
    if (!emailValidation.valid) {
      return new Response(
        JSON.stringify({ error: emailValidation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Phone validation
    const phoneValidation = validatePhone(body.parentPhone);
    if (!phoneValidation.valid) {
      return new Response(
        JSON.stringify({ error: phoneValidation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Essay validation
    const essayValidation = validateEssay(body.essay);
    if (!essayValidation.valid) {
      return new Response(
        JSON.stringify({ error: essayValidation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Duplicate check
    const duplicateCheck = await checkDuplicates(body.parentEmail, phoneValidation.formatted!);
    if (duplicateCheck.isDuplicate) {
      return new Response(
        JSON.stringify({ error: duplicateCheck.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Validate referral code (if provided)
    const validatedReferralCode = await validateReferralCode(body.referredByCode || null);

    // 9. Validate kid age
    const kidAge = parseInt(body.kidAge);
    if (isNaN(kidAge) || kidAge < 6 || kidAge > 13) {
      return new Response(
        JSON.stringify({ error: "Kid's age must be between 6 and 13" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // INSERT APPLICATION
    // =====================================================

    // Generate unique referral code
    const { data: referralCodeData } = await supabase.rpc("generate_referral_code");
    const referralCode = referralCodeData;

    const applicantData = {
      referral_code: referralCode,
      referred_by_code: validatedReferralCode,
      parent_first_name: body.parentFirstName,
      parent_last_name: body.parentLastName,
      parent_email: body.parentEmail,
      parent_phone: phoneValidation.formatted,
      kid_first_name: body.kidFirstName,
      kid_age: kidAge,
      ninja_experience: body.ninjaExperience || null,
      essay: body.essay,
      heard_about: body.heardAbout || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      submission_time_ms: body.submissionTimeMs || null,
      honeypot_filled: false,
      submitted_to_ghl: false,
    };

    const { data: newApplicant, error: insertError } = await supabase
      .from("applicants")
      .insert([applicantData])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save application. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // SUBMIT TO GHL (non-blocking)
    // =====================================================
    const ghlResult = await submitToGHL(newApplicant);
    
    if (ghlResult.success) {
      // Update submitted_to_ghl flag
      await supabase
        .from("applicants")
        .update({ submitted_to_ghl: true })
        .eq("id", newApplicant.id);
    } else {
      // Log error but don't block user success
      console.error("GHL submission failed for applicant:", newApplicant.id, ghlResult.error);
    }

    // =====================================================
    // RETURN SUCCESS
    // =====================================================
    return new Response(
      JSON.stringify({
        success: true,
        message: "Application submitted successfully!",
        referralCode: newApplicant.referral_code,
        referralUrl: `https://stafford-scholarship.usaninjagym.com/?ref=${newApplicant.referral_code}`,
        applicantId: newApplicant.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Submission handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
