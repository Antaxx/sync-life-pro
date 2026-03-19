import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import {
  TrendingUp, Target, CalendarDays, CheckCircle2, Flame,
  Footprints, Droplets, Dumbbell, BookOpen, ArrowUpRight,
  GraduationCap, ClipboardList, AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const goalIcons = [TrendingUp, Target, CalendarDays];

export default function Dashboard() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const { data: goals } = useSupabaseTable("long_term_goals", { limit: 3, orderBy: { column: "created_at", ascending: false } });
  const { data: tasks } = useSupabaseTable("tasks", { filter: { due_date: today }, realtime: true, orderBy: { column: "sort_order", ascending: true } });
  const { data: projects } = useSupabaseTable("projects", { filter: { status: "active" }, limit: 3 });
  const { data: healthLogs } = useSupabaseTable("health_logs", { filter: { log_date: today } });
  const { data: skills } = useSupabaseTable("skills", { limit: 1, orderBy: { column: "last_session_date", ascending: false } });
  const { data: finances } = useSupabaseTable("finances");
  const { data: contentItems } = useSupabaseTable("content_items", { filter: { status: "queue" }, limit: 2 });
  const { data: homework } = useSupabaseTable("homework");
  const { data: subjects } = useSupabaseTable("subjects");

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const userName = user?.email?.split("@")[0] ?? "";
  const todayHealth = healthLogs[0];
  const focusTasks = tasks.slice(0, 3);
  const topSkill = skills[0];

  const subjectMap = useMemo(() => {
    const map: Record<string, typeof subjects[0]> = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  const todayHomework = useMemo(() => {
    return homework.filter(h => {
      return h.due_date === today && h.status !== "done";
    }).slice(0, 4);
  }, [homework, today]);

  const monthFinances = useMemo(() => {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthItems = finances.filter(f => {
      const d = new Date(f.transaction_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const revenus = monthItems.filter(f => f.type === "revenue").reduce((s, f) => s + Number(f.amount), 0);
    const depenses = monthItems.filter(f => f.type === "expense").reduce((s, f) => s + Number(f.amount), 0);
    return { revenus, depenses, solde: revenus - depenses };
  }, [finances]);

  const getTaskStatus = (task: typeof tasks[0]) => {
    if (task.done) return { label: "Terminé", className: "bg-primary/20 text-primary" };
    if (task.urgent) return { label: "En cours", className: "bg-warning/20 text-warning" };
    return { label: "A faire", className: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end mb-8 md:mb-10 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground capitalize">{greeting} {userName}</h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center bg-card px-4 py-2 rounded-full shadow-sm border border-border gap-2 self-start sm:self-auto">
          <Flame size={18} className="text-warning" />
          <span className="font-bold text-sm">7 jours streak</span>
        </div>
      </header>

      {/* Objectifs */}
      <section className="mb-8 md:mb-10 animate-fade-in" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            Mes objectifs <span className="w-2 h-2 rounded-full bg-primary"></span>
          </h3>
          {goals.length < 3 && (
            <Link to="/organisation" className="text-primary text-xs font-bold uppercase tracking-wider">+ Ajouter</Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {goals.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-card p-6 rounded-xl shadow-sm border border-border text-center">
              <p className="text-sm text-muted-foreground">Aucun objectif. <Link to="/organisation" className="text-primary font-medium">En ajouter</Link></p>
            </div>
          ) : (
            goals.map((g, i) => {
              const Icon = goalIcons[i % goalIcons.length];
              return (
                <div key={g.id} className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border flex flex-col gap-3 md:gap-4">
                  <div className="flex justify-between items-start">
                    <span className="text-4xl md:text-5xl font-black text-primary/20">{String(i + 1).padStart(2, "0")}</span>
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{g.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{g.target_date ? `Échéance : ${new Date(g.target_date).toLocaleDateString("fr-FR")}` : ""}</p>
                    <div className="w-full bg-primary/10 h-2 rounded-full">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${g.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-primary mt-1 block">{g.progress}% complété</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 md:mb-10 animate-fade-in" style={{ animationDelay: "120ms" }}>
        {/* Left Col */}
        <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6">
          {/* Focus du jour */}
          <div className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-5 md:mb-6">
              <h3 className="text-base md:text-lg font-bold">Focus du jour</h3>
              <Link to="/organisation" className="text-primary text-xs font-bold uppercase tracking-wider">Editer</Link>
            </div>
            {focusTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune tâche aujourd'hui. <Link to="/organisation" className="text-primary font-medium">En ajouter</Link></p>
            ) : (
              <div className="flex flex-col gap-3">
                {focusTasks.map((t) => {
                  const status = getTaskStatus(t);
                  return (
                    <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border ${t.done ? "bg-primary/5 border-primary/10" : "border-border"}`}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <CheckCircle2 size={20} className={`shrink-0 ${t.done ? "text-primary" : "text-muted-foreground/40"}`} />
                        <span className={`font-medium text-sm truncate ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.text}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0 ml-2 ${status.className}`}>{status.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contenu en attente */}
          <div className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-base md:text-lg font-bold mb-4">Contenu en attente</h3>
            {contentItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contenu en attente.</p>
            ) : (
              <div className="space-y-3">
                {contentItems.map((item, i) => (
                  <div key={item.id} className={`flex items-center gap-4 ${i < contentItems.length - 1 ? "border-b border-border pb-3" : ""}`}>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Statut : {item.status}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground shrink-0">
                      {new Date(item.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Devoirs & Examens du jour */}
          <div className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                Devoirs & Examens du jour
              </h3>
              <Link to="/cours" className="text-primary text-xs font-bold uppercase tracking-wider">Voir tout</Link>
            </div>
            {todayHomework.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun devoir ou examen aujourd'hui. 🎉</p>
            ) : (
              <div className="flex flex-col gap-3">
                {todayHomework.map((h) => {
                  const subject = subjectMap[h.subject_id];
                  const isExam = h.type === "exam";
                  return (
                    <div key={h.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isExam ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isExam ? "bg-destructive/10" : "bg-primary/10"}`}>
                        {isExam ? <AlertTriangle size={16} className="text-destructive" /> : <ClipboardList size={16} className="text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{h.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {subject && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: subject.color + "20", color: subject.color }}>
                              {subject.name}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isExam ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>
                            {isExam ? "Examen" : "Devoir"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col */}
        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
          {/* Projets actifs */}
          <div className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-base md:text-lg font-bold mb-5 md:mb-6">Projets actifs</h3>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun projet actif.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-foreground">{p.name}</span>
                      <span className="text-xs font-bold text-primary">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-primary/10 h-1.5 rounded-full">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compétence en cours */}
          {topSkill ? (
            <div className="bg-primary text-primary-foreground p-5 md:p-6 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">En cours</h3>
                <p className="text-lg md:text-xl font-bold mb-4">{topSkill.name}</p>
                <Link to="/skills" className="bg-card text-primary text-xs font-bold px-4 py-2 rounded-full hover:bg-card/90 transition-colors">
                  Continuer
                </Link>
              </div>
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary-foreground) / 0.2)" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="white" strokeWidth="4"
                    strokeDasharray={`${(topSkill.progress / 100) * 100.5} 100.5`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{topSkill.progress}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-primary text-primary-foreground p-6 rounded-xl shadow-sm text-center">
              <p className="text-sm opacity-70">Aucune compétence en cours.</p>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10 animate-fade-in" style={{ animationDelay: "180ms" }}>
        {/* Santé du jour */}
        <div className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-base md:text-lg font-bold mb-4">Santé du jour</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-primary/5 p-3 rounded-lg flex flex-col items-center gap-1">
              <Footprints size={20} className="text-primary" />
              <span className="text-xs font-bold text-foreground">{todayHealth?.steps ? `${(todayHealth.steps / 1000).toFixed(1)}k` : "0"}</span>
            </div>
            <div className="bg-secondary p-3 rounded-lg flex flex-col items-center gap-1">
              <Droplets size={20} className="text-primary" />
              <span className="text-xs font-bold text-foreground">{((todayHealth?.water_ml ?? 0) / 1000).toFixed(1)}L</span>
            </div>
            <div className="bg-secondary p-3 rounded-lg flex flex-col items-center gap-1">
              <Dumbbell size={20} className="text-warning" />
              <span className="text-xs font-bold text-foreground">{todayHealth?.sport_duration_min ? `${todayHealth.sport_duration_min}m` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Compétence */}
        <div className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-base md:text-lg font-bold mb-4">Compétence</h3>
          {topSkill ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Target size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{topSkill.name}</p>
                <p className="text-xs text-muted-foreground">{topSkill.level} · {topSkill.total_hours}h</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune compétence.</p>
          )}
        </div>

        {/* Finances */}
        <div className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-base md:text-lg font-bold mb-4">Finances</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Solde actuel</p>
              <p className="text-xl md:text-2xl font-black text-foreground">{monthFinances.solde.toLocaleString()} €</p>
            </div>
            {monthFinances.revenus > 0 && (
              <div className="text-primary flex items-center text-xs font-bold">
                <ArrowUpRight size={14} /> {Math.round((monthFinances.solde / monthFinances.revenus) * 100)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Quick Actions */}
      <footer className="flex flex-wrap gap-3 md:gap-4 justify-center pb-6 md:pb-10 animate-fade-in" style={{ animationDelay: "240ms" }}>
        {[
          { label: "Voir toutes les tâches", path: "/organisation" },
          { label: "Nouveau projet", path: "/organisation" },
          { label: "Bilan hebdomadaire", path: "/organisation" },
          { label: "Accéder aux compétences", path: "/skills" },
        ].map((btn) => (
          <Link
            key={btn.label}
            to={btn.path}
            className="bg-card px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold border border-border shadow-sm hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {btn.label}
          </Link>
        ))}
      </footer>
    </div>
  );
}
