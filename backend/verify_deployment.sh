#!/usr/bin/env bash
# Pre-Deployment Verification Script
# Tests all critical authentication flow endpoints

echo "========================================================================"
echo "AUTHENTICATION SYSTEM - PRE-DEPLOYMENT VERIFICATION"
echo "========================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name=$1
    local test_path=$2
    
    echo -n "Testing: $test_name... "
    
    if python -m pytest "$test_path" -q --tb=no 2>&1 | grep -q "passed"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "Running Key Tests..."
echo "=========================================="
echo ""

# TASK 1: JWT Token Return
run_test "TASK 1: JWT Token Return" \
    "tests/unit/test_views.py::TestProfessionalViewSet::test_register_returns_jwt_tokens"

# TASK 2: Email Validation
run_test "TASK 2: Duplicate Email Validation" \
    "tests/unit/test_views.py::TestProfessionalViewSet::test_register_action_duplicate_email"

# TASK 4: Timing Attack Protection
run_test "TASK 4: Timing Attack Prevention" \
    "tests/unit/test_login_security.py::TestLoginSecurity::test_login_with_nonexistent_email"

# TASK 5: Complete Flow
run_test "TASK 5: Complete Auth Flow" \
    "tests/unit/test_login_security.py::TestLoginIntegration::test_full_registration_to_login_flow"

echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - READY FOR DEPLOYMENT${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - DO NOT DEPLOY${NC}"
    exit 1
fi
