import { ReactNode } from "react";

interface DashboardWidgetProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function DashboardWidget({ title, icon, children, className = "", delay = 0 }: DashboardWidgetProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 animate-fade-in ${className}`}
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}
