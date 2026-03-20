import { useParams, Link } from "react-router-dom";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { RenderIcon } from "@/components/organisation/IconPicker";
import { ArrowLeft, CheckCircle2, Circle, Trash2, FolderKanban } from "lucide-react";
import { useCallback, useMemo } from "react";

export default function LifeBucketDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: buckets } = useSupabaseTable("life_buckets");
  const { data: tasks, update: updateTask, remove: removeTask } = useSupabaseTable("tasks", {
    filter: { life_bucket_id: id },
    realtime: true,
    orderBy: { column: "created_at", ascending: false },
  });
  const { data: projects } = useSupabaseTable("projects", { filter: { life_bucket_id: id } });
  const { data: goals } = useSupabaseTable("long_term_goals", { filter: { life_bucket_id: id } });

  const bucket = useMemo(() => buckets.find(b => b.id === id), [buckets, id]);

  const toggleTask = useCallback(async (taskId: string, done: boolean) => {
    await updateTask(taskId, { done: !done });
  }, [updateTask]);

  if (!bucket) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Link to="/organisation" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bucket.color + "20" }}>
          <RenderIcon name={bucket.icon || "CircleDot"} size={22} color={bucket.color} />
        </div>
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground">{bucket.name}</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tâches · {projects.length} projets · {goals.length} objectifs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Tâches en cours */}
        <div className="bg-card p-5 md:p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-base md:text-lg font-bold mb-4">Tâches en cours ({pendingTasks.length})</h3>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune tâche en cours.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button onClick={() => toggleTask(t.id, t.done)} className="shrink-0">
                      <Circle size={18} className="text-muted-foreground" />
                    </button>
                    <span className="text-sm font-medium text-foreground truncate">{t.text}</span>
                  </div>
                  <button onClick={() => removeTask(t.id)} className="text-muted-foreground hover:text-destructive shrink-0 ml-2">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tâches terminées */}
        <div className="bg-card p-5 md:p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-base md:text-lg font-bold mb-4">Terminées ({doneTasks.length})</h3>
          {doneTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune tâche terminée.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {doneTasks.slice(0, 10).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground line-through truncate">{t.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projets */}
        <div className="bg-card p-5 md:p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            <FolderKanban size={18} className="text-primary" /> Projets
          </h3>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun projet lié.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">{p.name}</span>
                    <span className="text-xs font-bold text-primary">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-primary/10 h-1.5 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objectifs */}
        <div className="bg-card p-5 md:p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            <Target size={18} className="text-primary" /> Objectifs
          </h3>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun objectif lié.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {goals.map(g => (
                <div key={g.id} className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">{g.name}</span>
                    <span className="text-xs font-bold text-primary">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-primary/10 h-1.5 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
