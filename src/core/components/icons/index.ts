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
  Clock3,
  UserPlus,

  // Row actions
  Eye,
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
  BarChart3,
  Wallet,
  FolderTree,
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
