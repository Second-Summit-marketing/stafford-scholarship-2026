-- USA Ninja Stafford Scholarship Database Schema
-- Supabase PostgreSQL Database
-- Created: February 24, 2026

-- =====================================================
-- APPLICANTS TABLE
-- =====================================================
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by_code VARCHAR(10),
  
  -- Parent/Guardian info
  parent_first_name VARCHAR(100) NOT NULL,
  parent_last_name VARCHAR(100) NOT NULL,
  parent_email VARCHAR(255) UNIQUE NOT NULL,
  parent_phone VARCHAR(20) UNIQUE NOT NULL,
  
  -- Kid info
  kid_first_name VARCHAR(100) NOT NULL,
  kid_age INTEGER NOT NULL CHECK (kid_age >= 6 AND kid_age <= 13),
  ninja_experience VARCHAR(50),
  
  -- Essay
  essay TEXT NOT NULL CHECK (char_length(essay) >= 50 AND char_length(essay) <= 300),
  
  -- Source
  heard_about VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  submitted_to_ghl BOOLEAN DEFAULT FALSE,
  submission_time_ms INTEGER, -- Time taken to fill form (anti-bot)
  
  -- Honeypot tracking
  honeypot_filled BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT fk_referrer 
    FOREIGN KEY (referred_by_code) 
    REFERENCES applicants(referral_code) ON DELETE SET NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_referral_code ON applicants(referral_code);
CREATE INDEX idx_referred_by ON applicants(referred_by_code);
CREATE INDEX idx_parent_email ON applicants(parent_email);
CREATE INDEX idx_parent_phone ON applicants(parent_phone);
CREATE INDEX idx_created_at ON applicants(created_at DESC);
CREATE INDEX idx_submitted_to_ghl ON applicants(submitted_to_ghl);

-- =====================================================
-- RATE LIMITING TABLE
-- =====================================================
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'submit_form', 'get_stats', etc.
  attempted_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_ip_action_time UNIQUE (ip_address, action, attempted_at)
);

CREATE INDEX idx_rate_limits_ip_action ON rate_limits(ip_address, action, attempted_at DESC);

-- =====================================================
-- DISPOSABLE EMAIL DOMAINS (BLACKLIST)
-- =====================================================
CREATE TABLE disposable_email_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) UNIQUE NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Seed common disposable domains
INSERT INTO disposable_email_domains (domain) VALUES
  ('tempmail.com'),
  ('guerrillamail.com'),
  ('10minutemail.com'),
  ('mailinator.com'),
  ('throwaway.email'),
  ('temp-mail.org'),
  ('getnada.com'),
  ('maildrop.cc');

-- =====================================================
-- REFERRAL STATS VIEW (For easy querying)
-- =====================================================
CREATE OR REPLACE VIEW referral_stats AS
SELECT 
  a.id,
  a.referral_code,
  a.parent_first_name,
  a.parent_last_name,
  a.parent_email,
  a.created_at,
  COUNT(r.id) as referral_count,
  -- Calculate bonus entries based on referral tiers
  CASE 
    WHEN COUNT(r.id) >= 20 THEN 10
    WHEN COUNT(r.id) >= 10 THEN 5
    WHEN COUNT(r.id) >= 3 THEN 2
    ELSE 0
  END as bonus_entries,
  1 + CASE 
    WHEN COUNT(r.id) >= 20 THEN 10
    WHEN COUNT(r.id) >= 10 THEN 5
    WHEN COUNT(r.id) >= 3 THEN 2
    ELSE 0
  END as total_entries
FROM applicants a
LEFT JOIN applicants r ON r.referred_by_code = a.referral_code
GROUP BY a.id, a.referral_code, a.parent_first_name, a.parent_last_name, a.parent_email, a.created_at;

-- =====================================================
-- HELPER FUNCTION: Check Rate Limit
-- =====================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address INET,
  p_action VARCHAR(50),
  p_max_attempts INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM rate_limits
  WHERE ip_address = p_ip_address
    AND action = p_action
    AND attempted_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Return TRUE if under limit, FALSE if over
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: Record Rate Limit Attempt
-- =====================================================
CREATE OR REPLACE FUNCTION record_rate_limit_attempt(
  p_ip_address INET,
  p_action VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO rate_limits (ip_address, action)
  VALUES (p_ip_address, p_action);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: Generate Unique Referral Code
-- =====================================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
  chars VARCHAR(32) := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; -- No 0, O, 1, I for clarity
  result VARCHAR(10) := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    -- Generate 8-character code
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM applicants WHERE referral_code = result) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ADMIN QUERIES (For Dan's team)
-- =====================================================

-- Total applicants
-- SELECT COUNT(*) as total_applicants FROM applicants;

-- Applicants with referrals
-- SELECT * FROM referral_stats WHERE referral_count > 0 ORDER BY referral_count DESC;

-- Top referrers leaderboard
-- SELECT 
--   parent_first_name || ' ' || parent_last_name as name,
--   parent_email,
--   referral_code,
--   referral_count,
--   bonus_entries,
--   total_entries
-- FROM referral_stats
-- ORDER BY referral_count DESC
-- LIMIT 20;

-- Recent submissions (last 24 hours)
-- SELECT 
--   parent_first_name || ' ' || parent_last_name as parent_name,
--   kid_first_name,
--   kid_age,
--   parent_email,
--   parent_phone,
--   referred_by_code,
--   created_at
-- FROM applicants
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC;

-- Submissions not sent to GHL (for troubleshooting)
-- SELECT * FROM applicants WHERE submitted_to_ghl = FALSE;

-- Rate limit activity (potential spam)
-- SELECT 
--   ip_address,
--   action,
--   COUNT(*) as attempt_count,
--   MIN(attempted_at) as first_attempt,
--   MAX(attempted_at) as last_attempt
-- FROM rate_limits
-- WHERE attempted_at > NOW() - INTERVAL '1 hour'
-- GROUP BY ip_address, action
-- HAVING COUNT(*) > 2
-- ORDER BY attempt_count DESC;

-- =====================================================
-- ROW LEVEL SECURITY (Optional, if public API access needed)
-- =====================================================
-- Enable RLS on tables (uncomment if needed)
-- ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (via API key)
-- CREATE POLICY "Allow public insert" ON applicants
-- FOR INSERT WITH CHECK (true);

-- Create policy for public read of referral stats only
-- CREATE POLICY "Allow public read referral stats" ON applicants
-- FOR SELECT USING (true);

-- =====================================================
-- CLEANUP: Delete old rate limit records (run daily)
-- =====================================================
-- DELETE FROM rate_limits WHERE attempted_at < NOW() - INTERVAL '24 hours';
