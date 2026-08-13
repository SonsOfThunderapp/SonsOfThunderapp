window.TB_CONFIG = {
  VENUE: 'Crooked Can Brewery Patio, Winter Garden',
  MEETING_TIME: '6:30 PM',
  LEADER_PIN: 'thunder',
  // SMS target as digit groups only — never shown in UI
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],

  // Supabase (publishable / anon key only — NEVER put service_role here)
  // Project Settings → API → Project URL + anon public key
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Exact Storage bucket name (private). Paths: private/<user_id>/<file>
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',

  // Web Push — PUBLIC VAPID key only (optional; not required for Memories)
  VAPID_PUBLIC_KEY: ''
};
