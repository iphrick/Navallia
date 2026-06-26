"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Scissors } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useBarbers } from "@/hooks/useBarbers";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";

export default function BarbeirosPage() {
  const { barbers, loading, deactivateBarber } = useBarbers();
  const { role } = useAuth();
  const { success, error } = useToastContext();
  
  const [searchTerm, setSearchTerm] = useState("");

  const canEdit = role === "owner" || role === "manager";
  const canDelete = role === "owner"; // only owner can see delete (which is just deactivate for safety unless owner)

  const filteredBarbers = useMemo(() => {
    return barbers.filter(barber => {
      if (searchTerm) {
        return barber.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [barbers, searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!canEdit) return;
    if (confirm(`Tem certeza que deseja inativar o barbeiro ${name}?`)) {
      try {
        await deactivateBarber(id);
        success("Sucesso", "Barbeiro inativado com sucesso.");
      } catch (err) {
        error("Erro", "Não foi possível inativar o barbeiro.");
      }
    }
  };

  const formatCommission = (type: string, value: number) => {
    if (type === 'percentage') return `${value}%`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <PageContainer 
      title="Equipe de Barbeiros" 
      description="Gerencie os profissionais, horários e comissões."
      actions={
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href="/barbeiros/novo">
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Barbeiro</Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <Input 
            placeholder="Buscar por nome do barbeiro..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white/50">Carregando barbeiros...</div>
      ) : filteredBarbers.length === 0 ? (
        <EmptyState 
          icon={<Scissors className="h-8 w-8" />} 
          title="Nenhum barbeiro encontrado" 
          description="Ainda não há profissionais cadastrados na sua equipe." 
        />
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredBarbers.map((barber) => (
              <Card key={barber.id} className="p-4 bg-white/5 border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    {barber.avatarUrl ? (
                      <img src={barber.avatarUrl} alt={barber.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 font-bold">
                        {barber.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{barber.name}</div>
                    <div className="text-xs text-white/50 mt-0.5 line-clamp-1">{barber.specialties.join(", ")}</div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${barber.active ? 'bg-white/10 text-zinc-200' : 'bg-red-500/10 text-red-500'}`}>
                    {barber.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-white/10 pt-3">
                  <div>
                    <span className="text-white/50 block text-xs">Comissão</span>
                    <span className="text-white font-medium">{formatCommission(barber.commissionType, barber.commissionValue)}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-xs">Contato</span>
                    <span className="text-white font-medium">{barber.phone || "Não informado"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-1">
                  <Link href={`/barbeiros/${barber.id}`} className="text-white/50 hover:text-white" title="Visualizar">
                    <Eye className="h-5 w-5" />
                  </Link>
                  {canEdit && (
                    <Link href={`/barbeiros/${barber.id}/editar`} className="text-white/50 hover:text-white" title="Editar">
                      <Edit className="h-5 w-5" />
                    </Link>
                  )}
                  {canDelete && barber.active && (
                    <button onClick={() => handleDelete(barber.id, barber.name)} className="text-white/50 hover:text-red-400" title="Excluir">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block rounded-md border border-white/10 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Barbeiro</th>
                  <th className="px-4 py-3 font-medium">Especialidades</th>
                  <th className="px-4 py-3 font-medium">Comissão</th>
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredBarbers.map((barber) => (
                  <tr key={barber.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                          {barber.avatarUrl ? (
                            <img src={barber.avatarUrl} alt={barber.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50 font-bold">
                              {barber.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-white">{barber.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      <div className="flex flex-wrap gap-1">
                        {barber.specialties.slice(0, 2).map(sp => (
                           <span key={sp} className="bg-white/10 px-2 py-0.5 rounded text-xs">{sp}</span>
                        ))}
                        {barber.specialties.length > 2 && <span className="bg-white/10 px-2 py-0.5 rounded text-xs">+{barber.specialties.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {formatCommission(barber.commissionType, barber.commissionValue)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {barber.phone || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${barber.active ? 'bg-white/10 text-zinc-200' : 'bg-red-500/10 text-red-500'}`}>
                        {barber.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/barbeiros/${barber.id}`} className="text-white/50 hover:text-white" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canEdit && (
                          <Link href={`/barbeiros/${barber.id}/editar`} className="text-white/50 hover:text-white" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {canDelete && barber.active && (
                          <button onClick={() => handleDelete(barber.id, barber.name)} className="text-white/50 hover:text-red-400" title="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageContainer>
  );
}
