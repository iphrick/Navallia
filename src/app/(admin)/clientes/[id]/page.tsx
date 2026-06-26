"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, CalendarDays, DollarSign, Star, TrendingUp, Scissors, History, User } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { clientService } from "@/services/client.service";
import { useClients } from "@/hooks/useClients";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useAuth } from "@/hooks/useAuth";
import { Client } from "@/types/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PerfilClientePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { barbershopId } = useAuth();
  const { clients, loading: loadingClients } = useClients();
  const { profile: loyaltyProfile, loading: loadingLoyalty } = useLoyalty(clientId);
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <PageContainer title="Carregando..."><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  if (!client) return null;

  const averageTicket = client.totalAppointments > 0 ? client.totalSpent / client.totalAppointments : 0;
  const isVip = client.totalSpent >= 1000;

  return (
    <PageContainer 
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/clientes")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Link href={`/clientes/${client.id}/editar`}>
            <Button><Edit className="mr-2 h-4 w-4" /> Editar Cliente</Button>
          </Link>
        </div>
      }
    >
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Profile Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <Card className="p-6 flex flex-col items-center text-center bg-white/5 border-white/10">
            <div className="relative mb-4">
              {client.photoUrl ? (
                <img src={client.photoUrl} alt={client.name} className="h-28 w-28 rounded-full object-cover border-4 border-white/10" />
              ) : (
                <div className="h-28 w-28 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-4xl border-4 border-white/10">
                  {client.name.charAt(0)}
                </div>
              )}
              {isVip && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-yellow-300">
                  ⭐ VIP
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-white">{client.name}</h2>
              {loyaltyProfile && (
                <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${loyaltyProfile.tier === 'vip' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white/10 text-white/50 border-white/20'}`}>
                  {loyaltyProfile.tier}
                </span>
              )}
            </div>
            <div className="text-sm text-white/60 mb-4">{client.email || 'Sem e-mail cadastrado'}</div>
            
            <div className="w-full space-y-3 text-sm text-left border-t border-white/10 pt-4 mt-2">
              <div className="flex justify-between">
                <span className="text-white/50">WhatsApp</span>
                <span className="text-white font-medium">{client.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Telefone</span>
                <span className="text-white font-medium">{client.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Data de Nascimento</span>
                <span className="text-white font-medium">
                  {client.birthDate ? format(new Date(client.birthDate), 'dd/MM/yyyy') : 'Não informada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Cliente desde</span>
                <span className="text-white font-medium">
                  {client.createdAt ? format(client.createdAt instanceof Date ? client.createdAt : (client.createdAt as any).toDate(), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </span>
              </div>
            </div>
          </Card>

          {client.notes && (
            <Card className="p-6 bg-white/5 border-white/10">
              <h3 className="text-sm font-medium text-white/70 mb-2">Observações</h3>
              <p className="text-sm text-white/90 whitespace-pre-line">{client.notes}</p>
            </Card>
          )}
        </div>

        {/* Right Column: Stats & History */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white/5 border-white/10 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Scissors className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Atendimentos</span>
              </div>
              <div className="text-2xl font-bold text-white">{client.totalAppointments}</div>
            </Card>
            
            <Card className="p-4 bg-white/5 border-white/10 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Gasto</span>
              </div>
              <div className="text-2xl font-bold text-zinc-200">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalSpent)}
              </div>
            </Card>

            <Card className="p-4 bg-white/5 border-white/10 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Ticket Médio</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
              </div>
            </Card>

            <Card className="p-4 bg-white/5 border-white/10 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Star className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Pontos Fidelidade</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{client.loyaltyPoints}</div>
            </Card>
          </div>

          {/* History */}
          <Card className="p-6 bg-white/5 border-white/10 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico de Atendimentos
              </h3>
            </div>
            
            <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
              <CalendarDays className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">Integração com Agenda (Módulo 4) será implementada em breve.</p>
              <p className="text-xs text-white/40 mt-1">Aqui você verá os serviços, barbeiro e valor de cada visita.</p>
            </div>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
}
