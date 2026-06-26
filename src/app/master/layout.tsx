"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Store, CreditCard, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Visão Global", href: "/master/dashboard" },
  { icon: Store, label: "Barbearias", href: "/master/barbearias" },
  { icon: CreditCard, label: "Planos e Receitas", href: "/master/assinaturas" },
];

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== "master") {
      router.push("/dashboard");
    }
  }, [role, loading, router]);

  if (loading || role !== "master") {
    return null; // ou um loader
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans overflow-hidden selection:bg-purple-500/30">
      
      {/* Sidebar do Master */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800/50 flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 tracking-tight">
              SaaS Admin
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Master Control</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
            <Avatar 
              src={user?.photoURL || undefined} 
              name={user?.displayName || "Master"}
              className="h-10 w-10 border border-purple-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.displayName || "Master Admin"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <header className="h-16 flex items-center justify-end px-8 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
           {/* Cabeçalho do Master reservado para futuras ações (ex: Notificações) */}
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
