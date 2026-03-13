import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Users, TrendingUp, ExternalLink, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const tools = [
  { name: "Figma", category: "Design", price: 12, active: true, url: "figma.com" },
  { name: "Webflow", category: "No-Code", price: 29, active: true, url: "webflow.com" },
  { name: "Framer", category: "No-Code", price: 20, active: true, url: "framer.com" },
  { name: "N8N", category: "Automation", price: 0, active: true, url: "n8n.io" },
  { name: "Vercel", category: "Hosting", price: 20, active: true, url: "vercel.com" },
  { name: "Notion", category: "Productivité", price: 10, active: false, url: "notion.so" },
];

const clients = [
  { name: "Acme Corp", status: "Actif", mrr: 2500, projects: 2 },
  { name: "StartupXYZ", status: "Actif", mrr: 1200, projects: 1 },
  { name: "DesignStudio", status: "Prospect", mrr: 0, projects: 0 },
  { name: "TechFlow", status: "Terminé", mrr: 0, projects: 1 },
];

const mrrData = [
  { month: "Sep", mrr: 2800 },
  { month: "Oct", mrr: 3100 },
  { month: "Nov", mrr: 3200 },
  { month: "Déc", mrr: 3500 },
  { month: "Jan", mrr: 3700 },
  { month: "Fév", mrr: 3700 },
  { month: "Mar", mrr: 4200 },
];

const statusColors: Record<string, string> = {
  "Actif": "bg-success/20 text-success",
  "Prospect": "bg-warning/20 text-warning",
  "Terminé": "bg-muted text-muted-foreground",
};

export default function Business() {
  const totalMrr = clients.reduce((s, c) => s + c.mrr, 0);
  const mrrGoal = 10000;
  const activeClients = clients.filter(c => c.status === "Actif").length;
  const toolCost = tools.filter(t => t.active).reduce((s, t) => s + t.price, 0);

  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Business</h1>

      <Tabs defaultValue="tools" className="flex-1 flex flex-col">
        <TabsList className="bg-secondary mb-4 self-start">
          <TabsTrigger value="tools" className="gap-1.5 text-xs"><Wrench size={14} /> Outils & Références</TabsTrigger>
          <TabsTrigger value="clients" className="gap-1.5 text-xs"><Users size={14} /> Clients</TabsTrigger>
          <TabsTrigger value="mrr" className="gap-1.5 text-xs"><TrendingUp size={14} /> Revenus MRR</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <Input placeholder="Rechercher un outil..." className="h-8 max-w-xs text-xs bg-secondary border-none" />
            <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Ajouter</Button>
            <span className="ml-auto text-xs text-muted-foreground">Coût total : <span className="font-semibold text-foreground">{toolCost}€/mois</span></span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {tools.map((t) => (
              <div key={t.name} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-xs font-bold text-foreground">
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category} · {t.price > 0 ? `${t.price}€/mois` : "Gratuit"}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${t.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                  {t.active ? "Actif" : "Inactif"}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <Input placeholder="Rechercher un client..." className="h-8 max-w-xs text-xs bg-secondary border-none" />
            <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Nouveau client</Button>
          </div>
          <div className="space-y-2">
            {clients.map((c) => (
              <div key={c.name} className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {c.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.projects} projet{c.projects !== 1 ? "s" : ""}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[c.status]}`}>{c.status}</span>
                {c.mrr > 0 && <span className="text-sm font-semibold text-success">{c.mrr}€/mois</span>}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mrr" className="flex-1">
          {/* Cards */}
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

          {/* Chart */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Évolution MRR — 7 derniers mois</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mrrData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,53%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,11%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="mrr" fill="hsl(248, 88%, 69%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
