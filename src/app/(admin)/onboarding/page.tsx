"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Scissors,
  Building2,
  Phone,
  MapPin,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { createBarbershop } from "@/services/barbershop.service";
import { uploadLogo, createFilePreview, revokeFilePreview } from "@/services/upload.service";

// ─── Schema ────────────────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(80),
  phone: z.string().min(10, "Telefone inválido").max(20),
  address: z.string().min(5, "Endereço deve ter ao menos 5 caracteres").max(200),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user, userDoc, refreshBarbershop } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  // ─── Logo Handlers ──────────────────────────────────────────────────────────

  const handleLogoSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (logoPreview) revokeFilePreview(logoPreview);
    setLogoFile(file);
    setLogoPreview(createFilePreview(file));
  }, [logoPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoSelect(file);
  };

  const removeLogo = () => {
    if (logoPreview) revokeFilePreview(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user || !userDoc) return;

    try {
      // 1. Create barbershop document
      const barbershop = await createBarbershop(
        {
          name: data.name,
          phone: data.phone,
          address: data.address,
          email: userDoc.email,
        },
        user.uid
      );

      // 2. Upload logo if provided
      if (logoFile && barbershop.id) {
        try {
          const logoUrl = await uploadLogo(logoFile, barbershop.id);
          // Update barbershop with logo URL
          const { updateBarbershop } = await import("@/services/barbershop.service");
          await updateBarbershop(barbershop.id, { logoUrl });
        } catch (uploadErr) {
          console.warn("[Onboarding] Logo upload failed, continuing without logo:", uploadErr);
        }
      }

      // 3. Refresh auth context with new barbershop data
      await refreshBarbershop();

      success("Barbearia criada!", `Bem-vindo, ${data.name}! 🎉`);
      router.replace("/dashboard");
    } catch (err: any) {
      console.error("[Onboarding] Error:", err);
      toastError("Erro ao criar barbearia", err?.message ?? "Tente novamente.");
    }
  };

  // ─── Input Style ────────────────────────────────────────────────────────────

  const inputClass =
    "w-full h-11 rounded-xl border border-white/20 bg-[#0f1520] pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-[#0b0f1a] to-purple-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-blue-700 shadow-xl shadow-blue-600/30">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Configure sua Barbearia</h1>
            <p className="text-sm text-blue-200/60 mt-1.5">
              Preencha as informações para começar a usar o Navallia
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="h-px w-8 bg-white/20" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</div>
            <span className="text-xs text-white/50 ml-1">Cadastro da Barbearia</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

            {/* Logo Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">Logo da Barbearia</label>

              {logoPreview ? (
                <div className="relative flex items-center gap-4 rounded-xl border border-white/20 bg-white/8 p-4">
                  <img
                    src={logoPreview}
                    alt="Preview da logo"
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{logoFile?.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {logoFile ? (logoFile.size / 1024).toFixed(0) + " KB" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-3 transition-all ${
                    isDragging
                      ? "border-primary bg-primary/20"
                      : "border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/8"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/70">
                      <span className="text-primary font-medium">Clique para upload</span> ou arraste aqui
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">PNG, JPG, WEBP — máx. 5MB</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload"
              />
            </div>

            {/* Barbershop Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">
                Nome da Barbearia <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ex: Navallia Barber Shop"
                  className={inputClass}
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">
                Telefone / WhatsApp <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className={inputClass}
                  {...register("phone")}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">
                Endereço <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rua das Navalhas, 42 — São Paulo, SP"
                  className={inputClass}
                  {...register("address")}
                />
              </div>
              {errors.address && <p className="text-xs text-red-400">{errors.address.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-primary/80 hover:to-blue-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando barbearia...
                </>
              ) : (
                <>
                  Criar Minha Barbearia
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/30 mt-4">
          Você poderá editar essas informações depois nas Configurações.
        </p>
      </div>
    </div>
  );
}
