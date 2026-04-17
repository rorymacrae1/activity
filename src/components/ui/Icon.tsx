/**
 * Icon System — Centralized icon component using Lucide
 *
 * Lucide provides clean, single-weight line icons that match
 * the premium Airbnb-like aesthetic of PisteWise.
 *
 * @example
 * <Icon name="mountain" size={24} color={colors.ink.rich} />
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import Mountain from "lucide-react-native/dist/cjs/icons/mountain";
import Heart from "lucide-react-native/dist/cjs/icons/heart";
import Target from "lucide-react-native/dist/cjs/icons/target";
import Sparkles from "lucide-react-native/dist/cjs/icons/sparkles";
import Snowflake from "lucide-react-native/dist/cjs/icons/snowflake";
import Plane from "lucide-react-native/dist/cjs/icons/plane";
import Settings from "lucide-react-native/dist/cjs/icons/settings";
import Search from "lucide-react-native/dist/cjs/icons/search";
import ChevronRight from "lucide-react-native/dist/cjs/icons/chevron-right";
import ChevronLeft from "lucide-react-native/dist/cjs/icons/chevron-left";
import MapPin from "lucide-react-native/dist/cjs/icons/map-pin";
import Star from "lucide-react-native/dist/cjs/icons/star";
import Users from "lucide-react-native/dist/cjs/icons/users";
import Calendar from "lucide-react-native/dist/cjs/icons/calendar";
import TrendingUp from "lucide-react-native/dist/cjs/icons/trending-up";
import Compass from "lucide-react-native/dist/cjs/icons/compass";
import Home from "lucide-react-native/dist/cjs/icons/house";
import User from "lucide-react-native/dist/cjs/icons/user";
import LogIn from "lucide-react-native/dist/cjs/icons/log-in";
import Check from "lucide-react-native/dist/cjs/icons/check";
import X from "lucide-react-native/dist/cjs/icons/x";
import Info from "lucide-react-native/dist/cjs/icons/info";
import AlertTriangle from "lucide-react-native/dist/cjs/icons/triangle-alert";
import Car from "lucide-react-native/dist/cjs/icons/car";
import Train from "lucide-react-native/dist/cjs/icons/tram-front";
import Hotel from "lucide-react-native/dist/cjs/icons/hotel";
import Bookmark from "lucide-react-native/dist/cjs/icons/bookmark";
import Wallet from "lucide-react-native/dist/cjs/icons/wallet";
import CircleDollarSign from "lucide-react-native/dist/cjs/icons/circle-dollar-sign";
import Ticket from "lucide-react-native/dist/cjs/icons/ticket";
import CloudSnow from "lucide-react-native/dist/cjs/icons/cloud-snow";
import Wine from "lucide-react-native/dist/cjs/icons/wine";
import MapPinned from "lucide-react-native/dist/cjs/icons/map-pinned";
import Gauge from "lucide-react-native/dist/cjs/icons/gauge";
import UsersRound from "lucide-react-native/dist/cjs/icons/users-round";
import Activity from "lucide-react-native/dist/cjs/icons/activity";
import SlidersHorizontal from "lucide-react-native/dist/cjs/icons/sliders-horizontal";
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
  "sliders-horizontal": SlidersHorizontal,

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
  /** Icon color (default: colors.ink.rich) */
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
  color = colors.ink.rich,
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
  color = colors.ink.rich,
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
