import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rss, Library, FileText, Plus, ExternalLink, Trash2, Star, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusLabels: Record<string, string> = {
  unread: "Non lu", reading: "En cours", archived: "Archivé",
  queue: "File d'attente", raw_note: "Note brute", permanent_note: "Note permanente",
};

export default function Content() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [articleFilter, setArticleFilter] = useState("unread");
  const [searchContent, setSearchContent] = useState("");
  const [searchNotes, setSearchNotes] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const { data: feeds } = useSupabaseTable("rss_feeds", { orderBy: { column: "name", ascending: true } });
  const { data: articles, update: updateArticle } = useSupabaseTable("rss_articles", { orderBy: { column: "created_at", ascending: false } });
  const { data: contentItems, insert: insertContent, remove: removeContent } = useSupabaseTable("content_items", { orderBy: { column: "created_at", ascending: false } });
  const { data: notes, insert: insertNote, update: updateNote, remove: removeNote } = useSupabaseTable("notes", { realtime: true, orderBy: { column: "updated_at", ascending: false } });
  const { data: noteLinks } = useSupabaseTable("note_links");

  const feedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.filter(a => a.status === "unread").forEach(a => { if (a.feed_id) counts[a.feed_id] = (counts[a.feed_id] || 0) + 1; });
    return counts;
  }, [articles]);

  const totalUnread = articles.filter(a => a.status === "unread").length;
  const filteredArticles = useMemo(() => {
    let list = articles;
    if (selectedFeed) list = list.filter(a => a.feed_id === selectedFeed);
    if (articleFilter === "unread") list = list.filter(a => a.status === "unread");
    else if (articleFilter === "archived") list = list.filter(a => a.status === "archived");
    return list;
  }, [articles, selectedFeed, articleFilter]);

  const selectedArticleData = articles.find(a => a.id === selectedArticle);
  const selectedFeedData = selectedArticleData ? feeds.find(f => f.id === selectedArticleData.feed_id) : null;
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const filteredContent = useMemo(() => {
    if (!searchContent) return contentItems;
    const q = searchContent.toLowerCase();
    return contentItems.filter(c => c.title.toLowerCase().includes(q));
  }, [contentItems, searchContent]);

  const filteredNotes = useMemo(() => {
    if (!searchNotes) return notes;
    const q = searchNotes.toLowerCase();
    return notes.filter(n => n.title.toLowerCase().includes(q));
  }, [notes, searchNotes]);

  const linkedNoteIds = useMemo(() => {
    if (!selectedNoteId) return [];
    return noteLinks.filter(l => l.source_note_id === selectedNoteId || l.target_note_id === selectedNoteId)
      .map(l => l.source_note_id === selectedNoteId ? l.target_note_id : l.source_note_id);
  }, [selectedNoteId, noteLinks]);
  const linkedNotes = notes.filter(n => linkedNoteIds.includes(n.id));

  const [addContentOpen, setAddContentOpen] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentUrl, setNewContentUrl] = useState("");
  const [newContentType, setNewContentType] = useState("article");

  const handleAddContent = async () => {
    if (!newContentTitle) return;
    await insertContent({ title: newContentTitle, url: newContentUrl || null, content_type: newContentType });
    setNewContentTitle(""); setNewContentUrl(""); setAddContentOpen(false);
  };

  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const handleAddNote = async () => {
    if (!newNoteTitle) return;
    await insertNote({ title: newNoteTitle, content: "", tags: [] });
    setNewNoteTitle(""); setAddNoteOpen(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top Header with tabs */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex gap-3">
          {[
            { key: "inbox", label: "INBOX RSS" },
            { key: "content", label: "CONTENU" },
            { key: "notes", label: "NOTES" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-primary/5 text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="pl-9 pr-4 py-2 bg-background border-none rounded-full text-sm w-64 focus:ring-1 focus:ring-primary" placeholder="Rechercher..." />
          </div>
        </div>
      </header>

      {/* RSS Inbox */}
      {activeTab === "inbox" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sources */}
          <div className="w-[200px] border-r border-border bg-background/50 flex flex-col shrink-0 overflow-y-auto p-4">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest px-2 mb-3">Sources</h3>
            <div
              onClick={() => setSelectedFeed(null)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${!selectedFeed ? "bg-primary/5" : "hover:bg-primary/5"}`}
            >
              <div className="flex items-center gap-2">
                <Rss size={14} className="text-primary" />
                <span className="text-sm font-medium">Tous les flux</span>
              </div>
              <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-bold">{totalUnread}</span>
            </div>
            {feeds.map(f => (
              <div
                key={f.id}
                onClick={() => setSelectedFeed(f.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${selectedFeed === f.id ? "bg-primary/5" : "hover:bg-primary/5"}`}
              >
                <div className="flex items-center gap-2">
                  {f.favicon_url ? (
                    <img src={f.favicon_url} alt="" className="w-4 h-4 rounded-sm" />
                  ) : (
                    <div className="w-4 h-4 rounded-sm bg-primary/20" />
                  )}
                  <span className="text-sm">{f.name}</span>
                </div>
                {(feedCounts[f.id] || 0) > 0 && (
                  <span className="text-[10px] text-muted-foreground">{feedCounts[f.id]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Article List */}
          <div className="w-[340px] border-r border-border bg-background flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-border shrink-0">
              <div className="flex gap-2">
                {["unread", "favorites", "archived"].map(f => (
                  <button
                    key={f}
                    onClick={() => setArticleFilter(f)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      articleFilter === f ? "border-primary text-primary bg-card" : "border-border text-muted-foreground bg-card hover:bg-secondary"
                    }`}
                  >
                    {f === "unread" ? "Non lus" : f === "favorites" ? "Favoris" : "Archives"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredArticles.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedArticle(a.id)}
                  className={`p-4 bg-card rounded-xl shadow-sm border cursor-pointer transition-all ${
                    selectedArticle === a.id ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-sm bg-primary/20" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      {feeds.find(f => f.id === a.feed_id)?.name || "—"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold leading-snug mb-2 text-foreground">{a.title}</h4>
                  {a.content && <p className="text-xs text-muted-foreground line-clamp-2">{a.content.substring(0, 120)}...</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {a.published_at ? new Date(a.published_at).toLocaleDateString("fr-FR") : ""}
                    </span>
                    <Star size={14} className="text-primary/40 hover:text-primary" />
                  </div>
                </div>
              ))}
              {filteredArticles.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">Aucun article.</p>}
            </div>
          </div>

          {/* Reader */}
          <div className="flex-1 bg-card flex flex-col items-center overflow-y-auto">
            {selectedArticleData ? (
              <div className="w-full max-w-[680px] px-8 py-16">
                <div className="flex items-center gap-3 mb-8 text-muted-foreground text-sm">
                  <div className="w-6 h-6 rounded-sm bg-primary/20" />
                  <span>{selectedFeedData?.name || "—"}</span>
                  <span>•</span>
                  <span>{selectedArticleData.published_at ? new Date(selectedArticleData.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}</span>
                </div>
                <h1 className="text-4xl font-bold text-foreground leading-tight mb-8">{selectedArticleData.title}</h1>
                <div className="text-lg text-foreground leading-relaxed space-y-6">
                  <p>{selectedArticleData.content || "Contenu non disponible."}</p>
                </div>
                <div className="mt-8 flex gap-3">
                  <Button size="sm" variant="outline" onClick={() => updateArticle(selectedArticleData.id, { status: "archived" })}>Archiver</Button>
                  {selectedArticleData.url && (
                    <a href={selectedArticleData.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5"><ExternalLink size={14} /> Ouvrir</Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sélectionnez un article</div>
            )}
          </div>
        </div>
      )}

      {/* Content Library */}
      {activeTab === "content" && (
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchContent} onChange={e => setSearchContent(e.target.value)} className="pl-9 bg-card border-border rounded-xl" />
            </div>
            <Dialog open={addContentOpen} onOpenChange={setAddContentOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground gap-1.5"><Plus size={14} /> Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Ajouter du contenu</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Titre" value={newContentTitle} onChange={e => setNewContentTitle(e.target.value)} className="bg-secondary border-none" />
                  <Input placeholder="URL (optionnel)" value={newContentUrl} onChange={e => setNewContentUrl(e.target.value)} className="bg-secondary border-none" />
                  <Select value={newContentType} onValueChange={setNewContentType}>
                    <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="livre">Livre</SelectItem>
                      <SelectItem value="vidéo">Vidéo</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddContent}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filteredContent.map(b => (
              <div key={b.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-foreground">{b.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.content_type} {b.author ? `• ${b.author}` : ""}</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{statusLabels[b.status] || b.status}</span>
                </div>
                {(b.tags || []).length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {(b.tags || []).map(tag => <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{tag}</span>)}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <button onClick={() => removeContent(b.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {filteredContent.length === 0 && <p className="text-sm text-muted-foreground col-span-3">Aucun contenu.</p>}
          </div>
        </div>
      )}

      {/* Notes */}
      {activeTab === "notes" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-[260px] border-r border-border bg-background flex flex-col shrink-0 overflow-y-auto p-4">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher notes..." value={searchNotes} onChange={e => setSearchNotes(e.target.value)} className="pl-9 h-9 text-sm bg-card border-border rounded-lg" />
            </div>
            <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full mb-3 gap-1.5 bg-primary text-primary-foreground"><Plus size={14} /> Nouvelle note</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Nouvelle note</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Titre" value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} className="bg-secondary border-none" />
                  <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddNote}>Créer</Button>
                </div>
              </DialogContent>
            </Dialog>
            {filteredNotes.map(n => (
              <div key={n.id} onClick={() => setSelectedNoteId(n.id)} className={`cursor-pointer rounded-xl px-3 py-3 mb-1 transition-colors ${selectedNoteId === n.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary"}`}>
                <p className="text-sm font-bold text-foreground truncate">{n.title}</p>
                <div className="mt-1 flex gap-1">{(n.tags || []).map(t => <span key={t} className="text-[10px] text-muted-foreground">#{t}</span>)}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto bg-card p-8">
            {selectedNote ? (
              <>
                <Input value={selectedNote.title} onChange={e => updateNote(selectedNote.id, { title: e.target.value })} className="text-2xl font-bold border-none bg-transparent p-0 mb-6 text-foreground focus-visible:ring-0" />
                <textarea
                  value={selectedNote.content || ""}
                  onChange={e => updateNote(selectedNote.id, { content: e.target.value })}
                  className="w-full flex-1 resize-none bg-transparent text-foreground leading-relaxed focus:outline-none min-h-[400px]"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                  placeholder="Commencez à écrire..."
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sélectionnez ou créez une note</div>
            )}
          </div>
          {selectedNote && (
            <div className="w-[240px] border-l border-border bg-background p-4 overflow-y-auto shrink-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Métadonnées</p>
              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{selectedNote.note_type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Modifié</span><span className="text-foreground">{new Date(selectedNote.updated_at).toLocaleDateString("fr-FR")}</span></div>
              </div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1 mb-4">{(selectedNote.tags || []).map(t => <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">#{t}</span>)}</div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes liées ({linkedNotes.length})</p>
              {linkedNotes.map(n => <p key={n.id} onClick={() => setSelectedNoteId(n.id)} className="text-xs text-primary cursor-pointer mb-1">{n.title}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
