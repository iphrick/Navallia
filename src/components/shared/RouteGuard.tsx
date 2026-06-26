"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/Loading";

interface RouteGuardProps {
  children: React.ReactNode;
  /**
   * If true, this guard only requires authentication (not a barbershop).
   * Used for the onboarding page itself.
   */
  requiresBarbershop?: boolean;
}

export function RouteGuard({ children, requiresBarbershop = true }: RouteGuardProps) {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated → go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // If master, redirect to master dashboard if not already there
    if (userDoc?.role === "master" && !pathname.startsWith("/master")) {
      router.replace("/master/dashboard");
      return;
    }

    // Authenticated but no barbershop → go to onboarding
    // (unless we're already on the onboarding page or master area)
    if (
      requiresBarbershop &&
      userDoc !== null &&
      !userDoc.barbershopId &&
      pathname !== "/onboarding" &&
      !pathname.startsWith("/master")
    ) {
      router.replace("/onboarding");
      return;
    }
  }, [user, userDoc, loading, router, pathname, requiresBarbershop]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loading size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user) return null;

  // If barbershop required but not set, render nothing (redirect is pending)
  // Exception: allow /onboarding to render so the user can create a barbershop
  if (requiresBarbershop && userDoc !== null && !userDoc.barbershopId && pathname !== "/onboarding") return null;

  return <>{children}</>;
}
