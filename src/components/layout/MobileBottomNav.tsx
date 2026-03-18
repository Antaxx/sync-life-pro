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
  Youtube,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: ListChecks, label: "Orga", path: "/organisation" },
  { icon: BookOpen, label: "Contenu", path: "/content" },
  { icon: Heart, label: "Santé", path: "/health" },
  { icon: Youtube, label: "YouTube", path: "/youtube" },
  { icon: Briefcase, label: "Business", path: "/business" },
  { icon: Target, label: "Skills", path: "/skills" },
  { icon: Wallet, label: "Finances", path: "/finances" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: GraduationCap, label: "Cours", path: "/cours" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card/95 backdrop-blur-sm safe-area-bottom">
      <div className="flex w-full overflow-x-auto no-scrollbar px-1 py-1.5">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 min-w-[52px] text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
