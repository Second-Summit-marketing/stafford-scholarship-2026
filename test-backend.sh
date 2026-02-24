#!/bin/bash

# =====================================================
# Supabase Backend Test Suite
# USA Ninja Stafford Scholarship
# =====================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_REF="${SUPABASE_PROJECT_REF}"
ANON_KEY="${SUPABASE_ANON_KEY}"
BASE_URL="https://${PROJECT_REF}.supabase.co/functions/v1"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# =====================================================
# Helper Functions
# =====================================================

print_test() {
  echo -e "\n${YELLOW}TEST: $1${NC}"
}

print_pass() {
  echo -e "${GREEN}✓ PASS: $1${NC}"
  ((TESTS_PASSED++))
}

print_fail() {
  echo -e "${RED}✗ FAIL: $1${NC}"
  echo -e "${RED}  Details: $2${NC}"
  ((TESTS_FAILED++))
}

check_env() {
  if [ -z "$PROJECT_REF" ] || [ -z "$ANON_KEY" ]; then
    echo -e "${RED}ERROR: Missing environment variables${NC}"
    echo "Please set:"
    echo "  export SUPABASE_PROJECT_REF=your_project_ref"
    echo "  export SUPABASE_ANON_KEY=your_anon_key"
    exit 1
  fi
}

# =====================================================
# Test Cases
# =====================================================

test_submission_valid() {
  print_test "Valid submission with all fields"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "parentFirstName": "Test",
      "parentLastName": "Parent",
      "parentEmail": "test+'$(date +%s)'@example.com",
      "parentPhone": "(555) 000-'$(shuf -i 1000-9999 -n 1)'",
      "kidFirstName": "TestKid",
      "kidAge": 10,
      "ninjaExperience": "yes",
      "essay": "This is a test essay that is definitely longer than 50 characters to meet the minimum requirement for the scholarship application.",
      "heardAbout": "Test Suite",
      "submissionTimeMs": 5000,
      "website": ""
    }')
  
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    REFERRAL_CODE=$(echo "$RESPONSE" | jq -r '.referralCode')
    print_pass "Valid submission accepted. Referral code: $REFERRAL_CODE"
    echo "$REFERRAL_CODE" > /tmp/test_referral_code.txt
  else
    ERROR=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
    print_fail "Valid submission rejected" "$ERROR"
  fi
}

test_submission_duplicate_email() {
  print_test "Duplicate email rejection"
  
  # Submit first application
  EMAIL="duplicate+test@example.com"
  curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d "{
      \"parentFirstName\": \"First\",
      \"parentLastName\": \"Duplicate\",
      \"parentEmail\": \"$EMAIL\",
      \"parentPhone\": \"(555) 000-1111\",
      \"kidFirstName\": \"Kid1\",
      \"kidAge\": 8,
      \"essay\": \"This is a test essay with more than fifty characters to pass validation.\",
      \"submissionTimeMs\": 5000
    }" > /dev/null
  
  sleep 1
  
  # Try to submit with same email
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d "{
      \"parentFirstName\": \"Second\",
      \"parentLastName\": \"Duplicate\",
      \"parentEmail\": \"$EMAIL\",
      \"parentPhone\": \"(555) 000-2222\",
      \"kidFirstName\": \"Kid2\",
      \"kidAge\": 9,
      \"essay\": \"Another test essay with more than fifty characters to pass validation.\",
      \"submissionTimeMs\": 5000
    }")
  
  if echo "$RESPONSE" | jq -e '.error' | grep -q "email"; then
    print_pass "Duplicate email correctly rejected"
  else
    print_fail "Duplicate email not rejected" "$RESPONSE"
  fi
}

test_submission_honeypot() {
  print_test "Honeypot field triggers rejection"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "parentFirstName": "Bot",
      "parentLastName": "Submission",
      "parentEmail": "bot+'$(date +%s)'@example.com",
      "parentPhone": "(555) 000-9999",
      "kidFirstName": "BotKid",
      "kidAge": 10,
      "essay": "This is a bot essay with more than fifty characters.",
      "submissionTimeMs": 5000,
      "website": "http://spam-link.com"
    }')
  
  if echo "$RESPONSE" | jq -e '.error' | grep -q "Invalid submission"; then
    print_pass "Honeypot correctly triggered"
  else
    print_fail "Honeypot did not trigger" "$RESPONSE"
  fi
}

