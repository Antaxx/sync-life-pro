# Memory: index.md
Updated: now

Design system: light mode, Outfit font, accent #1a6b3a (green), bg #f0f7f0
Colors defined in index.css as HSL tokens. No dark mode.
10 sections: Dashboard, Organisation, Contenu & Notes, Santé, YouTube, Business, Compétences, Finances, Agents IA, Cours
Sidebar: fixed 220px left, Lucide icons size 18
Backend: Lovable Cloud (Supabase) with 25+ tables, RLS per user, realtime on tasks/notes/health_logs/finances/skills/youtube_videos/youtube_tasks/youtube_ideas
Auth: email/password, auto-confirm enabled, ProtectedRoute wraps all pages
Hook: useSupabaseTable generic hook for CRUD + realtime
YouTube: collaborative section with workspaces, members, videos pipeline, ideas, scripts, tasks, comments. RLS via is_workspace_member() security definer function.
Cours: personal section with subjects, schedule, homework, grades, flashcards (Anki-style spaced repetition), study_sessions. RLS per user_id.
