import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { RenderIcon } from "@/components/organisation/IconPicker";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function LifeBucketAnalyse() {
  const { data: buckets } = useSupabaseTable("life_buckets", { orderBy: { column: "sort_order", ascending: true } });
  const { data: tasks } = useSupabaseTable("tasks");

  const today = new Date().toISOString().split("T")[0];

  const chartData = useMemo(() => {
    const overdueTasks = tasks.filter(t => !t.done && t.due_date && t.due_date < today);

    const bucketCounts: Record<string, number> = {};
    overdueTasks.forEach(t => {
      const key = t.life_bucket_id || "__none";
      bucketCounts[key] = (bucketCounts[key] || 0) + 1;
    });

    const bucketMap = new Map(buckets.map(b => [b.id, b]));
    const data: { name: string; value: number; color: string }[] = [];

    Object.entries(bucketCounts).forEach(([key, count]) => {
      if (key === "__none") {
        data.push({ name: "Sans domaine", value: count, color: "hsl(var(--muted-foreground))" });
      } else {
        const bucket = bucketMap.get(key);
        if (bucket) {
          data.push({ name: bucket.name, value: count, color: bucket.color });
        }
      }
    });

    return data;
  }, [tasks, buckets, today]);

  const totalOverdue = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Link to="/organisation" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground">Analyse Life Buckets</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de vos domaines de vie</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-card p-5 md:p-8 rounded-2xl shadow-sm border border-border mb-6">
        <h3 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2">
          <AlertTriangle size={18} className="text-warning" />
          Tâches en retard par domaine
        </h3>
        <p className="text-sm text-muted-foreground mb-6">{totalOverdue} tâche{totalOverdue !== 1 ? "s" : ""} en retard au total</p>

        {totalOverdue === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">🎉 Aucune tâche en retard !</p>
          </div>
        ) : (
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="50%"
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-sm font-medium text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* All Life Buckets */}
      <div className="bg-card p-5 md:p-8 rounded-2xl shadow-sm border border-border">
        <h3 className="text-base md:text-lg font-bold mb-6">Tous les domaines de vie</h3>
        {buckets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun domaine de vie créé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {buckets.map(b => {
              const bucketTasks = tasks.filter(t => t.life_bucket_id === b.id);
              const done = bucketTasks.filter(t => t.done).length;
              const overdue = bucketTasks.filter(t => !t.done && t.due_date && t.due_date < today).length;
              const total = bucketTasks.length;

              return (
                <Link
                  key={b.id}
                  to={`/organisation/bucket/${b.id}`}
                  className="p-4 md:p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <RenderIcon name={b.icon || "CircleDot"} size={20} color={b.color} />
                    </div>
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{b.name}</h4>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-muted-foreground">{total} tâches</span>
                    <span className="text-primary font-bold">{done} faites</span>
                    {overdue > 0 && <span className="text-destructive font-bold">{overdue} en retard</span>}
                  </div>
                  {total > 0 && (
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((done / total) * 100)}%` }} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
