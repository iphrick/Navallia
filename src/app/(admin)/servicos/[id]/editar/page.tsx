"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { ServiceForm } from "@/components/services/ServiceForm";
import { useServices } from "@/hooks/useServices";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { serviceService } from "@/services/service.service";
import { Service } from "@/types/service";

export default function EditarServicoPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  
  const { updateService } = useServices();
  const { barbershopId } = useAuth();
  const { success, error } = useToastContext();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceService.getServiceById(serviceId);
        if (data && data.barbershopId === barbershopId) {
          setService(data);
        } else {
          router.push("/servicos");
        }
      } catch (err) {
        console.error(err);
        router.push("/servicos");
      } finally {
        setLoading(false);
      }
    };
    
    if (barbershopId && serviceId) {
      fetchService();
    }
  }, [serviceId, barbershopId, router]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await updateService(serviceId, data);
      success("Sucesso", "Serviço atualizado com sucesso.");
      router.push("/servicos");
    } catch (err) {
      console.error(err);
      error("Erro", "Não foi possível atualizar o serviço.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageContainer title="Editar Serviço"><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  return (
    <PageContainer 
      title="Editar Serviço" 
      description="Atualize os dados do serviço."
    >
      <div className="mt-6">
        {service && <ServiceForm initialData={service} onSubmit={handleSubmit} loading={isSubmitting} />}
      </div>
    </PageContainer>
  );
}
