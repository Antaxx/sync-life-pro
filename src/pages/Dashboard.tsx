import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import {
  Target, Zap, FolderKanban, Heart, GraduationCap, Wallet, BookMarked,
  Droplets, Footprints, Dumbbell, TrendingUp, ChevronRight, Flame,
  CheckCircle2, Circle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Organisation", icon: Zap, path: "/organisation" },
  { label: "Contenu", icon: BookMarked, path: "/content" },
  { label: "Santé", icon: Heart, path: "/health" },
  { label: "Business", icon: FolderKanban, path: "/business" },
  { label: "Compétences", icon: GraduationCap, path: "/skills" },
  { label: "Finances", icon: Wallet, path: "/finances" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const { data: goals } = useSupabaseTable("long_term_goals", { limit: 3, orderBy: { column: "created_at", ascending: false } });
  const { data: tasks } = useSupabaseTable("tasks", { filter: { due_date: today }, realtime: true, orderBy: { column: "sort_order", ascending: true } });
  const { data: projects } = useSupabaseTable("projects", { filter: { status: "active" }, limit: 3 });
  const { data: healthLogs } = useSupabaseTable("health_logs", { filter: { log_date: today } });
  const { data: skills } = useSupabaseTable("skills", { limit: 1, orderBy: { column: "last_session_date", ascending: false } });
  const { data: finances } = useSupabaseTable("finances");
  const { data: contentItems } = useSupabaseTable("content_items", { filter: { status: "queue" } });
  const { data: highlights } = useSupabaseTable("highlights");

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  const todayHealth = healthLogs[0];

  const monthFinances = useMemo(() => {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthItems = finances.filter(f => {
      const d = new Date(f.transaction_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const revenus = monthItems.filter(f => f.type === "revenue").reduce((s, f) => s + Number(f.amount), 0);
    const depenses = monthItems.filter(f => f.type === "expense").reduce((s, f) => s + Number(f.amount), 0);
    return { revenus, depenses };
  }, [finances]);

  const focusTasks = tasks.slice(0, 3);
  const topSkill = skills[0];

  return (
    <div className="flex h-screen flex-col overflow-hidden p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting} 👋</h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Flame size={16} className="text-warning" />
          <span className="text-xs text-muted-foreground">streak</span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-4 grid-rows-3 gap-4 overflow-hidden">
        {/* Goals */}
        <DashboardWidget title="Objectifs long terme" icon={<Target size={14} />} className="col-span-2" delay={0}>
          {goals.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun objectif. <Link to="/organisation" className="text-primary">En ajouter</Link></p>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => (
                <div key={g.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">{g.name}</span>
                    <span className="text-xs text-muted-foreground">{g.progress}%</span>
                  </div>
                  <Progress value={g.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </DashboardWidget>

        {/* Focus */}
        <DashboardWidget title="Focus du jour" icon={<Zap size={14} />} className="col-span-2" delay={1}>
          {focusTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune tâche aujourd'hui. <Link to="/organisation" className="text-primary">En ajouter</Link></p>
          ) : (
            <div className="space-y-2">
              {focusTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5">
                  {t.done ? <CheckCircle2 size={16} className="text-success shrink-0" /> : <Circle size={16} className="text-muted-foreground shrink-0" />}
                  <span className={`text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.text}</span>
                  {t.urgent && !t.done && (
                    <span className="ml-auto shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">Urgent</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </DashboardWidget>

        {/* Projects */}
        <DashboardWidget title="Projets actifs" icon={<FolderKanban size={14} />} delay={2}>
          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun projet actif.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-xs text-foreground truncate">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-1" />
                </div>
              ))}
            </div>
          )}
        </DashboardWidget>

        {/* Health */}
        <DashboardWidget title="Santé du jour" icon={<Heart size={14} />} delay={3}>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <Footprints size={14} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{todayHealth?.steps ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Pas</p>
            </div>
            <div className="text-center">
              <Droplets size={14} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{((todayHealth?.water_ml ?? 0) / 1000).toFixed(1)}L</p>
              <p className="text-[10px] text-muted-foreground">Eau</p>
            </div>
            <div className="text-center">
              <Dumbbell size={14} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{todayHealth?.sport_done ? "✓" : "—"}</p>
              <p className="text-[10px] text-muted-foreground">Sport</p>
            </div>
            <div className="text-center">
              <Heart size={14} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{todayHealth?.sleep_hours ?? "—"}h</p>
              <p className="text-[10px] text-muted-foreground">Sommeil</p>
            </div>
          </div>
        </DashboardWidget>

        {/* Skills */}
        <DashboardWidget title="Compétence en cours" icon={<GraduationCap size={14} />} delay={4}>
          {topSkill ? (
            <div className="text-center">
              <div className="relative mx-auto mb-2 h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                    strokeDasharray={`${(topSkill.progress / 100) * 175.9} 175.9`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{topSkill.progress}%</span>
              </div>
              <p className="text-sm font-medium text-foreground">{topSkill.name}</p>
              <p className="text-[10px] text-muted-foreground">{topSkill.level} · {topSkill.total_hours}h</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">Aucune compétence.</p>
          )}
        </DashboardWidget>

        {/* Finances */}
        <DashboardWidget title="Finances du mois" icon={<Wallet size={14} />} delay={5}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Revenus</span>
              <span className="text-sm font-semibold text-success">+{monthFinances.revenus.toLocaleString()}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Dépenses</span>
              <span className="text-sm font-semibold text-destructive">-{monthFinances.depenses.toLocaleString()}€</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-xs text-muted-foreground">Solde</span>
              <span className="text-sm font-bold text-foreground">+{(monthFinances.revenus - monthFinances.depenses).toLocaleString()}€</span>
            </div>
          </div>
        </DashboardWidget>

        {/* Content queue */}
        <DashboardWidget title="Contenu en attente" icon={<BookMarked size={14} />} delay={6}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">En file d'attente</span>
              <span className="text-sm font-semibold text-foreground">{contentItems.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Highlights à traiter</span>
              <span className="text-sm font-semibold text-warning">{highlights.length}</span>
            </div>
          </div>
        </DashboardWidget>

        {/* Quick Links */}
        <DashboardWidget title="Accès rapide" icon={<TrendingUp size={14} />} className="col-span-3" delay={7}>
          <div className="flex gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-secondary/50 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <link.icon size={14} />
                <span>{link.label}</span>
                <ChevronRight size={12} />
              </Link>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
