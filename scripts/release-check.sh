#!/usr/bin/env bash
# Thunder Board — tiny pre-deploy invariant check (no test framework)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FAIL=0
pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1"; FAIL=1; }

echo "=== Thunder Board release-check ==="

# Parse JS
for f in js/app.js netlify/functions/*.js; do
  if node --check "$f" 2>/dev/null; then pass "parse $f"
  else fail "parse $f"; fi
done

# Secrets must not appear as assignments in client
if grep -RIn --include='*.js' --include='*.html' -E "service_role|SERVICE_ROLE_KEY\s*[:=]|VAPID_PRIVATE|XAI_API_KEY\s*[:=]" js/ index.html 2>/dev/null | grep -v 'never\|NEVER\|not put\|Netlify env\|comment'; then
  fail "possible secret in client source"
else
  pass "no obvious server secrets in client"
fi

# Bucket name alignment
if grep -q "Sons Of Thunder Memories" js/config.js && grep -q "Sons Of Thunder Memories" supabase-schema.sql; then
  pass "memories bucket name aligned"
else
  fail "memories bucket name mismatch"
fi

# Leader RLS present
if grep -q "is_sot_leader" supabase-schema.sql && grep -q "app_members" supabase-schema.sql; then
  pass "app_members + is_sot_leader in schema"
else
  fail "missing app_members / is_sot_leader"
fi

# Open write anti-pattern on announcements (should not be plain with check true for insert auth without leader)
if grep -A2 'announcements insert' supabase-schema.sql | grep -q 'is_sot_leader'; then
  pass "announcements insert is leader-gated"
else
  fail "announcements insert not clearly leader-gated"
fi

# Meeting engine present
if grep -q "function getNextMeetingMonday" js/app.js && grep -q "isLaborDay" js/app.js && grep -q "isMemorialDay" js/app.js; then
  pass "canonical meeting engine present"
else
  fail "meeting engine missing pieces"
fi

# SW network-only (no caches.open in sw)
if grep -q "caches.open" sw.js 2>/dev/null; then
  fail "sw.js uses caches.open (stale risk)"
else
  pass "sw.js has no caches.open"
fi

# Push broadcast does not trust pin body as sole auth (should check app_members / Bearer)
if grep -q "app_members" netlify/functions/push-broadcast.js && grep -q "Authorization" netlify/functions/push-broadcast.js; then
  pass "push-broadcast uses identity path"
else
  fail "push-broadcast may still be PIN-only"
fi

# APP_BUILD present
if grep -q "APP_BUILD" js/config.js; then pass "APP_BUILD set"
else fail "APP_BUILD missing"; fi


# Housekeeping must be wired
if grep -q "setupHousekeeping();" js/app.js; then pass "setupHousekeeping wired"
else fail "setupHousekeeping defined but not called"; fi

if [ "$FAIL" -eq 0 ]; then
  # brothers.phone required by app.js pushBrother / pull
if ! grep -q "phone" supabase-schema.sql; then
  echo "FAIL  brothers phone column missing from schema"
  fail=1
else
  echo "PASS  brothers phone in schema"
fi

echo "=== ALL CHECKS PASSED ==="
  exit 0
else
  echo "=== RELEASE BLOCKED ==="
  exit 1
fi
