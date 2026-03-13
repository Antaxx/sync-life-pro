import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Building2, User, Globe, Plus, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const transactions = [
  { name: "Client Acme", amount: 2500, type: "revenu", category: "Business", date: "12 mars" },
  { name: "Client StartupXYZ", amount: 1200, type: "revenu", category: "Business", date: "10 mars" },
  { name: "Figma", amount: -12, type: "dépense", category: "Outils", date: "8 mars" },
  { name: "Webflow", amount: -29, type: "dépense", category: "Outils", date: "8 mars" },
  { name: "Loyer", amount: -950, type: "dépense", category: "Logement", date: "1 mars" },
  { name: "Courses", amount: -280, type: "dépense", category: "Alimentation", date: "5 mars" },
  { name: "Spotify", amount: -10, type: "dépense", category: "Loisirs", date: "3 mars" },
  { name: "Freelance side", amount: 500, type: "revenu", category: "Business", date: "15 mars" },
];

const categoryData = [
  { name: "Logement", value: 950, color: "#7C6AF7" },
  { name: "Alimentation", value: 280, color: "#34D399" },
  { name: "Outils", value: 91, color: "#FBBF24" },
  { name: "Loisirs", value: 10, color: "#60A5FA" },
  { name: "Transport", value: 120, color: "#F472B6" },
];

const monthlyData = [
  { month: "Oct", revenus: 3100, depenses: 1800 },
  { month: "Nov", revenus: 3200, depenses: 2100 },
  { month: "Déc", revenus: 3500, depenses: 1900 },
  { month: "Jan", revenus: 3700, depenses: 2200 },
  { month: "Fév", revenus: 3700, depenses: 2050 },
  { month: "Mar", revenus: 4200, depenses: 2180 },
];

export default function Finances() {
  const [view, setView] = useState<"business" | "perso" | "global">("global");
  const revenus = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const depenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Finances</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Transaction</Button>
        </div>
      </div>

      {/* View toggle */}
      <div className="mb-4 flex gap-2">
        {[
          { key: "global" as const, icon: Globe, label: "Global" },
          { key: "business" as const, icon: Building2, label: "Business" },
          { key: "perso" as const, icon: User, label: "Personnel" },
        ].map((v) => (
          <Button
            key={v.key}
            size="sm"
            variant={view === v.key ? "default" : "outline"}
            className={`gap-1.5 text-xs ${view === v.key ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setView(v.key)}
          >
            <v.icon size={14} /> {v.label}
          </Button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-success" />
            <span className="text-xs text-muted-foreground">Revenus</span>
          </div>
          <p className="text-2xl font-bold text-success">+{revenus.toLocaleString()}€</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-destructive" />
            <span className="text-xs text-muted-foreground">Dépenses</span>
          </div>
          <p className="text-2xl font-bold text-destructive">-{depenses.toLocaleString()}€</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} className="text-foreground" />
            <span className="text-xs text-muted-foreground">Solde</span>
          </div>
          <p className="text-2xl font-bold text-foreground">+{(revenus - depenses).toLocaleString()}€</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Épargne</span>
          </div>
          <p className="text-2xl font-bold text-primary">850€</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* Pie chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Dépenses par catégorie</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                <span className="text-muted-foreground flex-1">{c.name}</span>
                <span className="text-foreground">{c.value}€</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Évolution mensuelle</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenus" fill="hsl(160, 64%, 52%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions */}
        <div className="rounded-lg border border-border bg-card p-4 overflow-auto">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Transactions récentes</p>
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-xs font-medium text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category} · {t.date}</p>
                </div>
                <span className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-destructive"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}€
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
