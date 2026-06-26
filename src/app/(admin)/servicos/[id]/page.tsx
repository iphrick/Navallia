"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Star, Clock, DollarSign, Scissors, ListChecks } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { serviceService } from "@/services/service.service";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useAuth } from "@/hooks/useAuth";
import { Service } from "@/types/service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DetalhesServicoPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const { role, barbershopId } = useAuth();
  const { categories } = useServiceCategories();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = role === "owner" || role === "manager";

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceService.getServiceById(serviceId);
        if (data && data.barbershopId === barbershopId) {
          setService(data);
        } else {
          router.push("/servicos");
        }
      } catch (error) {
        console.error(error);
        router.push("/servicos");
      } finally {
        setLoading(false);
      }
    };
    
    if (barbershopId && serviceId) {
      fetchService();
    }
  }, [serviceId, barbershopId, router]);

  if (loading) {
    return <PageContainer title="Carregando..."><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  if (!service) return null;

  const categoryName = categories.find(c => c.id === service.categoryId)?.name || "Sem Categoria";

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatCommission = (type: string, value: number) => {
    if (type === 'percentage') return `${value}%`;
    return formatPrice(value);
  };

  // Mock revenue logic - in future this comes from Agenda
  const mockAppointments = 15;
  const mockRevenue = mockAppointments * service.price;

  return (
    <PageContainer 
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/servicos")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          {canEdit && (
            <Link href={`/servicos/${service.id}/editar`}>
              <Button><Edit className="mr-2 h-4 w-4" /> Editar Serviço</Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Details */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Card className="p-6 bg-white/5 border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {service.name}
                  {service.featured && <span title="Destaque"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /></span>}
                </h2>
                <div className="text-sm text-white/60 mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${service.active ? 'bg-white/10 text-zinc-200' : 'bg-red-500/10 text-red-500'}`}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </span>
                  • {categoryName}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded text-zinc-200">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Preço</p>
                  <p className="text-lg font-bold text-white">{formatPrice(service.price)}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Duração</p>
                  <p className="text-lg font-bold text-white">{service.duration} min</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded text-purple-400">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Comissão</p>
                  <p className="text-lg font-bold text-white">{formatCommission(service.commissionType, service.commissionValue)}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-pink-500/20 p-2 rounded text-pink-400">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Criado em</p>
                  <p className="text-sm font-bold text-white">
                    {service.createdAt ? format(service.createdAt instanceof Date ? service.createdAt : (service.createdAt as any).toDate(), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {service.description && (
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Descrição do Serviço</h3>
                <p className="text-sm text-white/90 whitespace-pre-line bg-white/5 p-4 rounded-lg">{service.description}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Performance Stats (Mocks based on Módulo 4 briefing) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Card className="p-6 bg-white/5 border-white/10 flex-1">
            <h3 className="text-lg font-medium text-white mb-4">Performance do Serviço</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-white/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-white mb-1">{mockAppointments}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider">Atendimentos no Mês</p>
              </div>
              <div className="border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-zinc-200 mb-1">{formatPrice(mockRevenue)}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider">Receita Gerada</p>
              </div>
            </div>

            <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
              <p className="text-sm text-white/50 mb-2">
                Integração completa com a **Agenda** em breve.
              </p>
              <p className="text-xs text-white/40">
                Aqui você verá o gráfico de popularidade e evolução de receita deste serviço ao longo do tempo.
              </p>
            </div>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
}
