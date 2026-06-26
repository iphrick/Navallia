"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Store, Ban, CheckCircle, Plus, Calendar, DollarSign, MessageCircle, Link as LinkIcon, RefreshCcw } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import { Button } from "@/components/ui/Button";
import { BarbershopDocument } from "@/types";

export default function MasterBarbershopsPage() {
  const [barbershops, setBarbershops] = useState<BarbershopDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToastContext();

  const [newShopName, setNewShopName] = useState("");
  const [newShopPhone, setNewShopPhone] = useState("");

  async function fetchBarbershops() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "barbershops"));
      setBarbershops(snap.docs.map(d => ({ id: d.id, ...d.data() } as BarbershopDocument)));
    } catch (err) {
      console.error(err);
      error("Erro", "Falha ao carregar barbearias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Deseja realmente ${currentStatus ? 'suspender' : 'reativar'} esta barbearia?`)) return;

    try {
      await updateDoc(doc(db, "barbershops", id), {
        active: !currentStatus
      });
      success("Sucesso", "Status atualizado.");
      fetchBarbershops();
    } catch (err) {
      error("Erro", "Falha ao atualizar status.");
    }
  };

  const handleMarkAsPaid = async (shop: BarbershopDocument) => {
    if (!confirm(`Confirmar pagamento da mensalidade de ${shop.name}? O vencimento será estendido em 30 dias.`)) return;

    try {
      // Data atual do vencimento ou hoje
      const currentDueDate = shop.subscriptionDueDate ? shop.subscriptionDueDate.toDate() : new Date();
      
      // Se já estava vencido há muito tempo, joga pra 30 dias a partir de HOJE. Se estava no prazo, adiciona 30 dias na data original.
      const baseDate = currentDueDate < new Date() ? new Date() : currentDueDate;
      const newDueDate = new Date(baseDate);
      newDueDate.setDate(newDueDate.getDate() + 30);

      await updateDoc(doc(db, "barbershops", shop.id), {
        subscriptionDueDate: Timestamp.fromDate(newDueDate),
        subscriptionStatus: "active"
      });
      
      success("Sucesso", "Pagamento registrado! Vencimento renovado.");
      fetchBarbershops();
    } catch (err) {
      error("Erro", "Falha ao registrar pagamento.");
    }
  };

  const handleOpenWhatsApp = (shop: BarbershopDocument) => {
    const phone = shop.phone || "5500000000000";
    const valor = shop.subscriptionPrice ? shop.subscriptionPrice.toFixed(2) : "99.90";
    const msg = `Olá, aqui é do sistema Navallia. Notamos que a sua assinatura mensal (Plano ${shop.subscriptionPlan || "Pro"}) no valor de R$ ${valor} encontra-se em aberto. Para continuar utilizando o sistema sem interrupções, por favor, realize o pagamento.`;
    
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCreateBarbershop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName) return;

    try {
      // Data de vencimento = hoje + 7 dias (trial)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const docRef = await addDoc(collection(db, "barbershops"), {
        name: newShopName,
        phone: newShopPhone,
        email: "",
        address: "",
        slug: newShopName.toLowerCase().replace(/\s+/g, '-'),
        ownerId: "pending", // Indica que ainda não tem um dono vinculado
        plan: "premium",
        active: true,
        subscriptionStatus: "trial",
        subscriptionDueDate: Timestamp.fromDate(dueDate),
        subscriptionPlan: "Premium",
        subscriptionPrice: 99.90,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Cria um convite vinculado a esta barbearia
      const inviteRef = await addDoc(collection(db, "invites"), {
        barbershopId: docRef.id,
        status: "pending",
        createdAt: serverTimestamp()
      });

      success("Barbearia Criada", "A barbearia foi gerada. Compartilhe o link de convite.");
      setIsModalOpen(false);
      setNewShopName("");
      setNewShopPhone("");
      fetchBarbershops();

      // Mostra o link pro master copiar
      const inviteLink = `${window.location.origin}/register?invite=${inviteRef.id}`;
      prompt("Copie este link mágico e mande no WhatsApp do cliente:", inviteLink);

    } catch (err) {
      error("Erro", "Não foi possível criar a barbearia.");
    }
  };

  const getStatusBadge = (shop: BarbershopDocument) => {
    if (shop.active === false) {
      return <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold">BLOQUEADA</span>;
    }
    
    const status = shop.subscriptionStatus || "active";
    const dueDate = shop.subscriptionDueDate?.toDate();
    const isOverdue = dueDate && dueDate < new Date();

    if (isOverdue || status === "overdue") {
      return <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold">VENCIDA</span>;
    }
    if (status === "trial") {
      return <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold">EM TESTE</span>;
    }
    
    return <span className="px-2 py-1 bg-white/10 text-zinc-200 rounded-full text-xs font-bold">EM DIA</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Barbearias</h1>
          <p className="text-slate-400">Controle financeiro e cadastral de clientes (SaaS).</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Barbearia
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Buscando empresas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome / Barbearia</th>
                  <th className="px-6 py-4 font-medium">Status SaaS</th>
                  <th className="px-6 py-4 font-medium">Plano</th>
                  <th className="px-6 py-4 font-medium">Vencimento</th>
                  <th className="px-6 py-4 font-medium text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {barbershops.map((shop) => {
                  const isActive = shop.active !== false;
                  
                  return (
                    <tr key={shop.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                            {shop.logoUrl ? (
                              <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <Store className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-slate-200 font-medium">{shop.name}</p>
                            <p className="text-slate-500 text-xs">Tel: {shop.phone || "Não informado"}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {getStatusBadge(shop)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-slate-300 font-medium">{shop.subscriptionPlan || "Padrão"}</p>
                        <p className="text-slate-500 text-xs">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shop.subscriptionPrice || 0)}/mês
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {shop.subscriptionDueDate ? shop.subscriptionDueDate.toDate().toLocaleDateString() : "S/ Data"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          <button
                            onClick={() => handleOpenWhatsApp(shop)}
                            title="Cobrar via WhatsApp"
                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleMarkAsPaid(shop)}
                            title="Marcar como Pago (+30 dias)"
                            className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(shop.id, isActive)}
                            title={isActive ? "Suspender Sistema" : "Reativar Sistema"}
                            className={`p-2 rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-slate-800 text-red-400 hover:bg-red-500/10' 
                                : 'bg-slate-800 text-zinc-200 hover:bg-white/10'
                            }`}
                          >
                            {isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                
                {barbershops.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma barbearia cadastrada no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Criação de Barbearia (Admin) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Nova Barbearia (Cliente)</h2>
            <p className="text-sm text-slate-400 mb-6">
              Isso criará a estrutura no banco de dados e gerará um link mágico para o dono assumir o controle.
            </p>
            
            <form onSubmit={handleCreateBarbershop} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Barbearia</label>
                <input 
                  type="text" 
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: Barber Shop do Zé"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp (Para cobrança)</label>
                <input 
                  type="text" 
                  value={newShopPhone}
                  onChange={(e) => setNewShopPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: 5511999999999"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">Criar e Gerar Link</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
