import { useState } from "react";
import { Plus, Trash2, Flame, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const levelLabels: Record<string, string> = {
  beginner: "Novice", intermediate: "Intermédiaire", advanced: "Avancé", mastered: "Expert",
};
const levelNumbers: Record<string, number> = {
  beginner: 1, intermediate: 2, advanced: 3, mastered: 5,
};

export default function Skills() {
  const { data: skills, insert: insertSkill, remove: removeSkill } = useSupabaseTable("skills", { realtime: true, orderBy: { column: "name", ascending: true } });
  const { data: sessions } = useSupabaseTable("skill_sessions", { orderBy: { column: "session_date", ascending: false } });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("beginner");
  const [newCategory, setNewCategory] = useState("");
  const [activeTab, setActiveTab] = useState("skills");

  const handleAdd = async () => {
    if (!newName) return;
    await insertSkill({ name: newName, level: newLevel, category: newCategory || null });
    setNewName(""); setDialogOpen(false);
  };

  const totalSkills = skills.length;
  const totalSessions = sessions.length;
  const maxStreak = skills.reduce((max, s) => Math.max(max, s.streak_days || 0), 0);
  const totalXP = skills.reduce((sum, s) => sum + (s.progress || 0) * 10, 0);

  return (
    <div className="flex h-screen flex-col overflow-auto">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Compétences</h1>
          <p className="text-xs text-muted-foreground font-medium">Gérez et suivez votre évolution personnelle</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="pl-9 pr-4 py-2 bg-card border border-border rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20" placeholder="Rechercher une compétence..." />
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-muted-foreground text-sm font-medium mb-1">Total Compétences</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-foreground">{totalSkills}</span>
              <span className="text-primary text-xs font-bold px-2 py-1 bg-primary/10 rounded-lg">Actives</span>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-muted-foreground text-sm font-medium mb-1">Points d'XP</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-foreground">{totalXP.toLocaleString()}</span>
              <span className="text-primary text-lg">⭐</span>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-muted-foreground text-sm font-medium mb-1">Série actuelle</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-foreground">{maxStreak} jours</span>
              <Flame size={20} className="text-amber-500" />
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="text-muted-foreground text-sm font-medium mb-1">Sessions complétées</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-foreground">{totalSessions}</span>
              <span className="text-blue-500 text-lg">✓</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-8 overflow-x-auto">
          {["skills", "learning", "progress"].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-colors ${
                activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {["MES COMPÉTENCES", "APPRENTISSAGE", "PROGRESSION"][i]}
            </button>
          ))}
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-3 gap-6">
          {skills.map(s => {
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (s.progress / 100) * circumference;
            return (
              <div key={s.id} className="bg-card p-6 rounded-3xl shadow-sm border border-border hover:border-primary/20 hover:shadow-md transition-all group relative">
                <button onClick={() => removeSkill(s.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                  <Trash2 size={14} />
                </button>
                <div className="flex justify-between items-start mb-6">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-primary/10" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                      <circle
                        className="text-primary"
                        cx="50" cy="50" fill="transparent" r="40"
                        stroke="currentColor" strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.35s" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-foreground">{s.progress}%</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {s.category && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{s.category}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Flame size={14} className={(s.streak_days || 0) > 0 ? "text-amber-500" : "text-muted-foreground/30"} />
                      <span className={`text-xs font-bold ${(s.streak_days || 0) > 0 ? "text-amber-500" : "text-muted-foreground/30"}`}>{s.streak_days || 0}j</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors text-foreground">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">Niveau {levelNumbers[s.level] || 1} - {levelLabels[s.level] || s.level}</p>
                </div>
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/10">
                  ▶ Session
                </button>
              </div>
            );
          })}

          {/* Add New Card */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="border-2 border-dashed border-muted-foreground/30 rounded-3xl flex flex-col items-center justify-center p-8 gap-4 hover:border-primary/40 hover:bg-card hover:shadow-sm transition-all text-muted-foreground hover:text-primary min-h-[320px]">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                  <Plus size={32} />
                </div>
                <p className="font-bold">Nouvelle Compétence</p>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Nouvelle compétence</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nom" value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary border-none" />
                <Select value={newLevel} onValueChange={setNewLevel}>
                  <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Novice</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                    <SelectItem value="mastered">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Catégorie" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-secondary border-none" />
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleAdd}>Ajouter</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* AI Agent Section */}
        <div className="mt-12">
          <h4 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
            ✨ Agent IA
          </h4>
          <div className="bg-primary/5 border border-border rounded-3xl p-8">
            <div className="flex flex-wrap gap-6 items-end">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-[10px] font-bold text-primary uppercase mb-2 tracking-widest">Objectif de séance</label>
                <select className="w-full bg-card border border-border rounded-xl py-3 px-4 focus:ring-primary text-sm font-medium">
                  <option>Réviser les bases</option>
                  <option>Pratiquer en profondeur</option>
                </select>
              </div>
              <div className="w-40">
                <label className="block text-[10px] font-bold text-primary uppercase mb-2 tracking-widest">Durée</label>
                <select className="w-full bg-card border border-border rounded-xl py-3 px-4 focus:ring-primary text-sm font-medium">
                  <option>25 min</option>
                  <option>50 min</option>
                </select>
              </div>
              <Button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2">
                Générer Session ⚡
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
