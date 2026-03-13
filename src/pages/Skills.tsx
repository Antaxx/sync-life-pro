import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BookOpen, TrendingUp, Flame, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const levelColors: Record<string, string> = {
  beginner: "text-muted-foreground",
  intermediate: "text-warning",
  advanced: "text-primary",
  mastered: "text-success",
};
const levelLabels: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé", mastered: "Maîtrisé",
};

export default function Skills() {
  const { data: skills, insert: insertSkill, remove: removeSkill } = useSupabaseTable("skills", { realtime: true, orderBy: { column: "name", ascending: true } });
  const { data: sessions } = useSupabaseTable("skill_sessions", { orderBy: { column: "session_date", ascending: false } });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("beginner");
  const [newCategory, setNewCategory] = useState("");

  const handleAdd = async () => {
    if (!newName) return;
    await insertSkill({ name: newName, level: newLevel, category: newCategory || null });
    setNewName(""); setDialogOpen(false);
  };

  // Weekly session hours
  const weeklyData = Array.from({ length: 6 }, (_, i) => {
    const weekSessions = sessions.filter(s => {
      const d = new Date(s.session_date);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (5 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return d >= weekStart && d < weekEnd;
    });
    return {
      week: `S${i + 1}`,
      hours: Math.round(weekSessions.reduce((s, sess) => s + sess.duration_minutes, 0) / 60 * 10) / 10,
    };
  });

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Compétences</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Nouvelle compétence</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Nouvelle compétence</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nom" value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary border-none" />
              <Select value={newLevel} onValueChange={setNewLevel}>
                <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                  <SelectItem value="mastered">Maîtrisé</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Catégorie" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-secondary border-none" />
              <Button className="w-full bg-primary text-primary-foreground" onClick={handleAdd}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="grid" className="flex-1 flex flex-col">
        <TabsList className="bg-secondary mb-4 self-start">
          <TabsTrigger value="grid" className="gap-1.5 text-xs"><Target size={14} /> Compétences</TabsTrigger>
          <TabsTrigger value="progress" className="gap-1.5 text-xs"><TrendingUp size={14} /> Progression</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-1">
          <div className="grid grid-cols-3 gap-4">
            {skills.map(s => (
              <div key={s.id} className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors relative group">
                <button onClick={() => removeSkill(s.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                  <Trash2 size={12} />
                </button>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">{s.name}</h3>
                  {(s.streak_days || 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-warning" />
                      <span className="text-[10px] font-semibold text-warning">{s.streak_days}</span>
                    </div>
                  )}
                </div>
                <div className="relative mx-auto mb-3 h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--primary))" strokeWidth="5"
                      strokeDasharray={`${(s.progress / 100) * 213.6} 213.6`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{s.progress}%</span>
                </div>
                <div className="text-center">
                  <span className={`text-xs font-medium ${levelColors[s.level]}`}>{levelLabels[s.level]}</span>
                  <p className="text-[10px] text-muted-foreground">{s.total_hours || 0}h investies</p>
                </div>
              </div>
            ))}
            {skills.length === 0 && <p className="text-sm text-muted-foreground col-span-3">Aucune compétence. Ajoutez-en une !</p>}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="flex-1">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Heures d'apprentissage par semaine</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(248, 88%, 69%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(248, 88%, 69%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="hours" stroke="hsl(248, 88%, 69%)" fill="url(#hoursGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
