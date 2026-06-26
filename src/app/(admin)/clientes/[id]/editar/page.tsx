"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { ClientForm } from "@/components/clients/ClientForm";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { clientStorageService } from "@/services/client-storage.service";
import { clientService } from "@/services/client.service";
import { Client } from "@/types/client";

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const { updateClient } = useClients();
  const { barbershopId } = useAuth();
  const { success, error } = useToastContext();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await clientService.getClient(clientId);
        if (data && data.barbershopId === barbershopId) {
          setClient(data);
        } else {
          router.push("/clientes");
        }
      } catch (error) {
        console.error(error);
        router.push("/clientes");
      } finally {
        setLoading(false);
      }
    };
    
    if (barbershopId && clientId) {
      fetchClient();
    }
  }, [clientId, barbershopId, router]);

  const handleSubmit = async (data: any, photoFile: File | null) => {
    if (!barbershopId || !client) return;
    
    try {
      setIsSubmitting(true);
      let photoUrl = client.photoUrl;

      if (photoFile) {
        photoUrl = await clientStorageService.uploadPhoto(barbershopId, client.id, photoFile);
      }

      await updateClient(client.id, {
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        birthDate: data.birthDate,
        notes: data.notes,
        favoriteBarberId: data.favoriteBarberId,
        ...(photoUrl ? { photoUrl } : {})
      });

      success("Sucesso", "Cliente atualizado com sucesso.");
      router.push("/clientes");
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      error("Erro", "Não foi possível atualizar o cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageContainer title="Editar Cliente"><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  return (
    <PageContainer 
      title="Editar Cliente" 
      description="Atualize os dados do cliente."
    >
      <div className="mt-6">
        {client && <ClientForm initialData={client} onSubmit={handleSubmit} loading={isSubmitting} />}
      </div>
    </PageContainer>
  );
}
