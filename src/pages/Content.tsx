import { useState, useMemo } from "react";
import { Rss, Plus, ExternalLink, Trash2, Star, Search, BookOpen } from "lucide-react";
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
  const [showReader, setShowReader] = useState(false);

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

  const handleSelectArticle = (id: string) => {
    setSelectedArticle(id);
    setShowReader(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top Header with tabs */}
      <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar">
          {[
            { key: "inbox", label: "INBOX" },
            { key: "content", label: "CONTENU" },
            { key: "notes", label: "NOTES" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowReader(false); }}
              className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-primary/5 text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* RSS Inbox */}
      {activeTab === "inbox" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sources - hidden on mobile */}
          <div className="hidden md:flex w-[200px] border-r border-border bg-background/50 flex-col shrink-0 overflow-y-auto p-4">
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
                  <span className="text-sm truncate">{f.name}</span>
                </div>
                {(feedCounts[f.id] || 0) > 0 && (
                  <span className="text-[10px] text-muted-foreground">{feedCounts[f.id]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Article List */}
          <div className={`${showReader ? "hidden md:flex" : "flex"} w-full md:w-[340px] border-r border-border bg-background flex-col shrink-0 overflow-hidden`}>
            <div className="p-3 md:p-4 border-b border-border shrink-0">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {["unread", "favorites", "archived"].map(f => (
                  <button
                    key={f}
                    onClick={() => setArticleFilter(f)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
                      articleFilter === f ? "border-primary text-primary bg-card" : "border-border text-muted-foreground bg-card hover:bg-secondary"
                    }`}
                  >
                    {f === "unread" ? "Non lus" : f === "favorites" ? "Favoris" : "Archives"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
              {filteredArticles.map(a => (
                <div
                  key={a.id}
                  onClick={() => handleSelectArticle(a.id)}
                  className={`p-3 md:p-4 bg-card rounded-xl shadow-sm border cursor-pointer transition-all ${
                    selectedArticle === a.id ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-sm bg-primary/20 shrink-0" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                      {feeds.find(f => f.id === a.feed_id)?.name || "—"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold leading-snug mb-2 text-foreground line-clamp-2">{a.title}</h4>
                  {a.content && <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">{a.content.substring(0, 120)}...</p>}
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
          <div className={`${showReader ? "flex" : "hidden md:flex"} flex-1 bg-card flex-col items-center overflow-y-auto`}>
            {selectedArticleData ? (
              <div className="w-full max-w-[680px] px-4 md:px-8 py-8 md:py-16">
                {/* Back button on mobile */}
                <button onClick={() => setShowReader(false)} className="md:hidden text-primary text-sm font-bold mb-4">← Retour</button>
                <div className="flex items-center gap-3 mb-6 md:mb-8 text-muted-foreground text-sm">
                  <div className="w-6 h-6 rounded-sm bg-primary/20 shrink-0" />
                  <span className="truncate">{selectedFeedData?.name || "—"}</span>
                  <span>•</span>
                  <span className="shrink-0">{selectedArticleData.published_at ? new Date(selectedArticleData.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-6 md:mb-8">{selectedArticleData.title}</h1>
                <div className="text-base md:text-lg text-foreground leading-relaxed space-y-6">
                  <p>{selectedArticleData.content || "Contenu non disponible."}</p>
                </div>
                <div className="mt-8 flex gap-3 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => updateArticle(selectedArticleData.id, { status: "archived" })}>Archiver</Button>
                  {selectedArticleData.url && (
                    <a href={selectedArticleData.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5"><ExternalLink size={14} /> Ouvrir</Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">Sélectionnez un article</div>
            )}
          </div>
        </div>
      )}

      {/* Content Library */}
      {activeTab === "content" && (
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchContent} onChange={e => setSearchContent(e.target.value)} className="pl-9 bg-card border-border rounded-xl" />
            </div>
            <Dialog open={addContentOpen} onOpenChange={setAddContentOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground gap-1.5"><Plus size={14} /> Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border mx-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map(b => (
              <div key={b.id} className="bg-card p-4 md:p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground truncate">{b.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.content_type} {b.author ? `• ${b.author}` : ""}</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase shrink-0">{statusLabels[b.status] || b.status}</span>
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
            {filteredContent.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Aucun contenu.</p>}
          </div>
        </div>
      )}

      {/* Notes */}
      {activeTab === "notes" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className={`${selectedNote && selectedNoteId ? "hidden md:flex" : "flex"} w-full md:w-[260px] border-r border-border bg-background flex-col shrink-0 overflow-y-auto p-4`}>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher notes..." value={searchNotes} onChange={e => setSearchNotes(e.target.value)} className="pl-9 h-9 text-sm bg-card border-border rounded-lg" />
            </div>
            <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full mb-3 gap-1.5 bg-primary text-primary-foreground"><Plus size={14} /> Nouvelle note</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border mx-4">
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
          <div className={`${selectedNote && selectedNoteId ? "flex" : "hidden md:flex"} flex-1 overflow-auto bg-card p-4 md:p-8 flex-col`}>
            {selectedNote ? (
              <>
                <button onClick={() => setSelectedNoteId(null)} className="md:hidden text-primary text-sm font-bold mb-4">← Retour</button>
                <Input value={selectedNote.title} onChange={e => updateNote(selectedNote.id, { title: e.target.value })} className="text-xl md:text-2xl font-bold border-none bg-transparent p-0 mb-6 text-foreground focus-visible:ring-0" />
                <textarea
                  value={selectedNote.content || ""}
                  onChange={e => updateNote(selectedNote.id, { content: e.target.value })}
                  className="w-full flex-1 resize-none bg-transparent text-foreground leading-relaxed focus:outline-none min-h-[300px] md:min-h-[400px]"
                  placeholder="Commencez à écrire..."
                />
                {linkedNotes.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Notes liées</h4>
                    <div className="flex flex-wrap gap-2">
                      {linkedNotes.map(n => (
                        <button key={n.id} onClick={() => setSelectedNoteId(n.id)} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20">
                          {n.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sélectionnez une note</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
