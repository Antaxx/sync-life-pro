import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, Plus, BookOpen, Calendar, ClipboardList,
  Layers, BarChart3, Sparkles, Loader2, Clock, AlertTriangle,
  CheckCircle2, Brain, ArrowRight, RotateCcw,
} from "lucide-react";
import { format, differenceInDays, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface Subject { id: string; user_id: string; name: string; teacher: string | null; color: string; coefficient: number; created_at: string; }
interface Schedule { id: string; user_id: string; subject_id: string; day_of_week: number; start_time: string; end_time: string; room: string | null; recurrent: boolean; type: string; }
interface Homework { id: string; user_id: string; subject_id: string; title: string; description: string | null; due_date: string; type: string; status: string; }
interface Grade { id: string; user_id: string; subject_id: string; title: string; grade: number; max_grade: number; coefficient: number; date: string; }
interface Flashcard { id: string; user_id: string; subject_id: string; question: string; answer: string; difficulty: string; next_review: string; review_count: number; }

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

export default function CoursPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("hub");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [showNewHomework, setShowNewHomework] = useState(false);
  const [showNewGrade, setShowNewGrade] = useState(false);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [showNewFlashcard, setShowNewFlashcard] = useState(false);
  const [ns, setNs] = useState({ name: "", teacher: "", color: "#1a6b3a", coefficient: 1 });
  const [nh, setNh] = useState({ subject_id: "", title: "", description: "", due_date: "", type: "homework" });
  const [ng, setNg] = useState({ subject_id: "", title: "", grade: 0, max_grade: 20, coefficient: 1, date: new Date().toISOString().split("T")[0] });
  const [nsch, setNsch] = useState({ subject_id: "", day_of_week: 0, start_time: "08:00", end_time: "10:00", room: "", type: "cours" });
  const [nfc, setNfc] = useState({ subject_id: "", question: "", answer: "" });

  // Flashcard review state
  const [reviewing, setReviewing] = useState(false);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewSubject, setReviewSubject] = useState("all");

  // Filter
  const [hwFilter, setHwFilter] = useState("all");
  const [hwSubjectFilter, setHwSubjectFilter] = useState("all");

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [s, sc, hw, gr, fc] = await Promise.all([
      supabase.from("subjects").select("*").eq("user_id", user.id) as any,
      supabase.from("schedule").select("*").eq("user_id", user.id) as any,
      supabase.from("homework").select("*").eq("user_id", user.id).order("due_date") as any,
      supabase.from("grades").select("*").eq("user_id", user.id).order("date", { ascending: false }) as any,
      supabase.from("flashcards").select("*").eq("user_id", user.id) as any,
    ]);
    setSubjects(s.data || []);
    setSchedules(sc.data || []);
    setHomeworks(hw.data || []);
    setGrades(gr.data || []);
    setFlashcards(fc.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getSubject = (id: string) => subjects.find((s) => s.id === id);
  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1; // 0=Mon

  const todaySchedule = useMemo(() =>
    schedules.filter(s => s.day_of_week === todayIdx).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [schedules, todayIdx]
  );

  const urgentHomework = useMemo(() =>
    homeworks.filter(h => h.status !== "done").sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 5),
    [homeworks]
  );

  const avgGrades = useMemo(() => {
    if (!grades.length) return 0;
    const totalWeighted = grades.reduce((acc, g) => acc + (g.grade / g.max_grade * 20) * g.coefficient, 0);
    const totalCoeff = grades.reduce((acc, g) => acc + g.coefficient, 0);
    return totalCoeff ? +(totalWeighted / totalCoeff).toFixed(2) : 0;
  }, [grades]);

  const dueFlashcards = useMemo(() =>
    flashcards.filter(f => new Date(f.next_review) <= new Date()),
    [flashcards]
  );

  const gradeColor = (g: number) => g >= 14 ? "text-green-600" : g >= 10 ? "text-amber-600" : "text-destructive";

  // CRUD handlers
  const addSubject = async () => {
    if (!user) return;
    await (supabase.from("subjects") as any).insert({ ...ns, user_id: user.id });
    setNs({ name: "", teacher: "", color: "#1a6b3a", coefficient: 1 });
    setShowNewSubject(false);
    toast({ title: "✓ Matière ajoutée" });
    fetchAll();
  };

  const addHomework = async () => {
    if (!user) return;
    await (supabase.from("homework") as any).insert({ ...nh, user_id: user.id });
    setNh({ subject_id: "", title: "", description: "", due_date: "", type: "homework" });
    setShowNewHomework(false);
    toast({ title: "✓ Devoir ajouté" });
    fetchAll();
  };

  const toggleHomework = async (hw: Homework) => {
    const newStatus = hw.status === "done" ? "todo" : "done";
    await (supabase.from("homework") as any).update({ status: newStatus }).eq("id", hw.id);
    fetchAll();
  };

  const addGrade = async () => {
    if (!user) return;
    await (supabase.from("grades") as any).insert({ ...ng, user_id: user.id });
    setNg({ subject_id: "", title: "", grade: 0, max_grade: 20, coefficient: 1, date: new Date().toISOString().split("T")[0] });
    setShowNewGrade(false);
    toast({ title: "✓ Note ajoutée" });
    fetchAll();
  };

  const addScheduleEntry = async () => {
    if (!user) return;
    await (supabase.from("schedule") as any).insert({ ...nsch, user_id: user.id });
    setNsch({ subject_id: "", day_of_week: 0, start_time: "08:00", end_time: "10:00", room: "", type: "cours" });
    setShowNewSchedule(false);
    toast({ title: "✓ Cours ajouté" });
    fetchAll();
  };

  const addFlashcard = async () => {
    if (!user) return;
    await (supabase.from("flashcards") as any).insert({ ...nfc, user_id: user.id });
    setNfc({ subject_id: "", question: "", answer: "" });
    setShowNewFlashcard(false);
    toast({ title: "✓ Flashcard ajoutée" });
    fetchAll();
  };

  const startReview = () => {
    const cards = reviewSubject === "all" ? dueFlashcards : dueFlashcards.filter(f => f.subject_id === reviewSubject);
    if (!cards.length) { toast({ title: "Aucune carte à réviser" }); return; }
    setReviewCards([...cards].sort(() => Math.random() - 0.5));
    setReviewIdx(0);
    setShowAnswer(false);
    setReviewing(true);
  };

  const answerFlashcard = async (difficulty: "hard" | "correct" | "easy") => {
    const card = reviewCards[reviewIdx];
    const intervals = { hard: 1, correct: 3, easy: 7 };
    const days = intervals[difficulty] * Math.max(1, card.review_count);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    await (supabase.from("flashcards") as any).update({
      next_review: nextReview.toISOString(),
      review_count: card.review_count + 1,
      difficulty,
    }).eq("id", card.id);

    if (reviewIdx + 1 >= reviewCards.length) {
      setReviewing(false);
      toast({ title: "✓ Session terminée !" });
      fetchAll();
    } else {
      setReviewIdx(reviewIdx + 1);
      setShowAnswer(false);
    }
  };

  // Grades per subject for chart
  const gradesBySubject = useMemo(() => {
    const map: Record<string, { total: number; coeff: number; name: string; color: string }> = {};
    grades.forEach(g => {
      const sub = getSubject(g.subject_id);
      if (!sub) return;
      if (!map[g.subject_id]) map[g.subject_id] = { total: 0, coeff: 0, name: sub.name, color: sub.color };
      map[g.subject_id].total += (g.grade / g.max_grade * 20) * g.coefficient;
      map[g.subject_id].coeff += g.coefficient;
    });
    return Object.values(map).map(v => ({ name: v.name, moyenne: +(v.total / v.coeff).toFixed(1), fill: v.color }));
  }, [grades, subjects]);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
        <GraduationCap className="text-primary" size={28} /> Mes Cours
      </h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full flex overflow-x-auto no-scrollbar bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="hub" className="flex-1 rounded-lg text-xs sm:text-sm">Hub</TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 rounded-lg text-xs sm:text-sm">Emploi du temps</TabsTrigger>
          <TabsTrigger value="subjects" className="flex-1 rounded-lg text-xs sm:text-sm">Matières</TabsTrigger>
          <TabsTrigger value="homework" className="flex-1 rounded-lg text-xs sm:text-sm">Devoirs</TabsTrigger>
          <TabsTrigger value="flashcards" className="flex-1 rounded-lg text-xs sm:text-sm">Flashcards</TabsTrigger>
          <TabsTrigger value="results" className="flex-1 rounded-lg text-xs sm:text-sm">Résultats</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 rounded-lg text-xs sm:text-sm">IA ✦</TabsTrigger>
        </TabsList>

        {/* HUB */}
        <TabsContent value="hub" className="space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={<ClipboardList size={20} />} label="Devoirs à rendre" value={homeworks.filter(h => h.status !== "done").length} />
            <MetricCard icon={<Calendar size={20} />} label="Prochain exam" value={
              homeworks.filter(h => h.type === "exam" && h.status !== "done").length
                ? format(new Date(homeworks.filter(h => h.type === "exam" && h.status !== "done")[0]?.due_date || new Date()), "dd MMM", { locale: fr })
                : "—"
            } />
            <MetricCard icon={<BarChart3 size={20} />} label="Moyenne générale" value={avgGrades ? `${avgGrades}/20` : "—"} valueColor={gradeColor(avgGrades)} />
            <MetricCard icon={<Brain size={20} />} label="Flashcards à réviser" value={dueFlashcards.length} />
          </div>

          {/* Today's schedule */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Cours d'aujourd'hui</CardTitle></CardHeader>
            <CardContent>
              {todaySchedule.length ? (
                <div className="space-y-2">
                  {todaySchedule.map(s => {
                    const sub = getSubject(s.subject_id);
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                        <div className="w-1 h-10 rounded-full" style={{ backgroundColor: sub?.color || "#ccc" }} />
                        <div className="flex-1">
                          <p className="text-sm font-bold">{sub?.name}</p>
                          <p className="text-xs text-muted-foreground">{s.room && `${s.room} · `}{sub?.teacher}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</p>
                          <Badge variant="secondary" className="text-[10px] rounded-full">{s.type}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Pas de cours aujourd'hui 🎉</p>
              )}
            </CardContent>
          </Card>

          {/* Urgent homework */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Devoirs urgents</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {urgentHomework.map(hw => {
                const sub = getSubject(hw.subject_id);
                const daysLeft = differenceInDays(new Date(hw.due_date), new Date());
                const urgencyColor = daysLeft < 2 ? "text-destructive" : daysLeft < 5 ? "text-amber-600" : "text-muted-foreground";
                return (
                  <div key={hw.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Checkbox checked={hw.status === "done"} onCheckedChange={() => toggleHomework(hw)} />
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub?.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{hw.title}</p>
                      <p className="text-xs text-muted-foreground">{sub?.name}</p>
                    </div>
                    <span className={`text-xs font-bold ${urgencyColor}`}>
                      {daysLeft < 0 ? "En retard" : daysLeft === 0 ? "Aujourd'hui" : `${daysLeft}j`}
                    </span>
                  </div>
                );
              })}
              {!urgentHomework.length && <p className="text-sm text-muted-foreground text-center py-4">Aucun devoir en attente</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCHEDULE */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewSchedule} onOpenChange={setShowNewSchedule}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus size={16} className="mr-2" /> Ajouter un cours</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Ajouter un cours</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={nsch.subject_id} onValueChange={(v) => setNsch({ ...nsch, subject_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Matière" /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={String(nsch.day_of_week)} onValueChange={(v) => setNsch({ ...nsch, day_of_week: +v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="time" value={nsch.start_time} onChange={(e) => setNsch({ ...nsch, start_time: e.target.value })} />
                    <Input type="time" value={nsch.end_time} onChange={(e) => setNsch({ ...nsch, end_time: e.target.value })} />
                  </div>
                  <Input placeholder="Salle" value={nsch.room} onChange={(e) => setNsch({ ...nsch, room: e.target.value })} />
                  <Select value={nsch.type} onValueChange={(v) => setNsch({ ...nsch, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cours">Cours magistral</SelectItem>
                      <SelectItem value="td">TD</SelectItem>
                      <SelectItem value="seminaire">Séminaire</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full rounded-xl" onClick={addScheduleEntry} disabled={!nsch.subject_id}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Weekly grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 gap-1">
                <div className="text-xs text-muted-foreground p-2" /> {/* corner */}
                {DAYS.map((d, i) => (
                  <div key={d} className={`text-center text-xs font-bold p-2 rounded-t-xl ${i === todayIdx ? "bg-primary/10 text-primary" : ""}`}>{d}</div>
                ))}
                {HOURS.map(h => (
                  <>
                    <div key={`h-${h}`} className="text-[10px] text-muted-foreground text-right pr-2 py-2">{h}:00</div>
                    {DAYS.map((_, dayIdx) => {
                      const entries = schedules.filter(s => s.day_of_week === dayIdx && parseInt(s.start_time) <= h && parseInt(s.end_time) > h);
                      return (
                        <div key={`${h}-${dayIdx}`} className={`min-h-[40px] border-t border-border/30 ${dayIdx === todayIdx ? "bg-primary/5" : ""}`}>
                          {entries.map(e => {
                            const sub = getSubject(e.subject_id);
                            if (parseInt(e.start_time) !== h) return null;
                            const duration = parseInt(e.end_time) - parseInt(e.start_time);
                            return (
                              <div
                                key={e.id}
                                className="rounded-lg p-1.5 text-white text-[10px] leading-tight"
                                style={{ backgroundColor: sub?.color || "#888", minHeight: `${duration * 40}px` }}
                              >
                                <p className="font-bold truncate">{sub?.name}</p>
                                <p className="opacity-80">{e.room}</p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SUBJECTS */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewSubject} onOpenChange={setShowNewSubject}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus size={16} className="mr-2" /> Nouvelle matière</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Nouvelle matière</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nom" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} />
                  <Input placeholder="Professeur" value={ns.teacher} onChange={(e) => setNs({ ...ns, teacher: e.target.value })} />
                  <div className="flex gap-2 items-center">
                    <label className="text-sm">Couleur</label>
                    <input type="color" value={ns.color} onChange={(e) => setNs({ ...ns, color: e.target.value })} className="h-8 w-12 rounded" />
                  </div>
                  <Input type="number" placeholder="Coefficient" value={ns.coefficient} onChange={(e) => setNs({ ...ns, coefficient: +e.target.value })} />
                  <Button className="w-full rounded-xl" onClick={addSubject} disabled={!ns.name}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(sub => {
              const subGrades = grades.filter(g => g.subject_id === sub.id);
              const avg = subGrades.length ? +(subGrades.reduce((a, g) => a + (g.grade / g.max_grade * 20) * g.coefficient, 0) / subGrades.reduce((a, g) => a + g.coefficient, 0)).toFixed(1) : null;
              const pendingHw = homeworks.filter(h => h.subject_id === sub.id && h.status !== "done").length;
              const nextCourse = schedules.filter(s => s.subject_id === sub.id && s.day_of_week >= todayIdx).sort((a, b) => a.day_of_week - b.day_of_week)[0];
              return (
                <Card key={sub.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: sub.color }} />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{sub.name}</h3>
                        <p className="text-xs text-muted-foreground">{sub.teacher || "Pas de prof"}</p>
                      </div>
                      {avg !== null && (
                        <span className={`text-xl font-bold ${gradeColor(avg)}`}>{avg}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {nextCourse && <span>📅 {DAYS[nextCourse.day_of_week]}</span>}
                      {pendingHw > 0 && <span className="text-amber-600">📝 {pendingHw} devoir{pendingHw > 1 ? "s" : ""}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!subjects.length && <p className="text-muted-foreground col-span-full text-center py-8">Ajoutez votre première matière</p>}
          </div>
        </TabsContent>

        {/* HOMEWORK */}
        <TabsContent value="homework" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {["all", "homework", "exam"].map(f => (
                <Button key={f} size="sm" variant={hwFilter === f ? "default" : "outline"} className="rounded-xl text-xs" onClick={() => setHwFilter(f)}>
                  {f === "all" ? "Tout" : f === "homework" ? "Devoirs" : "Examens"}
                </Button>
              ))}
            </div>
            <Dialog open={showNewHomework} onOpenChange={setShowNewHomework}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus size={16} className="mr-2" /> Nouveau devoir</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Nouveau devoir</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={nh.subject_id} onValueChange={(v) => setNh({ ...nh, subject_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Matière" /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Titre" value={nh.title} onChange={(e) => setNh({ ...nh, title: e.target.value })} />
                  <Textarea placeholder="Description" value={nh.description} onChange={(e) => setNh({ ...nh, description: e.target.value })} />
                  <Input type="date" value={nh.due_date} onChange={(e) => setNh({ ...nh, due_date: e.target.value })} />
                  <Select value={nh.type} onValueChange={(v) => setNh({ ...nh, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">Devoir</SelectItem>
                      <SelectItem value="exam">Examen</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full rounded-xl" onClick={addHomework} disabled={!nh.title || !nh.subject_id}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Subject filter pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Button size="sm" variant={hwSubjectFilter === "all" ? "default" : "outline"} className="rounded-full text-xs" onClick={() => setHwSubjectFilter("all")}>Toutes</Button>
            {subjects.map(s => (
              <Button key={s.id} size="sm" variant={hwSubjectFilter === s.id ? "default" : "outline"} className="rounded-full text-xs" onClick={() => setHwSubjectFilter(s.id)}
                style={hwSubjectFilter === s.id ? { backgroundColor: s.color } : {}}>
                {s.name}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {homeworks
              .filter(h => (hwFilter === "all" || h.type === hwFilter) && (hwSubjectFilter === "all" || h.subject_id === hwSubjectFilter))
              .map(hw => {
                const sub = getSubject(hw.subject_id);
                const daysLeft = differenceInDays(new Date(hw.due_date), new Date());
                const urgencyColor = daysLeft < 2 ? "bg-destructive/10" : daysLeft < 5 ? "bg-amber-50" : "";
                return (
                  <Card key={hw.id} className={`rounded-xl shadow-sm ${urgencyColor} ${hw.status === "done" ? "opacity-50" : ""}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Checkbox checked={hw.status === "done"} onCheckedChange={() => toggleHomework(hw)} />
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sub?.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${hw.status === "done" ? "line-through" : ""}`}>{hw.title}</p>
                          <Badge variant="secondary" className="text-[10px] rounded-full">{hw.type === "exam" ? "Examen" : "Devoir"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{sub?.name} · {format(new Date(hw.due_date), "dd MMM yyyy", { locale: fr })}</p>
                      </div>
                      <span className={`text-xs font-bold ${daysLeft < 2 ? "text-destructive" : daysLeft < 5 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {daysLeft < 0 ? "En retard" : daysLeft === 0 ? "Aujourd'hui" : `${daysLeft}j`}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        {/* FLASHCARDS */}
        <TabsContent value="flashcards" className="space-y-4">
          {reviewing ? (
            <div className="max-w-lg mx-auto space-y-4">
              <Progress value={((reviewIdx + 1) / reviewCards.length) * 100} className="rounded-full" />
              <p className="text-xs text-center text-muted-foreground">{reviewIdx + 1} / {reviewCards.length}</p>
              <Card className="rounded-2xl shadow-md min-h-[250px] flex items-center justify-center">
                <CardContent className="p-8 text-center space-y-4">
                  <p className="text-lg font-bold">{reviewCards[reviewIdx].question}</p>
                  {showAnswer ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="h-px bg-border" />
                      <p className="text-base text-muted-foreground">{reviewCards[reviewIdx].answer}</p>
                      <div className="flex gap-3 justify-center pt-4">
                        <Button variant="destructive" className="rounded-xl" onClick={() => answerFlashcard("hard")}>Difficile</Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => answerFlashcard("correct")}>Correct</Button>
                        <Button className="rounded-xl bg-green-600 hover:bg-green-700" onClick={() => answerFlashcard("easy")}>Facile</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="rounded-xl" onClick={() => setShowAnswer(true)}>
                      <RotateCcw size={14} className="mr-2" /> Voir la réponse
                    </Button>
                  )}
                </CardContent>
              </Card>
              <Button variant="ghost" className="w-full" onClick={() => setReviewing(false)}>Quitter la session</Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Select value={reviewSubject} onValueChange={setReviewSubject}>
                  <SelectTrigger className="w-48 rounded-xl"><SelectValue placeholder="Matière" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Dialog open={showNewFlashcard} onOpenChange={setShowNewFlashcard}>
                    <DialogTrigger asChild><Button variant="outline" className="rounded-xl"><Plus size={16} className="mr-2" /> Ajouter</Button></DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader><DialogTitle>Nouvelle flashcard</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <Select value={nfc.subject_id} onValueChange={(v) => setNfc({ ...nfc, subject_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Matière" /></SelectTrigger>
                          <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input placeholder="Question" value={nfc.question} onChange={(e) => setNfc({ ...nfc, question: e.target.value })} />
                        <Textarea placeholder="Réponse" value={nfc.answer} onChange={(e) => setNfc({ ...nfc, answer: e.target.value })} />
                        <Button className="w-full rounded-xl" onClick={addFlashcard} disabled={!nfc.question || !nfc.answer || !nfc.subject_id}>Ajouter</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button className="rounded-xl" onClick={startReview}>
                    <Brain size={16} className="mr-2" /> Réviser ({dueFlashcards.length})
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard icon={<Layers size={20} />} label="Total cartes" value={flashcards.length} />
                <MetricCard icon={<Clock size={20} />} label="À réviser" value={dueFlashcards.length} />
                <MetricCard icon={<CheckCircle2 size={20} />} label="Maîtrisées" value={flashcards.filter(f => f.review_count >= 5).length} />
                <MetricCard icon={<RotateCcw size={20} />} label="Révisions totales" value={flashcards.reduce((a, f) => a + f.review_count, 0)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {flashcards
                  .filter(f => reviewSubject === "all" || f.subject_id === reviewSubject)
                  .slice(0, 12)
                  .map(fc => {
                    const sub = getSubject(fc.subject_id);
                    return (
                      <Card key={fc.id} className="rounded-xl shadow-sm">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub?.color }} />
                            <span className="text-[10px] text-muted-foreground">{sub?.name}</span>
                          </div>
                          <p className="text-sm font-bold">{fc.question}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{fc.answer}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </>
          )}
        </TabsContent>

        {/* RESULTS */}
        <TabsContent value="results" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={showNewGrade} onOpenChange={setShowNewGrade}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus size={16} className="mr-2" /> Ajouter une note</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Ajouter une note</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={ng.subject_id} onValueChange={(v) => setNg({ ...ng, subject_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Matière" /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Titre" value={ng.title} onChange={(e) => setNg({ ...ng, title: e.target.value })} />
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" placeholder="Note" value={ng.grade} onChange={(e) => setNg({ ...ng, grade: +e.target.value })} />
                    <Input type="number" placeholder="Max" value={ng.max_grade} onChange={(e) => setNg({ ...ng, max_grade: +e.target.value })} />
                    <Input type="number" placeholder="Coeff" value={ng.coefficient} onChange={(e) => setNg({ ...ng, coefficient: +e.target.value })} />
                  </div>
                  <Input type="date" value={ng.date} onChange={(e) => setNg({ ...ng, date: e.target.value })} />
                  <Button className="w-full rounded-xl" onClick={addGrade} disabled={!ng.subject_id || !ng.title}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-2xl shadow-sm text-center py-8">
            <p className="text-sm text-muted-foreground">Moyenne générale</p>
            <p className={`text-5xl font-bold ${gradeColor(avgGrades)}`}>{avgGrades || "—"}<span className="text-lg text-muted-foreground">/20</span></p>
          </Card>

          {gradesBySubject.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Moyennes par matière</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradesBySubject}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="moyenne" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Detailed table */}
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Matière</th>
                    <th className="text-left p-3 font-medium">Évaluation</th>
                    <th className="text-center p-3 font-medium">Note</th>
                    <th className="text-center p-3 font-medium">Coeff</th>
                    <th className="text-center p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.slice(0, 20).map(g => {
                    const sub = getSubject(g.subject_id);
                    const normalized = g.grade / g.max_grade * 20;
                    return (
                      <tr key={g.id} className="border-t border-border/30">
                        <td className="p-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub?.color }} />
                          {sub?.name}
                        </td>
                        <td className="p-3">{g.title}</td>
                        <td className={`p-3 text-center font-bold ${gradeColor(normalized)}`}>{g.grade}/{g.max_grade}</td>
                        <td className="p-3 text-center">{g.coefficient}</td>
                        <td className="p-3 text-center text-muted-foreground">{format(new Date(g.date), "dd/MM", { locale: fr })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* AI TAB */}
        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-3">
                <Sparkles className="mx-auto text-primary" size={32} />
                <h3 className="font-bold">Générer des flashcards</h3>
                <p className="text-xs text-muted-foreground">Collez le contenu d'un cours et l'IA génère des cartes de révision</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-3">
                <BookOpen className="mx-auto text-primary" size={32} />
                <h3 className="font-bold">Résumer un cours</h3>
                <p className="text-xs text-muted-foreground">Obtenez un résumé structuré de vos notes de cours</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-3">
                <Calendar className="mx-auto text-primary" size={32} />
                <h3 className="font-bold">Plan de révision</h3>
                <p className="text-xs text-muted-foreground">Créez un plan de révision optimisé avant un examen</p>
              </CardContent>
            </Card>
          </div>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm">
                <Sparkles size={14} className="inline mr-1" />
                L'agent IA sera connecté prochainement pour générer du contenu intelligent.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ icon, label, value, valueColor }: { icon: React.ReactNode; label: string; value: string | number; valueColor?: string }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-lg font-bold ${valueColor || "text-foreground"}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
