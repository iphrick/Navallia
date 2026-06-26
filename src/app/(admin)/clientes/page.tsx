"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Users, Download, Upload, FileSpreadsheet, FileText } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { clientService } from "@/services/client.service";

export default function ClientesPage() {
  const { clients, loading, deleteClient, refreshClients } = useClients();
  const { role, user, barbershopId } = useAuth();
  const { success, error } = useToastContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [vipFilter, setVipFilter] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canDelete = role === "owner" || role === "manager";
  const canImport = role === "owner" || role === "manager";

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      if (statusFilter === "active" && !client.active) return false;
      if (statusFilter === "inactive" && client.active) return false;
      if (vipFilter && client.totalSpent < 1000) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          client.name.toLowerCase().includes(term) ||
          client.phone.includes(term) ||
          client.whatsapp.includes(term) ||
          (client.email && client.email.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [clients, searchTerm, statusFilter, vipFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!canDelete) return;
    if (confirm(`Tem certeza que deseja inativar o cliente ${name}?`)) {
      try {
        await deleteClient(id);
        success("Sucesso", "Cliente removido com sucesso.");
      } catch (err) {
        error("Erro", "Não foi possível inativar o cliente.");
      }
    }
  };

  const handleExportCSV = () => {
    const data = filteredClients.map(c => ({
      Nome: c.name,
      WhatsApp: c.whatsapp,
      Email: c.email || '',
      TotalGasto: c.totalSpent,
      Atendimentos: c.totalAppointments,
      Status: c.active ? 'Ativo' : 'Inativo'
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "clientes.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Exportado", "Arquivo CSV gerado com sucesso.");
  };

  const handleExportExcel = () => {
    const data = filteredClients.map(c => ({
      Nome: c.name,
      WhatsApp: c.whatsapp,
      Email: c.email || '',
      TotalGasto: c.totalSpent,
      Atendimentos: c.totalAppointments,
      Status: c.active ? 'Ativo' : 'Inativo'
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "clientes.xlsx");
    success("Exportado", "Arquivo Excel gerado com sucesso.");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barbershopId) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const validClients = results.data
            .filter((row: any) => row.nome && row.telefone)
            .map((row: any) => ({
              name: row.nome,
              phone: row.telefone,
              whatsapp: row.telefone,
              email: row.email || "",
            }));

          if (validClients.length === 0) {
            error("Aviso", "Nenhum cliente válido encontrado no CSV (campos 'nome' e 'telefone' são obrigatórios).");
            return;
          }

          await clientService.importClients(barbershopId, validClients);
          success("Sucesso", `${validClients.length} clientes importados com sucesso.`);
          refreshClients();
        } catch (err) {
          error("Erro", "Falha na importação do CSV.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: () => {
        error("Erro", "Arquivo CSV inválido.");
        setIsImporting(false);
      }
    });
  };

  return (
    <PageContainer 
      title="Clientes" 
      description="Gerencie sua base de clientes."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {canImport && (
            <>
              <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleImportCSV} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} isLoading={isImporting}>
                <Upload className="mr-2 h-4 w-4" /> Importar CSV
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
             <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
             <FileText className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Link href="/clientes/novo">
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Cliente</Button>
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <Input 
            placeholder="Buscar por nome, telefone ou e-mail..." 
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
            <Button 
             variant={vipFilter ? "default" : "outline"} 
             onClick={() => setVipFilter(!vipFilter)}
             className="whitespace-nowrap"
           >
              VIPs {vipFilter && "Ativo"}
           </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white/50">Carregando clientes...</div>
      ) : filteredClients.length === 0 ? (
        <EmptyState 
          icon={<Users className="h-8 w-8" />} 
          title="Nenhum cliente encontrado" 
          description="Nenhum cliente corresponde aos filtros aplicados." 
        />
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredClients.map((client) => (
              <Card key={client.id} className="p-4 bg-white/5 border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {client.photoUrl ? (
                     <img src={client.photoUrl} alt={client.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                     <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                       {client.name.charAt(0)}
                     </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2 text-white">
                      {client.name}
                      {client.totalSpent >= 1000 && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">⭐ VIP</span>}
                    </div>
                    <div className="text-xs text-white/60">{client.whatsapp || client.phone}</div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${client.active ? 'bg-white/10 text-zinc-200' : 'bg-red-500/10 text-red-500'}`}>
                    {client.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-white/10 pt-3">
                  <div>
                    <span className="text-white/50 block text-xs">Total Gasto</span>
                    <span className="text-white font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalSpent)}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-xs">Visitas</span>
                    <span className="text-white font-medium">{client.totalAppointments}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-1">
                  <Link href={`/clientes/${client.id}`} className="text-white/50 hover:text-white" title="Visualizar">
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link href={`/clientes/${client.id}/editar`} className="text-white/50 hover:text-white" title="Editar">
                    <Edit className="h-5 w-5" />
                  </Link>
                  {canDelete && client.active && (
                    <button onClick={() => handleDelete(client.id, client.name)} className="text-white/50 hover:text-red-400" title="Excluir">
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
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <th className="px-4 py-3 font-medium text-center">Atendimentos</th>
                  <th className="px-4 py-3 font-medium text-right">Total Gasto</th>
                  <th className="px-4 py-3 font-medium">Cadastro</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {client.photoUrl ? (
                           <img src={client.photoUrl} alt={client.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                           <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                             {client.name.charAt(0)}
                           </div>
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-2 text-white">
                            {client.name}
                            {client.totalSpent >= 1000 && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">⭐ VIP</span>}
                          </div>
                          {client.email && <div className="text-xs text-white/50">{client.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      <div className="text-sm">{client.whatsapp || client.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center bg-white/5 rounded-full px-2.5 py-0.5 text-xs text-white">
                        {client.totalAppointments}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {client.createdAt ? format(client.createdAt instanceof Date ? client.createdAt : (client.createdAt as any).toDate(), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${client.active ? 'bg-white/10 text-zinc-200' : 'bg-red-500/10 text-red-500'}`}>
                        {client.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/clientes/${client.id}`} className="text-white/50 hover:text-white" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/clientes/${client.id}/editar`} className="text-white/50 hover:text-white" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                        {canDelete && client.active && (
                          <button onClick={() => handleDelete(client.id, client.name)} className="text-white/50 hover:text-red-400" title="Excluir">
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
