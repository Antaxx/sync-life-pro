Design system: light mode, Outfit font, accent green #196b3e (primary HSL 150 63% 25%)
Colors defined in index.css as HSL tokens. Light background #f0f7f0.
Sidebar: fixed 220px left, white bg, green accent, "Capture rapide" button, user avatar at bottom.
Cards: white bg, rounded-xl, shadow-sm, border-border.
8 sections: Dashboard, Organisation, Contenu, Santé, Business, Compétences, Finances, Agents IA
Backend: Lovable Cloud (Supabase) with 19 tables, RLS per user, realtime on tasks/notes/health_logs/finances/skills
Auth: email/password, auto-confirm enabled, ProtectedRoute wraps all pages
Hook: useSupabaseTable generic hook for CRUD + realtime
