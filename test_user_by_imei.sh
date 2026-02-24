#!/bin/bash

# Replace with your actual backend URL and IMEI
BACKEND_URL="${VITE_BACKEND_API_BASE_URL:-http://localhost:8000}"
IMEI="894861351616151515"

echo "Testing getUserByIMEI API..."
echo "Backend URL: $BACKEND_URL"
echo "IMEI: $IMEI"
echo ""

curl -X POST "$BACKEND_URL/auth/user-by-imei-query" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"query\": \"query { userByImei(imei: \\\"$IMEI\\\") { uniqueId firstName lastName email mobile userType } }\"
  }" \
  -v

echo ""
echo "---"
echo "If you see 404 or error, the backend endpoint doesn't exist yet."
