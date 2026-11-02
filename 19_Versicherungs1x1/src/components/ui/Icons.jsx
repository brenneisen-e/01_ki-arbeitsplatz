// ===========================================================================
// Icons.jsx — Lucide-Icons, einfarbig (currentColor), Strichstärke 1,75 über
// CSS (svg.lucide). ICON_MAP übersetzt die Icon-Namen aus chapters.json.
//
// Regel für Phase 3: Neue Namen NUR am Ende der ICON_MAP anhängen (vorher
// neu lesen); in eigenen Dateien Icons direkt aus 'lucide-react' importieren.
// ===========================================================================
import {
  BarChart3, Building2, Package, GitBranch, Coins, ShieldCheck,
  Network, Banknote, Scale, Settings2, Rocket, Landmark, Heart,
  Briefcase, Activity, Cpu, Zap, Shield, Clock, RefreshCw,
  TrendingUp, FileText, Eye, Users, Car, Building, Truck,
  Layers, BarChart2, PieChart, Globe, Layout, Home, Info,
  AlertTriangle, Lightbulb, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Check, Search, X, RotateCcw, BookOpen, CheckCircle, LayoutGrid,
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft, ArrowUpRight, AlertCircle, CircleAlert,
  Minus, House, Menu, GraduationCap, Sparkles, Bookmark, BookmarkCheck, Keyboard,
  ExternalLink, ListChecks, CircleCheck, Library, Target, Calendar, Copy, Link,
  Quote, Hash, Award, Compass, Tag, Play, Filter, CornerDownLeft, TrendingDown,
  Circle, CircleDot, BookMarked, Scroll, Percent, Calculator, Timer, MapPin, Star, ThumbsUp,
} from 'lucide-react';

export const ICON_MAP = {
  'bar-chart-3': BarChart3, 'building-2': Building2, 'package': Package,
  'git-branch': GitBranch, 'coins': Coins, 'shield-check': ShieldCheck,
  'network': Network, 'banknote': Banknote, 'scale': Scale,
  'settings-2': Settings2, 'rocket': Rocket, 'landmark': Landmark,
  'heart': Heart, 'briefcase': Briefcase, 'activity': Activity,
  'cpu': Cpu, 'zap': Zap, 'shield': Shield, 'clock': Clock,
  'refresh-cw': RefreshCw, 'trending-up': TrendingUp,
  'file-text': FileText, 'eye': Eye, 'users': Users, 'car': Car,
  'building': Building, 'truck': Truck, 'layers': Layers,
  'bar-chart-2': BarChart2, 'pie-chart': PieChart, 'globe': Globe,
  'layout': Layout, 'home': Home, 'info': Info,
  'alert-triangle': AlertTriangle, 'lightbulb': Lightbulb,
  'alert-circle': AlertCircle,
  // Ergänzungen des Fundaments (Brief §11.10, Datenaudit A.9)
  'x': X, 'book-open': BookOpen, 'minus': Minus, 'check': Check,
  'circle-alert': CircleAlert, 'arrow-up-right': ArrowUpRight, 'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft, 'house': House, 'menu': Menu, 'search': Search,
  'graduation-cap': GraduationCap, 'sparkles': Sparkles, 'bookmark': Bookmark,
  'keyboard': Keyboard, 'external-link': ExternalLink, 'list-checks': ListChecks,
  'circle-check': CircleCheck, 'library': Library, 'target': Target, 'calendar': Calendar,
  'copy': Copy, 'link': Link, 'quote': Quote, 'hash': Hash, 'award': Award,
  'compass': Compass, 'tag': Tag, 'play': Play, 'filter': Filter, 'trending-down': TrendingDown,
  'scroll': Scroll, 'percent': Percent, 'calculator': Calculator, 'timer': Timer,
  'map-pin': MapPin, 'star': Star, 'thumbs-up': ThumbsUp, 'chevron-right': ChevronRight,
  // --- Phase 3: neue Einträge NUR hier unten anhängen ---
};

/** Icon-Bauteil zu einem Datennamen; unbekannt → BarChart3. */
export function getIconComponent(name) {
  return ICON_MAP[name] || BarChart3;
}

/** Deutscher Alias. */
export const ikone = getIconComponent;

export {
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Check, Search, X,
  RotateCcw, BookOpen, CheckCircle, LayoutGrid, ArrowUp, ArrowDown, ArrowRight, ArrowLeft,
  ArrowUpRight, Info, AlertTriangle, AlertCircle, CircleAlert, Lightbulb, Layers, Shield, ShieldCheck,
  BarChart3, Home, House, Minus, Menu, GraduationCap, Sparkles, Bookmark, BookmarkCheck, Keyboard,
  ExternalLink, ListChecks, CircleCheck, Library, Target, Calendar, Copy, Link, Quote, Hash,
  Award, Compass, Tag, Play, Filter, CornerDownLeft, TrendingUp, TrendingDown, Clock, Circle, CircleDot,
  BookMarked, Scroll, Percent, Calculator, Timer, MapPin, Star, ThumbsUp, Users, Globe, Landmark,
};
