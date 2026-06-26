"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Target, CalendarDays, Scissors, DollarSign, Award, TrendingUp } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { barberService } from "@/services/barber.service";
import { useAuth } from "@/hooks/useAuth";
import { Barber, BarberGoal } from "@/types/barber";
import { useToastContext } from "@/contexts/ToastContext";

export default function PerfilBarbeiroPage() {
  const params = useParams();
  const router = useRouter();
  const barberId = params.id as string;
  const { user, role, barbershopId } = useAuth();
  const { success, error } = useToastContext();
  
  const [barber, setBarber] = useState<Barber | null>(null);
  const [currentGoal, setCurrentGoal] = useState<BarberGoal | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal/State for goal setting
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetRevenue, setTargetRevenue] = useState("0");
  const [savingGoal, setSavingGoal] = useState(false);

  const canEdit = role === "owner" || role === "manager" || user?.uid === barberId;
  const canSetGoals = role === "owner" || role === "manager";
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    const fetchData = async () => {
      try {
        const barberData = await barberService.getBarberById(barberId);
        if (barberData && barberData.barbershopId === barbershopId) {
          setBarber(barberData);
          
          // Buscar a meta do mês atual
          const goalData = await barberService.getBarberGoal(barbershopId, barberId, currentMonth);
          setCurrentGoal(goalData);
          if (goalData) setTargetRevenue(goalData.targetRevenue.toString());
        } else {
          router.push("/barbeiros");
        }
      } catch (err) {
        console.error(err);
        router.push("/barbeiros");
      } finally {
        setLoading(false);
      }
    };
    
    if (barbershopId && barberId) {
      fetchData();
    }
  }, [barberId, barbershopId, router, currentMonth]);

  const handleSaveGoal = async () => {
    if (!barbershopId || !targetRevenue) return;
    
    try {
      setSavingGoal(true);
      await barberService.setBarberGoal(barbershopId, barberId, currentMonth, parseFloat(targetRevenue));
      success("Meta definida", "Meta mensal atualizada com sucesso.");
      
      // Atualizar no state
      const updatedGoal = await barberService.getBarberGoal(barbershopId, barberId, currentMonth);
      setCurrentGoal(updatedGoal);
      setIsEditingGoal(false);
    } catch (err) {
      error("Erro", "Falha ao definir meta.");
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return <PageContainer title="Carregando..."><div className="py-10 text-center text-white/50">Carregando dados...</div></PageContainer>;
  }

  if (!barber) return null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const progress = currentGoal && currentGoal.targetRevenue > 0 
    ? Math.min(100, Math.round((currentGoal.currentRevenue / currentGoal.targetRevenue) * 100)) 
    : 0;

  return (
    <PageContainer 
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/barbeiros")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          {canEdit && (
            <Link href={`/barbeiros/${barber.id}/editar`}>
              <Button><Edit className="mr-2 h-4 w-4" /> Editar Perfil</Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="mt-6 flex flex-col xl:flex-row gap-6">
        
        {/* Left Column: Profile & Contact */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <Card className="p-6 bg-white/5 border-white/10 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 border-4 border-white/5 mb-4">
              {barber.avatarUrl ? (
                <img src={barber.avatarUrl} alt={barber.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-4xl font-bold">
                  {barber.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">{barber.name}</h2>
            <p className="text-white/50 mt-1">{barber.email || "Sem e-mail"}</p>
            <p className="text-white/50">{barber.phone || "Sem telefone"}</p>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {barber.specialties.map(sp => (
                <span key={sp} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  {sp}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-zinc-200" /> Grade Horária
            </h3>
            <div className="space-y-3">
              {Object.entries(barber.workSchedule).map(([day, schedule]) => {
                if (!schedule.active) return null;
                const daysMap: Record<string, string> = { monday: "Seg", tuesday: "Ter", wednesday: "Qua", thursday: "Qui", friday: "Sex", saturday: "Sáb", sunday: "Dom" };
                return (
                  <div key={day} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="text-white/70">{daysMap[day]}</span>
                    <span className="text-white font-medium">{schedule.start} às {schedule.end}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Performance, Goals & Stats */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          
          {/* Goal Tracker */}
          <Card className="p-6 bg-white/5 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Target className="h-24 w-24 text-white/5 -rotate-12" />
            </div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-400" /> Meta do Mês ({currentMonth.split('-').reverse().join('/')})
                </h3>
                <p className="text-sm text-white/50 mt-1">Acompanhe o faturamento e objetivo traçado.</p>
              </div>
              {canSetGoals && !isEditingGoal && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingGoal(true)}>Definir Meta</Button>
              )}
            </div>

            {isEditingGoal ? (
              <div className="bg-white/5 p-4 rounded-lg flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <Input 
                    label="Nova Meta de Faturamento (R$)" 
                    type="number" 
                    value={targetRevenue} 
                    onChange={(e) => setTargetRevenue(e.target.value)} 
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsEditingGoal(false)}>Cancelar</Button>
                  <Button onClick={handleSaveGoal} isLoading={savingGoal}>Salvar</Button>
                </div>
              </div>
            ) : (
              <div className="mb-2">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-sm text-white/50 block">Alcançado</span>
                    <span className="text-2xl font-bold text-white">{formatPrice(currentGoal?.currentRevenue || 0)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-white/50 block">Objetivo</span>
                    <span className="text-xl font-bold text-white/70">{formatPrice(currentGoal?.targetRevenue || 0)}</span>
                  </div>
                </div>
                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right mt-2">
                  <span className={`text-sm font-bold ${progress >= 100 ? 'text-zinc-200' : 'text-primary'}`}>
                    {progress}% concluído
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
              <div className="bg-white/10 p-4 rounded-xl text-zinc-200">
                <Scissors className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-white/50 uppercase tracking-wider">Atendimentos</p>
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-xs text-white/40 mt-1">Este mês</p>
              </div>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-xl text-primary">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-white/50 uppercase tracking-wider">Comissão Acumulada</p>
                <p className="text-3xl font-bold text-white">R$ 0,00</p>
                <p className="text-xs text-white/40 mt-1">Estimativa do mês</p>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-white/5 border-white/10 border-dashed text-center py-12">
            <CalendarDays className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Agenda do Barbeiro</h3>
            <p className="text-white/50 max-w-md mx-auto">
              A visualização completa da agenda diária, semanal e mensal do profissional estará disponível no próximo módulo de atualização.
            </p>
          </Card>

        </div>
      </div>
    </PageContainer>
  );
}
