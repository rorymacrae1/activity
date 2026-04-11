/**
 * Icon System — Centralized icon component using Lucide
 *
 * Lucide provides clean, single-weight line icons that match
 * the premium Airbnb-like aesthetic of PisteWise.
 *
 * @example
 * <Icon name="mountain" size={24} color={colors.text.primary} />
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Mountain,
  Heart,
  Target,
  Sparkles,
  Snowflake,
  Plane,
  Settings,
  Search,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Star,
  Users,
  Calendar,
  TrendingUp,
  Compass,
  Home,
  User,
  LogIn,
  Check,
  X,
  Info,
  AlertTriangle,
  Car,
  Train,
  Hotel,
  Bookmark,
  Wallet,
  CircleDollarSign,
  Ticket,
  CloudSnow,
  Wine,
  MapPinned,
  Gauge,
  UsersRound,
  Activity,
  type LucideIcon,
} from "lucide-react-native";
import { colors } from "@/theme/colors";

// ─────────────────────────────────────────────────────────────────────────────
// Icon Registry
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation & Actions
  mountain: Mountain,
  heart: Heart,
  target: Target,
  sparkles: Sparkles,
  snowflake: Snowflake,
  plane: Plane,
  settings: Settings,
  search: Search,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  compass: Compass,
  home: Home,
  user: User,
  "log-in": LogIn,

  // Resort & Location
  "map-pin": MapPin,
  star: Star,
  users: Users,
  calendar: Calendar,
  "trending-up": TrendingUp,

  // Transport & Accommodation
  car: Car,
  train: Train,
  hotel: Hotel,
  bookmark: Bookmark,
  wallet: Wallet,
  "circle-dollar-sign": CircleDollarSign,
  ticket: Ticket,
  "cloud-snow": CloudSnow,
  wine: Wine,
  "map-pinned": MapPinned,
  gauge: Gauge,
  "users-round": UsersRound,
  activity: Activity,

  // Feedback
  check: Check,
  x: X,
  info: Info,
  "alert-triangle": AlertTriangle,
};

export type IconName = keyof typeof ICON_MAP;

// ─────────────────────────────────────────────────────────────────────────────
// Icon Component
// ─────────────────────────────────────────────────────────────────────────────

interface IconProps {
  /** Icon name from the registry */
  name: IconName;
  /** Size in pixels (default: 24) */
  size?: number;
  /** Icon color (default: colors.text.primary) */
  color?: string;
  /** Stroke width (default: 1.5 for premium thin look) */
  strokeWidth?: number;
}

/**
 * Unified icon component using Lucide icons.
 * Provides consistent sizing and premium thin stroke styling.
 */
export function Icon({
  name,
  size = 24,
  color = colors.text.primary,
  strokeWidth = 1.5,
}: IconProps) {
  const LucideIcon = ICON_MAP[name];

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon with Circle Background
// ─────────────────────────────────────────────────────────────────────────────

interface IconCircleProps extends IconProps {
  /** Background color */
  backgroundColor?: string;
  /** Circle size (icon will be 50% of this) */
  circleSize?: number;
}

/**
 * Icon wrapped in a circular background.
 * Useful for buttons, avatars, and badges.
 */
export function IconCircle({
  name,
  color = colors.text.primary,
  backgroundColor = colors.surface.secondary,
  circleSize = 48,
  strokeWidth = 1.5,
}: IconCircleProps) {
  const iconSize = circleSize * 0.5;

  return (
    <View
      style={[
        styles.circle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor,
        },
      ]}
    >
      <Icon
        name={name}
        size={iconSize}
        color={color}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
