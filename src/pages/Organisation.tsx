import { useState } from "react";
import { Plus, Zap, Brain, Clock, CheckCircle2, Circle, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const todayTasks = [
  { text: "Finaliser maquette Acme", bucket: "Business", mind: "Flow", needle: true, done: false },
  { text: "Répondre emails clients", bucket: "Business", mind: "Quick", needle: false, done: true },
  { text: "Session React Patterns 1h", bucket: "Compétences", mind: "Flow", needle: true, done: false },
  { text: "Marche 30 min", bucket: "Santé", mind: "Easy", needle: false, done: false },
  { text: "Review notes Zettelkasten", bucket: "Contenu", mind: "Quick", needle: false, done: false },
];

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
  const [tasks, setTasks] = useState(todayTasks);

  const toggleTask = (idx: number) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  };

  const flowCount = tasks.filter(t => t.mind === "Flow" && !t.done).length;

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      {/* Quick actions */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">Organisation</h1>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Plus size={14} /> Tâche
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Plus size={14} /> Projet
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground">
            <Zap size={14} /> Routine du jour
          </Button>
        </div>
      </div>

      {/* Flow warning */}
      {flowCount > 2 && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <AlertTriangle size={14} />
          <span>Attention : {flowCount} tâches Flow aujourd'hui (max 2 recommandé)</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Today */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aujourd'hui</h2>
          <div className="space-y-1">
            {tasks.map((t, i) => {
              const MindIcon = mindIcons[t.mind];
              return (
                <div
                  key={i}
                  onClick={() => toggleTask(i)}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary/20"
                >
                  {t.done ? (
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                  ) : (
                    <Circle size={16} className="text-muted-foreground shrink-0" />
                  )}
                  <span className={`flex-1 text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {t.text}
                  </span>
                  {t.needle && !t.done && <ArrowUpRight size={14} className="text-primary" />}
                  <MindIcon size={14} className="text-muted-foreground" />
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${bucketColors[t.bucket] || "bg-muted text-muted-foreground"}`}>
                    {t.bucket}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Eisenhower Matrix */}
          <h2 className="mt-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Matrice Eisenhower</h2>
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {[
              { label: "Urgent & Important", cls: "border-destructive/30", items: ["Finaliser maquette Acme"] },
              { label: "Important", cls: "border-primary/30", items: ["Session React Patterns", "Créer plan marketing"] },
              { label: "Urgent", cls: "border-warning/30", items: ["Répondre emails"] },
              { label: "Ni urgent ni important", cls: "border-border", items: ["Ranger bureau", "Review notes"] },
            ].map((q) => (
              <div key={q.label} className={`rounded-md border ${q.cls} bg-card p-3`}>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{q.label}</p>
                <div className="space-y-1">
                  {q.items.map((item) => (
                    <p key={item} className="text-xs text-foreground">{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Workspaces</h2>
          {["Open Loops", "Move the Needle", "Time Tracking", "Weekly Review", "Habit Tracker", "Bottlenecks"].map((ws) => (
            <div key={ws} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground cursor-pointer hover:border-primary/20 transition-colors">
              {ws}
            </div>
          ))}

          <h2 className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Life Buckets</h2>
          {Object.entries(bucketColors).map(([name, cls]) => (
            <div key={name} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${cls.split(" ")[0]}`} />
              <span className="text-xs text-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
