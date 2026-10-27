/**
 * Central icon barrel — the ONLY place lucide-react-native is imported from.
 * This enforces a single outline icon family across the app and shields
 * feature code from upstream icon renames.
 *
 * Size conventions:
 *   20px → compact controls (search, filter, in-row icons)
 *   22–24px → bottom navigation & header actions
 *   24px → primary actions
 */
export {
  // Header / navigation
  Menu,
  Bell,
  ChevronDown,
  House,
  FileText,
  MessageSquare,
  LayoutGrid,

  // Controls
  Search,
  ListFilter,
  Filter,
  Plus,
  EllipsisVertical,
  Check,
  Minus,
  X,
  ArrowUpDown,
  Calendar,

  // People & stats
  User,
  Users,
  UserCheck,
  UserX,
  Clock,
  Clock3,
  UserPlus,

  // Row actions
  Eye,
  EyeOff,
  Lock,
  Pencil,
  KeyRound,

  // States
  SearchX,
  TriangleAlert,
  UsersRound,

  // Details & documents
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  CreditCard,
  Download,
  Share2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileCheck,
  ExternalLink,
  File,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Trash2,

  // About page (mission / values glyphs)
  Target,
  Scale,
  ShieldCheck,
  BadgeCheck,
  Award,
  IdCard,
  Crown,
  Heart,
  Leaf,
  UserRound,

  // Finance / accounting & navigation
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  ArrowRight,
  BarChart3,
  Wallet,
  FolderTree,
  RefreshCw,
  RotateCcw,
  Landmark,
  Zap,
  Banknote,
  HeartHandshake,
  SlidersHorizontal,

  // Settings, modules, content & system
  Settings,
  Gift,
  Newspaper,
  BookOpen,
  Receipt,
  Building2,
  Database,
  Wrench,
  HelpCircle,
  Info,
  Tag,
  Key,
  Globe,
  Activity,
  ClipboardList,
  ShieldAlert,
  Smartphone,
  Send,
  Layers,
  Briefcase,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react-native';

/**
 * Icon component contract used by feature code — keeps call sites decoupled
 * from the lucide type surface.
 */
import type { ComponentType } from 'react';

export type AppIconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;
