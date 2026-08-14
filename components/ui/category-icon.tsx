import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  ShoppingCart,
  Fuel,
  Smartphone,
  Repeat,
  User,
  MoreHorizontal,
  Wallet,
  Plane,
  Gift,
  Coffee,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  home: Home,
  clapperboard: Clapperboard,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "shopping-cart": ShoppingCart,
  fuel: Fuel,
  smartphone: Smartphone,
  repeat: Repeat,
  user: User,
  "more-horizontal": MoreHorizontal,
  wallet: Wallet,
  plane: Plane,
  gift: Gift,
  coffee: Coffee,
  dumbbell: Dumbbell,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export function CategoryIcon({
  icon,
  className,
  color,
}: {
  icon: string;
  className?: string;
  color?: string;
}) {
  const Icon = ICON_MAP[icon] ?? MoreHorizontal;
  return <Icon className={cn("h-4 w-4", className)} style={color ? { color } : undefined} />;
}
