"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Copy, Star, Scissors } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useServices } from "@/hooks/useServices";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";

export default function ServicosPage() {
  const { services, loading, deleteService, duplicateService, toggleFeatured } = useServices();
  const { categories } = useServiceCategories();
  const { role } = useAuth();
  const { success, error } = useToastContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

  const canEdit = role === "owner" || role === "manager";
  const canDelete = role === "owner" || role === "manager"; // Edit: Manager CAN do logic delete (active: false).

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      if (statusFilter === "active" && !service.active) return false;
      if (statusFilter === "inactive" && service.active) return false;
      if (searchTerm) {
        return service.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [services, searchTerm, statusFilter]);

  const handleDuplicate = async (id: string, name: string) => {
    if (!canEdit) return;
    try {
      await duplicateService(id);
      success("Sucesso", `Serviço ${name} duplicado com sucesso.`);
    } catch (err) {
      error("Erro", "Não foi possível duplicar o serviço.");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    if (!canEdit) return;
    try {
      await toggleFeatured(id, currentFeatured);
      success("Sucesso", currentFeatured ? "Destaque removido." : "Serviço marcado como destaque.");
    } catch (err) {
      error("Erro", "Não foi possível alterar o destaque.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canDelete) return;
    if (confirm(`Tem certeza que deseja inativar o serviço ${name}?`)) {
      try {
        await deleteService(id);
        success("Sucesso", "Serviço inativado com sucesso.");
      } catch (err) {
        error("Erro", "Não foi possível inativar o serviço.");
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "Sem Categoria";
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatCommission = (type: string, value: number) => {
    if (type === 'percentage') return `${value}%`;
    return formatPrice(value);
  };

  return (
    <PageContainer 
      title="Serviços" 
      description="Gerencie os serviços oferecidos pela sua barbearia."
      actions={
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href="/servicos/novo">
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Serviço</Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <Input 
            placeholder="Buscar por nome do serviço..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <select 
              className="bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
           >
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="all">Todos</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white/50">Carregando serviços...</div>
      ) : filteredServices.length === 0 ? (
        <EmptyState 
          icon={<Scissors className="h-8 w-8" />} 
          title="Nenhum serviço encontrado" 
          description="Nenhum serviço corresponde aos filtros aplicados." 
        />
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredServices.map((service) => (
              <Card key={service.id} className="p-4 bg-white/5 border-white/10 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2 text-white">
                      {service.name}
                      {service.featured && <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">{getCategoryName(service.categoryId)}</div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${service.active ? 'bg-white/10 text-zinc-200' : 'bg-red-500/10 text-red-500'}`}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm border-t border-white/10 pt-3">
                  <div>
                    <span className="text-white/50 block text-xs">Preço</span>
                    <span className="text-white font-medium">{formatPrice(service.price)}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-xs">Duração</span>
                    <span className="text-white font-medium">{service.duration} min</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-xs">Comissão</span>
                    <span className="text-white font-medium">{formatCommission(service.commissionType, service.commissionValue)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-1">
                  <Link href={`/servicos/${service.id}`} className="text-white/50 hover:text-white" title="Visualizar">
                    <Eye className="h-5 w-5" />
                  </Link>
                  {canEdit && (
                    <>
                      <button onClick={() => handleToggleFeatured(service.id, service.featured)} className={service.featured ? "text-yellow-400" : "text-white/50 hover:text-yellow-400"} title="Destaque">
                        <Star className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDuplicate(service.id, service.name)} className="text-white/50 hover:text-white" title="Duplicar">
                        <Copy className="h-5 w-5" />
                      </button>
                      <Link href={`/servicos/${service.id}/editar`} className="text-white/50 hover:text-white" title="Editar">
                        <Edit className="h-5 w-5" />
                      </Link>
                    </>
                  )}
                  {canDelete && service.active && (
                    <button onClick={() => handleDelete(service.id, service.name)} className="text-white/50 hover:text-red-400" title="Excluir">
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
                  <th className="px-4 py-3 font-medium">Serviço</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium text-right">Preço</th>
                  <th className="px-4 py-3 font-medium text-center">Duração</th>
                  <th className="px-4 py-3 font-medium text-right">Comissão</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-2 text-white">
                        {service.name}
                        {service.featured && <span title="Destaque"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /></span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {getCategoryName(service.categoryId)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatPrice(service.price)}
                    </td>
                    <td className="px-4 py-3 text-center text-white">
                      <div className="inline-flex items-center justify-center bg-white/5 rounded-full px-2.5 py-0.5 text-xs">
                        {service.duration} min
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCommission(service.commissionType, service.commissionValue)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${service.active ? 'bg-white/10 text-zinc-200' : 'bg-red-500/10 text-red-500'}`}>
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/servicos/${service.id}`} className="text-white/50 hover:text-white" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canEdit && (
                          <>
                            <button onClick={() => handleToggleFeatured(service.id, service.featured)} className={service.featured ? "text-yellow-400" : "text-white/50 hover:text-yellow-400"} title="Destaque">
                              <Star className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDuplicate(service.id, service.name)} className="text-white/50 hover:text-white" title="Duplicar">
                              <Copy className="h-4 w-4" />
                            </button>
                            <Link href={`/servicos/${service.id}/editar`} className="text-white/50 hover:text-white" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Link>
                          </>
                        )}
                        {canDelete && service.active && (
                          <button onClick={() => handleDelete(service.id, service.name)} className="text-white/50 hover:text-red-400" title="Excluir">
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
