import { Metadata } from "next";
import Image from "next/image";
import { Scissors } from "lucide-react";
import { publicService } from "@/services/public.service";
import { PublicBookingFlow } from "@/components/booking/PublicBookingFlow";

export const metadata: Metadata = {
  title: 'Agende seu Horário | Navallia',
  description: 'Sistema de agendamento online inteligente.',
};

export default async function AgendamentoPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug } = await params;
  // No App Router server component, we can fetch the barbershop by slug
  const barbershop = await publicService.getBarbershopBySlug(slug);

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-white mb-2">404</h1>
        <p className="text-white/50">Barbearia não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {barbershop.logoUrl ? (
               <div className="relative h-10 w-10 overflow-hidden rounded-full">
                 <Image src={barbershop.logoUrl} alt={barbershop.name} fill className="object-cover" sizes="40px" />
               </div>
            ) : (
               <div className="h-10 w-10 rounded-full bg-white/10 text-zinc-200 flex items-center justify-center border border-white/20">
                 <Scissors className="w-5 h-5" />
               </div>
            )}
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">{barbershop.name}</h1>
              <p className="text-[10px] text-zinc-200 font-medium uppercase tracking-widest">Agendamento Online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Flow */}
      <main className="flex-1 py-10 px-4">
        <PublicBookingFlow 
          barbershopId={barbershop.id} 
          barbershopName={barbershop.name} 
        />
      </main>

      {/* Footer Powered By */}
      <footer className="py-6 text-center border-t border-white/5">
        <p className="text-xs text-white/30">
          Powered by <span className="font-semibold text-white/50">Navallia SaaS</span>
        </p>
      </footer>
    </div>
  );
}
