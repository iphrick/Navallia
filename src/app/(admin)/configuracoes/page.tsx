import { PageContainer } from "@/components/ui/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Settings } from "lucide-react";
export default function ConfiguracoesPage() {
  return (
    <PageContainer title="Configurações" description="Personalize as configurações do sistema.">
      <EmptyState icon={<Settings className="h-8 w-8" />} title="Configurações em breve" description="Aqui você personalizará todas as configurações da barbearia e do sistema." />
    </PageContainer>
  );
}
