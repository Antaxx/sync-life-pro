import { useState, useEffect } from "react";
import { User, Bell, Globe, Palette, Moon, Sun, Monitor, Camera, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

type Language = "fr" | "en";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("lifesync-language") as Language) || "fr";
  });

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || ""
  );

  const [notifDaily, setNotifDaily] = useState(() => localStorage.getItem("notif-daily") !== "false");
  const [notifStreak, setNotifStreak] = useState(() => localStorage.getItem("notif-streak") !== "false");
  const [notifTasks, setNotifTasks] = useState(() => localStorage.getItem("notif-tasks") !== "false");
  const [notifYoutube, setNotifYoutube] = useState(() => localStorage.getItem("notif-youtube") !== "false");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("lifesync-language", language);
      localStorage.setItem("notif-daily", String(notifDaily));
      localStorage.setItem("notif-streak", String(notifStreak));
      localStorage.setItem("notif-tasks", String(notifTasks));
      localStorage.setItem("notif-youtube", String(notifYoutube));

      if (user && displayName.trim()) {
        await supabase.auth.updateUser({
          data: { display_name: displayName.trim() }
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "system", label: "Système", icon: Monitor },
  ];

  return (
    <div className="flex h-screen flex-col overflow-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground font-medium mt-1 text-sm">Personnalise ton expérience LifeSync.</p>
      </header>

      <div className="flex flex-col gap-6 max-w-2xl">

        {/* PROFIL */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Profil</h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div>
              <p className="font-bold text-foreground">{displayName || "Utilisateur"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Prénom / Pseudo</Label>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ton prénom..."
                className="mt-1 bg-secondary border-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="mt-1 bg-secondary border-none opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié ici.</p>
            </div>
          </div>
        </section>

        {/* APPARENCE */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette size={18} className="text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Apparence</h2>
          </div>

          <Label className="text-sm font-medium text-foreground">Thème</Label>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {themeOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Icon size={20} className={theme === option.value ? "text-primary" : "text-muted-foreground"} />
                  <span className={`text-xs font-bold ${theme === option.value ? "text-primary" : "text-muted-foreground"}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* LANGUE */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe size={18} className="text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Langue</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "fr", label: "Français", flag: "🇫🇷" },
              { value: "en", label: "English", flag: "🇬🇧" },
            ].map(lang => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value as Language)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  language === lang.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className={`text-sm font-bold ${language === lang.value ? "text-primary" : "text-muted-foreground"}`}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell size={18} className="text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: "daily", label: "Résumé quotidien", description: "Un résumé de ta journée chaque matin", value: notifDaily, setter: setNotifDaily },
              { key: "streak", label: "Rappels de streak", description: "Alerte si ton streak est en danger", value: notifStreak, setter: setNotifStreak },
              { key: "tasks", label: "Tâches en retard", description: "Notification si des tâches ne sont pas complétées", value: notifTasks, setter: setNotifTasks },
              { key: "youtube", label: "Chaîne YouTube", description: "Rappels pour le calendrier éditorial", value: notifYoutube, setter: setNotifYoutube },
            ].map(notif => (
              <div key={notif.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div>
                  <p className="text-sm font-bold text-foreground">{notif.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                </div>
                <button
                  onClick={() => notif.setter(!notif.value)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    notif.value ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    notif.value ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SAUVEGARDER */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2"
        >
          {saved ? (
            <><Check size={18} /> Sauvegardé !</>
          ) : saving ? (
            <><Save size={18} /> Sauvegarde...</>
          ) : (
            <><Save size={18} /> Sauvegarder les paramètres</>
          )}
        </Button>

      </div>
    </div>
  );
}
