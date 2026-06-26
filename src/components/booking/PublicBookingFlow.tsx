"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday, parse, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Calendar, Clock, Scissors, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { publicService } from "@/services/public.service";
import { Service } from "@/types/service";
import { Barber } from "@/types/barber";
import { appointmentService } from "@/services/appointment.service";

interface PublicBookingFlowProps {
  barbershopId: string;
  barbershopName: string;
}

export function PublicBookingFlow({ barbershopId, barbershopName }: PublicBookingFlowProps) {
  const [step, setStep] = useState(1);
  
  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load Services and Barbers on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [svcs, bbrs] = await Promise.all([
          publicService.getPublicServices(barbershopId),
          publicService.getPublicBarbers(barbershopId)
        ]);
        setServices(svcs);
        setBarbers(bbrs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [barbershopId]);

  // Load timeslots when Date and Barber are selected
  useEffect(() => {
    if (selectedDate && selectedBarber && selectedService) {
      const loadSlots = async () => {
        // In a real scenario, we calculate based on workSchedule and existing appointments.
        // For this demo, we'll generate 30min slots between 09:00 and 18:00 and remove existing ones.
        const apps = await appointmentService.getAppointmentsByDate(barbershopId, selectedDate);
        const bookedTimes = apps.filter(a => a.barberId === selectedBarber.id).map(a => a.startTime);
        
        const slots = [];
        let current = parse("09:00", "HH:mm", new Date());
        const end = parse("18:00", "HH:mm", new Date());

        while (current < end) {
          const timeString = format(current, "HH:mm");
          if (!bookedTimes.includes(timeString)) {
            slots.push(timeString);
          }
          current = addMinutes(current, 30);
        }
        setAvailableSlots(slots);
      };
      loadSlots();
    }
  }, [selectedDate, selectedBarber, selectedService, barbershopId]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !clientName || !clientPhone) return;

    setSubmitting(true);
    try {
      const endTimeString = format(
        addMinutes(parse(selectedTime, "HH:mm", new Date()), selectedService.duration),
        "HH:mm"
      );

      await publicService.createPublicAppointment(
        barbershopId,
        selectedBarber.id,
        selectedService.id,
        selectedService.price,
        selectedDate,
        selectedTime,
        endTimeString,
        clientName,
        clientPhone
      );
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white/50">Carregando horários...</div>;
  }

  if (success) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-20 h-20 bg-white/10 text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2">Agendamento Confirmado!</h2>
        <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase font-medium pt-2">Seu horário foi reservado com sucesso.</p>
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6 text-left max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">Cliente</p>
          <p className="text-white font-medium mb-5">{clientName}</p>
          
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">Serviço</p>
          <p className="text-white font-medium mb-5">{selectedService?.name}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">Profissional</p>
              <p className="text-white font-medium">{selectedBarber?.name}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">Data / Hora</p>
              <p className="text-primary font-bold tracking-wide">
                {format(parse(selectedDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")} às {selectedTime}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-[10px] text-zinc-500 pt-8 uppercase tracking-[0.2em] font-semibold">
          Te esperamos na {barbershopName}!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {/* Progress */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s ? 'bg-primary border-white/20 text-black' : 'bg-background border-white/20 text-white/50'}`}>
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2">O que você quer fazer?</h2>
            <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase font-medium">Escolha o serviço desejado</p>
          </div>
          {services.length === 0 ? (
            <div className="text-center py-10 border border-white/10 rounded-xl bg-white/5">
              <Scissors className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-medium">Nenhum serviço disponível</p>
              <p className="text-white/30 text-sm mt-1">Esta barbearia ainda não cadastrou seus serviços.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(svc => (
                <Card 
                  key={svc.id} 
                  className={`p-4 cursor-pointer transition-all border-2 ${selectedService?.id === svc.id ? 'border-white/20 bg-white/10' : 'border-white/5 hover:border-white/20 bg-white/5'}`}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{svc.name}</h4>
                      <p className="text-xs text-white/50 mt-1">{svc.duration} min</p>
                    </div>
                    <span className="font-bold text-zinc-200">R$ {svc.price.toFixed(2)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Button className="w-full mt-6" disabled={!selectedService || services.length === 0} onClick={handleNext}>Continuar</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2">Com quem?</h2>
            <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase font-medium">Escolha o profissional de sua preferência</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {barbers.map(barber => (
              <Card 
                key={barber.id} 
                className={`p-4 cursor-pointer transition-all border-2 text-center flex flex-col items-center gap-3 ${selectedBarber?.id === barber.id ? 'border-white/20 bg-white/10' : 'border-white/5 hover:border-white/20 bg-white/5'}`}
                onClick={() => setSelectedBarber(barber)}
              >
                {barber.avatarUrl ? (
                  <img src={barber.avatarUrl} alt={barber.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white/50" />
                  </div>
                )}
                <span className="font-medium text-white text-sm">{barber.name}</span>
              </Card>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="w-1/3" onClick={handleBack}>Voltar</Button>
            <Button className="w-2/3" disabled={!selectedBarber} onClick={handleNext}>Continuar</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2">Quando?</h2>
            <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase font-medium">Escolha a data e o horário</p>
          </div>
          
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm text-white/70">Data</label>
            <input 
              type="date"
              min={format(startOfToday(), "yyyy-MM-dd")}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
              }}
              className="bg-background border border-white/10 rounded-lg p-3 text-white focus:border-white/20 outline-none"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="text-sm text-white/70 block mb-2">Horários Disponíveis</label>
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map(time => (
                    <div 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded text-center cursor-pointer text-sm font-medium transition-colors border ${selectedTime === time ? 'bg-primary text-black border-white/20' : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'}`}
                    >
                      {time}
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-4 text-white/40 text-sm">
                    Nenhum horário livre neste dia.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="w-1/3" onClick={handleBack}>Voltar</Button>
            <Button className="w-2/3" disabled={!selectedDate || !selectedTime} onClick={handleNext}>Continuar</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2">Último Passo</h2>
            <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase font-medium">Preencha seus dados para confirmar a reserva</p>
          </div>
          
          <Card className="p-4 bg-white/5 border-white/10 mb-6">
            <h4 className="text-sm font-medium text-white/50 mb-3 border-b border-white/5 pb-2">Resumo da Reserva</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Serviço</span><span className="text-white font-medium">{selectedService?.name}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Profissional</span><span className="text-white font-medium">{selectedBarber?.name}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Data</span><span className="text-zinc-200 font-bold">{selectedDate ? format(parse(selectedDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : ''} às {selectedTime}</span></div>
            </div>
          </Card>

          <div className="space-y-3">
            <Input 
              label="Seu Nome Completo" 
              placeholder="Ex: João da Silva" 
              value={clientName} 
              onChange={e => setClientName(e.target.value)} 
              required 
            />
            <Input 
              label="WhatsApp (Apenas números)" 
              placeholder="Ex: 11999999999" 
              value={clientPhone} 
              onChange={e => setClientPhone(e.target.value)} 
              required 
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" className="w-1/3" onClick={handleBack}>Voltar</Button>
            <Button type="submit" className="w-2/3" isLoading={submitting}>Confirmar Reserva</Button>
          </div>
        </form>
      )}

    </div>
  );
}
