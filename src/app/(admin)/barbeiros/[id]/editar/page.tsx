"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { BarberForm } from "@/components/barbers/BarberForm";
import { useBarbers } from "@/hooks/useBarbers";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { barberService } from "@/services/barber.service";
import { barberStorageService } from "@/services/barber-storage.service";
import { Barber } from "@/types/barber";

export default function EditarBarbeiroPage() {
  const router = useRouter();
  const params = useParams();
  const barberId = params.id as string;
  
  const { updateBarber } = useBarbers();
  const { user, barbershopId: authBarbershopId } = useAuth();
  const { success, error } = useToastContext();
  
  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const data = await barberService.getBarberById(barberId);
        if (data && data.barbershopId === authBarbershopId) {
          setBarber(data);
        } else {
          router.push("/barbeiros");
        }
      } catch (err) {
        console.error(err);
        router.push("/barbeiros");
      } finally {
        setLoading(false);
      }
    };
    
    if (authBarbershopId && barberId) {
      fetchBarber();
    }
  }, [barberId, authBarbershopId, router]);

  const handleSubmit = async (data: any, avatarFile: File | null) => {
    if (!authBarbershopId) return;

    try {
      setIsSubmitting(true);
      
      let avatarUrl = data.avatarUrl;
      // Se houver nova foto, faz o upload e pega a URL
      if (avatarFile) {
        avatarUrl = await barberStorageService.uploadAvatar(authBarbershopId, barberId, avatarFile);
      }

      await updateBarber(barberId, { ...data, avatarUrl });
      success("Sucesso", "Dados atualizados com sucesso.");
      router.push("/barbeiros");
    } catch (err) {
      console.error(err);
      error("Erro", "Não foi possível atualizar o barbeiro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageContainer title="Editar Barbeiro"><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  return (
    <PageContainer 
      title="Editar Barbeiro" 
      description="Atualize as informações, especialidades e jornada de trabalho."
    >
      <div className="mt-6">
        {barber && <BarberForm initialData={barber} onSubmit={handleSubmit} loading={isSubmitting} />}
      </div>
    </PageContainer>
  );
}
