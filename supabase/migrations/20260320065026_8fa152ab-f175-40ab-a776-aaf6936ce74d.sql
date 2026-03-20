
CREATE OR REPLACE FUNCTION public.auto_add_workspace_creator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.youtube_members (workspace_id, user_id, role, email)
  VALUES (NEW.id, NEW.created_by, 'owner', NULL);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_add_workspace_creator
  AFTER INSERT ON public.youtube_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_workspace_creator();
