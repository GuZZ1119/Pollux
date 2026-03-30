"use client";

import { useState, useEffect } from "react";

interface Props {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-11 h-11 text-sm",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ src, name, size = "md", className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const s = sizeMap[size];
  const initials = getInitials(name);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className={`${s} rounded-full object-cover ${className}`}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${s} rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
