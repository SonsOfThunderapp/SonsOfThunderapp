window.TB_CONFIG = {
  // Bumped with each production zip so phones can detect a new build
  APP_BUILD: '20260815-pushleader',

  VENUE: 'Crooked Can Brewery Patio, Winter Garden',
  MEETING_TIME: '6:30 PM',

  // Mild client-side UI gate only — NOT server security (View Source can reveal this).
  // Push broadcast and DB leadership writes use Supabase session + app_members role.
  // Change this sample before real use. Optional: same string only for opening Leadership UI.
  LEADER_PIN: 'thunder-board-lead',

  // SMS target as digit groups only — never shown in UI
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],

  // Supabase (publishable / anon key only — NEVER put service_role here)
  SUPABASE_URL: 'https://mnsempcgomukcpofgvlm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_QkUCt8trZ0vUwXmqfaUQwg_qXZ5_87m',

  // Exact Storage bucket name (private). Paths: private/<user_id>/<file>
  // Must match supabase-schema.sql bucket id/name
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',

  // Web Push — PUBLIC key only. Private key is Netlify env VAPID_PRIVATE_KEY (never in client).
  VAPID_PUBLIC_KEY: 'BGRjLCD3QnLBxb2VFNgxpGcJ1Ptxosp8yGq8yiJTGm2YS8OHVYsOhVvCFpmyREbeQsmsq6NaJ42j9yMx19Vl6hE'
};
