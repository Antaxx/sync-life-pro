import { useState } from "react";
import { Footprints, Droplets, Dumbbell, Moon, Plus, Minus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const weekData = [
  { day: "Lun", steps: 8200, water: 2.0, sleep: 7.5 },
  { day: "Mar", steps: 6500, water: 2.5, sleep: 6.8 },
  { day: "Mer", steps: 9100, water: 2.2, sleep: 7.2 },
  { day: "Jeu", steps: 7400, water: 1.8, sleep: 8.0 },
  { day: "Ven", steps: 5800, water: 2.0, sleep: 7.0 },
  { day: "Sam", steps: 11200, water: 2.8, sleep: 8.5 },
  { day: "Dim", steps: 6248, water: 1.5, sleep: 7.2 },
];

export default function Health() {
  const [water, setWater] = useState(1500);
  const waterGoal = 2500;

  const metrics = [
    { icon: Footprints, label: "Pas", value: "6,248", goal: "10,000", pct: 62, color: "primary" },
    { icon: Droplets, label: "Eau", value: `${(water / 1000).toFixed(1)}L`, goal: "2.5L", pct: (water / waterGoal) * 100, color: "primary" },
    { icon: Dumbbell, label: "Sport", value: "Fait ✓", goal: "1 session", pct: 100, color: "success" },
    { icon: Moon, label: "Sommeil", value: "7h12", goal: "8h", pct: 90, color: "primary" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Santé</h1>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Flame size={16} className="text-warning" />
          <span className="text-sm font-semibold text-warning">8</span>
          <span className="text-xs text-muted-foreground">jours streak santé</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <m.icon size={18} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="mb-2 text-[10px] text-muted-foreground">Objectif : {m.goal}</p>
            <Progress value={m.pct} className="h-1.5" />
          </div>
        ))}
      </div>

      {/* Water quick add */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Droplets size={18} className="text-primary" />
        <span className="text-sm text-foreground">Eau : {(water / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setWater(w => Math.max(0, w - 250))}>
            <Minus size={12} /> 250ml
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setWater(w => w + 250)}>
            <Plus size={12} /> 250ml
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setWater(w => w + 500)}>
            <Plus size={12} /> 500ml
          </Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pas — 7 derniers jours</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(248, 88%, 69%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(248, 88%, 69%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="steps" stroke="hsl(248, 88%, 69%)" fill="url(#stepsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sommeil — 7 derniers jours</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 64%, 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 64%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="sleep" stroke="hsl(160, 64%, 52%)" fill="url(#sleepGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
