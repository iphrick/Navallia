"use client";

import React from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Trash2, ShieldAlert } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useFinancial } from "@/hooks/useFinancial";
import { useAuth } from "@/hooks/useAuth";
import { formatDateBR } from "@/lib/date-utils";
import { useToastContext } from "@/contexts/ToastContext";

export default function FinanceiroPage() {
  const { role } = useAuth();
  const { success, error } = useToastContext();
  const { 
    transactions, 
    summary, 
    loading, 
    dateFilter, 
    setDateFilter,
    removeTransaction,
    isAuthorized
  } = useFinancial();

  const isOwner = role === "owner";

  if (!isAuthorized) {
    return (
      <PageContainer title="Acesso Negado">
        <div className="flex flex-col items-center justify-center py-20 text-white/50 text-center">
          <ShieldAlert className="w-12 h-12 mb-4 text-red-500/50" />
          <h2 className="text-xl font-bold text-white mb-2">Restrição de Acesso</h2>
          <p className="max-w-md">O módulo financeiro é restrito a proprietários e gerentes da barbearia. Seus ganhos e comissões estão disponíveis no Dashboard.</p>
        </div>
      </PageContainer>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleDelete = async (id: string, desc: string) => {
    if (!isOwner) {
       error("Negado", "Apenas o proprietário (Owner) pode excluir registros financeiros.");
       return;
    }
    
    if (confirm(`Atenção: Tem certeza que deseja apagar o registro '${desc}' do livro caixa? Esta ação é irreversível.`)) {
      try {
        await removeTransaction(id);
        success("Excluído", "Registro removido com sucesso.");
      } catch (err) {
        error("Erro", "Falha ao remover o registro.");
      }
    }
  };

  const DateFilterSelector = () => (
    <select 
      className="bg-background border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:ring-primary focus:border-white/20 outline-none"
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value as any)}
    >
      <option value="today">Hoje</option>
      <option value="7d">Últimos 7 dias</option>
      <option value="30d">Últimos 30 dias</option>
      <option value="month">Mês Atual</option>
    </select>
  );

  return (
    <PageContainer 
      title="Gestão Financeira" 
      description="Fluxo de caixa, receitas, despesas e relatórios."
      actions={
        <div className="flex items-center gap-3">
          <DateFilterSelector />
          <Link href="/financeiro/novo">
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Lançamento</Button>
          </Link>
        </div>
      }
    >
      <div className="mt-6 space-y-6">
        
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Entradas (Receitas)"
            value={formatCurrency(summary.totalIncome)}
            icon={ArrowUpRight}
            colorClass="text-zinc-200 bg-white/10"
          />
          <MetricCard
            title="Saídas (Despesas)"
            value={formatCurrency(summary.totalExpense)}
            icon={ArrowDownRight}
            colorClass="text-red-400 bg-red-500/20"
          />
          <MetricCard
            title="Comissões Pagas"
            value={formatCurrency(summary.commissionsPaid)}
            subtitle="Já incluso nas saídas"
            icon={Wallet}
            colorClass="text-yellow-400 bg-yellow-500/20"
          />
          <MetricCard
            title="Lucro Líquido"
            value={formatCurrency(summary.netProfit)}
            icon={DollarSign}
            colorClass={summary.netProfit >= 0 ? "text-zinc-200 bg-white/10" : "text-red-400 bg-red-500/20"}
          />
        </div>

        {/* Tabela de Transações */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="text-lg font-medium text-white">Livro Caixa</h3>
            <span className="text-xs text-white/50">{transactions.length} registros no período</span>
          </div>
          
          {loading ? (
             <div className="text-center py-10 text-white/50">Carregando livro caixa...</div>
          ) : transactions.length === 0 ? (
             <div className="text-center py-10 text-white/50">Nenhuma movimentação neste período.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-background text-white/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3 font-medium text-center">Método</th>
                    <th className="px-4 py-3 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 text-white/80">{formatDateBR(t.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${t.type === 'income' ? 'bg-white/10 text-zinc-200 border-white/10' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70 max-w-xs truncate" title={t.description}>
                        {t.description || "-"}
                        {t.appointmentId && <span className="ml-2 text-[10px] text-primary bg-primary/20 px-1.5 py-0.5 rounded border border-primary/20">Automático</span>}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${t.type === 'income' ? 'text-zinc-200' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-center text-white/50 uppercase text-xs">
                        {t.paymentMethod || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                         {isOwner && (
                           <button 
                             onClick={() => handleDelete(t.id, t.category)} 
                             className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                             title="Excluir"
                           >
                             <Trash2 className="h-4 w-4 inline-block" />
                           </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
}
