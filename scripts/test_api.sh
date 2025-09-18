#!/bin/bash

# PICC API Testing Script
# Usage: ./scripts/test_api.sh

BASE_URL="http://localhost:8000/api"
EMAIL="test@example.com"
PASSWORD="password123"
NAME="Test User"

echo "🚀 PICC API Testing Script"
echo "========================="

# Health Check
echo -e "\n📋 1. Health Check"
echo "GET $BASE_URL/health"
curl -s "$BASE_URL/health" | jq
echo ""

# Register User
echo -e "\n👤 2. Register User"
echo "POST $BASE_URL/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"password_confirmation\": \"$PASSWORD\"
  }")

echo "$REGISTER_RESPONSE" | jq

# Extract token from registration
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "✅ Registration successful, token: ${TOKEN:0:20}..."
else
  echo "❌ Registration failed, trying login..."
  
  # Login if registration failed (user already exists)
  echo -e "\n🔐 3. Login User"
  echo "POST $BASE_URL/auth/login"
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  echo "$LOGIN_RESPONSE" | jq
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')
  
  if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Login successful, token: ${TOKEN:0:20}..."
  else
    echo "❌ Login failed"
    exit 1
  fi
fi

# Get Current User
echo -e "\n👤 4. Get Current User"
echo "GET $BASE_URL/auth/user"
curl -s -X GET "$BASE_URL/auth/user" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Test Protected Endpoint Without Auth
echo -e "\n🔒 5. Test Protected Endpoint (No Auth)"
echo "GET $BASE_URL/auth/user (without token)"
curl -s -X GET "$BASE_URL/auth/user" | jq
echo ""

# Logout
echo -e "\n👋 6. Logout"
echo "POST $BASE_URL/auth/logout"
curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Test Invalid Credentials
echo -e "\n❌ 7. Test Invalid Login"
echo "POST $BASE_URL/auth/login (wrong password)"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"wrongpassword\"
  }" | jq
echo ""

echo "✅ API Testing Complete!"