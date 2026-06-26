"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { TransactionForm } from "@/components/financial/TransactionForm";
import { useFinancial } from "@/hooks/useFinancial";
import { useToastContext } from "@/contexts/ToastContext";
import { ShieldAlert } from "lucide-react";

export default function NovaTransacaoPage() {
  const router = useRouter();
  const { addTransaction, isAuthorized } = useFinancial();
  const { success, error } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthorized) {
    return (
      <PageContainer title="Acesso Negado">
         <div className="flex flex-col items-center justify-center py-20 text-white/50 text-center">
          <ShieldAlert className="w-12 h-12 mb-4 text-red-500/50" />
          <h2 className="text-xl font-bold text-white mb-2">Restrição de Acesso</h2>
        </div>
      </PageContainer>
    );
  }

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await addTransaction(data);
      success("Sucesso", "Lançamento registrado com sucesso.");
      router.push("/financeiro");
    } catch (err) {
      console.error(err);
      error("Erro", "Não foi possível salvar o lançamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Novo Lançamento Financeiro" 
      description="Registre entradas manuais ou despesas do caixa da barbearia."
    >
      <div className="mt-6">
        <TransactionForm onSubmit={handleSubmit} loading={isSubmitting} />
      </div>
    </PageContainer>
  );
}
