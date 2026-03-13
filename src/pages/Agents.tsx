import { Bot, GraduationCap, FileText, Search, Mic, BarChart3, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const agents = [
  {
    name: "Agent Compétences",
    description: "Génère un plan de session 2h avec tâches automatiques dans Organisation.",
    icon: GraduationCap,
    color: "bg-warning/15 text-warning",
  },
  {
    name: "Agent Notes",
    description: "Transforme les highlights en notes permanentes Zettelkasten.",
    icon: FileText,
    color: "bg-primary/15 text-primary",
  },
  {
    name: "Agent Problème → Contenu",
    description: "Trouve les meilleurs livres, vidéos et articles pour résoudre un problème.",
    icon: Search,
    color: "bg-success/15 text-success",
  },
  {
    name: "Agent Marketing Vocal",
    description: "Analyse ton texte marketing et donne un score sur 100 avec suggestions.",
    icon: Mic,
    color: "bg-pink-500/15 text-pink-400",
  },
  {
    name: "Agent Stats",
    description: "Analyse tes données LifeSync et génère un rapport hebdomadaire complet.",
    icon: BarChart3,
    color: "bg-blue-500/15 text-blue-400",
  },
];

export default function Agents() {
  return (
    <div className="flex h-screen flex-col overflow-auto p-6">
      <h1 className="mb-6 text-xl font-bold text-foreground">Agents IA</h1>

      {/* Agent grid */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="group rounded-lg border border-border bg-card p-5 hover:border-primary/20 transition-colors cursor-pointer"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${agent.color}`}>
              <agent.icon size={20} />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{agent.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
            <Button size="sm" variant="outline" className="mt-3 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Lancer <ChevronRight size={12} />
            </Button>
          </div>
        ))}
      </div>

      {/* Global Assistant */}
      <div className="flex-1 rounded-lg border border-border bg-card flex flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Bot size={18} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Assistant Global</span>
          <span className="text-[10px] text-muted-foreground ml-auto">Powered by Claude Sonnet</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Bot size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Chat libre avec accès à toutes vos données LifeSync.</p>
            <p className="text-xs text-muted-foreground mt-1">Pose une question ou demande une action.</p>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input placeholder="Demande quelque chose à ton assistant..." className="h-10 text-sm bg-secondary border-none" />
            <Button size="sm" className="h-10 px-6 bg-primary text-primary-foreground">
              <MessageSquare size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
