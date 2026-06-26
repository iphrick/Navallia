"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { ClientForm } from "@/components/clients/ClientForm";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { clientStorageService } from "@/services/client-storage.service";

export default function NovoClientePage() {
  const router = useRouter();
  const { createClient } = useClients();
  const { barbershopId } = useAuth();
  const { success, error } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any, photoFile: File | null) => {
    if (!barbershopId) return;
    
    try {
      setIsSubmitting(true);
      // Cria o cliente primeiro para obter o ID
      const newClient = await createClient({
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        birthDate: data.birthDate,
        notes: data.notes,
        favoriteBarberId: data.favoriteBarberId,
        totalAppointments: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        active: true,
      });

      // Se tiver foto, faz o upload e atualiza o cliente
      if (photoFile) {
        const photoUrl = await clientStorageService.uploadPhoto(barbershopId, newClient.id, photoFile);
        // Atualizamos usando o service direto ou usando hook (no hook ele atualiza a lista)
        // Para simplificar, vou chamar a função de update que temos no hook (se existir) 
        // ou precisaremos recarregar. Mas na listagem ele vai puxar denovo
        const { clientService } = await import('@/services/client.service');
        await clientService.updateClient(newClient.id, { photoUrl });
      }

      success("Sucesso", "Cliente cadastrado com sucesso.");
      router.push("/clientes");
    } catch (err) {
      console.error("Erro ao criar cliente:", err);
      error("Erro", "Não foi possível cadastrar o cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Novo Cliente" 
      description="Cadastre um novo cliente na sua barbearia."
    >
      <div className="mt-6">
        <ClientForm onSubmit={handleSubmit} loading={isSubmitting} />
      </div>
    </PageContainer>
  );
}
