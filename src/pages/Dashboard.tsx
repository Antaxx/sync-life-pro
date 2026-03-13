import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import {
  Target, Zap, FolderKanban, Heart, GraduationCap, Wallet, BookMarked,
  Droplets, Footprints, Dumbbell, TrendingUp, ChevronRight, Flame,
  CheckCircle2, Circle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const goals = [
  { name: "Freelance 10K€/mois", progress: 62, color: "bg-primary" },
  { name: "Courir un marathon", progress: 35, color: "bg-success" },
  { name: "100 notes Zettelkasten", progress: 48, color: "bg-warning" },
];

const focusTasks = [
  { text: "Finaliser maquette client Acme", urgent: true, done: false },
  { text: "Session Deep Work — React Patterns", urgent: false, done: false },
  { text: "Review article sur la productivité", urgent: false, done: true },
];

const projects = [
  { name: "Refonte site Acme", progress: 72 },
  { name: "App mobile fitness", progress: 45 },
  { name: "Formation Next.js", progress: 88 },
];

const quickLinks = [
  { label: "Organisation", icon: Zap, path: "/organisation" },
  { label: "Contenu", icon: BookMarked, path: "/content" },
  { label: "Santé", icon: Heart, path: "/health" },
  { label: "Business", icon: FolderKanban, path: "/business" },
  { label: "Compétences", icon: GraduationCap, path: "/skills" },
  { label: "Finances", icon: Wallet, path: "/finances" },
];

export default function Dashboard() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="flex h-screen flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting} 👋</h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Flame size={16} className="text-warning" />
          <span className="text-sm font-semibold text-warning">12</span>
          <span className="text-xs text-muted-foreground">jours</span>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid flex-1 grid-cols-4 grid-rows-3 gap-4 overflow-hidden">
        {/* Goals */}
        <DashboardWidget title="Objectifs long terme" icon={<Target size={14} />} className="col-span-2" delay={0}>
          <div className="space-y-3">
            {goals.map((g) => (
              <div key={g.name}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-foreground">{g.name}</span>
                  <span className="text-xs text-muted-foreground">{g.progress}%</span>
                </div>
                <Progress value={g.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </DashboardWidget>

        {/* Focus */}
        <DashboardWidget title="Focus du jour" icon={<Zap size={14} />} className="col-span-2" delay={1}>
          <div className="space-y-2">
            {focusTasks.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {t.done ? (
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                ) : (
                  <Circle size={16} className="text-muted-foreground shrink-0" />
                )}
                <span className={`text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {t.text}
                </span>
                {t.urgent && !t.done && (
                  <span className="ml-auto shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                    Urgent
                  </span>
                )}
              </div>
            ))}
          </div>
        </DashboardWidget>

        {/* Projects */}
        <DashboardWidget title="Projets actifs" icon={<FolderKanban size={14} />} delay={2}>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.name}>
                <div className="mb-1 flex justify-between">
                  <span className="text-xs text-foreground truncate">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-1" />
              </div>
            ))}
          </div>
        </DashboardWidget>

        {/* Health */}
        <DashboardWidget title="Santé du jour" icon={<Heart size={14} />} delay={3}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Footprints, label: "Pas", value: "6,248", target: "10K", pct: 62 },
              { icon: Droplets, label: "Eau", value: "1.5L", target: "2.5L", pct: 60 },
              { icon: Dumbbell, label: "Sport", value: "✓", target: "", pct: 100 },
              { icon: Heart, label: "Sommeil", value: "7h12", target: "8h", pct: 90 },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <m.icon size={14} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </DashboardWidget>

        {/* Skills */}
        <DashboardWidget title="Compétence en cours" icon={<GraduationCap size={14} />} delay={4}>
          <div className="text-center">
            <div className="relative mx-auto mb-2 h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                  strokeDasharray={`${0.68 * 175.9} 175.9`} strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">68%</span>
            </div>
            <p className="text-sm font-medium text-foreground">React Avancé</p>
            <p className="text-[10px] text-muted-foreground">Intermédiaire · 24h investies</p>
          </div>
        </DashboardWidget>

        {/* Finances */}
        <DashboardWidget title="Finances du mois" icon={<Wallet size={14} />} delay={5}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Revenus</span>
              <span className="text-sm font-semibold text-success">+4 200€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Dépenses</span>
              <span className="text-sm font-semibold text-destructive">-2 180€</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-xs text-muted-foreground">Solde</span>
              <span className="text-sm font-bold text-foreground">+2 020€</span>
            </div>
          </div>
        </DashboardWidget>

        {/* Content queue */}
        <DashboardWidget title="Contenu en attente" icon={<BookMarked size={14} />} delay={6}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Articles non lus</span>
              <span className="text-sm font-semibold text-foreground">14</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Highlights à traiter</span>
              <span className="text-sm font-semibold text-warning">7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Notes brutes</span>
              <span className="text-sm font-semibold text-foreground">3</span>
            </div>
          </div>
        </DashboardWidget>

        {/* Quick Links */}
        <DashboardWidget title="Accès rapide" icon={<TrendingUp size={14} />} className="col-span-3" delay={7}>
          <div className="flex gap-2">
            {quickLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-secondary/50 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <link.icon size={14} />
                <span>{link.label}</span>
                <ChevronRight size={12} />
              </a>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
