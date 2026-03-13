import { useState, useMemo } from "react";
import { Wallet, Building2, User, Globe, Plus, TrendingUp, TrendingDown, PiggyBank, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PIE_COLORS = ["#7C6AF7", "#34D399", "#FBBF24", "#60A5FA", "#F472B6", "#FB923C"];

export default function Finances() {
  const { data: finances, insert: insertFinance, remove: removeFinance } = useSupabaseTable("finances", {
    realtime: true,
    orderBy: { column: "transaction_date", ascending: false },
  });

  const [view, setView] = useState<"global" | "business" | "personal">("global");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState("expense");
  const [newCategory, setNewCategory] = useState("");
  const [newScope, setNewScope] = useState("personal");

  const handleAdd = async () => {
    if (!newName || !newAmount) return;
    await insertFinance({
      name: newName,
      amount: parseFloat(newAmount),
      type: newType,
      category: newCategory || "Autre",
      scope: newScope,
    });
    setNewName(""); setNewAmount(""); setNewCategory(""); setDialogOpen(false);
  };

  const filtered = useMemo(() => {
    if (view === "global") return finances;
    return finances.filter(f => f.scope === (view === "business" ? "business" : "personal"));
  }, [finances, view]);

  const now = new Date();
  const monthFiltered = filtered.filter(f => {
    const d = new Date(f.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const revenus = monthFiltered.filter(f => f.type === "revenue").reduce((s, f) => s + Number(f.amount), 0);
  const depenses = monthFiltered.filter(f => f.type === "expense").reduce((s, f) => s + Number(f.amount), 0);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    monthFiltered.filter(f => f.type === "expense").forEach(f => {
      cats[f.category] = (cats[f.category] || 0) + Number(f.amount);
    });
    return Object.entries(cats).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));
  }, [monthFiltered]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { revenus: number; depenses: number }> = {};
    filtered.forEach(f => {
      const key = new Date(f.transaction_date).toLocaleDateString("fr-FR", { month: "short" });
      if (!months[key]) months[key] = { revenus: 0, depenses: 0 };
      if (f.type === "revenue") months[key].revenus += Number(f.amount);
      else months[key].depenses += Number(f.amount);
    });
    return Object.entries(months).slice(-6).map(([month, d]) => ({ month, ...d }));
  }, [filtered]);

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Finances</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Transaction</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Nouvelle transaction</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nom" value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary border-none" />
              <Input placeholder="Montant (€)" type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="bg-secondary border-none" />
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenu</SelectItem>
                  <SelectItem value="expense">Dépense</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Catégorie" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-secondary border-none" />
              <Select value={newScope} onValueChange={setNewScope}>
                <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personnel</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-primary text-primary-foreground" onClick={handleAdd}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-2">
        {[
          { key: "global" as const, icon: Globe, label: "Global" },
          { key: "business" as const, icon: Building2, label: "Business" },
          { key: "personal" as const, icon: User, label: "Personnel" },
        ].map(v => (
          <Button key={v.key} size="sm" variant={view === v.key ? "default" : "outline"}
            className={`gap-1.5 text-xs ${view === v.key ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setView(v.key)}>
            <v.icon size={14} /> {v.label}
          </Button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-success" /><span className="text-xs text-muted-foreground">Revenus</span></div>
          <p className="text-2xl font-bold text-success">+{revenus.toLocaleString()}€</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-destructive" /><span className="text-xs text-muted-foreground">Dépenses</span></div>
          <p className="text-2xl font-bold text-destructive">-{depenses.toLocaleString()}€</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1"><Wallet size={14} className="text-foreground" /><span className="text-xs text-muted-foreground">Solde</span></div>
          <p className="text-2xl font-bold text-foreground">{(revenus - depenses) >= 0 ? "+" : ""}{(revenus - depenses).toLocaleString()}€</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1"><PiggyBank size={14} className="text-primary" /><span className="text-xs text-muted-foreground">Épargne</span></div>
          <p className="text-2xl font-bold text-primary">{Math.max(0, revenus - depenses).toLocaleString()}€</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Dépenses par catégorie</p>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground flex-1">{c.name}</span>
                    <span className="text-foreground">{c.value}€</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-xs text-muted-foreground">Aucune dépense ce mois.</p>}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Évolution mensuelle</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenus" fill="hsl(160, 64%, 52%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-muted-foreground">Pas assez de données.</p>}
        </div>

        <div className="rounded-lg border border-border bg-card p-4 overflow-auto">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Transactions récentes</p>
          <div className="space-y-2">
            {monthFiltered.slice(0, 15).map(t => (
              <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category} · {new Date(t.transaction_date).toLocaleDateString("fr-FR")}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === "revenue" ? "text-success" : "text-destructive"}`}>
                  {t.type === "revenue" ? "+" : "-"}{Number(t.amount).toLocaleString()}€
                </span>
                <button onClick={() => removeFinance(t.id)} className="ml-2 text-muted-foreground hover:text-destructive"><Trash2 size={10} /></button>
              </div>
            ))}
            {monthFiltered.length === 0 && <p className="text-xs text-muted-foreground">Aucune transaction ce mois.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
