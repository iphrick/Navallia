"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Star,
  Scissors,
  UserCheck,
  CalendarDays,
  DollarSign,
  Package,
  BarChart3,
  MessageCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { NavItem, Permission } from "@/types";

const navItems: NavItem[] = [
  { label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { label: "Clientes",     href: "/clientes",     icon: Users,         permission: "clients.view" },
  { label: "Fidelidade",   href: "/fidelidade",   icon: Star,          permission: "clients.view" },
  { label: "Serviços",     href: "/servicos",     icon: Scissors,      permission: "services.view" },
  { label: "Barbeiros",    href: "/barbeiros",    icon: UserCheck,     permission: "barbers.view" },
  { label: "Agenda",       href: "/agenda",       icon: CalendarDays,  permission: "agenda.view" },
  { label: "Financeiro",   href: "/financeiro",   icon: DollarSign,    permission: "financial.view" },
  { label: "Estoque",      href: "/estoque",      icon: Package,       permission: "stock.view" },
  { label: "Relatórios",   href: "/relatorios",   icon: BarChart3,     permission: "reports.view" },
  { label: "Comunicação",  href: "/comunicacao",  icon: MessageCircle, permission: "clients.view" },
  { label: "Configurações",href: "/configuracoes",icon: Settings,      permission: "settings.manage" },
];

const ROLE_LABELS: Record<string, string> = {
  owner:   "Proprietário",
  manager: "Gerente",
  barber:  "Barbeiro",
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { hasPermission, role, currentBarbershop } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission as Permission);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300 ease-in-out",
          /* industrial bg + right border */
          "border-r border-[#2a2a2a]",
          "w-64 -translate-x-full lg:translate-x-0",
          isOpen && "translate-x-0",
          "lg:static lg:z-auto lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-64"
        )}
        style={{ background: "linear-gradient(180deg, #141414 0%, #111111 100%)" }}
      >
        {/* ── Brand strip ── */}
        <div
          className={cn(
            "flex h-[72px] items-center border-b border-[#2a2a2a] px-4 shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              {/* Scissors icon mark */}
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92400E] shadow-leather shrink-0">
                <Scissors className="h-4 w-4 text-[#F5F5DC]" />
              </div>
              <div>
                <span className="font-display text-base font-bold tracking-widest text-white uppercase">
                  Navallia
                </span>
                <span className="block text-[9px] tracking-[0.2em] text-[#92400E] uppercase font-semibold -mt-0.5">
                  Barbershop System
                </span>
                {currentBarbershop?.name && (
                  <span className="block text-[10px] tracking-wide text-[#A3A3A3] mt-0.5 truncate max-w-[140px]">
                    {currentBarbershop.name}
                  </span>
                )}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92400E]">
              <Scissors className="h-4 w-4 text-[#F5F5DC]" />
            </div>
          )}

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Section label ── */}
        {!collapsed && (
          <div className="px-4 pt-5 pb-2">
            <span className="text-[9px] font-bold tracking-[0.25em] text-[#505050] uppercase">
              Menu Principal
            </span>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {visibleNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "sidebar-item",
                  active ? "sidebar-item-active" : "sidebar-item-inactive",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] flex-shrink-0",
                    active ? "text-[#F5F5DC]" : "text-neutral-500"
                  )}
                />
                {!collapsed && (
                  <span className={cn(
                    "text-sm font-medium",
                    active ? "text-[#F5F5DC]" : ""
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Role badge ── */}
        {!collapsed && role && (
          <div className="px-3 pb-3">
            <div
              className="rounded-lg px-3 py-2.5 text-xs"
              style={{
                background: "rgba(146,64,14,0.08)",
                border: "1px solid rgba(146,64,14,0.2)",
              }}
            >
              <p className="text-[#505050] text-[10px] uppercase tracking-widest mb-0.5">Perfil</p>
              <p className="text-[#A3A3A3] font-medium">
                {ROLE_LABELS[role] ?? role}
              </p>
            </div>
          </div>
        )}

        {/* ── Collapse toggle (desktop) ── */}
        <div
          className="hidden border-t border-[#2a2a2a] p-2 lg:block"
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "sidebar-item sidebar-item-inactive w-full text-neutral-500 hover:text-neutral-200",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
