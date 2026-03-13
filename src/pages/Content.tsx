import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rss, Library, FileText, Search, Plus, ExternalLink, Highlighter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const rssSources = [
  { name: "TechCrunch", unread: 4 },
  { name: "Hacker News", unread: 12 },
  { name: "CSS-Tricks", unread: 2 },
  { name: "Smashing Magazine", unread: 1 },
  { name: "A List Apart", unread: 0 },
];

const articles = [
  { title: "The Future of React Server Components", source: "TechCrunch", status: "unread", date: "Aujourd'hui" },
  { title: "Understanding CSS Container Queries", source: "CSS-Tricks", status: "reading", date: "Hier" },
  { title: "10 Productivity Hacks for Developers", source: "Hacker News", status: "unread", date: "Hier" },
  { title: "Design Systems at Scale", source: "Smashing Magazine", status: "archived", date: "12 mars" },
];

const bookmarks = [
  { title: "Atomic Habits — James Clear", type: "Livre", status: "Note brute", tags: ["productivité", "habitudes"] },
  { title: "The Art of Thinking Clearly", type: "Livre", status: "File d'attente", tags: ["psychologie"] },
  { title: "Designing Data-Intensive Apps", type: "Livre", status: "En cours", tags: ["tech", "architecture"] },
  { title: "3Blue1Brown — Linear Algebra", type: "Vidéo", status: "Archivé", tags: ["maths"] },
];

const notes = [
  { title: "Zettelkasten Method", tags: ["méthode", "notes"], linked: 5, updated: "Aujourd'hui" },
  { title: "React Patterns — Compound Components", tags: ["react", "patterns"], linked: 3, updated: "Hier" },
  { title: "Stoïcisme et productivité", tags: ["philosophie", "productivité"], linked: 2, updated: "10 mars" },
  { title: "Business Model Canvas — Acme", tags: ["business", "stratégie"], linked: 1, updated: "8 mars" },
];

const statusColors: Record<string, string> = {
  "unread": "bg-primary/20 text-primary",
  "reading": "bg-warning/20 text-warning",
  "archived": "bg-muted text-muted-foreground",
  "File d'attente": "bg-muted text-muted-foreground",
  "En cours": "bg-warning/20 text-warning",
  "Note brute": "bg-primary/20 text-primary",
  "Note permanente": "bg-success/20 text-success",
  "Archivé": "bg-muted text-muted-foreground",
};

export default function Content() {
  const [selectedArticle, setSelectedArticle] = useState(0);
  const [activeTab, setActiveTab] = useState("inbox");

  return (
    <div className="flex h-screen flex-col overflow-hidden p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Contenu & Notes</h1>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Plus size={14} /> Ajouter URL
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-secondary mb-4 self-start">
          <TabsTrigger value="inbox" className="gap-1.5 text-xs"><Rss size={14} /> Inbox RSS</TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5 text-xs"><Library size={14} /> Contenu</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5 text-xs"><FileText size={14} /> Notes</TabsTrigger>
        </TabsList>

        {/* RSS Inbox - 3 columns */}
        <TabsContent value="inbox" className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-[200px_1fr_1fr] gap-4">
            {/* Sources */}
            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sources</p>
              {rssSources.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-foreground hover:bg-secondary cursor-pointer">
                  <span className="truncate">{s.name}</span>
                  {s.unread > 0 && (
                    <span className="rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary">{s.unread}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Article list */}
            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              <div className="mb-3">
                <Input placeholder="Rechercher..." className="h-8 text-xs bg-secondary border-none" />
              </div>
              {articles.map((a, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedArticle(i)}
                  className={`cursor-pointer rounded-md px-3 py-2.5 transition-colors mb-1 ${
                    selectedArticle === i ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary border border-transparent"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{a.source}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{a.date}</span>
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reader */}
            <div className="overflow-auto rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">{articles[selectedArticle].title}</h2>
              <p className="text-xs text-muted-foreground mb-4">{articles[selectedArticle].source} · {articles[selectedArticle].date}</p>
              <div className="prose prose-sm prose-invert max-w-[680px] text-foreground leading-relaxed" style={{ fontSize: "15px", lineHeight: "1.65" }}>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
                <p className="mt-3">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
                <p className="mt-3">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa.</p>
              </div>
              <div className="mt-6 flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Highlighter size={14} /> Surligner
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <ExternalLink size={14} /> Ouvrir
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Content library */}
        <TabsContent value="content" className="flex-1 overflow-auto">
          <div className="mb-4 flex items-center gap-3">
            <Input placeholder="Rechercher du contenu..." className="h-8 max-w-xs text-xs bg-secondary border-none" />
            {["Tout", "Livre", "Vidéo", "Article", "Podcast"].map((f) => (
              <Button key={f} size="sm" variant="outline" className="text-xs h-8">{f}</Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bookmarks.map((b, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{b.type}</p>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[b.status]}`}>{b.status}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {b.tags.map((tag) => (
                    <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-[240px_1fr_240px] gap-4">
            {/* Note list */}
            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              <Input placeholder="Rechercher notes..." className="mb-3 h-8 text-xs bg-secondary border-none" />
              {notes.map((n, i) => (
                <div key={i} className="cursor-pointer rounded-md px-3 py-2 hover:bg-secondary mb-1">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <div className="mt-1 flex gap-1">
                    {n.tags.map((t) => (
                      <span key={t} className="text-[10px] text-muted-foreground">#{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Editor */}
            <div className="overflow-auto rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">{notes[0].title}</h2>
              <div className="text-sm text-foreground leading-relaxed space-y-3" style={{ fontSize: "15px", lineHeight: "1.65" }}>
                <p>La méthode Zettelkasten est un système de gestion des connaissances développé par Niklas Luhmann.</p>
                <p>Les principes clés :</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Une idée = une note atomique</li>
                  <li>Liens bidirectionnels entre notes [[liens]]</li>
                  <li>Notes permanentes vs notes temporaires</li>
                  <li>Le réseau émerge naturellement</li>
                </ul>
                <p>Voir aussi : <span className="text-primary cursor-pointer">[[React Patterns]]</span>, <span className="text-primary cursor-pointer">[[Productivité]]</span></p>
              </div>
            </div>

            {/* Metadata panel */}
            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Métadonnées</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modifié</span>
                  <span className="text-foreground">Aujourd'hui</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liens</span>
                  <span className="text-foreground">{notes[0].linked}</span>
                </div>
              </div>
              <p className="mt-4 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1">
                {notes[0].tags.map((t) => (
                  <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                ))}
              </div>
              <p className="mt-4 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Notes liées</p>
              <div className="space-y-1">
                <p className="text-xs text-primary cursor-pointer">React Patterns</p>
                <p className="text-xs text-primary cursor-pointer">Productivité</p>
              </div>

              {/* Mini graph placeholder */}
              <p className="mt-4 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Graphe</p>
              <div className="h-32 rounded-md border border-border bg-secondary flex items-center justify-center">
                <BookOpen size={18} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
