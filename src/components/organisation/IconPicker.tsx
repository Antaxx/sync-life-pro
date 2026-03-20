import { useState, useMemo } from "react";
import {
  Home, Heart, Briefcase, BookOpen, Target, Wallet, Brain, Dumbbell,
  Music, Camera, Palette, Code, Globe, Star, Flame, Zap,
  Coffee, Sun, Moon, Cloud, Compass, Map, Award, Gift,
  Shield, Lock, Key, Bell, Mail, MessageCircle, Phone, Monitor,
  Laptop, Smartphone, Tv, Headphones, Mic, Video, Film, Image,
  FileText, Folder, Archive, Bookmark, Tag, Hash, AtSign, Link2,
  Search, Settings, Wrench, Lightbulb, Battery, Wifi, Bluetooth,
  Clock, Timer, Calendar, CalendarDays, Watch, Hourglass,
  Car, Bus, Train, Plane, Rocket, Ship, Bike, Footprints,
  TreePine, Flower2, Leaf, Mountain, Waves, Droplets, Wind, Snowflake,
  Apple, Cherry, Grape, Pizza, Sandwich, CakeSlice, IceCream, Cookie,
  Dog, Cat, Bird, Fish, Bug, Rabbit, Squirrel,
  Users, UserPlus, UserCheck, Baby, PersonStanding,
  Building, Building2, School, Church, Hospital, Store, Factory, Warehouse,
  Flag, Crown, Trophy, Medal, Gem, Diamond, Sparkles, PartyPopper,
  Pencil, PenTool, Brush, Scissors, Ruler, Eraser,
  Plus, Minus, X, Check, AlertTriangle, Info, HelpCircle, Ban,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, RotateCw,
  Eye, EyeOff, Volume2, VolumeX,
  Smile, Frown, Meh, Laugh, Angry,
  ThumbsUp, ThumbsDown, HandMetal, Handshake,
  CircleDot, Square, Triangle, Hexagon, Octagon, Pentagon,
  Layers, Grid3X3, LayoutGrid, BarChart3, PieChart, TrendingUp, Activity,
  Shirt, Watch as WatchIcon, Glasses, Umbrella, Backpack,
  Gamepad2, Dice1, Puzzle, Drama, Clapperboard,
  Newspaper, Radio, Podcast, Rss, Wifi as WifiIcon2,
  GraduationCap, Library, NotebookPen, Presentation, BookMarked,
  Stethoscope, Pill, Syringe, Thermometer, HeartPulse,
  Banknote, CreditCard, PiggyBank, Receipt, BadgeDollarSign,
  Hammer, HardHat, Shovel, Axe, Drill,
  Truck, Tractor, Construction, TrafficCone,
  Anchor, LifeBuoy, Sailboat,
  Tent, Campfire, Binoculars, Telescope,
  Atom, Dna, FlaskConical, Microscope, TestTube2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Home, Heart, Briefcase, BookOpen, Target, Wallet, Brain, Dumbbell,
  Music, Camera, Palette, Code, Globe, Star, Flame, Zap,
  Coffee, Sun, Moon, Cloud, Compass, Map, Award, Gift,
  Shield, Lock, Key, Bell, Mail, MessageCircle, Phone, Monitor,
  Laptop, Smartphone, Tv, Headphones, Mic, Video, Film, Image,
  FileText, Folder, Archive, Bookmark, Tag, Hash, AtSign, Link2,
  Search, Settings, Wrench, Tool, Lightbulb, Battery, Wifi, Bluetooth,
  Clock, Timer, Calendar, CalendarDays, Alarm, Watch, Hourglass,
  Car, Bus, Train, Plane, Rocket, Ship, Bike, Footprints,
  TreePine, Flower2, Leaf, Mountain, Waves, Droplets, Wind, Snowflake,
  Apple, Cherry, Grape, Pizza, Sandwich, CakeSlice, IceCream, Cookie,
  Dog, Cat, Bird, Fish, Bug, Rabbit, Squirrel,
  Users, UserPlus, UserCheck, Baby, PersonStanding,
  Building, Building2, School, Church, Hospital, Store, Factory, Warehouse,
  Flag, Crown, Trophy, Medal, Gem, Diamond, Sparkles, PartyPopper,
  Pencil, PenTool, Brush, Scissors, Ruler, Eraser,
  Plus, Minus, X, Check, AlertTriangle, Info, HelpCircle, Ban,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, RotateCw,
  Eye, EyeOff, Volume2, VolumeX,
  Smile, Frown, Meh, Laugh, Angry,
  ThumbsUp, ThumbsDown, HandMetal, Handshake,
  CircleDot, Square, Triangle, Hexagon, Octagon, Pentagon,
  Layers, Grid3X3, LayoutGrid, BarChart3, PieChart, TrendingUp, Activity,
  Shirt, Glasses, Umbrella, Backpack,
  Gamepad2, Dice1, Puzzle, Drama, Clapperboard,
  Newspaper, Radio, Podcast, Rss,
  GraduationCap, Library, NotebookPen, Presentation, BookMarked,
  Stethoscope, Pill, Syringe, Thermometer, HeartPulse,
  Banknote, CreditCard, PiggyBank, Receipt, BadgeDollarSign,
  Hammer, HardHat, Shovel, Axe, Drill,
  Truck, Tractor, Construction, TrafficCone,
  Anchor, LifeBuoy, Sailboat,
  Tent, Campfire, Binoculars, Telescope,
  Atom, Dna, FlaskConical, Microscope, TestTube2,
};

export const iconNames = Object.keys(ICON_MAP);

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = "hsl(var(--primary))" }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return iconNames;
    const q = search.toLowerCase();
    return iconNames.filter(n => n.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Rechercher une icône..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-secondary border-none text-sm"
      />
      <ScrollArea className="h-48 rounded-lg border border-border p-2">
        <div className="grid grid-cols-8 gap-1">
          {filtered.map(name => {
            const Icon = ICON_MAP[name];
            const isSelected = value === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  isSelected ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-secondary"
                }`}
                title={name}
              >
                <Icon size={18} style={{ color: isSelected ? color : undefined }} className={isSelected ? "" : "text-muted-foreground"} />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export function RenderIcon({ name, size = 18, color, className }: { name: string; size?: number; color?: string; className?: string }) {
  const Icon = ICON_MAP[name] || CircleDot;
  return <Icon size={size} color={color} className={className} />;
}
