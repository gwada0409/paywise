import React from "react";

export function LoadingSkeleton({
  className = "h-24 w-full",
  count = 1,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl bg-muted/60 dark:bg-muted/30 ${className}`}
        />
      ))}
    </div>
  );
}
