import React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClass = sizeMap[size];
  const initials = name ? getInitials(name) : "?";

  if (src) {
    return (
      <div className={cn("relative rounded-full overflow-hidden bg-muted", sizeClass, className)}>
        <Image src={src} alt={name ?? "Avatar"} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground select-none",
        sizeClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
