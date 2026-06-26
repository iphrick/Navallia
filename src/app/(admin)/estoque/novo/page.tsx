"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { ProductForm } from "@/components/stock/ProductForm";
import { useStock } from "@/hooks/useStock";

export default function NovoProdutoPage() {
  const router = useRouter();
  const { addProduct } = useStock();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await addProduct(data);
      router.push("/estoque");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Cadastrar Produto" 
      description="Adicione um novo produto ao catálogo do estoque."
    >
      <div className="mt-6">
        <ProductForm onSubmit={handleSubmit} loading={isSubmitting} />
      </div>
    </PageContainer>
  );
}
