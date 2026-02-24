// Supabase Edge Function: Referral Stats
// Endpoint: /functions/v1/referral-stats
// Method: GET
// Query param: ?code=XXXXXXXX

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// CONFIGURATION
// =====================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================================
// CORS HEADERS
// =====================================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// MAIN HANDLER
// =====================================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const referralCode = url.searchParams.get("code");

    if (!referralCode) {
      return new Response(
        JSON.stringify({ error: "Missing referral code parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get referral stats from view
    const { data: stats, error } = await supabase
      .from("referral_stats")
      .select("*")
      .eq("referral_code", referralCode)
      .single();

    if (error || !stats) {
      return new Response(
        JSON.stringify({ error: "Referral code not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate next tier info
    let nextTier = {
      threshold: 3,
      bonusEntries: 2,
      remaining: 3 - stats.referral_count,
    };

    if (stats.referral_count >= 20) {
      nextTier = {
        threshold: 20,
        bonusEntries: 10,
        remaining: 0,
      };
    } else if (stats.referral_count >= 10) {
      nextTier = {
        threshold: 20,
        bonusEntries: 10,
        remaining: 20 - stats.referral_count,
      };
    } else if (stats.referral_count >= 3) {
      nextTier = {
        threshold: 10,
        bonusEntries: 5,
        remaining: 10 - stats.referral_count,
      };
    }

    // Return stats
    return new Response(
      JSON.stringify({
        success: true,
        referralCode: stats.referral_code,
        parentName: `${stats.parent_first_name} ${stats.parent_last_name}`,
        referralCount: stats.referral_count,
        bonusEntries: stats.bonus_entries,
        totalEntries: stats.total_entries,
        nextTier: nextTier,
        appliedAt: stats.created_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Referral stats error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
