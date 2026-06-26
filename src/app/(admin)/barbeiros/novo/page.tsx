"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { BarberForm } from "@/components/barbers/BarberForm";
import { useBarbers } from "@/hooks/useBarbers";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { barberStorageService } from "@/services/barber-storage.service";
import { barberService } from "@/services/barber.service";

export default function NovoBarbeiroPage() {
  const router = useRouter();
  const { user, barbershopId } = useAuth();
  const { createBarber } = useBarbers();
  const { success, error } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any, avatarFile: File | null) => {
    if (!barbershopId) return;

    try {
      setIsSubmitting(true);
      
      // 1. Criar barbeiro
      const newBarber = await createBarber(data);

      // 2. Upload da foto se houver
      if (avatarFile) {
        const url = await barberStorageService.uploadAvatar(barbershopId, newBarber.id, avatarFile);
        await barberService.updateBarber(newBarber.id, { avatarUrl: url });
      }

      success("Sucesso", "Barbeiro cadastrado com sucesso.");
      router.push("/barbeiros");
    } catch (err) {
      console.error(err);
      error("Erro", "Não foi possível cadastrar o barbeiro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Novo Barbeiro" 
      description="Cadastre um novo profissional na equipe."
    >
      <div className="mt-6">
        <BarberForm onSubmit={handleSubmit} loading={isSubmitting} />
      </div>
    </PageContainer>
  );
}
