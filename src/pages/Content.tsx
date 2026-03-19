import { useState } from "react";
import { Rss, BookOpen, FileText } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import InboxTab from "@/components/content/InboxTab";
import ContentTab from "@/components/content/ContentTab";
import NotesTab from "@/components/content/NotesTab";

const tabs = [
  { key: "inbox", label: "INBOX", icon: Rss },
  { key: "content", label: "CONTENU", icon: BookOpen },
  { key: "notes", label: "NOTES", icon: FileText },
];

export default function Content() {
  const [activeTab, setActiveTab] = useState("inbox");

  const { data: feeds } = useSupabaseTable("rss_feeds", { orderBy: { column: "name", ascending: true } });
  const { data: articles, update: updateArticle } = useSupabaseTable("rss_articles", { orderBy: { column: "created_at", ascending: false } });
  const { data: contentItems, insert: insertContent, remove: removeContent } = useSupabaseTable("content_items", { orderBy: { column: "created_at", ascending: false } });
  const { data: notes, insert: insertNote, update: updateNote, remove: removeNote } = useSupabaseTable("notes", { realtime: true, orderBy: { column: "updated_at", ascending: false } });
  const { data: noteLinks } = useSupabaseTable("note_links");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="h-14 md:h-16 border-b border-border bg-card flex items-center px-4 md:px-6 shrink-0">
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {activeTab === "inbox" && (
        <InboxTab feeds={feeds} articles={articles} updateArticle={updateArticle} />
      )}
      {activeTab === "content" && (
        <ContentTab contentItems={contentItems} insertContent={insertContent} removeContent={removeContent} />
      )}
      {activeTab === "notes" && (
        <NotesTab notes={notes} noteLinks={noteLinks} insertNote={insertNote} updateNote={updateNote} removeNote={removeNote} />
      )}
    </div>
  );
}