test_submission_too_fast() {
  print_test "Submission time validation (<3 seconds)"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "parentFirstName": "Fast",
      "parentLastName": "Submit",
      "parentEmail": "fast+'$(date +%s)'@example.com",
      "parentPhone": "(555) 000-8888",
      "kidFirstName": "FastKid",
      "kidAge": 10,
      "essay": "This is a fast submission essay with more than fifty characters.",
      "submissionTimeMs": 1500
    }')
  
  if echo "$RESPONSE" | jq -e '.error' | grep -q "take your time"; then
    print_pass "Fast submission correctly rejected"
  else
    print_fail "Fast submission not rejected" "$RESPONSE"
  fi
}

test_submission_invalid_email() {
  print_test "Invalid email format rejection"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "parentFirstName": "Invalid",
      "parentLastName": "Email",
      "parentEmail": "not-an-email",
      "parentPhone": "(555) 000-7777",
      "kidFirstName": "Kid",
      "kidAge": 10,
      "essay": "This is an essay with an invalid email address but more than fifty characters.",
      "submissionTimeMs": 5000
    }')
  
  if echo "$RESPONSE" | jq -e '.error' | grep -q "email"; then
    print_pass "Invalid email correctly rejected"
  else
    print_fail "Invalid email not rejected" "$RESPONSE"
  fi
}

test_submission_invalid_phone() {
  print_test "Invalid phone format rejection"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "parentFirstName": "Invalid",
      "parentLastName": "Phone",
      "parentEmail": "invalidphone+'$(date +%s)'@example.com",
      "parentPhone": "123",
      "kidFirstName": "Kid",
      "kidAge": 10,
      "essay": "This is an essay with an invalid phone number but more than fifty characters.",
      "submissionTimeMs": 5000
    }')
  
  if echo "$RESPONSE" | jq -e '.error' | grep -q -i "phone"; then
    print_pass "Invalid phone correctly rejected"
  else
    print_fail "Invalid phone not rejected" "$RESPONSE"
  fi
}

test_submission_short_essay() {
  print_test "Essay too short (<50 characters)"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "parentFirstName": "Short",
      "parentLastName": "Essay",
      "parentEmail": "shortessay+'$(date +%s)'@example.com",
      "parentPhone": "(555) 000-6666",
      "kidFirstName": "Kid",
      "kidAge": 10,
      "essay": "Too short",
      "submissionTimeMs": 5000
    }')
  
  if echo "$RESPONSE" | jq -e '.error' | grep -q "50 characters"; then
    print_pass "Short essay correctly rejected"
  else
    print_fail "Short essay not rejected" "$RESPONSE"
  fi
}

test_submission_invalid_age() {
  print_test "Invalid kid age (outside 6-13 range)"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "parentFirstName": "Invalid",
      "parentLastName": "Age",
      "parentEmail": "invalidage+'$(date +%s)'@example.com",
      "parentPhone": "(555) 000-5555",
      "kidFirstName": "Kid",
      "kidAge": 16,
      "essay": "This is an essay with an invalid age but more than fifty characters.",
      "submissionTimeMs": 5000
    }')
  
  if echo "$RESPONSE" | jq -e '.error' | grep -q "age"; then
    print_pass "Invalid age correctly rejected"
  else
    print_fail "Invalid age not rejected" "$RESPONSE"
  fi
}

test_referral_stats() {
  print_test "Referral stats retrieval"
  
  if [ ! -f /tmp/test_referral_code.txt ]; then
    print_fail "No referral code from previous test" "Run test_submission_valid first"
    return
  fi
  
  REFERRAL_CODE=$(cat /tmp/test_referral_code.txt)
  
  RESPONSE=$(curl -s "${BASE_URL}/referral-stats?code=${REFERRAL_CODE}" \
    -H "Authorization: Bearer ${ANON_KEY}")
  
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    REFERRAL_COUNT=$(echo "$RESPONSE" | jq -r '.referralCount')
    print_pass "Referral stats retrieved. Count: $REFERRAL_COUNT"
  else
    ERROR=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
    print_fail "Referral stats retrieval failed" "$ERROR"
  fi
}

