import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  Heart,
  Briefcase,
  Target,
  Wallet,
  Bot,
  Flame,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ListChecks, label: "Organisation", path: "/organisation" },
  { icon: BookOpen, label: "Contenu & Notes", path: "/content" },
  { icon: Heart, label: "Santé", path: "/health" },
  { icon: Briefcase, label: "Business", path: "/business" },
  { icon: Target, label: "Compétences", path: "/skills" },
  { icon: Wallet, label: "Finances", path: "/finances" },
  { icon: Bot, label: "Agents IA", path: "/agents" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Flame size={16} className="text-primary-foreground" />
        </div>
        <span className="text-base font-semibold text-foreground tracking-tight">LifeSync</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Streak footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flame size={14} className="text-warning" />
          <span>12 jours de streak</span>
        </div>
      </div>
    </aside>
  );
}
