"use client";

import {
  FaFolder,
  FaLayerGroup,
  FaTable,
  FaUtensils,
  FaShoppingCart,
  FaClipboardList,
  FaBook,
  FaTruck,
  FaSignOutAlt,
  FaUsers,
  FaStore,
  FaDollarSign,
  FaBox,
  FaRuler,
} from "react-icons/fa";
import { ChefHat, UtensilsCrossed } from "lucide-react";

interface FlaticonIconProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: any;
}

// Map icon paths to fallback icons - using consistent icon library
const fallbackIcons: Record<string, any> = {
  "/icons/flaticon/folder.svg": FaFolder,
  "/icons/flaticon/layer-group.svg": FaLayerGroup,
  "/icons/flaticon/table.svg": FaTable,
  "/icons/flaticon/utensils.svg": FaUtensils,
  "/icons/flaticon/shopping-cart.svg": FaShoppingCart,
  "/icons/flaticon/clipboard-list.svg": FaClipboardList,
  "/icons/flaticon/book.svg": FaBook,
  "/icons/flaticon/truck.svg": FaTruck,
  "/icons/flaticon/sign-out.svg": FaSignOutAlt,
  "/icons/flaticon/users.svg": FaUsers,
  "/icons/flaticon/store.svg": FaStore,
  "/icons/flaticon/dollar-sign.svg": FaDollarSign,
  "/icons/flaticon/box.svg": FaBox,
  "/icons/flaticon/ruler.svg": FaRuler,
  "/icons/flaticon/chef-hat.svg": ChefHat,
  "/icons/flaticon/waiter.svg": UtensilsCrossed,
};

export default function FlaticonIcon({
  src,
  alt,
  className = "",
  fallbackIcon,
}: FlaticonIconProps) {
  // For now, use fallback icons directly for consistency
  // When Flaticon SVG files are added, this will automatically use them
  const FallbackIcon = fallbackIcon || fallbackIcons[src];

  if (FallbackIcon) {
    return (
      <FallbackIcon className={className} style={{ display: "inline-block" }} />
    );
  }

  // If no fallback, try to load as image
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ display: "inline-block" }}
    />
  );
}
