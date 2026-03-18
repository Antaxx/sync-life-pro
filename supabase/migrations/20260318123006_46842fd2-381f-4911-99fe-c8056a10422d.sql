
-- ==========================================
-- SECTION COURS (personal tables)
-- ==========================================

CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  teacher TEXT,
  color TEXT NOT NULL DEFAULT '#1a6b3a',
  coefficient NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  recurrent BOOLEAN NOT NULL DEFAULT true,
  type TEXT NOT NULL DEFAULT 'cours',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own schedule" ON public.schedule FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.homework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'homework',
  status TEXT NOT NULL DEFAULT 'todo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own homework" ON public.homework FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  grade NUMERIC NOT NULL,
  max_grade NUMERIC NOT NULL DEFAULT 20,
  coefficient NUMERIC NOT NULL DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grades" ON public.grades FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own study_sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- SECTION YOUTUBE (collaborative tables)
-- ==========================================

CREATE TABLE public.youtube_workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Ma chaîne',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.youtube_workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.youtube_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.youtube_workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  email TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);
ALTER TABLE public.youtube_members ENABLE ROW LEVEL SECURITY;

-- Security definer function for workspace membership check
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.youtube_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

-- RLS for workspaces: members can access
CREATE POLICY "Members can access workspaces" ON public.youtube_workspaces
  FOR ALL USING (public.is_workspace_member(auth.uid(), id))
  WITH CHECK (auth.uid() = created_by);

-- RLS for members: members of same workspace can see each other
CREATE POLICY "Members can access workspace members" ON public.youtube_members
  FOR SELECT USING (public.is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Owner can manage members" ON public.youtube_members
  FOR INSERT WITH CHECK (
    public.is_workspace_member(auth.uid(), workspace_id)
  );
CREATE POLICY "Members can delete self" ON public.youtube_members
  FOR DELETE USING (auth.uid() = user_id);

-- Allow users to create workspaces (and first member entry)
CREATE POLICY "Users can create workspaces" ON public.youtube_workspaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can insert self as member" ON public.youtube_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.youtube_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.youtube_workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'idea',
  assigned_to UUID,
  thumbnail_url TEXT,
  publish_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage workspace videos" ON public.youtube_videos
  FOR ALL USING (public.is_workspace_member(auth.uid(), workspace_id))
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE TABLE public.youtube_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.youtube_workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  potential_score INTEGER NOT NULL DEFAULT 5,
  category TEXT,
  proposed_by UUID NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  voters UUID[] DEFAULT '{}'::UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.youtube_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage workspace ideas" ON public.youtube_ideas
  FOR ALL USING (public.is_workspace_member(auth.uid(), workspace_id))
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE TABLE public.youtube_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.youtube_videos(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.youtube_workspaces(id) ON DELETE CASCADE NOT NULL,
  content TEXT DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.youtube_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage workspace scripts" ON public.youtube_scripts
  FOR ALL USING (public.is_workspace_member(auth.uid(), workspace_id))
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE TABLE public.youtube_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.youtube_workspaces(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.youtube_videos(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  assigned_to UUID,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.youtube_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage workspace tasks" ON public.youtube_tasks
  FOR ALL USING (public.is_workspace_member(auth.uid(), workspace_id))
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE TABLE public.youtube_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.youtube_videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.youtube_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage video comments" ON public.youtube_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.youtube_videos v
      WHERE v.id = video_id AND public.is_workspace_member(auth.uid(), v.workspace_id)
    )
  )
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime on collaborative tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.youtube_videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.youtube_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.youtube_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.youtube_comments;
