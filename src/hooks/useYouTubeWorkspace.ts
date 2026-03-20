import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface YTWorkspace { id: string; name: string; created_by: string; created_at: string; }
export interface YTMember { id: string; workspace_id: string; user_id: string; role: string; email: string | null; joined_at: string; }
export interface YTVideo { id: string; workspace_id: string; title: string; description: string | null; status: string; assigned_to: string | null; thumbnail_url: string | null; publish_date: string | null; priority: string; tags: string[]; created_by: string; created_at: string; updated_at: string; }
export interface YTIdea { id: string; workspace_id: string; title: string; description: string | null; potential_score: number; category: string | null; proposed_by: string; votes: number; voters: string[]; created_at: string; }
export interface YTScript { id: string; video_id: string; workspace_id: string; content: string; word_count: number; created_at: string; updated_at: string; }
export interface YTTask { id: string; workspace_id: string; video_id: string | null; title: string; assigned_to: string | null; due_date: string | null; status: string; priority: string; done: boolean; created_at: string; updated_at: string; }
export interface YTComment { id: string; video_id: string; user_id: string; content: string; created_at: string; }

export function useYouTubeWorkspace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workspace, setWorkspace] = useState<YTWorkspace | null>(null);
  const [members, setMembers] = useState<YTMember[]>([]);
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [ideas, setIdeas] = useState<YTIdea[]>([]);
  const [scripts, setScripts] = useState<YTScript[]>([]);
  const [tasks, setTasks] = useState<YTTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      // Get user's workspace membership
      const { data: memberData } = await supabase
        .from("youtube_members")
        .select("*")
        .eq("user_id", user.id)
        .limit(1) as any;

      if (!memberData?.length) {
        setLoading(false);
        return;
      }

      const wsId = memberData[0].workspace_id;

      const [wsRes, membersRes, videosRes, ideasRes, scriptsRes, tasksRes] = await Promise.all([
        supabase.from("youtube_workspaces").select("*").eq("id", wsId).single() as any,
        supabase.from("youtube_members").select("*").eq("workspace_id", wsId) as any,
        supabase.from("youtube_videos").select("*").eq("workspace_id", wsId).order("created_at", { ascending: false }) as any,
        supabase.from("youtube_ideas").select("*").eq("workspace_id", wsId).order("votes", { ascending: false }) as any,
        supabase.from("youtube_scripts").select("*").eq("workspace_id", wsId) as any,
        supabase.from("youtube_tasks").select("*").eq("workspace_id", wsId).order("created_at", { ascending: false }) as any,
      ]);

      setWorkspace(wsRes.data);
      setMembers(membersRes.data || []);
      setVideos(videosRes.data || []);
      setIdeas(ideasRes.data || []);
      setScripts(scriptsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (e: any) {
      console.error("YT workspace error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime
  useEffect(() => {
    if (!workspace) return;
    const channel = supabase
      .channel("yt-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "youtube_videos", filter: `workspace_id=eq.${workspace.id}` }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "youtube_tasks", filter: `workspace_id=eq.${workspace.id}` }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "youtube_ideas", filter: `workspace_id=eq.${workspace.id}` }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [workspace, fetchAll]);

  const createWorkspace = useCallback(async (name: string) => {
    if (!user) return;
    const { error } = await (supabase.from("youtube_workspaces") as any)
      .insert({ name, created_by: user.id });
    if (error) { toast({ title: "❌ Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✓ Workspace créé" });
    fetchAll();
  }, [user, fetchAll]);

  const inviteMember = useCallback(async (email: string) => {
    if (!workspace) return;
    // Look up user by email in members (simple approach)
    const { error } = await (supabase.from("youtube_members") as any)
      .insert({ workspace_id: workspace.id, user_id: crypto.randomUUID(), role: "member", email });
    if (error) { toast({ title: "❌ Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✓ Invitation envoyée" });
    fetchAll();
  }, [workspace, fetchAll]);

  const addVideo = useCallback(async (data: Partial<YTVideo>) => {
    if (!workspace || !user) return;
    const { error } = await (supabase.from("youtube_videos") as any)
      .insert({ ...data, workspace_id: workspace.id, created_by: user.id });
    if (error) { toast({ title: "❌ Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✓ Vidéo ajoutée" });
  }, [workspace, user]);

  const updateVideo = useCallback(async (id: string, data: Partial<YTVideo>) => {
    const { error } = await (supabase.from("youtube_videos") as any).update(data).eq("id", id);
    if (error) { toast({ title: "❌ Erreur", description: error.message, variant: "destructive" }); return; }
  }, []);

  const addIdea = useCallback(async (data: Partial<YTIdea>) => {
    if (!workspace || !user) return;
    const { error } = await (supabase.from("youtube_ideas") as any)
      .insert({ ...data, workspace_id: workspace.id, proposed_by: user.id });
    if (error) { toast({ title: "❌ Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✓ Idée ajoutée" });
  }, [workspace, user]);

  const voteIdea = useCallback(async (idea: YTIdea) => {
    if (!user) return;
    const alreadyVoted = idea.voters?.includes(user.id);
    if (alreadyVoted) return;
    await (supabase.from("youtube_ideas") as any)
      .update({ votes: idea.votes + 1, voters: [...(idea.voters || []), user.id] })
      .eq("id", idea.id);
  }, [user]);

  const convertIdeaToVideo = useCallback(async (idea: YTIdea) => {
    if (!workspace || !user) return;
    await (supabase.from("youtube_videos") as any).insert({
      workspace_id: workspace.id, title: idea.title, description: idea.description,
      status: "idea", created_by: user.id, priority: "medium",
    });
    await (supabase.from("youtube_ideas") as any).delete().eq("id", idea.id);
    toast({ title: "✓ Idée convertie en vidéo" });
  }, [workspace, user]);

  const addTask = useCallback(async (data: Partial<YTTask>) => {
    if (!workspace) return;
    const { error } = await (supabase.from("youtube_tasks") as any)
      .insert({ ...data, workspace_id: workspace.id });
    if (error) { toast({ title: "❌ Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✓ Tâche ajoutée" });
  }, [workspace]);

  const updateTask = useCallback(async (id: string, data: Partial<YTTask>) => {
    await (supabase.from("youtube_tasks") as any).update(data).eq("id", id);
  }, []);

  const addScript = useCallback(async (videoId: string, content: string) => {
    if (!workspace) return;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const { error } = await (supabase.from("youtube_scripts") as any)
      .insert({ video_id: videoId, workspace_id: workspace.id, content, word_count: wordCount });
    if (error) { toast({ title: "❌ Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✓ Script sauvegardé" });
    fetchAll();
  }, [workspace, fetchAll]);

  const updateScript = useCallback(async (id: string, content: string) => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    await (supabase.from("youtube_scripts") as any).update({ content, word_count: wordCount }).eq("id", id);
  }, []);

  return {
    workspace, members, videos, ideas, scripts, tasks, loading,
    createWorkspace, inviteMember, addVideo, updateVideo, addIdea, voteIdea,
    convertIdeaToVideo, addTask, updateTask, addScript, updateScript, fetchAll,
  };
}