test_referral_tracking() {
  print_test "Referral relationship tracking"
  
  if [ ! -f /tmp/test_referral_code.txt ]; then
    print_fail "No referral code from previous test" "Run test_submission_valid first"
    return
  fi
  
  REFERRAL_CODE=$(cat /tmp/test_referral_code.txt)
  
  # Submit second application with referral code
  RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d "{
      \"parentFirstName\": \"Referred\",
      \"parentLastName\": \"Parent\",
      \"parentEmail\": \"referred+$(date +%s)@example.com\",
      \"parentPhone\": \"(555) 000-$(shuf -i 1000-9999 -n 1)\",
      \"kidFirstName\": \"ReferredKid\",
      \"kidAge\": 8,
      \"essay\": \"This is a referred application essay with more than fifty characters.\",
      \"referredByCode\": \"$REFERRAL_CODE\",
      \"submissionTimeMs\": 5000
    }")
  
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    sleep 2
    
    # Check referral count increased
    STATS=$(curl -s "${BASE_URL}/referral-stats?code=${REFERRAL_CODE}" \
      -H "Authorization: Bearer ${ANON_KEY}")
    
    REFERRAL_COUNT=$(echo "$STATS" | jq -r '.referralCount')
    
    if [ "$REFERRAL_COUNT" -ge 1 ]; then
      print_pass "Referral tracking working. Count: $REFERRAL_COUNT"
    else
      print_fail "Referral count did not increase" "Expected ≥1, got $REFERRAL_COUNT"
    fi
  else
    ERROR=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
    print_fail "Referred submission failed" "$ERROR"
  fi
}

test_rate_limiting() {
  print_test "Rate limiting (3 per hour)"
  
  echo "  Submitting 4 requests rapidly..."
  
  ATTEMPTS=0
  BLOCKED=0
  
  for i in {1..4}; do
    RESPONSE=$(curl -s -X POST "${BASE_URL}/submit" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${ANON_KEY}" \
      -d "{
        \"parentFirstName\": \"RateLimit\",
        \"parentLastName\": \"Test$i\",
        \"parentEmail\": \"ratelimit$(date +%s)_$i@example.com\",
        \"parentPhone\": \"(555) 000-$(shuf -i 1000-9999 -n 1)\",
        \"kidFirstName\": \"Kid$i\",
        \"kidAge\": 10,
        \"essay\": \"This is rate limit test essay number $i with more than fifty characters.\",
        \"submissionTimeMs\": 5000
      }")
    
    ((ATTEMPTS++))
    
    if echo "$RESPONSE" | jq -e '.error' | grep -q "Too many"; then
      ((BLOCKED++))
    fi
    
    sleep 1
  done
  
  if [ $BLOCKED -ge 1 ]; then
    print_pass "Rate limiting triggered after $ATTEMPTS attempts"
  else
    print_fail "Rate limiting did not trigger" "Expected at least 1 block, got $BLOCKED"
  fi
}

# =====================================================
# Main Test Execution
# =====================================================

echo "=================================================="
echo "  Supabase Backend Test Suite"
echo "  USA Ninja Stafford Scholarship"
echo "=================================================="
echo ""
echo "Project: ${PROJECT_REF}"
echo "Base URL: ${BASE_URL}"
echo ""

# Check environment
check_env

# Run all tests
test_submission_valid
test_referral_stats
test_referral_tracking
test_submission_duplicate_email
test_submission_honeypot
test_submission_too_fast
test_submission_invalid_email
test_submission_invalid_phone
test_submission_short_essay
test_submission_invalid_age
# test_rate_limiting # Uncomment to test rate limiting (may take a while)

# Summary
echo ""
echo "=================================================="
echo "  Test Summary"
echo "=================================================="
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please review.${NC}"
  exit 1
fi
