import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BookOpen, TrendingUp, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const skills = [
  { name: "React", level: "Avancé", pct: 78, hours: 48, streak: 12 },
  { name: "TypeScript", level: "Intermédiaire", pct: 55, hours: 32, streak: 5 },
  { name: "Design System", level: "Intermédiaire", pct: 42, hours: 18, streak: 3 },
  { name: "Node.js", level: "Débutant", pct: 22, hours: 10, streak: 0 },
  { name: "Marketing", level: "Débutant", pct: 15, hours: 6, streak: 1 },
  { name: "Copywriting", level: "Intermédiaire", pct: 60, hours: 28, streak: 7 },
];

const levelColors: Record<string, string> = {
  "Débutant": "text-muted-foreground",
  "Intermédiaire": "text-warning",
  "Avancé": "text-primary",
  "Maîtrisé": "text-success",
};

const progressData = [
  { week: "S1", hours: 4 }, { week: "S2", hours: 6 }, { week: "S3", hours: 3 },
  { week: "S4", hours: 8 }, { week: "S5", hours: 5 }, { week: "S6", hours: 7 },
];

export default function Skills() {
  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Compétences</h1>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Nouvelle compétence</Button>
      </div>

      <Tabs defaultValue="grid" className="flex-1 flex flex-col">
        <TabsList className="bg-secondary mb-4 self-start">
          <TabsTrigger value="grid" className="gap-1.5 text-xs"><Target size={14} /> Compétences</TabsTrigger>
          <TabsTrigger value="learn" className="gap-1.5 text-xs"><BookOpen size={14} /> Apprentissage</TabsTrigger>
          <TabsTrigger value="progress" className="gap-1.5 text-xs"><TrendingUp size={14} /> Progression</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="flex-1">
          <div className="grid grid-cols-3 gap-4">
            {skills.map((s) => (
              <div key={s.name} className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">{s.name}</h3>
                  {s.streak > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-warning" />
                      <span className="text-[10px] font-semibold text-warning">{s.streak}</span>
                    </div>
                  )}
                </div>
                {/* Circular progress */}
                <div className="relative mx-auto mb-3 h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                    <circle
                      cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--primary))" strokeWidth="5"
                      strokeDasharray={`${(s.pct / 100) * 213.6} 213.6`} strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{s.pct}%</span>
                </div>
                <div className="text-center">
                  <span className={`text-xs font-medium ${levelColors[s.level]}`}>{s.level}</span>
                  <p className="text-[10px] text-muted-foreground">{s.hours}h investies</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learn" className="flex-1">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <BookOpen size={24} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Planifiez vos sessions d'apprentissage ici.</p>
            <p className="text-xs text-muted-foreground mt-1">L'agent IA peut générer un plan de session de 2h.</p>
            <Button size="sm" className="mt-4 gap-1.5 text-xs bg-primary text-primary-foreground">
              Générer une session
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="flex-1">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Heures d'apprentissage par semaine</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={progressData}>
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
