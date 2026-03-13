import { useState, useMemo, useCallback } from "react";
import { Footprints, Droplets, Dumbbell, Moon, Plus, Minus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Health() {
  const { user } = useAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const { data: healthLogs, refetch } = useSupabaseTable("health_logs", {
    realtime: true,
    orderBy: { column: "log_date", ascending: false },
    limit: 30,
  });
  const { data: healthGoals } = useSupabaseTable("health_goals");

  const todayLog = healthLogs.find(l => l.log_date === today);
  const goals = healthGoals[0] || { steps_goal: 10000, water_goal_ml: 2500, sleep_goal_hours: 8, sport_sessions_goal: 1 };

  const updateTodayLog = useCallback(async (updates: Record<string, any>) => {
    if (!user) return;
    try {
      if (todayLog) {
        const { error } = await supabase.from("health_logs").update(updates).eq("id", todayLog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("health_logs").insert({ user_id: user.id, log_date: today, ...updates });
        if (error) throw error;
      }
      refetch();
      toast({ title: "✓ Sauvegardé" });
    } catch (e: any) {
      toast({ title: "❌ Erreur", description: e.message, variant: "destructive" });
    }
  }, [user, todayLog, today, refetch]);

  const addWater = useCallback((ml: number) => {
    const current = todayLog?.water_ml || 0;
    updateTodayLog({ water_ml: Math.max(0, current + ml) });
  }, [todayLog, updateTodayLog]);

  const toggleSport = useCallback(() => {
    updateTodayLog({ sport_done: !todayLog?.sport_done });
  }, [todayLog, updateTodayLog]);

  const waterPct = Math.min(100, ((todayLog?.water_ml || 0) / goals.water_goal_ml) * 100);
  const stepsPct = Math.min(100, ((todayLog?.steps || 0) / goals.steps_goal) * 100);
  const sleepPct = Math.min(100, ((Number(todayLog?.sleep_hours) || 0) / Number(goals.sleep_goal_hours)) * 100);

  const weekData = useMemo(() => {
    return healthLogs.slice(0, 7).reverse().map(l => ({
      day: new Date(l.log_date).toLocaleDateString("fr-FR", { weekday: "short" }),
      steps: l.steps || 0,
      sleep: Number(l.sleep_hours) || 0,
    }));
  }, [healthLogs]);

  const metrics = [
    { icon: Footprints, label: "Pas", value: (todayLog?.steps || 0).toLocaleString(), goal: goals.steps_goal.toLocaleString(), pct: stepsPct },
    { icon: Droplets, label: "Eau", value: `${((todayLog?.water_ml || 0) / 1000).toFixed(1)}L`, goal: `${(goals.water_goal_ml / 1000).toFixed(1)}L`, pct: waterPct },
    { icon: Dumbbell, label: "Sport", value: todayLog?.sport_done ? "Fait ✓" : "À faire", goal: "1 session", pct: todayLog?.sport_done ? 100 : 0 },
    { icon: Moon, label: "Sommeil", value: `${todayLog?.sleep_hours || "—"}h`, goal: `${goals.sleep_goal_hours}h`, pct: sleepPct },
  ];

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Santé</h1>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {metrics.map(m => (
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

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Droplets size={18} className="text-primary" />
        <span className="text-sm text-foreground">Eau : {((todayLog?.water_ml || 0) / 1000).toFixed(1)}L / {(goals.water_goal_ml / 1000).toFixed(1)}L</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addWater(-250)}>
            <Minus size={12} /> 250ml
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addWater(250)}>
            <Plus size={12} /> 250ml
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addWater(500)}>
            <Plus size={12} /> 500ml
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Dumbbell size={18} className="text-primary" />
        <span className="text-sm text-foreground">Sport du jour</span>
        <Button size="sm" variant={todayLog?.sport_done ? "default" : "outline"} className="ml-auto text-xs h-7" onClick={toggleSport}>
          {todayLog?.sport_done ? "✓ Fait" : "Marquer fait"}
        </Button>
      </div>

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
