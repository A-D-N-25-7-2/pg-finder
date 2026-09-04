import {
  AlertCircle,
  BarChart3,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Clock3,
  DoorOpen,
  Eye,
  FileText,
  Heart,
  Home,
  Image,
  Info,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

const iconMap = {
  alert: AlertCircle,
  analytics: BarChart3,
  bed: BedDouble,
  booking: CalendarDays,
  check: Check,
  verified: CheckCircle2,
  arrow: ChevronRight,
  profile: CircleUserRound,
  list: ClipboardList,
  pending: Clock3,
  logout: DoorOpen,
  view: Eye,
  file: FileText,
  wishlist: Heart,
  home: Home,
  image: Image,
  info: Info,
  search: Search,
  mail: Mail,
  map: MapPin,
  message: MessageCircle,
  moon: Moon,
  phone: Phone,
  send: Send,
  settings: Settings,
  shield: ShieldCheck,
  rating: Star,
  sun: Sun,
  delete: Trash2,
  users: Users,
  money: Wallet,
  close: X,
};

const AppIcon = ({
  name,
  size = 18,
  strokeWidth = 2,
  className = "",
  fill = "none",
}) => {
  const Icon = iconMap[name] || Info;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      fill={fill}
      className={className}
      aria-hidden="true"
    />
  );
};

export default AppIcon;
