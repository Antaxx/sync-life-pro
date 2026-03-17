import { useState, useMemo } from "react";
import { Plus, Trash2, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  prospect: "bg-amber-100 text-amber-700",
  terminated: "bg-secondary text-muted-foreground",
};
const statusLabels: Record<string, string> = { active: "Actif", prospect: "Prospect", terminated: "Terminé" };

export default function Business() {
  const { data: tools, insert: insertTool, remove: removeTool } = useSupabaseTable("tools", { orderBy: { column: "name", ascending: true } });
  const { data: clients, insert: insertClient, remove: removeClient } = useSupabaseTable("clients", { orderBy: { column: "name", ascending: true } });
  const { data: projects } = useSupabaseTable("projects");
  const { data: finances } = useSupabaseTable("finances");

  const [activeTab, setActiveTab] = useState("overview");
  const [toolFilter, setToolFilter] = useState("all");
  const [toolSearch, setToolSearch] = useState("");

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
  const activeProjects = projects.filter(p => p.status === "active").length;
  const toolCost = tools.filter(t => t.active).reduce((s, t) => s + Number(t.price_monthly || 0), 0);

  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [tools]);

  const filteredTools = useMemo(() => {
    let list = tools;
    if (toolFilter !== "all") list = list.filter(t => t.category === toolFilter);
    if (toolSearch) list = list.filter(t => t.name.toLowerCase().includes(toolSearch.toLowerCase()));
    return list;
  }, [tools, toolFilter, toolSearch]);

  const mrrData = useMemo(() => {
    const months: Record<string, number> = {};
    finances.filter(f => f.type === "revenue" && f.scope === "business").forEach(f => {
      const key = new Date(f.transaction_date).toLocaleDateString("fr-FR", { month: "short" });
      months[key] = (months[key] || 0) + Number(f.amount);
    });
    return Object.entries(months).map(([month, mrr]) => ({ month, mrr }));
  }, [finances]);

  const topClients = useMemo(() => {
    return [...clients].filter(c => c.status === "active").sort((a, b) => Number(b.mrr || 0) - Number(a.mrr || 0)).slice(0, 5);
  }, [clients]);

  const tabs = ["Vue d'ensemble", "Outils", "Clients", "MRR"];

  return (
    <div className="flex h-screen flex-col overflow-auto p-4 md:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground">Business</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Gérez votre écosystème professionnel.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {[
          { label: "Projets actifs", value: activeProjects.toString(), sub: `${projects.length} total`, icon: "📁" },
          { label: "Outils", value: tools.length.toString(), sub: `${toolCost}€/mois`, icon: "🔧" },
          { label: "Clients", value: clients.length.toString(), sub: `${activeClients} actifs`, icon: "👥" },
          { label: "MRR", value: `${totalMrr.toLocaleString()}€`, sub: "Mensuel récurrent", icon: "💰" },
        ].map(m => (
          <div key={m.label} className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{m.label}</p>
            <p className="text-2xl md:text-3xl font-bold text-primary mt-2">{m.value}</p>
            <div className="mt-3 md:mt-4 flex items-center text-xs text-muted-foreground font-medium">
              <TrendingUp size={14} className="mr-1 text-primary shrink-0" /> <span className="truncate">{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 md:mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(["overview", "tools", "clients", "mrr"][i])}
            className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === ["overview", "tools", "clients", "mrr"][i]
                ? "border-b-2 border-primary text-primary bg-primary/5 rounded-t-xl"
                : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Outils Tab */}
      {activeTab === "tools" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setToolFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${toolFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>Tout</button>
              {categories.map(c => (
                <button key={c} onClick={() => setToolFilter(c)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${toolFilter === c ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>{c}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={toolSearch} onChange={e => setToolSearch(e.target.value)} className="pl-9 rounded-xl border-border bg-card w-full sm:w-48 md:w-64" />
              </div>
              <Dialog open={toolOpen} onOpenChange={setToolOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground gap-1.5 shrink-0"><Plus size={14} /> Ajouter</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border mx-4">
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
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTools.map(t => (
              <div key={t.id} className="bg-card p-4 md:p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center text-base md:text-lg font-bold text-foreground border border-border shrink-0">
                      {t.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground truncate">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.category || "—"}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase shrink-0 ${t.active ? statusColors.active : statusColors.terminated}`}>
                    {t.active ? "Actif" : "Inactif"}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4 md:mt-6 pt-3 md:pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">{Number(t.price_monthly) > 0 ? `${t.price_monthly}€/mois` : "Gratuit"}</span>
                  <div className="flex gap-2">
                    {t.url && (
                      <a href={t.url} target="_blank" rel="noopener noreferrer">
                        <button className="px-3 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">Ouvrir</button>
                      </a>
                    )}
                    <button onClick={() => removeTool(t.id)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            {filteredTools.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Aucun outil.</p>}
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === "clients" && (
        <div className="space-y-6">
          <Dialog open={clientOpen} onOpenChange={setClientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground gap-1.5"><Plus size={14} /> Nouveau client</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border mx-4">
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
          <div className="space-y-3 md:space-y-4">
            {clients.map(c => (
              <div key={c.id} className="bg-card p-3 md:p-4 rounded-2xl border border-border flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">{c.name.substring(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-foreground text-sm truncate">{c.name}</h5>
                  <p className="text-xs text-muted-foreground truncate">{c.email || "—"}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase shrink-0 hidden sm:inline ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                {Number(c.mrr) > 0 && (
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary text-sm">{c.mrr}€</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold hidden sm:block">Mensuel</p>
                  </div>
                )}
                <button onClick={() => removeClient(c.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
            {clients.length === 0 && <p className="text-sm text-muted-foreground">Aucun client.</p>}
          </div>
        </div>
      )}

      {/* MRR / Overview Tab */}
      {(activeTab === "mrr" || activeTab === "overview") && (
        <div className="space-y-6 md:space-y-8">
          <div className="bg-card p-5 md:p-8 rounded-3xl border border-border shadow-sm">
            <div className="mb-6 md:mb-8">
              <p className="text-muted-foreground font-medium mb-1 uppercase tracking-widest text-xs">MRR actuel</p>
              <h4 className="text-3xl md:text-5xl font-black text-primary tracking-tight">{totalMrr.toLocaleString()}€</h4>
            </div>
            {mrrData.length > 0 && (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={mrrData}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#mrrGrad)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-foreground">Meilleurs clients</h3>
              <div className="space-y-3 md:space-y-4">
                {topClients.map(c => (
                  <div key={c.id} className="bg-card p-3 md:p-4 rounded-2xl border border-border flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">{c.name.substring(0, 2).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-foreground text-sm truncate">{c.name}</h5>
                      <p className="text-xs text-muted-foreground">{projects.filter(p => p.client_id === c.id && p.status === "active").length} Projets</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm">{c.mrr}€</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold hidden sm:block">Mensuel</p>
                    </div>
                  </div>
                ))}
                {topClients.length === 0 && <p className="text-sm text-muted-foreground">Aucun client actif.</p>}
              </div>
            </div>
            <div className="bg-primary/5 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center border border-border">
              <span className="text-4xl md:text-5xl mb-4">🚀</span>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Prêt à scaler ?</h3>
              <p className="text-muted-foreground text-sm mb-6">Gérez vos clients et outils pour maximiser votre MRR.</p>
              <Button className="bg-primary text-primary-foreground px-6 md:px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">Voir les outils</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
