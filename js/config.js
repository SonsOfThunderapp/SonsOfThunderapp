window.TB_CONFIG = {
  VENUE: 'Crooked Can Brewery Patio, Winter Garden',
  MEETING_TIME: '6:30 PM',

  // Mild leadership gate only — NOT real security. View Source can reveal this PIN.
  // Anyone motivated can bypass it. Treat leadership edits as low-stakes, not private data vault.
  LEADER_PIN: 'sot-lead',  // change in Netlify env LEADER_PIN for production

  // SMS target as digit groups only — never shown in UI
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],

  // Supabase (publishable / anon key only — NEVER put service_role here)
  SUPABASE_URL: 'https://mnsempcgomukcpofgvlm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_QkUCt8trZ0vUwXmqfaUQwg_qXZ5_87m',

  // Exact Storage bucket name (private). Paths: private/<user_id>/<file>
  // Must match supabase-schema.sql bucket id/name
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',

  // Web Push — PUBLIC key only. Private key is Netlify env VAPID_PRIVATE_KEY (never in client).
  VAPID_PUBLIC_KEY: 'BCgwDSLwty9ggT-AB7uJ1FyMCkL51HeJ0ceu-1g6mxU3EOROSBq254SHkRZfA8S_UNEKPhS3epV9egEtcU7i2Y4'
};
