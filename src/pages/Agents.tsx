import { useState, useRef, useEffect } from "react";
import { Bot, GraduationCap, FileText, Search, Mic, BarChart3, MessageSquare, ChevronRight, X, Send, Loader2, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const agents = [
  {
    id: "competences",
    name: "Agent Compétences",
    description: "Génère un plan de session 2h avec tâches automatiques.",
    icon: GraduationCap,
    color: "bg-warning/15 text-warning",
    domaine: "l'apprentissage et les compétences",
    systemPrompt: `Tu es un coach d'apprentissage expert spécialisé UNIQUEMENT dans l'apprentissage et les compétences.

Quand l'utilisateur te donne une compétence à travailler, génère un plan de session détaillé de 2 heures avec :
- Un objectif clair pour la session
- 4-6 étapes concrètes avec durée estimée
- Des ressources recommandées (livres, vidéos, exercices)
- Des tâches actionnables à la fin

RÈGLE IMPORTANTE : Si la question ne concerne PAS l'apprentissage ou les compétences, réponds EXACTEMENT dans ce format JSON et rien d'autre :
{"redirect": true, "agent": "Agent Contenu", "agentId": "contenu", "raison": "Cette question concerne la recherche de contenus"}
ou
{"redirect": true, "agent": "Agent Notes", "agentId": "notes", "raison": "Cette question concerne la prise de notes"}
ou
{"redirect": true, "agent": "Agent Marketing", "agentId": "marketing", "raison": "Cette question concerne le marketing"}
ou
{"redirect": true, "agent": "Agent Stats", "agentId": "stats", "raison": "Cette question concerne les statistiques"}
ou si aucun agent ne correspond :
{"noAgent": true, "question": "la question posée en résumé court"}

Réponds en français.`,
    placeholder: "Ex: Je veux apprendre React, niveau débutant, focus sur les hooks...",
  },
  {
    id: "notes",
    name: "Agent Notes",
    description: "Transforme les highlights en notes Zettelkasten.",
    icon: FileText,
    color: "bg-primary/15 text-primary",
    domaine: "la prise de notes et la méthode Zettelkasten",
    systemPrompt: `Tu es un expert de la méthode Zettelkasten spécialisé UNIQUEMENT dans la prise de notes.

Quand l'utilisateur te donne des highlights ou extraits de texte, transforme-les en notes permanentes Zettelkasten avec :
- Un titre atomique et précis (concept unique)
- Une explication claire et concise en tes propres mots
- Les connexions possibles avec d'autres concepts
- Une citation clé si pertinent
Chaque note doit être autosuffisante.

RÈGLE IMPORTANTE : Si la question ne concerne PAS la prise de notes ou Zettelkasten, réponds EXACTEMENT dans ce format JSON et rien d'autre :
{"redirect": true, "agent": "Agent Compétences", "agentId": "competences", "raison": "Cette question concerne l'apprentissage"}
ou
{"redirect": true, "agent": "Agent Contenu", "agentId": "contenu", "raison": "Cette question concerne la recherche de contenus"}
ou
{"redirect": true, "agent": "Agent Marketing", "agentId": "marketing", "raison": "Cette question concerne le marketing"}
ou
{"redirect": true, "agent": "Agent Stats", "agentId": "stats", "raison": "Cette question concerne les statistiques"}
ou si aucun agent ne correspond :
{"noAgent": true, "question": "la question posée en résumé court"}

Réponds en français.`,
    placeholder: "Colle tes highlights ou extraits de texte ici...",
  },
  {
    id: "contenu",
    name: "Agent Contenu",
    description: "Trouve les meilleurs contenus pour résoudre un problème.",
    icon: Search,
    color: "bg-success/15 text-success",
    domaine: "la recherche de contenus et ressources",
    systemPrompt: `Tu es un expert en curation de contenu spécialisé UNIQUEMENT dans la recherche de ressources.

Quand l'utilisateur décrit un problème ou un besoin, recommande :
- 3-5 livres essentiels avec une phrase d'explication
- 3-5 chaînes YouTube ou vidéos spécifiques
- 2-3 podcasts pertinents
- 2-3 articles ou ressources en ligne
- Un plan d'action pour consommer ce contenu efficacement

RÈGLE IMPORTANTE : Si la question ne concerne PAS la recherche de contenus ou ressources, réponds EXACTEMENT dans ce format JSON et rien d'autre :
{"redirect": true, "agent": "Agent Compétences", "agentId": "competences", "raison": "Cette question concerne l'apprentissage"}
ou
{"redirect": true, "agent": "Agent Notes", "agentId": "notes", "raison": "Cette question concerne la prise de notes"}
ou
{"redirect": true, "agent": "Agent Marketing", "agentId": "marketing", "raison": "Cette question concerne le marketing"}
ou
{"redirect": true, "agent": "Agent Stats", "agentId": "stats", "raison": "Cette question concerne les statistiques"}
ou si aucun agent ne correspond :
{"noAgent": true, "question": "la question posée en résumé court"}

Réponds en français.`,
    placeholder: "Décris ton problème ou ce que tu veux apprendre...",
  },
  {
    id: "marketing",
    name: "Agent Marketing",
    description: "Analyse ton texte marketing et donne un score.",
    icon: Mic,
    color: "bg-pink-500/15 text-pink-400",
    domaine: "le marketing et le copywriting",
    systemPrompt: `Tu es un expert en copywriting spécialisé UNIQUEMENT dans l'analyse de textes marketing.

Quand l'utilisateur te donne un texte marketing, analyse-le et fournis :
- Un score global sur 100 avec justification
- Score clarté du message (0-20)
- Score accroche et impact émotionnel (0-20)
- Score appel à l'action (0-20)
- Score crédibilité et preuve sociale (0-20)
- Score adaptation à la cible (0-20)
- 3 points forts spécifiques
- 3 améliorations prioritaires avec exemples concrets
- Une version améliorée du texte

RÈGLE IMPORTANTE : Si la question ne concerne PAS le marketing ou le copywriting, réponds EXACTEMENT dans ce format JSON et rien d'autre :
{"redirect": true, "agent": "Agent Compétences", "agentId": "competences", "raison": "Cette question concerne l'apprentissage"}
ou
{"redirect": true, "agent": "Agent Notes", "agentId": "notes", "raison": "Cette question concerne la prise de notes"}
ou
{"redirect": true, "agent": "Agent Contenu", "agentId": "contenu", "raison": "Cette question concerne la recherche de contenus"}
ou
{"redirect": true, "agent": "Agent Stats", "agentId": "stats", "raison": "Cette question concerne les statistiques"}
ou si aucun agent ne correspond :
{"noAgent": true, "question": "la question posée en résumé court"}

Réponds en français.`,
    placeholder: "Colle ton texte marketing, accroche, email, post réseaux sociaux...",
  },
  {
    id: "stats",
    name: "Agent Stats",
    description: "Analyse tes données et génère un rapport hebdo.",
    icon: BarChart3,
    color: "bg-blue-500/15 text-blue-400",
    domaine: "les statistiques et rapports de productivité",
    systemPrompt: `Tu es un analyste de productivité spécialisé UNIQUEMENT dans les statistiques et rapports.

Quand l'utilisateur te donne ses données de la semaine, génère un rapport structuré avec :
- Résumé exécutif de la semaine (3-4 phrases)
- Points forts et victoires de la semaine
- Points faibles et axes d'amélioration
- Patterns et tendances identifiés
- Score de productivité global sur 10
- 3 recommandations concrètes pour la semaine suivante
- Objectif prioritaire pour la prochaine semaine

RÈGLE IMPORTANTE : Si la question ne concerne PAS les statistiques ou rapports, réponds EXACTEMENT dans ce format JSON et rien d'autre :
{"redirect": true, "agent": "Agent Compétences", "agentId": "competences", "raison": "Cette question concerne l'apprentissage"}
ou
{"redirect": true, "agent": "Agent Notes", "agentId": "notes", "raison": "Cette question concerne la prise de notes"}
ou
{"redirect": true, "agent": "Agent Contenu", "agentId": "contenu", "raison": "Cette question concerne la recherche de contenus"}
ou
{"redirect": true, "agent": "Agent Marketing", "agentId": "marketing", "raison": "Cette question concerne le marketing"}
ou si aucun agent ne correspond :
{"noAgent": true, "question": "la question posée en résumé court"}

Réponds en français.`,
    placeholder: "Décris ta semaine : tâches accomplies, objectifs atteints, difficultés...",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
  redirect?: { agent: string; agentId: string; raison: string; originalMessage: string };
  noAgent?: { question: string; originalMessage: string };
};

async function callGroq(systemPrompt: string, messages: Message[], userMessage: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
          .filter((m) => !m.redirect && !m.noAgent)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Groq:", data);
    throw new Error(data.error?.message || "Erreur API Groq");
  }

  return data.choices?.[0]?.message?.content || "Désolé, une erreur est survenue.";
}

type AgentModalProps = {
  agent: typeof agents[0];
  initialMessage?: string;
  onClose: () => void;
  onRedirect: (agentId: string, message: string) => void;
};

function AgentModal({ agent, initialMessage, onClose, onRedirect }: AgentModalProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [idees, setIdees] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
    }
  }, [initialMessage]);

  const saveIdee = async (question: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("agent_ideas").insert({
          user_id: user.id,
          question,
          agent_name: agent.name,
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.log("Table agent_ideas pas encore créée, idée sauvegardée localement");
    }
    setIdees((prev) => [...prev, question]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const rawResponse = await callGroq(agent.systemPrompt, messages, userMessage);

      // Essaie de parser comme JSON (redirect ou noAgent)
      try {
        const parsed = JSON.parse(rawResponse.trim());

        if (parsed.redirect) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "",
              redirect: {
                agent: parsed.agent,
                agentId: parsed.agentId,
                raison: parsed.raison,
                originalMessage: userMessage,
              },
            },
          ]);
        } else if (parsed.noAgent) {
          await saveIdee(parsed.question || userMessage);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "",
              noAgent: {
                question: parsed.question || userMessage,
                originalMessage: userMessage,
              },
            },
          ]);
        } else {
          setMessages((prev) => [...prev, { role: "assistant", content: rawResponse }]);
        }
      } catch {
        // Pas du JSON = réponse normale
        setMessages((prev) => [...prev, { role: "assistant", content: rawResponse }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Erreur : ${error instanceof Error ? error.message : "Connexion impossible."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${agent.color}`}>
              <agent.icon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X size={16} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className={`mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${agent.color}`}>
                  <agent.icon size={24} />
                </div>
                <p className="text-sm font-medium text-foreground">{agent.name}</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">{agent.description}</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === "user" && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground">
                    {message.content}
                  </div>
                </div>
              )}
              {message.role === "assistant" && !message.redirect && !message.noAgent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-secondary text-foreground">
                    {message.content}
                  </div>
                </div>
              )}
              {message.redirect && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl border border-border bg-secondary p-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      Cette question concerne <strong>{message.redirect.agent}</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">{message.redirect.raison}</p>
                    <Button
                      size="sm"
                      className="gap-2 bg-primary text-primary-foreground text-xs"
                      onClick={() => {
                        onRedirect(message.redirect!.agentId, message.redirect!.originalMessage);
                      }}
                    >
                      Ouvrir {message.redirect.agent}
                      <ArrowRight size={12} />
                    </Button>
                  </div>
                </div>
              )}
              {message.noAgent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl border border-warning/30 bg-warning/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} className="text-warning" />
                      <p className="text-xs font-medium text-warning">Aucun agent disponible</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Ta demande a été sauvegardée dans les idées pour améliorer l'app !
                    </p>
                    <div className="rounded-lg bg-secondary px-3 py-2">
                      <p className="text-xs text-foreground">💡 "{message.noAgent.question}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
                <Loader2 size={14} className="animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">En train de réfléchir...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Idées sauvegardées */}
        {idees.length > 0 && (
          <div className="border-t border-border px-4 py-2 bg-warning/5">
            <p className="text-xs text-warning font-medium flex items-center gap-1">
              <Lightbulb size={12} />
              {idees.length} idée{idees.length > 1 ? "s" : ""} sauvegardée{idees.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder={agent.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[60px] max-h-[120px] resize-none text-sm bg-secondary border-none"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="h-auto px-4 bg-primary text-primary-foreground shrink-0 self-end"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</p>
        </div>
      </div>
    </div>
  );
}

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string>("");
  const [globalMessages, setGlobalMessages] = useState<Message[]>([]);
  const [globalInput, setGlobalInput] = useState("");
  const [globalLoading, setGlobalLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const GLOBAL_SYSTEM_PROMPT = `Tu es l'Assistant Global de LifeSync, un système d'exploitation de vie personnel.
Tu as accès à toutes les sections : Dashboard, Organisation, Contenu & Notes, Santé, YouTube, Compétences, Finances, Agents IA, Cours.
Tu aides l'utilisateur à gérer sa vie de façon globale et cohérente.
Sois concis, actionnable et bienveillant. Réponds toujours en français.`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [globalMessages]);

  const handleRedirect = (agentId: string, message: string) => {
    const targetAgent = agents.find((a) => a.id === agentId);
    if (targetAgent) {
      setSelectedAgent(targetAgent);
      setRedirectMessage(message);
    }
  };

  const sendGlobalMessage = async () => {
    if (!globalInput.trim() || globalLoading) return;

    const userMessage = globalInput.trim();
    setGlobalInput("");
    setGlobalMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setGlobalLoading(true);

    try {
      const assistantMessage = await callGroq(GLOBAL_SYSTEM_PROMPT, globalMessages, userMessage);
      setGlobalMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      setGlobalMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Erreur : ${error instanceof Error ? error.message : "Connexion impossible."}`,
        },
      ]);
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-auto p-4 md:p-6">
      <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-foreground">Agents IA</h1>

      {/* Agent grid */}
      <div className="mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="group rounded-xl border border-border bg-card p-4 md:p-5 hover:border-primary/20 transition-colors cursor-pointer"
            onClick={() => { setSelectedAgent(agent); setRedirectMessage(""); }}
          >
            <div className={`mb-3 inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg ${agent.color}`}>
              <agent.icon size={18} />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{agent.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 gap-1 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(agent);
                setRedirectMessage("");
              }}
            >
              Lancer <ChevronRight size={12} />
            </Button>
          </div>
        ))}
      </div>

      {/* Global Assistant */}
      <div className="flex-1 rounded-xl border border-border bg-card flex flex-col min-h-[300px]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Bot size={18} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Assistant Global</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Connecté</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {globalMessages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Bot size={28} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chat libre avec accès à toutes vos données.</p>
                <p className="text-xs text-muted-foreground mt-1">Pose une question ou demande une action.</p>
              </div>
            </div>
          )}
          {globalMessages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {globalLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
                <Loader2 size={14} className="animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">En train de réfléchir...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border p-3 md:p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Demande quelque chose..."
              value={globalInput}
              onChange={(e) => setGlobalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendGlobalMessage();
              }}
              className="h-10 text-sm bg-secondary border-none"
            />
            <Button
              onClick={sendGlobalMessage}
              disabled={!globalInput.trim() || globalLoading}
              size="sm"
              className="h-10 px-4 md:px-6 bg-primary text-primary-foreground shrink-0"
            >
              {globalLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Agent Modal */}
      {selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          initialMessage={redirectMessage}
          onClose={() => { setSelectedAgent(null); setRedirectMessage(""); }}
          onRedirect={handleRedirect}
        />
      )}
    </div>
  );
}
