import { useState, useMemo } from "react";
import { Rss, Star, ExternalLink, Archive, ChevronLeft, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InboxTabProps {
  feeds: any[];
  articles: any[];
  updateArticle: (id: string, data: any) => void;
}

export default function InboxTab({ feeds, articles, updateArticle }: InboxTabProps) {
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [articleFilter, setArticleFilter] = useState("unread");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [showReader, setShowReader] = useState(false);

  const feedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.filter(a => a.status === "unread").forEach(a => {
      if (a.feed_id) counts[a.feed_id] = (counts[a.feed_id] || 0) + 1;
    });
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

  const handleSelectArticle = (id: string) => {
    setSelectedArticle(id);
    setShowReader(true);
    // Mark as reading
    const article = articles.find(a => a.id === id);
    if (article && article.status === "unread") {
      updateArticle(id, { status: "reading" });
    }
  };

  const timeAgo = (date: string) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}j`;
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Feed sidebar - Readwise style */}
      <div className="hidden md:flex w-[220px] border-r border-border bg-background flex-col shrink-0 overflow-hidden">
        <div className="p-3 border-b border-border">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">Flux RSS</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <button
            onClick={() => setSelectedFeed(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              !selectedFeed ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Rss size={15} className={!selectedFeed ? "text-primary" : "text-muted-foreground"} />
              <span>Tous les articles</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              !selectedFeed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>{totalUnread}</span>
          </button>

          {feeds.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFeed(f.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedFeed === f.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {f.favicon_url ? (
                  <img src={f.favicon_url} alt="" className="w-4 h-4 rounded-sm shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-primary/20 shrink-0" />
                )}
                <span className="truncate">{f.name}</span>
              </div>
              {(feedCounts[f.id] || 0) > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">{feedCounts[f.id]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Article list - Readwise Reader inspired */}
      <div className={`${showReader ? "hidden md:flex" : "flex"} w-full md:w-[360px] border-r border-border bg-card/50 flex-col shrink-0 overflow-hidden`}>
        <div className="p-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {["unread", "favorites", "archived"].map(f => (
              <button
                key={f}
                onClick={() => setArticleFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  articleFilter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {f === "unread" ? "Non lus" : f === "favorites" ? "Favoris" : "Archives"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredArticles.map(a => {
            const feed = feeds.find(f => f.id === a.feed_id);
            return (
              <div
                key={a.id}
                onClick={() => handleSelectArticle(a.id)}
                className={`px-4 py-3.5 border-b border-border/50 cursor-pointer transition-all ${
                  selectedArticle === a.id
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "hover:bg-secondary/50 border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {feed?.favicon_url ? (
                    <img src={feed.favicon_url} alt="" className="w-3.5 h-3.5 rounded-sm" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-sm bg-primary/15" />
                  )}
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                    {feed?.name || "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0 flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(a.published_at)}
                  </span>
                </div>
                <h4 className={`text-[13px] leading-snug mb-1 line-clamp-2 ${
                  a.status === "unread" ? "font-bold text-foreground" : "font-medium text-foreground/80"
                }`}>{a.title}</h4>
                {a.content && (
                  <p className="text-[11px] text-muted-foreground/70 line-clamp-1 hidden md:block">
                    {a.content.substring(0, 100)}
                  </p>
                )}
              </div>
            );
          })}
          {filteredArticles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Rss size={24} className="mb-2 opacity-30" />
              <p className="text-sm">Aucun article</p>
            </div>
          )}
        </div>
      </div>

      {/* Reader pane - Readwise Reader clean style */}
      <div className={`${showReader ? "flex" : "hidden md:flex"} flex-1 bg-card flex-col overflow-y-auto`}>
        {selectedArticleData ? (
          <div className="w-full max-w-[640px] mx-auto px-5 md:px-10 py-8 md:py-14">
            <button onClick={() => setShowReader(false)} className="md:hidden flex items-center gap-1 text-primary text-sm font-medium mb-6">
              <ChevronLeft size={16} /> Retour
            </button>

            {/* Source & meta */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border/50">
              {selectedFeedData?.favicon_url ? (
                <img src={selectedFeedData.favicon_url} alt="" className="w-5 h-5 rounded-sm" />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-primary/15" />
              )}
              <span className="text-sm font-medium text-muted-foreground">{selectedFeedData?.name}</span>
              {selectedArticleData.author && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-sm text-muted-foreground/70 flex items-center gap-1">
                    <User size={12} /> {selectedArticleData.author}
                  </span>
                </>
              )}
              <span className="text-muted-foreground/40">·</span>
              <span className="text-sm text-muted-foreground/60">
                {selectedArticleData.published_at
                  ? new Date(selectedArticleData.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  : ""}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-[32px] font-bold text-foreground leading-tight mb-8 tracking-[-0.02em]">
              {selectedArticleData.title}
            </h1>

            {/* Content */}
            <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 leading-[1.8]">
              <p>{selectedArticleData.content || "Contenu non disponible."}</p>
            </div>

            {/* Actions bar */}
            <div className="mt-10 pt-6 border-t border-border/50 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-lg"
                onClick={() => updateArticle(selectedArticleData.id, { status: "archived" })}
              >
                <Archive size={14} /> Archiver
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-lg">
                <Star size={14} /> Favori
              </Button>
              {selectedArticleData.url && (
                <a href={selectedArticleData.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
                  <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
                    <ExternalLink size={14} /> Original
                  </Button>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Rss size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Sélectionnez un article</p>
              <p className="text-xs mt-1 opacity-60">pour commencer la lecture</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
