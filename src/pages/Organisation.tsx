import { useState, useCallback, useMemo } from "react";
import { Plus, Zap, Brain, Clock, CheckCircle2, Circle, ArrowUpRight, Trash2, ChevronDown, ChevronRight, CalendarDays, FolderKanban, Layers, BarChart3, Pencil, X, Inbox, Star, Timer, BookOpen, Repeat, AlertTriangle, CalendarClock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { IconPicker, RenderIcon } from "@/components/organisation/IconPicker";

const WORKSPACES = [
  { id: "open_loops", label: "Open Loops", icon: Inbox, color: "#1a6b3a", description: "Tout ce qui est en suspens et doit être traité." },
  { id: "move_needle", label: "Move the Needle", icon: Star, color: "#1a6b3a", description: "Les tâches qui font vraiment avancer tes objectifs." },
  { id: "time_tracking", label: "Time Tracking", icon: Timer, color: "#1a6b3a", description: "Suivi du temps passé sur tes tâches." },
  { id: "weekly_review", label: "Weekly Review", icon: BookOpen, color: "#1a6b3a", description: "Bilan hebdomadaire : ce qui s'est passé, ce qui vient." },
  { id: "habit_tracker", label: "Habit Tracker", icon: Repeat, color: "#1a6b3a", description: "Suivi de tes habitudes quotidiennes." },
  { id: "bottlenecks", label: "Bottlenecks", icon: AlertTriangle, color: "#1a6b3a", description: "Les blocages qui ralentissent tes projets." },
  { id: "ideal_schedule", label: "Ideal Schedule", icon: CalendarClock, color: "#1a6b3a", description: "Ton emploi du temps idéal type." },
  { id: "personal", label: "Personnel", icon: User, color: "#1a6b3a", description: "Notes et réflexions personnelles." },
];

type WorkspaceState = {
  openLoops: { id: number; text: string; done: boolean }[];
  habits: { id: number; name: string; done: boolean }[];
  bottlenecks: { id: number; text: string }[];
  notes: Record<string, string>;
};

function WorkspaceModal({ workspace, state, setState, onClose }: {
  workspace: typeof WORKSPACES[0];
  state: WorkspaceState;
  setState: (s: WorkspaceState) => void;
  onClose: () => void;
}) {
  const [newItem, setNewItem] = useState("");
  const Icon = workspace.icon;

  const renderContent = () => {
    switch (workspace.id) {
      case "open_loops":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un open loop..."
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newItem.trim()) {
                    setState({ ...state, openLoops: [...state.openLoops, { id: Date.now(), text: newItem.trim(), done: false }] });
                    setNewItem("");
                  }
                }}
                className="bg-secondary border-none text-sm"
              />
              <Button size="sm" onClick={() => {
                if (newItem.trim()) {
                  setState({ ...state, openLoops: [...state.openLoops, { id: Date.now(), text: newItem.trim(), done: false }] });
                  setNewItem("");
                }
              }} className="bg-primary text-primary-foreground shrink-0">
                <Plus size={14} />
              </Button>
            </div>
            <div className="space-y-2">
              {state.openLoops.map(loop => (
                <div key={loop.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <button onClick={() => setState({ ...state, openLoops: state.openLoops.map(l => l.id === loop.id ? { ...l, done: !l.done } : l) })}>
                    {loop.done ? <CheckCircle2 size={16} className="text-primary" /> : <Circle size={16} className="text-muted-foreground" />}
                  </button>
                  <span className={`text-sm flex-1 ${loop.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{loop.text}</span>
                  <button onClick={() => setState({ ...state, openLoops: state.openLoops.filter(l => l.id !== loop.id) })} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {state.openLoops.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun open loop. Tout est traité !</p>}
            </div>
          </div>
        );

      case "move_needle":
        return (
          <div className="space-y-3">
            <div className="p-6 bg-secondary rounded-xl text-center">
              <Star size={32} className="mx-auto mb-3 text-amber-500" />
              <p className="text-sm text-muted-foreground">Les tâches marquées <strong>MTN</strong> lors de leur création apparaîtront ici.</p>
              <p className="text-xs text-muted-foreground mt-2">Coche "MTN" dans le formulaire de création de tâche.</p>
            </div>
          </div>
        );

      case "time_tracking":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {["Travail", "Apprentissage", "Sport", "Personnel"].map(cat => (
                <div key={cat} className="p-4 bg-secondary rounded-xl">
                  <p className="text-sm font-bold text-foreground">{cat}</p>
                  <p className="text-3xl font-black text-primary mt-2">0h</p>
                  <p className="text-xs text-muted-foreground mt-1">cette semaine</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "weekly_review":
        return (
          <div className="space-y-4">
            {[
              { key: "wins", label: "🏆 Victoires de la semaine", placeholder: "Qu'est-ce qui s'est bien passé ?" },
              { key: "improvements", label: "📈 À améliorer", placeholder: "Qu'est-ce qui aurait pu mieux se passer ?" },
              { key: "next_week", label: "🎯 Objectifs semaine prochaine", placeholder: "Quels sont tes 3 objectifs ?" },
            ].map(section => (
              <div key={section.key}>
                <Label className="text-sm font-bold text-foreground">{section.label}</Label>
                <Textarea
                  placeholder={section.placeholder}
                  value={state.notes[section.key] || ""}
                  onChange={e => setState({ ...state, notes: { ...state.notes, [section.key]: e.target.value } })}
                  className="mt-2 bg-secondary border-none resize-none text-sm min-h-[100px]"
                />
              </div>
            ))}
          </div>
        );

      case "habit_tracker":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle habitude..."
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newItem.trim()) {
                    setState({ ...state, habits: [...state.habits, { id: Date.now(), name: newItem.trim(), done: false }] });
                    setNewItem("");
                  }
                }}
                className="bg-secondary border-none text-sm"
              />
              <Button size="sm" onClick={() => {
                if (newItem.trim()) {
                  setState({ ...state, habits: [...state.habits, { id: Date.now(), name: newItem.trim(), done: false }] });
                  setNewItem("");
                }
              }} className="bg-primary text-primary-foreground shrink-0">
                <Plus size={14} />
              </Button>
            </div>
            <div className="space-y-2">
              {state.habits.map(habit => (
                <div key={habit.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <button onClick={() => setState({ ...state, habits: state.habits.map(h => h.id === habit.id ? { ...h, done: !h.done } : h) })}>
                    {habit.done ? <CheckCircle2 size={18} className="text-primary" /> : <Circle size={18} className="text-muted-foreground" />}
                  </button>
                  <span className={`text-sm flex-1 ${habit.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{habit.name}</span>
                  <button onClick={() => setState({ ...state, habits: state.habits.filter(h => h.id !== habit.id) })} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {state.habits.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucune habitude. Ajoutes-en une !</p>}
            </div>
            {state.habits.length > 0 && (
              <div className="p-3 rounded-xl" style={{ backgroundColor: "#1a6b3a20" }}>
                <p className="text-sm font-bold text-primary">
                  {state.habits.filter(h => h.done).length}/{state.habits.length} habitudes complétées aujourd'hui
                </p>
                <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${state.habits.length > 0 ? (state.habits.filter(h => h.done).length / state.habits.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "bottlenecks":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Décris un blocage..."
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newItem.trim()) {
                    setState({ ...state, bottlenecks: [...state.bottlenecks, { id: Date.now(), text: newItem.trim() }] });
                    setNewItem("");
                  }
                }}
                className="bg-secondary border-none text-sm"
              />
              <Button size="sm" onClick={() => {
                if (newItem.trim()) {
                  setState({ ...state, bottlenecks: [...state.bottlenecks, { id: Date.now(), text: newItem.trim() }] });
                  setNewItem("");
                }
              }} className="bg-primary text-primary-foreground shrink-0">
                <Plus size={14} />
              </Button>
            </div>
            <div className="space-y-2">
              {state.bottlenecks.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/30">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  <span className="text-sm flex-1 text-foreground">{b.text}</span>
                  <button onClick={() => setState({ ...state, bottlenecks: state.bottlenecks.filter(x => x.id !== b.id) })} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {state.bottlenecks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun blocage identifié.</p>}
            </div>
          </div>
        );

      case "ideal_schedule":
        return (
          <div className="space-y-2">
            {[
              { time: "6h - 8h", label: "Réveil & matin" },
              { time: "8h - 12h", label: "Matinée" },
              { time: "12h - 14h", label: "Déjeuner" },
              { time: "14h - 17h", label: "Après-midi" },
              { time: "17h - 19h", label: "Fin d'après-midi" },
              { time: "19h - 22h", label: "Soirée" },
            ].map(slot => (
              <div key={slot.time} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <span className="text-xs font-bold text-primary w-20 shrink-0">{slot.time}</span>
                <Input
                  placeholder={`${slot.label}...`}
                  value={state.notes[slot.time] || ""}
                  onChange={e => setState({ ...state, notes: { ...state.notes, [slot.time]: e.target.value } })}
                  className="bg-transparent border-none text-sm p-0 h-auto focus-visible:ring-0"
                />
              </div>
            ))}
          </div>
        );

      case "personal":
        return (
          <Textarea
            placeholder="Notes personnelles, réflexions, idées..."
            value={state.notes["personal"] || ""}
            onChange={e => setState({ ...state, notes: { ...state.notes, personal: e.target.value } })}
            className="bg-secondary border-none resize-none text-sm min-h-[300px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex flex-col w-full max-w-lg max-h-[85vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: workspace.color + "20" }}>
              <Icon size={20} style={{ color: workspace.color }} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{workspace.label}</h3>
              <p className="text-xs text-muted-foreground">{workspace.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X size={16} />
          </Button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

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
  const [activeWorkspace, setActiveWorkspace] = useState<typeof WORKSPACES[0] | null>(null);
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>({
    openLoops: [],
    habits: [
      { id: 1, name: "Méditation 10min", done: false },
      { id: 2, name: "Lecture 30min", done: false },
      { id: 3, name: "Sport", done: false },
    ],
    bottlenecks: [],
    notes: {},
  });

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

        {/* TÂCHES */}
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
                  <div key={q.label} className={`p-4 rounded-xl border ${q.cls} min-h-[100px]`}>
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
                {projects.length === 0 && <p className="text-sm text-muted-foreground">Aucun projet actif.</p>}
              </div>
            </div>
          )}
        </div>

        {/* WORKSPACES */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => toggle("workspaces")} className="flex items-center justify-between p-4 md:p-6 w-full hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              {openSections.workspaces ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-muted-foreground" />}
              <h3 className="text-base md:text-lg font-bold tracking-wide text-foreground uppercase">Workspaces</h3>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full hidden sm:inline">
              {WORKSPACES.length} espaces
            </span>
          </button>
          {openSections.workspaces && (
            <div className="p-4 md:p-6 border-t border-border bg-secondary/20">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {WORKSPACES.map(ws => {
                  const Icon = ws.icon;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => setActiveWorkspace(ws)}
                      className="group flex flex-col items-center gap-2 p-3 md:p-4 bg-card rounded-2xl shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: ws.color + "20" }}
                      >
                        <Icon size={22} style={{ color: ws.color }} />
                      </div>
                      <span className="text-[11px] md:text-xs font-bold text-foreground text-center leading-tight">{ws.label}</span>
                    </button>
                  );
                })}
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

      {/* Workspace Modal */}
      {activeWorkspace && (
        <WorkspaceModal
          workspace={activeWorkspace}
          state={workspaceState}
          setState={setWorkspaceState}
          onClose={() => setActiveWorkspace(null)}
        />
      )}
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

  const startCreate = () => { setEditId(null); setName(""); setColor("#1a6b3a"); setIcon("Home"); setShowCreate(true); };
  const startEdit = (b: any) => { setEditId(b.id); setName(b.name); setColor(b.color); setIcon(b.icon || "CircleDot"); setShowCreate(true); };
  const handleSave = async () => {
    if (!name.trim()) return;
    if (editId) await updateBucket(editId, { name: name.trim(), color, icon });
    else await insertBucket({ name: name.trim(), color, icon, sort_order: lifeBuckets.length });
    setShowCreate(false);
  };

  return (
    <>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Modifier le domaine" : "Nouveau domaine de vie"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input placeholder="Ex: Santé, Carrière, Famille..." value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-none mt-1" />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <Label>Icône</Label>
              <div className="mt-2"><IconPicker value={icon} onChange={setIcon} color={color} /></div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>{editId ? "Enregistrer" : "Créer"}</Button>
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
            <Link to="/organisation/analyse" onClick={e => e.stopPropagation()} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
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
                    <button onClick={() => startEdit(b)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
                    <button onClick={() => removeBucket(b.id)} className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X size={12} /></button>
                  </div>
                  <Link to={`/organisation/bucket/${b.id}`} className="flex flex-col items-center gap-2 w-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <RenderIcon name={b.icon || "CircleDot"} size={22} color={b.color} />
                    </div>
                    <span className="text-[11px] md:text-xs font-bold text-foreground text-center leading-tight">{b.name}</span>
                  </Link>
                </div>
              ))}
              <button onClick={startCreate} className="flex flex-col items-center justify-center gap-2 p-3 md:p-4 bg-card rounded-2xl shadow-sm border-2 border-dashed border-border hover:border-primary/50 transition-colors min-h-[100px]">
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
