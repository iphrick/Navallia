"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  LogOut,
  User,
  ChevronDown,
  Store,
  Upload,
  X,
  Zap,
  Camera,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

const PLAN_LABEL: Record<string, string> = {
  free:       "Grátis",
  basic:      "Basic",
  pro:        "Pro",
  enterprise: "Enterprise",
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, currentBarbershop, userDoc, refreshBarbershop, barbershopId, role } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen]         = React.useState(false);
  const dropdownRef                              = React.useRef<HTMLDivElement>(null);

  // Avatar modal
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [selectedFile, setSelectedFile]             = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl]                 = React.useState<string | null>(null);
  const [uploading, setUploading]                   = React.useState(false);

  // Logo modal
  const [isLogoModalOpen, setIsLogoModalOpen]   = React.useState(false);
  const [logoFile, setLogoFile]                 = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview]           = React.useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo]       = React.useState(false);

  const isOwner = role === "owner" || role === "manager";

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      success("Logout realizado", "Até logo!");
      router.push("/login");
    } catch {
      error("Erro ao sair", "Tente novamente.");
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const closeLogoModal = () => {
    setIsLogoModalOpen(false);
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  };

  const planKey = (currentBarbershop as any)?.plan ?? "free";

  return (
    <>
      <header
        className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[#2a2a2a] px-4 md:px-6"
        style={{ background: "linear-gradient(180deg, #161616 0%, #131313 100%)" }}
      >
        {/* ── Left: hamburger (mobile) ── */}
        <div className="flex items-center w-[120px] md:w-[160px]">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* ── Center: Barbershop identity (CENTERPIECE) ── */}
        <div className="flex-1 flex items-center justify-center">
          {currentBarbershop ? (
            <div className="flex flex-col items-center gap-0.5">
              {/* Logo clicável para upload (só owner/manager) */}
              <div className="relative group">
                {isOwner && (
                  <button
                    onClick={() => setIsLogoModalOpen(true)}
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Alterar logo"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                )}

                {currentBarbershop.logoUrl ? (
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden ring-1 ring-[#92400E]/40">
                    <Image
                      src={currentBarbershop.logoUrl}
                      alt={currentBarbershop.name}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "h-14 w-14 rounded-xl flex items-center justify-center transition-colors",
                      isOwner
                        ? "bg-[#92400E]/20 border border-[#92400E]/30 hover:border-[#92400E]/60 cursor-pointer"
                        : "bg-[#92400E]/20 border border-[#92400E]/30"
                    )}
                    onClick={() => isOwner && setIsLogoModalOpen(true)}
                  >
                    <Store className="h-4 w-4 text-[#92400E]" />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-2 opacity-40">
              <Store className="h-4 w-4 text-neutral-500" />
              <span className="text-xs text-neutral-500 uppercase tracking-widest">Barbearia</span>
            </div>
          )}
        </div>

        {/* ── Right: plan badge + notifications + user ── */}
        <div className="flex items-center justify-end gap-2 w-[120px] md:w-[160px]">
          {currentBarbershop && (
            <span
              className="hidden md:flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
              style={{
                background: "rgba(146,64,14,0.12)",
                border:     "1px solid rgba(146,64,14,0.3)",
                color:      "#D97706",
              }}
            >
              <Zap className="h-2.5 w-2.5" />
              {PLAN_LABEL[planKey] ?? "Pro"}
            </span>
          )}

          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
            <Bell className="h-4 w-4" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/5 transition-colors"
              aria-expanded={dropdownOpen}
            >
              <Avatar
                src={userDoc?.avatarUrl || user?.photoURL}
                name={userDoc?.name || user?.displayName || user?.email || "U"}
                size="sm"
              />
              <ChevronDown
                className={cn(
                  "hidden md:block h-3.5 w-3.5 text-neutral-500 transition-transform",
                  dropdownOpen && "rotate-180"
                )}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#2a2a2a] py-1 shadow-industrial z-50 animate-fade-in"
                style={{ background: "#161616" }}
              >
                <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
                  <p className="text-sm font-semibold text-white truncate">
                    {userDoc?.name || user?.displayName || "Usuário"}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => { router.push("/configuracoes"); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Meu perfil
                </button>
                <button
                  onClick={() => { setIsProfileModalOpen(true); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Alterar foto
                </button>
                {isOwner && (
                  <button
                    onClick={() => { setIsLogoModalOpen(true); setDropdownOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Store className="h-4 w-4" />
                    Alterar logo
                  </button>
                )}
                <div className="my-1 border-t border-[#2a2a2a]" />
                <button
                  onClick={() => { handleLogout(); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Modal: Logo da barbearia ── */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-xl border border-[#2a2a2a] p-6 text-white shadow-industrial space-y-6"
            style={{ background: "#161616" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold tracking-wide uppercase">
                Logo da Barbearia
              </h3>
              <button onClick={closeLogoModal} className="text-neutral-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              {/* Preview */}
              <div
                className="relative h-32 w-32 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: "#1c1c1c", border: "2px solid #2a2a2a" }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="h-full w-full object-contain p-1" />
                ) : currentBarbershop?.logoUrl ? (
                  <img src={currentBarbershop.logoUrl} alt="Logo atual" className="h-full w-full object-contain p-1" />
                ) : (
                  <Store className="h-10 w-10 text-neutral-600" />
                )}
              </div>

              <label
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a2a] hover:border-[#92400E]/40 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                Escolher arquivo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      if (logoPreview) URL.revokeObjectURL(logoPreview);
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              <p className="text-[10px] text-neutral-600">PNG, JPG — fundo preto recomendado</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a2a]">
              <Button variant="outline" onClick={closeLogoModal} disabled={uploadingLogo}>
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!logoFile || !barbershopId) return;
                  try {
                    setUploadingLogo(true);
                    const { resizeImageToBase64 } = await import("@/lib/image-utils");
                    const { updateBarbershop }    = await import("@/services/barbershop.service");

                    const base64 = await resizeImageToBase64(logoFile, 512);
                    await updateBarbershop(barbershopId, { logoUrl: base64 });
                    await refreshBarbershop();
                    success("Logo atualizado", "Logo da barbearia salvo com sucesso.");
                    closeLogoModal();
                  } catch (err: any) {
                    error("Erro ao salvar logo", err.message || "Tente novamente.");
                  } finally {
                    setUploadingLogo(false);
                  }
                }}
                disabled={!logoFile || uploadingLogo}
                isLoading={uploadingLogo}
              >
                Salvar logo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Foto de perfil ── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-xl border border-[#2a2a2a] p-6 text-white shadow-industrial space-y-6"
            style={{ background: "#161616" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold tracking-wide uppercase">
                Alterar Foto de Perfil
              </h3>
              <button onClick={closeProfileModal} className="text-neutral-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-[#92400E]/30 bg-[#1c1c1c] flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : userDoc?.avatarUrl || user?.photoURL ? (
                  <img src={userDoc?.avatarUrl || user?.photoURL || ""} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-neutral-600">
                    {(userDoc?.name ?? "U").substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a2a] hover:border-[#92400E]/40 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer transition-all">
                <Upload className="h-3.5 w-3.5" />
                Escolher arquivo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              <p className="text-[10px] text-neutral-600">PNG, JPG — máx. 2MB</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a2a]">
              <Button variant="outline" onClick={closeProfileModal} disabled={uploading}>
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedFile || !user) return;
                  try {
                    setUploading(true);
                    const { resizeImageToBase64 } = await import("@/lib/image-utils");
                    const { updateUserDocument }  = await import("@/firebase/auth");

                    const base64 = await resizeImageToBase64(selectedFile, 256);
                    await updateUserDocument(user.uid, { avatarUrl: base64 });
                    await refreshBarbershop();
                    success("Foto atualizada", "Foto de perfil alterada com sucesso.");
                    closeProfileModal();
                  } catch (err: any) {
                    error("Erro ao salvar foto", err.message || "Tente novamente.");
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={!selectedFile || uploading}
                isLoading={uploading}
              >
                Salvar foto
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
