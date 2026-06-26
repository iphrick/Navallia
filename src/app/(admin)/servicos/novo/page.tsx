"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { ServiceForm } from "@/components/services/ServiceForm";
import { useServices } from "@/hooks/useServices";
import { useToastContext } from "@/contexts/ToastContext";

export default function NovoServicoPage() {
  const router = useRouter();
  const { createService } = useServices();
  const { success, error } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createService(data);
      success("Sucesso", "Serviço cadastrado com sucesso.");
      router.push("/servicos");
    } catch (err) {
      console.error(err);
      error("Erro", "Não foi possível cadastrar o serviço.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Novo Serviço" 
      description="Cadastre um novo serviço na sua barbearia."
    >
      <div className="mt-6">
        <ServiceForm onSubmit={handleSubmit} loading={isSubmitting} />
      </div>
    </PageContainer>
  );
}
