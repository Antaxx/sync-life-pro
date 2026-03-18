import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useYouTubeWorkspace, YTVideo, YTIdea, YTTask } from "@/hooks/useYouTubeWorkspace";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Youtube, Plus, ThumbsUp, ArrowRight, Calendar, FileText,
  CheckSquare, Users, Star, Loader2, Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PIPELINE_COLS = [
  { key: "idea", label: "💡 Idée", color: "bg-muted" },
  { key: "script", label: "📝 Script", color: "bg-blue-50" },
  { key: "filming", label: "🎬 Tournage", color: "bg-amber-50" },
  { key: "editing", label: "✂️ Montage", color: "bg-purple-50" },
  { key: "published", label: "🚀 Publié", color: "bg-green-50" },
  { key: "archived", label: "📦 Archivé", color: "bg-gray-50" },
];

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning-foreground",
  low: "bg-muted text-muted-foreground",
};

export default function YouTubePage() {
  const { user } = useAuth();
  const yt = useYouTubeWorkspace();
  const [tab, setTab] = useState("pipeline");
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [wsName, setWsName] = useState("Ma chaîne YouTube");
  const [filter, setFilter] = useState("all");

  // New video form
  const [nv, setNv] = useState({ title: "", description: "", priority: "medium", publish_date: "" });
  // New idea form
  const [ni, setNi] = useState({ title: "", description: "", category: "", potential_score: 5 });
  // New task form
  const [nt, setNt] = useState({ title: "", assigned_to: "", due_date: "", priority: "medium", video_id: "" });
  // Script editing
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState("");

  if (yt.loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!yt.workspace) {
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto">
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="text-center">
            <Youtube className="mx-auto text-red-500 mb-2" size={48} />
            <CardTitle className="text-xl">Créer un espace YouTube</CardTitle>
            <p className="text-sm text-muted-foreground">
              Collaborez avec votre équipe sur vos vidéos YouTube
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nom de la chaîne"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
            />
            <Button className="w-full rounded-xl" onClick={() => yt.createWorkspace(wsName)}>
              <Plus size={16} className="mr-2" /> Créer l'espace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMemberEmail = (uid: string | null) => {
    if (!uid) return "Non assigné";
    const m = yt.members.find((m) => m.user_id === uid);
    return m?.email?.split("@")[0] || "Membre";
  };

  const handleAddVideo = async () => {
    await yt.addVideo({ title: nv.title, description: nv.description, priority: nv.priority, publish_date: nv.publish_date || null, status: "idea" });
    setNv({ title: "", description: "", priority: "medium", publish_date: "" });
    setShowNewVideo(false);
  };

  const handleAddIdea = async () => {
    await yt.addIdea({ title: ni.title, description: ni.description, category: ni.category, potential_score: ni.potential_score });
    setNi({ title: "", description: "", category: "", potential_score: 5 });
    setShowNewIdea(false);
  };

  const handleAddTask = async () => {
    await yt.addTask({
      title: nt.title, assigned_to: nt.assigned_to || null,
      due_date: nt.due_date || null, priority: nt.priority,
      video_id: nt.video_id || null,
    });
    setNt({ title: "", assigned_to: "", due_date: "", priority: "medium", video_id: "" });
    setShowNewTask(false);
  };

  const handleSaveScript = async (videoId: string) => {
    const existing = yt.scripts.find((s) => s.video_id === videoId);
    if (existing) {
      await yt.updateScript(existing.id, scriptContent);
    } else {
      await yt.addScript(videoId, scriptContent);
    }
    setEditingScript(null);
  };

  const handleDragStart = (e: React.DragEvent, videoId: string) => {
    e.dataTransfer.setData("videoId", videoId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const videoId = e.dataTransfer.getData("videoId");
    if (videoId) await yt.updateVideo(videoId, { status: newStatus } as any);
    yt.fetchAll();
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Youtube className="text-red-500" size={28} />
            {yt.workspace.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <Users size={14} className="inline mr-1" />
            {yt.members.length} membre{yt.members.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full flex overflow-x-auto no-scrollbar bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="pipeline" className="flex-1 rounded-lg text-xs sm:text-sm">Pipeline</TabsTrigger>
          <TabsTrigger value="ideas" className="flex-1 rounded-lg text-xs sm:text-sm">Idées</TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 rounded-lg text-xs sm:text-sm">Calendrier</TabsTrigger>
          <TabsTrigger value="scripts" className="flex-1 rounded-lg text-xs sm:text-sm">Scripts</TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1 rounded-lg text-xs sm:text-sm">Tâches</TabsTrigger>
        </TabsList>

        {/* PIPELINE */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewVideo} onOpenChange={setShowNewVideo}>
              <DialogTrigger asChild>
                <Button className="rounded-xl"><Plus size={16} className="mr-2" /> Nouvelle vidéo</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Nouvelle vidéo</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Titre" value={nv.title} onChange={(e) => setNv({ ...nv, title: e.target.value })} />
                  <Textarea placeholder="Description" value={nv.description} onChange={(e) => setNv({ ...nv, description: e.target.value })} />
                  <Select value={nv.priority} onValueChange={(v) => setNv({ ...nv, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={nv.publish_date} onChange={(e) => setNv({ ...nv, publish_date: e.target.value })} />
                  <Button className="w-full rounded-xl" onClick={handleAddVideo} disabled={!nv.title}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {PIPELINE_COLS.map((col) => {
              const colVideos = yt.videos.filter((v) => v.status === col.key);
              return (
                <div
                  key={col.key}
                  className={`${col.color} rounded-2xl p-3 min-h-[200px]`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.key)}
                >
                  <h3 className="text-sm font-bold mb-3 text-foreground">{col.label} ({colVideos.length})</h3>
                  <div className="space-y-2">
                    {colVideos.map((v) => (
                      <Card
                        key={v.id}
                        className="rounded-xl shadow-sm cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, v.id)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <p className="text-sm font-semibold truncate">{v.title}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-[10px] ${priorityColors[v.priority]}`}>{v.priority}</Badge>
                            <span className="text-[10px] text-muted-foreground">{getMemberEmail(v.assigned_to)}</span>
                          </div>
                          {v.publish_date && (
                            <p className="text-[10px] text-muted-foreground">
                              📅 {format(new Date(v.publish_date), "dd MMM", { locale: fr })}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* IDEAS */}
        <TabsContent value="ideas" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {["all", "mine", "best"].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Toutes" : f === "mine" ? "Mes idées" : "Meilleures"}
                </Button>
              ))}
            </div>
            <Dialog open={showNewIdea} onOpenChange={setShowNewIdea}>
              <DialogTrigger asChild>
                <Button className="rounded-xl"><Plus size={16} className="mr-2" /> Nouvelle idée</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Nouvelle idée vidéo</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Titre" value={ni.title} onChange={(e) => setNi({ ...ni, title: e.target.value })} />
                  <Textarea placeholder="Description" value={ni.description} onChange={(e) => setNi({ ...ni, description: e.target.value })} />
                  <Input placeholder="Catégorie" value={ni.category} onChange={(e) => setNi({ ...ni, category: e.target.value })} />
                  <div>
                    <label className="text-sm font-medium">Potentiel ({ni.potential_score}/10)</label>
                    <input type="range" min={1} max={10} value={ni.potential_score} onChange={(e) => setNi({ ...ni, potential_score: +e.target.value })} className="w-full accent-primary" />
                  </div>
                  <Button className="w-full rounded-xl" onClick={handleAddIdea} disabled={!ni.title}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {yt.ideas
              .filter((i) => {
                if (filter === "mine") return i.proposed_by === user?.id;
                return true;
              })
              .sort((a, b) => filter === "best" ? b.potential_score - a.potential_score : 0)
              .map((idea) => (
                <Card key={idea.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-foreground">{idea.title}</h3>
                      {idea.category && <Badge variant="secondary" className="rounded-full text-[10px]">{idea.category}</Badge>}
                    </div>
                    {idea.description && <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Star key={i} size={14} className={i < idea.potential_score ? "text-amber-400 fill-amber-400" : "text-muted"} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">{getMemberEmail(idea.proposed_by)}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="rounded-xl text-xs" onClick={() => yt.voteIdea(idea)}>
                          <ThumbsUp size={14} className="mr-1" /> {idea.votes}
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => yt.convertIdeaToVideo(idea)}>
                          <ArrowRight size={14} className="mr-1" /> Pipeline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* CALENDAR */}
        <TabsContent value="calendar" className="space-y-4">
          <CalendarView videos={yt.videos} />
        </TabsContent>

        {/* SCRIPTS */}
        <TabsContent value="scripts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yt.videos.filter(v => v.status !== "archived").map((video) => {
              const script = yt.scripts.find((s) => s.video_id === video.id);
              const isEditing = editingScript === video.id;
              return (
                <Card key={video.id} className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">{video.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] rounded-full">{video.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isEditing ? (
                      <>
                        <Textarea
                          value={scriptContent}
                          onChange={(e) => setScriptContent(e.target.value)}
                          rows={8}
                          placeholder="## Intro&#10;&#10;## Développement&#10;&#10;## Conclusion&#10;&#10;## CTA"
                          className="rounded-xl text-sm"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {scriptContent.split(/\s+/).filter(Boolean).length} mots · ~{Math.ceil(scriptContent.split(/\s+/).filter(Boolean).length / 150)} min
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditingScript(null)}>Annuler</Button>
                            <Button size="sm" className="rounded-xl" onClick={() => handleSaveScript(video.id)}>Sauvegarder</Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {script ? (
                          <div className="bg-muted/50 rounded-xl p-3 text-sm whitespace-pre-wrap max-h-32 overflow-auto">
                            {script.content || "Script vide"}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Aucun script</p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-xs"
                            onClick={() => {
                              setEditingScript(video.id);
                              setScriptContent(script?.content || "## Intro\n\n## Développement\n\n## Conclusion\n\n## CTA");
                            }}
                          >
                            <FileText size={14} className="mr-1" /> {script ? "Modifier" : "Écrire"}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TASKS */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {["all", "mine", "late", "week"].map((f) => (
                <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="rounded-xl text-xs" onClick={() => setFilter(f)}>
                  {f === "all" ? "Toutes" : f === "mine" ? "Mes tâches" : f === "late" ? "En retard" : "Cette semaine"}
                </Button>
              ))}
            </div>
            <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
              <DialogTrigger asChild>
                <Button className="rounded-xl"><Plus size={16} className="mr-2" /> Nouvelle tâche</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Nouvelle tâche YouTube</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Titre" value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })} />
                  <Select value={nt.assigned_to} onValueChange={(v) => setNt({ ...nt, assigned_to: v })}>
                    <SelectTrigger><SelectValue placeholder="Assigner à..." /></SelectTrigger>
                    <SelectContent>
                      {yt.members.map((m) => (
                        <SelectItem key={m.user_id} value={m.user_id}>{m.email?.split("@")[0] || "Membre"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={nt.video_id} onValueChange={(v) => setNt({ ...nt, video_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Vidéo liée (optionnel)" /></SelectTrigger>
                    <SelectContent>
                      {yt.videos.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="date" value={nt.due_date} onChange={(e) => setNt({ ...nt, due_date: e.target.value })} />
                  <Select value={nt.priority} onValueChange={(v) => setNt({ ...nt, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full rounded-xl" onClick={handleAddTask} disabled={!nt.title}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {yt.tasks
              .filter((t) => {
                if (filter === "mine") return t.assigned_to === user?.id;
                if (filter === "late") return t.due_date && new Date(t.due_date) < new Date() && !t.done;
                if (filter === "week") {
                  if (!t.due_date) return false;
                  const d = new Date(t.due_date);
                  const now = new Date();
                  const weekEnd = new Date(now);
                  weekEnd.setDate(weekEnd.getDate() + 7);
                  return d >= now && d <= weekEnd;
                }
                return true;
              })
              .map((task) => (
                <Card key={task.id} className={`rounded-xl shadow-sm ${task.done ? "opacity-50" : ""}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={(checked) => yt.updateTask(task.id, { done: !!checked, status: checked ? "done" : "todo" } as any)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.done ? "line-through" : ""}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{getMemberEmail(task.assigned_to)}</span>
                        {task.due_date && (
                          <span className={`text-[10px] ${new Date(task.due_date) < new Date() && !task.done ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                            📅 {format(new Date(task.due_date), "dd MMM", { locale: fr })}
                          </span>
                        )}
                        <Badge className={`text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                      </div>
                    </div>
                    <Select value={task.status} onValueChange={(v) => yt.updateTask(task.id, { status: v } as any)}>
                      <SelectTrigger className="w-28 h-7 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">À faire</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="done">Fait</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            {yt.tasks.length === 0 && (
              <p className="text-center text-muted-foreground py-12">Aucune tâche pour le moment</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple Calendar View component
function CalendarView({ videos }: { videos: YTVideo[] }) {
  const [month, setMonth] = useState(new Date());
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const statusColors: Record<string, string> = {
    idea: "bg-muted", script: "bg-blue-200", filming: "bg-amber-200",
    editing: "bg-purple-200", published: "bg-green-200", archived: "bg-gray-200",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setMonth(new Date(year, m - 1))}>←</Button>
        <h3 className="font-bold text-foreground">{format(month, "MMMM yyyy", { locale: fr })}</h3>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setMonth(new Date(year, m + 1))}>→</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d} className="text-xs font-bold text-muted-foreground py-2">{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayVideos = videos.filter((v) => v.publish_date === dateStr);
          const isToday = dateStr === new Date().toISOString().split("T")[0];
          return (
            <div key={day} className={`rounded-xl p-1 min-h-[60px] md:min-h-[80px] text-left ${isToday ? "ring-2 ring-primary bg-primary/5" : "bg-card"}`}>
              <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
              <div className="space-y-0.5 mt-1">
                {dayVideos.map((v) => (
                  <div key={v.id} className={`${statusColors[v.status]} rounded px-1 py-0.5`}>
                    <p className="text-[9px] truncate font-medium">{v.title}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
