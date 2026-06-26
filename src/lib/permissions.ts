import type { Permission, UserRole } from "@/types";

// ─── Permission Map ────────────────────────────────────────────────────────────

/**
 * RBAC Permission Map.
 * Each role has a set of allowed permissions.
 * Owner has all permissions.
 */
const PERMISSIONS: Record<UserRole, Permission[]> = {
  master: [
    "barbershop.delete",
    "barbershop.manage",
    "plan.manage",
    "clients.view",
    "clients.manage",
    "services.view",
    "services.manage",
    "agenda.view",
    "agenda.manage",
    "financial.view",
    "financial.manage",
    "reports.view",
    "settings.manage",
    "barbers.view",
    "barbers.manage",
    "stock.view",
    "stock.manage",
    "appointments.view",
    "appointments.own",
    "appointments.manage",
  ],

  owner: [
    "barbershop.delete",
    "barbershop.manage",
    "plan.manage",
    "clients.view",
    "clients.manage",
    "services.view",
    "services.manage",
    "agenda.view",
    "agenda.manage",
    "financial.view",
    "financial.manage",
    "reports.view",
    "settings.manage",
    "barbers.view",
    "barbers.manage",
    "stock.view",
    "stock.manage",
    "appointments.view",
    "appointments.own",
    "appointments.manage",
  ],

  manager: [
    "clients.view",
    "clients.manage",
    "services.view",
    "services.manage",
    "agenda.view",
    "agenda.manage",
    "financial.view",
    "financial.manage",
    "reports.view",
    "barbers.view",
    "stock.view",
    "stock.manage",
    "appointments.view",
    "appointments.manage",
  ],

  barber: [
    "clients.view",
    "agenda.view",
    "appointments.view",
    "appointments.own",
    "barbers.view",
  ],
};

// ─── hasPermission ─────────────────────────────────────────────────────────────

/**
 * Checks if a given role has a specific permission.
 *
 * Usage:
 * ```ts
 * hasPermission("manager", "financial.view") // true
 * hasPermission("barber", "barbershop.delete") // false
 * ```
 */
export const hasPermission = (role: UserRole | null, permission: Permission): boolean => {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(permission) ?? false;
};

/**
 * Returns all permissions for a given role.
 */
export const getPermissions = (role: UserRole | null): Permission[] => {
  if (!role) return [];
  return PERMISSIONS[role] ?? [];
};

/**
 * Checks if a role is at least as privileged as a minimum required role.
 * Hierarchy: owner > manager > barber
 */
export const hasMinRole = (role: UserRole | null, minRole: UserRole): boolean => {
  if (!role) return false;
  const hierarchy: Record<UserRole, number> = {
    barber: 1,
    manager: 2,
    owner: 3,
    master: 4,
  };
  return hierarchy[role] >= hierarchy[minRole];
};

// ─── Role Labels ───────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  master: "Administrador Geral",
  owner: "Proprietário",
  manager: "Gerente",
  barber: "Barbeiro",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  master: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  owner: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-primary",
  manager: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  barber: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
};
