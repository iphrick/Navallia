"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { AppointmentForm } from "@/components/agenda/AppointmentForm";
import { useAppointments } from "@/hooks/useAppointments";
import { useToastContext } from "@/contexts/ToastContext";
import { Appointment } from "@/types/appointment";

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createAppointment } = useAppointments();
  const { success, error } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form from URL params (clicked on Grid)
  const initialData: Partial<Appointment> = {
    barberId: searchParams.get("barberId") || "",
    startTime: searchParams.get("time") || "09:00",
    date: searchParams.get("date") || new Date().toISOString().split("T")[0],
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createAppointment(data);
      success("Sucesso", "Agendamento criado com sucesso.");
      router.push("/agenda");
    } catch (err: any) {
      console.error(err);
      if (err.message === "CONFLICT") {
         error("Conflito de Horário", "O barbeiro selecionado já possui um agendamento nesse horário.");
      } else {
         error("Erro", "Não foi possível criar o agendamento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Novo Agendamento" 
      description="Selecione o cliente, o serviço e verifique a disponibilidade."
    >
      <div className="mt-6">
        <AppointmentForm 
           initialData={initialData} 
           onSubmit={handleSubmit} 
           loading={isSubmitting} 
        />
      </div>
    </PageContainer>
  );
}
