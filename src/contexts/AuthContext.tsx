"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import {
  loginUser,
  logoutUser,
  registerUser,
  sendPasswordReset,
  onAuthChange,
  getUserDocument,
} from "@/firebase/auth";
import { getBarbershop } from "@/services/barbershop.service";
import { hasPermission as checkPermission } from "@/lib/permissions";
import { setCurrentBarbershopId } from "@/lib/utils";
import type { LoginData, RegisterData } from "@/firebase/auth";
import type { UserDocument, BarbershopDocument, Permission, UserRole } from "@/types";

// ─── Context Type ──────────────────────────────────────────────────────────────

interface AuthContextValue {
  // Firebase auth user
  user: User | null;
  loading: boolean;

  // Firestore user document
  userDoc: UserDocument | null;

  // Multi-tenant data
  currentBarbershop: BarbershopDocument | null;
  barbershopId: string | null;
  role: UserRole | null;

  // RBAC
  hasPermission: (permission: Permission) => boolean;

  // Auth actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Refresh barbershop data (called after onboarding)
  refreshBarbershop: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [currentBarbershop, setCurrentBarbershop] = useState<BarbershopDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived state
  const barbershopId = userDoc?.barbershopId || null;
  const role = userDoc?.role ?? null;

  // ─── Load user document and barbershop ────────────────────────────────────

  const loadUserData = useCallback(async (firebaseUser: User) => {
    try {
      const doc = await getUserDocument(firebaseUser.uid);
      if (doc) {
        const typedDoc = doc as UserDocument;
        setUserDoc(typedDoc);

        // Sync global helper
        setCurrentBarbershopId(typedDoc.barbershopId || null);

        // Load barbershop if user has one
        if (typedDoc.barbershopId) {
          const shop = await getBarbershop(typedDoc.barbershopId);
          setCurrentBarbershop(shop);
        } else {
          setCurrentBarbershop(null);
        }
      }
    } catch (err) {
      console.error("[AuthContext] Failed to load user data:", err);
    }
  }, []);

  // ─── Auth state listener ──────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Salvar token no cookie para o middleware do Next.js poder ler (SSR)
        try {
          const token = await firebaseUser.getIdToken();
          document.cookie = `__session=${token}; path=/; max-age=86400; SameSite=Strict`;
        } catch (e) {
          console.error("Erro ao gerar token", e);
        }

        await loadUserData(firebaseUser);
      } else {
        // Apagar cookie no logout
        document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUserDoc(null);
        setCurrentBarbershop(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserData]);

  // ─── Refresh barbershop ────────────────────────────────────────────────────

  const refreshBarbershop = useCallback(async () => {
    if (!user) return;
    await loadUserData(user);
  }, [user, loadUserData]);

  // ─── RBAC ─────────────────────────────────────────────────────────────────

  const hasPermissionFn = useCallback(
    (permission: Permission): boolean => {
      return checkPermission(role, permission);
    },
    [role]
  );

  // ─── Auth Actions ──────────────────────────────────────────────────────────

  const login = async (data: LoginData) => {
    await loginUser(data);
  };

  const register = async (data: RegisterData) => {
    await registerUser(data);
  };

  const logout = async () => {
    await logoutUser();
    setUserDoc(null);
    setCurrentBarbershop(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userDoc,
        currentBarbershop,
        barbershopId: barbershopId || null,
        role,
        hasPermission: hasPermissionFn,
        login,
        register,
        logout,
        resetPassword,
        refreshBarbershop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
