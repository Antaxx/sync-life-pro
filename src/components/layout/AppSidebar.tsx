import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  Heart,
  Briefcase,
  Target,
  Wallet,
  Bot,
  LogOut,
  PlusCircle,
  RefreshCw,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ListChecks, label: "Organisation", path: "/organisation" },
  { icon: BookOpen, label: "Contenu", path: "/content" },
  { icon: Heart, label: "Santé", path: "/health" },
  { icon: Briefcase, label: "Business", path: "/business" },
  { icon: Target, label: "Compétences", path: "/skills" },
  { icon: Wallet, label: "Finances", path: "/finances" },
  { icon: Bot, label: "Agents IA", path: "/agents" },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-sidebar-border bg-sidebar justify-between p-4">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <RefreshCw size={16} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">LifeSync</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-4">
        <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
          <PlusCircle size={18} />
          Capture rapide
        </button>
        <div className="flex items-center gap-3 border-t border-sidebar-border pt-4 px-1">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-foreground truncate">{user?.email?.split("@")[0] ?? "Utilisateur"}</span>
            <button
              onClick={signOut}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors text-left flex items-center gap-1"
            >
              <LogOut size={10} /> Déconnexion
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
