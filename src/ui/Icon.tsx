import {
  Activity,
  Archive,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  Award,
  Ban,
  Bell,
  Briefcase,
  Calendar,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  CornerUpLeft,
  CreditCard,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  House,
  Inbox,
  Info,
  KeyRound,
  List,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Pause,
  Pen,
  PenLine,
  Phone,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  SkipForward,
  Smartphone,
  Trash2,
  TrendingUp,
  TriangleAlert,
  User,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

/**
 * One icon vocabulary for the web, named like the app's (Feather names, see
 * Leads/src/components/ui/Icon.tsx), so shared code such as describe-event.ts
 * can name icons once for both.
 */
const ICONS = {
  activity: Activity,
  archive: Archive,
  'arrow-right': ArrowRight,
  'arrow-up-down': ArrowUpDown,
  'arrow-up-right': ArrowUpRight,
  award: Award,
  'bar-chart-2': ChartColumn,
  bell: Bell,
  briefcase: Briefcase,
  calendar: Calendar,
  check: Check,
  'check-circle': CircleCheck,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  circle: Circle,
  'alert-circle': CircleAlert,
  clock: Clock,
  copy: Copy,
  'corner-up-left': CornerUpLeft,
  'credit-card': CreditCard,
  'edit-2': Pen,
  'edit-3': PenLine,
  'external-link': ExternalLink,
  eye: Eye,
  'eye-off': EyeOff,
  'file-text': FileText,
  home: House,
  inbox: Inbox,
  info: Info,
  key: KeyRound,
  list: List,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  menu: Menu,
  'message-circle': MessageCircle,
  'message-square': MessageSquare,
  'more-horizontal': Ellipsis,
  pause: Pause,
  phone: Phone,
  play: Play,
  plus: Plus,
  repeat: Repeat,
  'rotate-ccw': RotateCcw,
  search: Search,
  send: Send,
  settings: Settings,
  shield: Shield,
  'skip-forward': SkipForward,
  slash: Ban,
  smartphone: Smartphone,
  'trash-2': Trash2,
  'trending-up': TrendingUp,
  'alert-triangle': TriangleAlert,
  user: User,
  'user-plus': UserPlus,
  users: Users,
  x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 16,
  className,
  strokeWidth = 1.8,
  label,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Set when the icon carries meaning on its own; otherwise it is hidden from screen readers. */
  label?: string;
}) {
  const Component = ICONS[name] ?? Circle;
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable={false}
    />
  );
}
