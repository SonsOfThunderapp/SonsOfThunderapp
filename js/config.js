window.TB_CONFIG = {
  VENUE: 'Crooked Can Brewery Patio, Winter Garden',
  MEETING_TIME: '6:30 PM',
  LEADER_PIN: 'thunder',
  // SMS target as digit groups only — never shown in UI
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],

  // Shared brotherhood data (Supabase). Leave empty = local-only mode.
  // Setup: create project at supabase.com → run supabase-schema.sql → paste URL + anon key here
  // (anon key is public client key; RLS policies protect writes as defined in schema)
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Web Push — PUBLIC VAPID key only (safe in client). Generate with:
  //   npx web-push generate-vapid-keys
  // Put the matching private key in Netlify env as VAPID_PRIVATE_KEY (secret).
  // Also set VAPID_PUBLIC_KEY + VAPID_SUBJECT on Netlify for the broadcast function.
  VAPID_PUBLIC_KEY: ''
};
