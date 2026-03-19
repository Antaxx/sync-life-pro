import { useState, useMemo } from "react";
import { Search, Plus, Hash, Link2, FileText, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface NotesTabProps {
  notes: any[];
  noteLinks: any[];
  insertNote: (data: any) => void;
  updateNote: (id: string, data: any) => void;
  removeNote: (id: string) => void;
}

export default function NotesTab({ notes, noteLinks, insertNote, updateNote, removeNote }: NotesTabProps) {
  const [search, setSearch] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const filteredNotes = useMemo(() => {
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter(n => n.title.toLowerCase().includes(q) || (n.tags || []).some((t: string) => t.toLowerCase().includes(q)));
  }, [notes, search]);

  const linkedNoteIds = useMemo(() => {
    if (!selectedNoteId) return [];
    return noteLinks
      .filter(l => l.source_note_id === selectedNoteId || l.target_note_id === selectedNoteId)
      .map(l => l.source_note_id === selectedNoteId ? l.target_note_id : l.source_note_id);
  }, [selectedNoteId, noteLinks]);

  const linkedNotes = notes.filter(n => linkedNoteIds.includes(n.id));

  // All tags for explorer
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(n => (n.tags || []).forEach((t: string) => tags.add(t)));
    return Array.from(tags);
  }, [notes]);

  const handleAdd = async () => {
    if (!newTitle) return;
    await insertNote({ title: newTitle, content: "", tags: [] });
    setNewTitle(""); setAddOpen(false);
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Notes sidebar - Obsidian style */}
      <div className={`${selectedNote ? "hidden md:flex" : "flex"} w-full md:w-[260px] border-r border-border bg-background flex-col shrink-0 overflow-hidden`}>
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-secondary/50 border-none rounded-lg"
            />
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full gap-1.5 bg-primary text-primary-foreground rounded-lg h-8 text-xs">
                <Plus size={14} /> Nouvelle note
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border mx-4">
              <DialogHeader><DialogTitle>Nouvelle note</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Titre de la note" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-secondary border-none" />
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleAdd}>Créer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Notes list */}
          <div className="mb-3">
            <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              Notes ({filteredNotes.length})
            </p>
          </div>
          {filteredNotes.map(n => (
            <button
              key={n.id}
              onClick={() => setSelectedNoteId(n.id)}
              className={`w-full text-left rounded-lg px-3 py-2.5 mb-0.5 transition-colors ${
                selectedNoteId === n.id
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : "hover:bg-secondary border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={13} className={selectedNoteId === n.id ? "text-primary" : "text-muted-foreground/50"} />
                <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
              </div>
              {(n.tags || []).length > 0 && (
                <div className="mt-1 flex gap-1 ml-5">
                  {(n.tags || []).slice(0, 3).map((t: string) => (
                    <span key={t} className="text-[9px] text-primary/60">#{t}</span>
                  ))}
                </div>
              )}
              {n.content && (
                <p className="text-[11px] text-muted-foreground/60 mt-0.5 ml-5 truncate">{n.content.substring(0, 50)}</p>
              )}
            </button>
          ))}
        </div>

        {/* Tags explorer */}
        {allTags.length > 0 && (
          <div className="p-3 border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Note editor - Obsidian style */}
      <div className={`${selectedNote ? "flex" : "hidden md:flex"} flex-1 overflow-auto bg-card flex-col`}>
        {selectedNote ? (
          <div className="max-w-[700px] w-full mx-auto px-5 md:px-10 py-6 md:py-10 flex-1 flex flex-col">
            <button onClick={() => setSelectedNoteId(null)} className="md:hidden flex items-center gap-1 text-primary text-sm font-medium mb-4">
              <ChevronLeft size={16} /> Retour
            </button>

            {/* Note title - Obsidian inline editing */}
            <Input
              value={selectedNote.title}
              onChange={e => updateNote(selectedNote.id, { title: e.target.value })}
              className="text-2xl md:text-3xl font-bold border-none bg-transparent p-0 mb-2 text-foreground focus-visible:ring-0 h-auto tracking-[-0.02em]"
            />

            {/* Tags */}
            {(selectedNote.tags || []).length > 0 && (
              <div className="flex gap-1.5 mb-6">
                {(selectedNote.tags || []).map((t: string) => (
                  <span key={t} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Hash size={10} /> {t}
                  </span>
                ))}
              </div>
            )}

            {/* Content editor */}
            <textarea
              value={selectedNote.content || ""}
              onChange={e => updateNote(selectedNote.id, { content: e.target.value })}
              className="w-full flex-1 resize-none bg-transparent text-foreground leading-[1.9] focus:outline-none min-h-[300px] md:min-h-[400px] text-[15px]"
              placeholder="Commencez à écrire..."
            />

            {/* Backlinks - Obsidian style */}
            {linkedNotes.length > 0 && (
              <div className="mt-8 pt-5 border-t border-border">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                  <Link2 size={12} /> Liens retour ({linkedNotes.length})
                </h4>
                <div className="space-y-1.5">
                  {linkedNotes.map(n => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNoteId(n.id)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-primary/10 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileText size={13} className="text-primary/50" /> {n.title}
                      </p>
                      {n.content && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 ml-5 truncate">{n.content.substring(0, 80)}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Sélectionnez une note</p>
              <p className="text-xs mt-1 opacity-60">ou créez-en une nouvelle</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
