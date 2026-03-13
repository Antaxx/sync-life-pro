import { useState, useCallback, useMemo } from "react";
import { Plus, Zap, Brain, Clock, CheckCircle2, Circle, AlertTriangle, ArrowUpRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const bucketColors: Record<string, string> = {
  Business: "bg-primary/20 text-primary",
  Compétences: "bg-warning/20 text-warning",
  Santé: "bg-success/20 text-success",
  Contenu: "bg-blue-500/20 text-blue-400",
};

const mindIcons: Record<string, typeof Zap> = {
  Flow: Brain,
  Quick: Zap,
  Easy: Clock,
};

export default function Organisation() {
  const today = new Date().toISOString().split("T")[0];
  const { data: tasks, insert: insertTask, update: updateTask, remove: removeTask } = useSupabaseTable("tasks", {
    realtime: true,
    orderBy: { column: "sort_order", ascending: true },
  });
  const { data: lifeBuckets, insert: insertBucket } = useSupabaseTable("life_buckets");
  const { data: projects } = useSupabaseTable("projects", { filter: { status: "active" } });

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskMind, setNewTaskMind] = useState<string>("Quick");
  const [newTaskUrgent, setNewTaskUrgent] = useState(false);
  const [newTaskImportant, setNewTaskImportant] = useState(false);
  const [newTaskNeedle, setNewTaskNeedle] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const todayTasks = useMemo(() => tasks.filter(t => t.due_date === today), [tasks, today]);
  const flowCount = todayTasks.filter(t => t.state_of_mind === "Flow" && !t.done).length;

  const toggleTask = useCallback(async (id: string, done: boolean) => {
    await updateTask(id, { done: !done });
  }, [updateTask]);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    await insertTask({
      text: newTaskText,
      due_date: today,
      state_of_mind: newTaskMind as any,
      urgent: newTaskUrgent,
      important: newTaskImportant,
      move_the_needle: newTaskNeedle,
    });
    setNewTaskText("");
    setNewTaskUrgent(false);
    setNewTaskImportant(false);
    setNewTaskNeedle(false);
    setDialogOpen(false);
  };

  // Eisenhower matrix
  const urgent_important = todayTasks.filter(t => t.urgent && t.important && !t.done);
  const important_only = todayTasks.filter(t => !t.urgent && t.important && !t.done);
  const urgent_only = todayTasks.filter(t => t.urgent && !t.important && !t.done);
  const neither = todayTasks.filter(t => !t.urgent && !t.important && !t.done);

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">Organisation</h1>
        <div className="ml-auto flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus size={14} /> Tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Nouvelle tâche</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Description de la tâche" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} className="bg-secondary border-none" />
                <Select value={newTaskMind} onValueChange={setNewTaskMind}>
                  <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flow">Flow (deep work)</SelectItem>
                    <SelectItem value="Quick">Quick (rapide)</SelectItem>
                    <SelectItem value="Easy">Easy (facile)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox checked={newTaskUrgent} onCheckedChange={(v) => setNewTaskUrgent(!!v)} /> Urgent
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox checked={newTaskImportant} onCheckedChange={(v) => setNewTaskImportant(!!v)} /> Important
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox checked={newTaskNeedle} onCheckedChange={(v) => setNewTaskNeedle(!!v)} /> Move the Needle
                  </label>
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddTask}>Ajouter</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {flowCount > 2 && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <AlertTriangle size={14} />
          <span>Attention : {flowCount} tâches Flow ({">"}2 recommandé)</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 flex-1">
        <div className="col-span-2 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aujourd'hui ({todayTasks.length} tâches)</h2>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune tâche pour aujourd'hui. Cliquez sur "+ Tâche" pour en ajouter.</p>
          ) : (
            <div className="space-y-1">
              {todayTasks.map((t) => {
                const MindIcon = mindIcons[t.state_of_mind || "Quick"] || Zap;
                const bucketName = lifeBuckets.find(b => b.id === t.life_bucket_id)?.name;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary/20"
                  >
                    <button onClick={() => toggleTask(t.id, t.done)}>
                      {t.done ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} className="text-muted-foreground" />}
                    </button>
                    <span className={`flex-1 text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.text}</span>
                    {t.move_the_needle && !t.done && <ArrowUpRight size={14} className="text-primary" />}
                    <MindIcon size={14} className="text-muted-foreground" />
                    {bucketName && (
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${bucketColors[bucketName] || "bg-muted text-muted-foreground"}`}>
                        {bucketName}
                      </span>
                    )}
                    <button onClick={() => removeTask(t.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="mt-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Matrice Eisenhower</h2>
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {[
              { label: "Urgent & Important", cls: "border-destructive/30", items: urgent_important },
              { label: "Important", cls: "border-primary/30", items: important_only },
              { label: "Urgent", cls: "border-warning/30", items: urgent_only },
              { label: "Ni urgent ni important", cls: "border-border", items: neither },
            ].map((q) => (
              <div key={q.label} className={`rounded-md border ${q.cls} bg-card p-3`}>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{q.label}</p>
                <div className="space-y-1">
                  {q.items.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">—</p>
                  ) : (
                    q.items.map((item) => <p key={item.id} className="text-xs text-foreground">{item.text}</p>)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Projets actifs ({projects.length}/5)</h2>
          {projects.map((p) => (
            <div key={p.id} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
              {p.name} <span className="text-[10px] text-muted-foreground">({p.progress}%)</span>
            </div>
          ))}
          {projects.length === 0 && <p className="text-xs text-muted-foreground">Aucun projet actif.</p>}

          <h2 className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Life Buckets</h2>
          {lifeBuckets.map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
              <span className="text-xs text-foreground">{b.name}</span>
            </div>
          ))}
          {lifeBuckets.length === 0 && <p className="text-xs text-muted-foreground">Aucun bucket.</p>}
        </div>
      </div>
    </div>
  );
}
