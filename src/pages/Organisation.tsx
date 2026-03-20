import { useState, useCallback, useMemo } from "react";
import { Plus, Zap, Brain, Clock, CheckCircle2, Circle, ArrowUpRight, Trash2, ChevronDown, ChevronRight, CalendarDays, FolderKanban, Layers, BarChart3, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { IconPicker, RenderIcon } from "@/components/organisation/IconPicker";

export default function Organisation() {
  const today = new Date().toISOString().split("T")[0];
  const { data: tasks, insert: insertTask, update: updateTask, remove: removeTask } = useSupabaseTable("tasks", {
    realtime: true,
    orderBy: { column: "sort_order", ascending: true },
  });
  const { data: lifeBuckets, insert: insertBucket, update: updateBucket, remove: removeBucket } = useSupabaseTable("life_buckets", { orderBy: { column: "sort_order", ascending: true } });
  const { data: projects } = useSupabaseTable("projects", { filter: { status: "active" } });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskMind, setNewTaskMind] = useState("Quick");
  const [newTaskUrgent, setNewTaskUrgent] = useState(false);
  const [newTaskImportant, setNewTaskImportant] = useState(false);
  const [newTaskNeedle, setNewTaskNeedle] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ today: true });
  const toggle = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const todayTasks = useMemo(() => tasks.filter(t => t.due_date === today), [tasks, today]);
  const remainingCount = todayTasks.filter(t => !t.done).length;

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

  const urgent_important = todayTasks.filter(t => t.urgent && t.important && !t.done);
  const important_only = todayTasks.filter(t => !t.urgent && t.important && !t.done);
  const urgent_only = todayTasks.filter(t => t.urgent && !t.important && !t.done);
  const neither = todayTasks.filter(t => !t.urgent && !t.important && !t.done);

  const now = new Date();
  const monthName = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const dayOfWeek = (now.getDay() + 6) % 7;
  const startDay = now.getDate() - dayOfWeek;
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

  const mindLabels: Record<string, { label: string; cls: string }> = {
    Flow: { label: "FOCUSED", cls: "bg-blue-50 text-blue-600" },
    Quick: { label: "QUICK", cls: "bg-primary/10 text-primary" },
    Easy: { label: "EASY", cls: "bg-amber-50 text-amber-600" },
  };

  return (
    <div className="flex h-screen flex-col overflow-auto p-4 md:p-8">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Organisation</h1>
        <p className="text-muted-foreground font-medium mt-1 text-sm md:text-base">Gérez vos espaces de travail et vos priorités.</p>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 h-12 md:h-14 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all text-sm">
              <Plus size={16} /> Tâche
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border mx-4">
            <DialogHeader><DialogTitle>Nouvelle tâche</DialogTitle></DialogHeader>
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
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={newTaskUrgent} onCheckedChange={(v) => setNewTaskUrgent(!!v)} /> Urgent</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={newTaskImportant} onCheckedChange={(v) => setNewTaskImportant(!!v)} /> Important</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={newTaskNeedle} onCheckedChange={(v) => setNewTaskNeedle(!!v)} /> MTN</label>
              </div>
              <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddTask}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
        <button className="flex items-center justify-center gap-2 h-12 md:h-14 rounded-2xl bg-card text-foreground font-bold shadow-sm hover:shadow-md transition-all text-sm">
          <Zap size={16} className="text-primary" /> Rapide
        </button>
        <button className="flex items-center justify-center gap-2 h-12 md:h-14 rounded-2xl bg-card text-foreground font-bold shadow-sm hover:shadow-md transition-all text-sm">
          <Clock size={16} className="text-primary" /> Do Now
        </button>
        <button className="flex items-center justify-center gap-2 h-12 md:h-14 rounded-2xl bg-card text-foreground font-bold shadow-sm hover:shadow-md transition-all text-sm">
          <Brain size={16} className="text-primary" /> Routine
        </button>
      </div>

      {/* Accordion Sections */}
      <div className="flex flex-col gap-4">
        {/* AUJOURD'HUI */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => toggle("today")} className="flex items-center justify-between p-4 md:p-6 w-full hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              {openSections.today ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-muted-foreground" />}
              <h3 className="text-base md:text-lg font-bold tracking-wide text-foreground uppercase">Aujourd'hui</h3>
            </div>
            <span className="text-xs md:text-sm font-medium text-muted-foreground">{remainingCount} restantes</span>
          </button>
          {openSections.today && (
            <div className="p-4 md:p-6 border-t border-border bg-secondary/20">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                <div className="md:col-span-8 flex flex-col gap-3">
                  {todayTasks.map(t => {
                    const mind = mindLabels[t.state_of_mind || "Quick"] || mindLabels.Quick;
                    return (
                      <div key={t.id} className="flex items-center justify-between bg-card p-3 md:p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                          <button onClick={() => toggleTask(t.id, t.done)} className="shrink-0">
                            {t.done ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} className="text-muted-foreground" />}
                          </button>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.text}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${mind.cls}`}>{mind.label}</span>
                              {t.move_the_needle && (
                                <span className="text-[10px] flex items-center text-amber-500 font-bold uppercase tracking-tighter gap-0.5">
                                  <ArrowUpRight size={10} /> MTN
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeTask(t.id)} className="text-muted-foreground hover:text-destructive shrink-0 ml-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {todayTasks.length === 0 && <p className="text-sm text-muted-foreground">Aucune tâche pour aujourd'hui.</p>}
                </div>
                {/* Mini Calendar - hidden on small mobile */}
                <div className="hidden md:block md:col-span-4 bg-card p-5 rounded-xl shadow-sm border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-foreground capitalize">{monthName}</h4>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDays.map((d, i) => (
                      <span key={i} className="text-[10px] font-bold text-muted-foreground uppercase mb-2">{d}</span>
                    ))}
                    {Array.from({ length: 7 }, (_, i) => {
                      const day = startDay + i;
                      const isToday = day === now.getDate();
                      return (
                        <span key={i} className={`text-sm py-2 rounded-lg ${isToday ? "bg-primary/10 text-primary font-bold" : day > now.getDate() ? "text-muted-foreground/50" : "text-foreground"}`}>
                          {day > 0 ? day : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CALENDRIER */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => toggle("calendar")} className="flex items-center justify-between p-4 md:p-6 w-full hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              {openSections.calendar ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-muted-foreground" />}
              <h3 className="text-base md:text-lg font-bold tracking-wide text-foreground uppercase">Calendrier</h3>
            </div>
            <CalendarDays size={20} className="text-muted-foreground" />
          </button>
          {openSections.calendar && (
            <div className="p-4 md:p-6 border-t border-border bg-secondary/20">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="h-20 md:h-32 rounded-xl bg-card shadow-sm border border-border" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TÂCHES (Eisenhower) */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => toggle("tasks")} className="flex items-center justify-between p-4 md:p-6 w-full hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              {openSections.tasks ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-muted-foreground" />}
              <h3 className="text-base md:text-lg font-bold tracking-wide text-foreground uppercase">Tâches</h3>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full hidden sm:inline">Matrice Eisenhower</span>
          </button>
          {openSections.tasks && (
            <div className="p-4 md:p-6 border-t border-border bg-secondary/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {[
                  { label: "Urgent & Important", cls: "border-destructive/20 bg-destructive/5", items: urgent_important },
                  { label: "Important & Pas Urgent", cls: "border-blue-200 bg-blue-50/30", items: important_only },
                  { label: "Urgent & Pas Important", cls: "border-amber-200 bg-amber-50/30", items: urgent_only },
                  { label: "Ni Urgent Ni Important", cls: "border-border bg-card", items: neither },
                ].map(q => (
                  <div key={q.label} className={`p-4 rounded-xl border ${q.cls} min-h-[100px] md:min-h-[120px]`}>
                    <span className="text-xs font-bold text-muted-foreground uppercase">{q.label}</span>
                    <div className="mt-3 space-y-1">
                      {q.items.map(item => <p key={item.id} className="text-sm text-foreground">{item.text}</p>)}
                      {q.items.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PROJETS */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => toggle("projects")} className="flex items-center justify-between p-4 md:p-6 w-full hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              {openSections.projects ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-muted-foreground" />}
              <h3 className="text-base md:text-lg font-bold tracking-wide text-foreground uppercase">Projets</h3>
            </div>
            <FolderKanban size={20} className="text-muted-foreground" />
          </button>
          {openSections.projects && (
            <div className="p-4 md:p-6 border-t border-border bg-secondary/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-card shadow-sm border border-border">
                    <h5 className="font-bold text-foreground">{p.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{p.progress}% complété</p>
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">Aucun projet actif.</p>}
              </div>
            </div>
          )}
        </div>

        {/* LIFE BUCKETS */}
        <LifeBucketsSection
          lifeBuckets={lifeBuckets}
          openSections={openSections}
          toggle={toggle}
          insertBucket={insertBucket}
          updateBucket={updateBucket}
          removeBucket={removeBucket}
        />
      </div>
    </div>
  );
}

function LifeBucketsSection({ lifeBuckets, openSections, toggle, insertBucket, updateBucket, removeBucket }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1a6b3a");
  const [icon, setIcon] = useState("Home");

  const COLORS = ["#1a6b3a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6"];

  const startCreate = () => {
    setEditId(null);
    setName("");
    setColor("#1a6b3a");
    setIcon("Home");
    setShowCreate(true);
  };

  const startEdit = (b: any) => {
    setEditId(b.id);
    setName(b.name);
    setColor(b.color);
    setIcon(b.icon || "CircleDot");
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editId) {
      await updateBucket(editId, { name: name.trim(), color, icon });
    } else {
      await insertBucket({ name: name.trim(), color, icon, sort_order: lifeBuckets.length });
    }
    setShowCreate(false);
  };

  return (
    <>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le domaine" : "Nouveau domaine de vie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input placeholder="Ex: Santé, Carrière, Famille..." value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-none mt-1" />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Icône</Label>
              <div className="mt-2">
                <IconPicker value={icon} onChange={setIcon} color={color} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>
              {editId ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggle("buckets")} className="flex items-center justify-between p-4 md:p-6 w-full hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            {openSections.buckets ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-muted-foreground" />}
            <h3 className="text-base md:text-lg font-bold tracking-wide text-foreground uppercase">Life Buckets</h3>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/organisation/analyse"
              onClick={e => e.stopPropagation()}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <BarChart3 size={14} /> Analyse
            </Link>
            <Layers size={20} className="text-muted-foreground" />
          </div>
        </button>
        {openSections.buckets && (
          <div className="p-4 md:p-6 border-t border-border bg-secondary/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {lifeBuckets.map((b: any) => (
                <div key={b.id} className="group relative flex flex-col items-center gap-2 p-3 md:p-4 bg-card rounded-2xl shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                    <button onClick={() => startEdit(b)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => removeBucket(b.id)} className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <X size={12} />
                    </button>
                  </div>
                  <Link to={`/organisation/bucket/${b.id}`} className="flex flex-col items-center gap-2 w-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <RenderIcon name={b.icon || "CircleDot"} size={22} color={b.color} />
                    </div>
                    <span className="text-[11px] md:text-xs font-bold text-foreground text-center leading-tight">{b.name}</span>
                  </Link>
                </div>
              ))}
              <button
                onClick={startCreate}
                className="flex flex-col items-center justify-center gap-2 p-3 md:p-4 bg-card rounded-2xl shadow-sm border-2 border-dashed border-border hover:border-primary/50 transition-colors min-h-[100px]"
              >
                <Plus size={20} className="text-muted-foreground" />
                <span className="text-[11px] md:text-xs font-bold text-muted-foreground">Ajouter</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
