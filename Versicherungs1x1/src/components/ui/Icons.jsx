import {
  BarChart3, Building2, Package, GitBranch, Coins, ShieldCheck,
  Network, Banknote, Scale, Settings2, Rocket, Landmark, Heart,
  Briefcase, Activity, Cpu, Zap, Shield, Clock, RefreshCw,
  TrendingUp, FileText, Eye, Users, Car, Building, Truck,
  Layers, BarChart2, PieChart, Globe, Layout, Home, Info,
  AlertTriangle, Lightbulb, ChevronDown, ChevronLeft, ChevronRight,
  Check, Search, X, RotateCcw, BookOpen, CheckCircle, LayoutGrid,
  ArrowUp, ArrowDown, AlertCircle,
} from 'lucide-react';

const ICON_MAP = {
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
};

export function getIconComponent(name) {
  return ICON_MAP[name] || BarChart3;
}

export {
  ChevronDown, ChevronLeft, ChevronRight, Check, Search, X,
  RotateCcw, BookOpen, CheckCircle, LayoutGrid, ArrowUp, ArrowDown,
  Info, AlertTriangle, Lightbulb, Layers, Shield, ShieldCheck,
  BarChart3, Home,
};
