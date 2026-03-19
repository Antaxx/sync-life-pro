import { useState, useMemo } from "react";
import { Search, Plus, Trash2, FileText, Video, Headphones, BookOpen, Hash, Folder, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusLabels: Record<string, string> = {
  unread: "Non lu", reading: "En cours", archived: "Archivé",
  queue: "File d'attente", raw_note: "Note brute", permanent_note: "Note permanente",
};

const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  livre: BookOpen,
  "vidéo": Video,
  podcast: Headphones,
};

interface ContentTabProps {
  contentItems: any[];
  insertContent: (data: any) => void;
  removeContent: (id: string) => void;
}

export default function ContentTab({ contentItems, insertContent, removeContent }: ContentTabProps) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState("article");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const filteredContent = useMemo(() => {
    let list = contentItems;
    if (filterType) list = list.filter(c => c.content_type === filterType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }
    return list;
  }, [contentItems, search, filterType]);

  // Group by type for Obsidian-style tree
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    contentItems.forEach(c => {
      const type = c.content_type || "autre";
      if (!groups[type]) groups[type] = [];
      groups[type].push(c);
    });
    return groups;
  }, [contentItems]);

  // All tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contentItems.forEach(c => (c.tags || []).forEach((t: string) => tags.add(t)));
    return Array.from(tags);
  }, [contentItems]);

  const selectedItemData = contentItems.find(c => c.id === selectedItem);

  const handleAdd = async () => {
    if (!newTitle) return;
    await insertContent({ title: newTitle, url: newUrl || null, content_type: newType });
    setNewTitle(""); setNewUrl(""); setAddOpen(false);
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Obsidian-style file explorer sidebar */}
      <div className="hidden md:flex w-[240px] border-r border-border bg-background flex-col shrink-0 overflow-hidden">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-secondary/50 border-none rounded-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* File tree by type */}
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = typeIcons[type] || FileText;
            return (
              <div key={type} className="mb-1">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <Folder size={13} className="text-primary/60" />
                  <span>{type}</span>
                  <span className="ml-auto text-[10px] opacity-50">{items.length}</span>
                </div>
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item.id)}
                    className={`w-full flex items-center gap-2 px-3 pl-6 py-1.5 text-sm rounded-md transition-colors text-left ${
                      selectedItem === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-secondary"
                    }`}
                  >
                    <Icon size={13} className="shrink-0 opacity-50" />
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            );
          })}

          {/* Tags section */}
          {allTags.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                <Hash size={13} className="text-primary/60" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1 px-2 mt-1">
                {allTags.map(tag => (
                  <span key={tag} className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full cursor-pointer hover:bg-primary/20">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add button */}
        <div className="p-2 border-t border-border">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full gap-1.5 bg-primary text-primary-foreground rounded-lg h-8 text-xs">
                <Plus size={14} /> Nouveau contenu
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border mx-4">
              <DialogHeader><DialogTitle>Ajouter du contenu</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Titre" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-secondary border-none" />
                <Input placeholder="URL (optionnel)" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="bg-secondary border-none" />
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="bg-secondary border-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="livre">Livre</SelectItem>
                    <SelectItem value="vidéo">Vidéo</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleAdd}>Ajouter</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main content area - Obsidian style */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile: show list or detail */}
        {!selectedItemData ? (
          <div className="flex-1 overflow-auto">
            {/* Mobile add button */}
            <div className="md:hidden p-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border rounded-xl" />
              </div>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground gap-1.5 shrink-0"><Plus size={14} /></Button>
                </DialogTrigger>
              </Dialog>
            </div>

            {/* Grid/list of items */}
            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredContent.map(b => {
                const Icon = typeIcons[b.content_type] || FileText;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedItem(b.id)}
                    className="bg-card p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{b.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {b.content_type}{b.author ? ` · ${b.author}` : ""}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase shrink-0">
                        {statusLabels[b.status] || b.status}
                      </span>
                    </div>
                    {(b.tags || []).length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-3 ml-12">
                        {(b.tags || []).map((tag: string) => (
                          <span key={tag} className="text-[10px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredContent.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BookOpen size={28} className="mb-2 opacity-20" />
                  <p className="text-sm">Aucun contenu</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detail view - Obsidian note style */
          <div className="flex-1 overflow-auto bg-card">
            <div className="max-w-[700px] mx-auto px-5 md:px-10 py-8 md:py-12">
              <button onClick={() => setSelectedItem(null)} className="flex items-center gap-1 text-muted-foreground hover:text-primary text-sm mb-6 transition-colors">
                <ChevronRight size={14} className="rotate-180" /> Retour à la bibliothèque
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                  {selectedItemData.content_type}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase">
                  {statusLabels[selectedItemData.status] || selectedItemData.status}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-[-0.02em]">
                {selectedItemData.title}
              </h1>

              {selectedItemData.author && (
                <p className="text-sm text-muted-foreground mb-6">par {selectedItemData.author}</p>
              )}

              {selectedItemData.description && (
                <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-sm text-foreground/80 leading-relaxed">
                  {selectedItemData.description}
                </div>
              )}

              {selectedItemData.url && (
                <a href={selectedItemData.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6">
                  Ouvrir le lien <ChevronRight size={14} />
                </a>
              )}

              {(selectedItemData.tags || []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-4 pt-4 border-t border-border">
                  {(selectedItemData.tags || []).map((tag: string) => (
                    <span key={tag} className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-border flex justify-end">
                <button onClick={() => { removeContent(selectedItemData.id); setSelectedItem(null); }}
                  className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 text-sm">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
