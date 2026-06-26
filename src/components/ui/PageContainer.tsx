import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children:     React.ReactNode;
  className?:   string;
  title?:       string;
  description?: string;
  actions?:     React.ReactNode;
}

export function PageContainer({
  children,
  className,
  title,
  description,
  actions,
}: PageContainerProps) {
  return (
    <main className={cn("page-container animate-fade-in", className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between pb-1">
          <div>
            {title && (
              <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-[#505050] mt-0.5">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">{actions}</div>
          )}
        </div>
      )}

      {/* Industrial divider under page title */}
      {title && <div className="divider-industrial -mt-2" />}

      {children}
    </main>
  );
}
