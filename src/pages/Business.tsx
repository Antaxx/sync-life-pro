import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Users, TrendingUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  active: "bg-success/20 text-success",
  prospect: "bg-warning/20 text-warning",
  terminated: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = { active: "Actif", prospect: "Prospect", terminated: "Terminé" };

export default function Business() {
  const { data: tools, insert: insertTool, remove: removeTool } = useSupabaseTable("tools", { orderBy: { column: "name", ascending: true } });
  const { data: clients, insert: insertClient, remove: removeClient } = useSupabaseTable("clients", { orderBy: { column: "name", ascending: true } });
  const { data: finances } = useSupabaseTable("finances");

  // Tool dialog
  const [toolOpen, setToolOpen] = useState(false);
  const [newToolName, setNewToolName] = useState("");
  const [newToolUrl, setNewToolUrl] = useState("");
  const [newToolCategory, setNewToolCategory] = useState("");
  const [newToolPrice, setNewToolPrice] = useState("");

  const handleAddTool = async () => {
    if (!newToolName) return;
    await insertTool({ name: newToolName, url: newToolUrl || null, category: newToolCategory || null, price_monthly: parseFloat(newToolPrice) || 0 });
    setNewToolName(""); setNewToolUrl(""); setNewToolCategory(""); setNewToolPrice(""); setToolOpen(false);
  };

  // Client dialog
  const [clientOpen, setClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientStatus, setNewClientStatus] = useState("prospect");
  const [newClientMrr, setNewClientMrr] = useState("");

  const handleAddClient = async () => {
    if (!newClientName) return;
    await insertClient({ name: newClientName, status: newClientStatus, mrr: parseFloat(newClientMrr) || 0 });
    setNewClientName(""); setNewClientMrr(""); setClientOpen(false);
  };

  const totalMrr = clients.filter(c => c.status === "active").reduce((s, c) => s + Number(c.mrr || 0), 0);
  const activeClients = clients.filter(c => c.status === "active").length;
  const toolCost = tools.filter(t => t.active).reduce((s, t) => s + Number(t.price_monthly || 0), 0);
  const mrrGoal = 10000;

  // MRR chart from finances
  const mrrData = useMemo(() => {
    const months: Record<string, number> = {};
    finances.filter(f => f.type === "revenue" && f.scope === "business").forEach(f => {
      const key = new Date(f.transaction_date).toLocaleDateString("fr-FR", { month: "short" });
      months[key] = (months[key] || 0) + Number(f.amount);
    });
    return Object.entries(months).map(([month, mrr]) => ({ month, mrr }));
  }, [finances]);

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Business</h1>
      <Tabs defaultValue="tools" className="flex-1 flex flex-col">
        <TabsList className="bg-secondary mb-4 self-start">
          <TabsTrigger value="tools" className="gap-1.5 text-xs"><Wrench size={14} /> Outils</TabsTrigger>
          <TabsTrigger value="clients" className="gap-1.5 text-xs"><Users size={14} /> Clients</TabsTrigger>
          <TabsTrigger value="mrr" className="gap-1.5 text-xs"><TrendingUp size={14} /> Revenus MRR</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <Dialog open={toolOpen} onOpenChange={setToolOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Nouvel outil</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nom" value={newToolName} onChange={e => setNewToolName(e.target.value)} className="bg-secondary border-none" />
                  <Input placeholder="URL" value={newToolUrl} onChange={e => setNewToolUrl(e.target.value)} className="bg-secondary border-none" />
                  <Input placeholder="Catégorie" value={newToolCategory} onChange={e => setNewToolCategory(e.target.value)} className="bg-secondary border-none" />
                  <Input placeholder="Prix mensuel (€)" type="number" value={newToolPrice} onChange={e => setNewToolPrice(e.target.value)} className="bg-secondary border-none" />
                  <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddTool}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
            <span className="ml-auto text-xs text-muted-foreground">Coût : <span className="font-semibold text-foreground">{toolCost}€/mois</span></span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {tools.map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-xs font-bold text-foreground">{t.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category || "—"} · {Number(t.price_monthly) > 0 ? `${t.price_monthly}€/mois` : "Gratuit"}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${t.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                  {t.active ? "Actif" : "Inactif"}
                </span>
                <button onClick={() => removeTool(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
              </div>
            ))}
            {tools.length === 0 && <p className="text-sm text-muted-foreground col-span-3">Aucun outil.</p>}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="flex-1">
          <div className="mb-4">
            <Dialog open={clientOpen} onOpenChange={setClientOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Nouveau client</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nom" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="bg-secondary border-none" />
                  <Select value={newClientStatus} onValueChange={setNewClientStatus}>
                    <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="terminated">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="MRR (€/mois)" type="number" value={newClientMrr} onChange={e => setNewClientMrr(e.target.value)} className="bg-secondary border-none" />
                  <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddClient}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {clients.map(c => (
              <div key={c.id} className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/20 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{c.name[0]}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                {Number(c.mrr) > 0 && <span className="text-sm font-semibold text-success">{c.mrr}€/mois</span>}
                <button onClick={() => removeClient(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
              </div>
            ))}
            {clients.length === 0 && <p className="text-sm text-muted-foreground">Aucun client.</p>}
          </div>
        </TabsContent>

        <TabsContent value="mrr" className="flex-1">
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">MRR Total</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalMrr.toLocaleString()}€</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Clients actifs</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{activeClients}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Revenu moyen</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{activeClients > 0 ? Math.round(totalMrr / activeClients).toLocaleString() : 0}€</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Objectif MRR</p>
              <p className="mt-1 text-lg font-bold text-foreground">{totalMrr.toLocaleString()} / {mrrGoal.toLocaleString()}€</p>
              <Progress value={(totalMrr / mrrGoal) * 100} className="mt-2 h-1.5" />
            </div>
          </div>
          {mrrData.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Évolution MRR</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mrrData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="mrr" fill="hsl(248, 88%, 69%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
