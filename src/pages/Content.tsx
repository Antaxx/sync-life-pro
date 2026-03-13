import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rss, Library, FileText, Plus, ExternalLink, Highlighter, BookOpen, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  unread: "bg-primary/20 text-primary",
  reading: "bg-warning/20 text-warning",
  archived: "bg-muted text-muted-foreground",
  queue: "bg-muted text-muted-foreground",
  raw_note: "bg-primary/20 text-primary",
  permanent_note: "bg-success/20 text-success",
};

const statusLabels: Record<string, string> = {
  unread: "Non lu",
  reading: "En cours",
  archived: "Archivé",
  queue: "File d'attente",
  raw_note: "Note brute",
  permanent_note: "Note permanente",
};

export default function Content() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [searchContent, setSearchContent] = useState("");
  const [searchNotes, setSearchNotes] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Data
  const { data: feeds, insert: insertFeed } = useSupabaseTable("rss_feeds", { orderBy: { column: "name", ascending: true } });
  const { data: articles, insert: insertArticle, update: updateArticle } = useSupabaseTable("rss_articles", { orderBy: { column: "created_at", ascending: false } });
  const { data: contentItems, insert: insertContent, update: updateContent, remove: removeContent } = useSupabaseTable("content_items", { orderBy: { column: "created_at", ascending: false } });
  const { data: notes, insert: insertNote, update: updateNote, remove: removeNote } = useSupabaseTable("notes", { realtime: true, orderBy: { column: "updated_at", ascending: false } });
  const { data: noteLinks } = useSupabaseTable("note_links");
  const { data: highlights, insert: insertHighlight } = useSupabaseTable("highlights");

  // Feed article counts
  const feedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.filter(a => a.status === "unread").forEach(a => {
      if (a.feed_id) counts[a.feed_id] = (counts[a.feed_id] || 0) + 1;
    });
    return counts;
  }, [articles]);

  const selectedArticleData = articles.find(a => a.id === selectedArticle);
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const filteredContent = useMemo(() => {
    if (!searchContent) return contentItems;
    const q = searchContent.toLowerCase();
    return contentItems.filter(c => c.title.toLowerCase().includes(q) || (c.tags || []).some(t => t.toLowerCase().includes(q)));
  }, [contentItems, searchContent]);

  const filteredNotes = useMemo(() => {
    if (!searchNotes) return notes;
    const q = searchNotes.toLowerCase();
    return notes.filter(n => n.title.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q)));
  }, [notes, searchNotes]);

  // Dialogs
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

  const linkedNoteIds = useMemo(() => {
    if (!selectedNoteId) return [];
    return noteLinks
      .filter(l => l.source_note_id === selectedNoteId || l.target_note_id === selectedNoteId)
      .map(l => l.source_note_id === selectedNoteId ? l.target_note_id : l.source_note_id);
  }, [selectedNoteId, noteLinks]);

  const linkedNotes = notes.filter(n => linkedNoteIds.includes(n.id));

  return (
    <div className="flex h-screen flex-col overflow-hidden p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Contenu & Notes</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-secondary mb-4 self-start">
          <TabsTrigger value="inbox" className="gap-1.5 text-xs"><Rss size={14} /> Inbox RSS</TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5 text-xs"><Library size={14} /> Contenu</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5 text-xs"><FileText size={14} /> Notes</TabsTrigger>
        </TabsList>

        {/* RSS */}
        <TabsContent value="inbox" className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-[200px_1fr_1fr] gap-4">
            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sources ({feeds.length})</p>
              {feeds.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-foreground hover:bg-secondary cursor-pointer">
                  <span className="truncate">{s.name}</span>
                  {(feedCounts[s.id] || 0) > 0 && (
                    <span className="rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary">{feedCounts[s.id]}</span>
                  )}
                </div>
              ))}
              {feeds.length === 0 && <p className="text-xs text-muted-foreground">Aucun flux RSS.</p>}
            </div>
            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              <Input placeholder="Rechercher..." className="mb-3 h-8 text-xs bg-secondary border-none" />
              {articles.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedArticle(a.id)}
                  className={`cursor-pointer rounded-md px-3 py-2.5 mb-1 ${selectedArticle === a.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary border border-transparent"}`}
                >
                  <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{a.author || "—"}</span>
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[a.status]}`}>{statusLabels[a.status]}</span>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <p className="text-xs text-muted-foreground p-2">Aucun article.</p>}
            </div>
            <div className="overflow-auto rounded-lg border border-border bg-card p-6">
              {selectedArticleData ? (
                <>
                  <h2 className="text-lg font-semibold text-foreground mb-1">{selectedArticleData.title}</h2>
                  <p className="text-xs text-muted-foreground mb-4">{selectedArticleData.author}</p>
                  <div className="prose prose-sm prose-invert max-w-[680px] text-foreground leading-relaxed" style={{ fontSize: "15px", lineHeight: "1.65" }}>
                    <p>{selectedArticleData.content || "Contenu non disponible."}</p>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => updateArticle(selectedArticleData.id, { status: "archived" })}>
                      Archiver
                    </Button>
                    {selectedArticleData.url && (
                      <a href={selectedArticleData.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs"><ExternalLink size={14} /> Ouvrir</Button>
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sélectionnez un article</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Content library */}
        <TabsContent value="content" className="flex-1 overflow-auto">
          <div className="mb-4 flex items-center gap-3">
            <Input placeholder="Rechercher..." value={searchContent} onChange={e => setSearchContent(e.target.value)} className="h-8 max-w-xs text-xs bg-secondary border-none" />
            <Dialog open={addContentOpen} onOpenChange={setAddContentOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Ajouter</Button>
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
                      <SelectItem value="cours">Cours</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddContent}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredContent.map(b => (
              <div key={b.id} className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{b.content_type}</p>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[b.status]}`}>{statusLabels[b.status] || b.status}</span>
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {(b.tags || []).map(tag => (
                    <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                  ))}
                </div>
                <div className="mt-2 flex gap-1">
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => removeContent(b.id)}>
                    <Trash2 size={10} />
                  </Button>
                </div>
              </div>
            ))}
            {filteredContent.length === 0 && <p className="text-sm text-muted-foreground col-span-2">Aucun contenu.</p>}
          </div>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-[240px_1fr_240px] gap-4">
            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              <Input placeholder="Rechercher notes..." value={searchNotes} onChange={e => setSearchNotes(e.target.value)} className="mb-3 h-8 text-xs bg-secondary border-none" />
              <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full mb-3 gap-1.5 text-xs"><Plus size={14} /> Nouvelle note</Button>
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
                <div key={n.id} onClick={() => setSelectedNoteId(n.id)} className={`cursor-pointer rounded-md px-3 py-2 mb-1 ${selectedNoteId === n.id ? "bg-primary/10" : "hover:bg-secondary"}`}>
                  <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                  <div className="mt-1 flex gap-1">
                    {(n.tags || []).map(t => <span key={t} className="text-[10px] text-muted-foreground">#{t}</span>)}
                  </div>
                </div>
              ))}
              {filteredNotes.length === 0 && <p className="text-xs text-muted-foreground">Aucune note.</p>}
            </div>

            <div className="overflow-auto rounded-lg border border-border bg-card p-6">
              {selectedNote ? (
                <>
                  <Input
                    value={selectedNote.title}
                    onChange={e => updateNote(selectedNote.id, { title: e.target.value })}
                    className="text-lg font-semibold border-none bg-transparent p-0 mb-4 text-foreground focus-visible:ring-0"
                  />
                  <textarea
                    value={selectedNote.content || ""}
                    onChange={e => updateNote(selectedNote.id, { content: e.target.value })}
                    className="w-full flex-1 resize-none bg-transparent text-sm text-foreground leading-relaxed focus:outline-none min-h-[300px]"
                    style={{ fontSize: "15px", lineHeight: "1.65" }}
                    placeholder="Commencez à écrire..."
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sélectionnez ou créez une note</div>
              )}
            </div>

            <div className="overflow-auto rounded-lg border border-border bg-card p-3">
              {selectedNote && (
                <>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Métadonnées</p>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{selectedNote.note_type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Modifié</span><span className="text-foreground">{new Date(selectedNote.updated_at).toLocaleDateString("fr-FR")}</span></div>
                  </div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(selectedNote.tags || []).map(t => <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>)}
                  </div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Notes liées ({linkedNotes.length})</p>
                  {linkedNotes.map(n => (
                    <p key={n.id} onClick={() => setSelectedNoteId(n.id)} className="text-xs text-primary cursor-pointer mb-1">{n.title}</p>
                  ))}
                  <p className="mt-4 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Graphe</p>
                  <div className="h-32 rounded-md border border-border bg-secondary flex items-center justify-center">
                    <BookOpen size={18} className="text-muted-foreground" />
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
