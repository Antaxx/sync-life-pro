import { useState, useMemo, useCallback } from "react";
import { Footprints, Droplets, Dumbbell, Moon, Plus, Flame, Zap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    updateTodayLog({ water_ml: Math.max(0, (todayLog?.water_ml || 0) + ml) });
  }, [todayLog, updateTodayLog]);

  const toggleSport = useCallback(() => {
    updateTodayLog({ sport_done: !todayLog?.sport_done });
  }, [todayLog, updateTodayLog]);

  const waterPct = Math.min(100, ((todayLog?.water_ml || 0) / goals.water_goal_ml) * 100);
  const stepsPct = Math.min(100, ((todayLog?.steps || 0) / goals.steps_goal) * 100);
  const sleepPct = Math.min(100, ((Number(todayLog?.sleep_hours) || 0) / Number(goals.sleep_goal_hours)) * 100);

  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...healthLogs].sort((a, b) => b.log_date.localeCompare(a.log_date));
    for (const log of sorted) {
      if (log.steps && log.steps > 0) count++;
      else break;
    }
    return count;
  }, [healthLogs]);

  const globalPct = Math.round(((stepsPct + waterPct + sleepPct + (todayLog?.sport_done ? 100 : 0)) / 4));

  const weekData = useMemo(() => {
    return healthLogs.slice(0, 7).reverse().map(l => ({
      day: new Date(l.log_date).toLocaleDateString("fr-FR", { weekday: "short" }),
      steps: l.steps || 0,
      sleep: Number(l.sleep_hours) || 0,
      pct: Math.min(100, ((l.steps || 0) / goals.steps_goal) * 100),
    }));
  }, [healthLogs, goals]);

  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="flex h-screen flex-col overflow-auto p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Santé</h1>
          <p className="text-sm text-muted-foreground font-medium">Vos statistiques pour aujourd'hui</p>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-card border border-border px-3 md:px-4 py-2 rounded-full shadow-sm">
              <Flame size={16} className="text-amber-500" />
              <span className="font-bold text-sm text-foreground">{streak}j streak</span>
            </div>
          )}
          <Button size="sm" className="bg-primary text-primary-foreground rounded-full font-bold shadow-md gap-2">
            <Plus size={16} /> Log
          </Button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Steps */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-blue-50 rounded-xl text-blue-600"><Footprints size={20} /></div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter hidden sm:inline">Obj {goals.steps_goal.toLocaleString()}</span>
          </div>
          <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-1">Pas</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground">{(todayLog?.steps || 0).toLocaleString()}</p>
          <div className="mt-3 md:mt-4 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stepsPct}%` }} />
          </div>
        </div>

        {/* Hydration */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-cyan-50 rounded-xl text-cyan-600"><Droplets size={20} /></div>
            <div className="flex gap-1">
              <button onClick={() => addWater(250)} className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 md:px-2 py-1 rounded-md font-bold hover:bg-cyan-200 transition-colors">+250</button>
              <button onClick={() => addWater(500)} className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 md:px-2 py-1 rounded-md font-bold hover:bg-cyan-200 transition-colors">+500</button>
            </div>
          </div>
          <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-1">Eau</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground">{(todayLog?.water_ml || 0).toLocaleString()} ml</p>
          <div className="mt-3 md:mt-4 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${waterPct}%` }} />
          </div>
        </div>

        {/* Sport */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-emerald-50 rounded-xl text-emerald-600"><Dumbbell size={20} /></div>
            <button
              onClick={toggleSport}
              className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors ${
                todayLog?.sport_done ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {todayLog?.sport_done ? "✓ Validé" : "Valider"}
            </button>
          </div>
          <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-1">Sport</h3>
          <p className="text-lg md:text-xl font-bold text-foreground">{todayLog?.sport_done ? "Validé ✓" : "En attente"}</p>
        </div>

        {/* Sleep */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-indigo-50 rounded-xl text-indigo-600"><Moon size={20} /></div>
          </div>
          <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-1">Sommeil</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground">{todayLog?.sleep_hours ? `${todayLog.sleep_hours}h` : "—"}</p>
          <div className="mt-3 md:mt-4 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${sleepPct}%` }} />
          </div>
        </div>

        {/* Streak */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-amber-50 rounded-xl text-amber-600"><Zap size={20} /></div>
            <Award size={18} className="text-amber-300" />
          </div>
          <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-1">Streak</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground">{streak} jours</p>
        </div>

        {/* Global Progress */}
        <div className="bg-primary p-4 md:p-6 rounded-2xl border border-primary shadow-lg text-primary-foreground">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl"><Award size={20} /></div>
          </div>
          <h3 className="text-primary-foreground/70 text-xs md:text-sm font-medium mb-1">Global</h3>
          <p className="text-2xl md:text-3xl font-bold">{globalPct}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">
        {/* Activity Bar Chart */}
        <div className="bg-card p-5 md:p-8 rounded-2xl border border-border shadow-sm">
          <h4 className="font-bold text-base md:text-lg text-foreground mb-6 md:mb-8">Activité (7j)</h4>
          <div className="relative h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2 px-2 md:px-4">
            {(weekData.length > 0 ? weekData : dayLabels.map(d => ({ day: d, steps: 0, pct: 0, sleep: 0 }))).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full">
                <div className="w-full bg-primary/20 rounded-t-lg transition-all" style={{ height: `${Math.max(5, d.pct)}%` }} />
                <span className="text-[10px] text-center text-muted-foreground font-bold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Water Chart */}
        <div className="bg-card p-5 md:p-8 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h4 className="font-bold text-base md:text-lg text-foreground">Eau</h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-xs font-bold text-muted-foreground">Réel</span>
              </div>
            </div>
          </div>
          <div className="h-48 md:h-64 flex items-end justify-between px-2">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-cyan-50 rounded-xl overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-cyan-500/20 transition-all" style={{ height: `${waterPct}%` }}>
                  <div className="absolute top-0 left-0 right-0 h-4 bg-cyan-500/10 rounded-full blur-sm" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-cyan-600">{Math.round(waterPct)}%</p>
                  <p className="text-xs md:text-sm text-cyan-600/70 font-medium">{((todayLog?.water_ml || 0) / 1000).toFixed(1)}L / {(goals.water_goal_ml / 1000).toFixed(1)}L</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
