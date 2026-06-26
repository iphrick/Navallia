"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Activity, Users, Package, DollarSign } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { reportService } from "@/services/report.service";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { useToastContext } from "@/contexts/ToastContext";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function RelatoriosPage() {
  const { role, barbershopId } = useAuth();
  const { error, success } = useToastContext();
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Filtros Financeiro
  const [finStart, setFinStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [finEnd, setFinEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  if (role === "barber") {
    return (
      <PageContainer title="Acesso Negado">
        <div className="py-20 text-center text-white/50">Você não tem permissão para visualizar relatórios.</div>
      </PageContainer>
    );
  }

  const handleExport = async (type: 'financial' | 'clients' | 'stock', formatType: 'csv' | 'pdf') => {
    if (!barbershopId) return;
    setLoadingType(`${type}-${formatType}`);

    try {
      if (type === 'financial') {
        const { csvData, pdfColumns, pdfData } = await reportService.getFinancialReport(barbershopId, finStart, finEnd);
        if (csvData.length === 0) throw new Error("Nenhum dado encontrado nesse período.");
        
        if (formatType === 'csv') exportToCSV(csvData, "Relatorio_Financeiro");
        else exportToPDF("Relatório Financeiro", pdfColumns, pdfData, "Relatorio_Financeiro");
      } 
      else if (type === 'clients') {
        const { csvData, pdfColumns, pdfData } = await reportService.getClientsReport(barbershopId);
        if (csvData.length === 0) throw new Error("Nenhum cliente encontrado.");

        if (formatType === 'csv') exportToCSV(csvData, "Relatorio_Clientes");
        else exportToPDF("Relatório de Clientes", pdfColumns, pdfData, "Relatorio_Clientes");
      }
      else if (type === 'stock') {
        const { csvData, pdfColumns, pdfData } = await reportService.getStockReport(barbershopId);
        if (csvData.length === 0) throw new Error("Nenhum produto encontrado.");

        if (formatType === 'csv') exportToCSV(csvData, "Relatorio_Estoque");
        else exportToPDF("Relatório de Estoque", pdfColumns, pdfData, "Relatorio_Estoque");
      }
      
      success("Relatório gerado", "O download começará em instantes.");
    } catch (err: any) {
      error("Erro ao gerar relatório", err.message || "Tente novamente.");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <PageContainer 
      title="Relatórios e Analytics" 
      description="Exporte dados estratégicos do seu negócio."
    >
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Relatório Financeiro */}
        <Card className="p-6 bg-white/5 border-white/10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 text-primary">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Fluxo de Caixa</h3>
              <p className="text-xs text-white/50">Receitas, despesas e lucros.</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/70">Data Inicial</label>
              <input 
                type="date" 
                value={finStart}
                onChange={e => setFinStart(e.target.value)}
                className="bg-background border border-white/10 rounded p-2 text-sm text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/70">Data Final</label>
              <input 
                type="date" 
                value={finEnd}
                onChange={e => setFinEnd(e.target.value)}
                className="bg-background border border-white/10 rounded p-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button 
              variant="outline" 
              className="w-full text-xs" 
              onClick={() => handleExport('financial', 'csv')}
              isLoading={loadingType === 'financial-csv'}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel/CSV
            </Button>
            <Button 
              className="w-full text-xs" 
              onClick={() => handleExport('financial', 'pdf')}
              isLoading={loadingType === 'financial-pdf'}
            >
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </Card>

        {/* Relatório de Clientes */}
        <Card className="p-6 bg-white/5 border-white/10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Base de Clientes</h3>
              <p className="text-xs text-white/50">Exportação total e CRM.</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6 flex-1 flex flex-col justify-center">
            <p className="text-sm text-white/70 text-center">
              Gera um relatório completo com histórico de visitas, pontuações e ticket médio de todos os clientes cadastrados.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button 
              variant="outline" 
              className="w-full text-xs"
              onClick={() => handleExport('clients', 'csv')}
              isLoading={loadingType === 'clients-csv'}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel/CSV
            </Button>
            <Button 
              className="w-full text-xs"
              onClick={() => handleExport('clients', 'pdf')}
              isLoading={loadingType === 'clients-pdf'}
            >
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </Card>

        {/* Relatório de Estoque */}
        <Card className="p-6 bg-white/5 border-white/10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/10 text-zinc-200">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Inventário (Estoque)</h3>
              <p className="text-xs text-white/50">Produtos e capital imobilizado.</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6 flex-1 flex flex-col justify-center">
             <p className="text-sm text-white/70 text-center">
              Gera a relação de todos os insumos, apontando alertas de baixo estoque e o custo total armazenado na barbearia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button 
              variant="outline" 
              className="w-full text-xs"
              onClick={() => handleExport('stock', 'csv')}
              isLoading={loadingType === 'stock-csv'}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel/CSV
            </Button>
            <Button 
              className="w-full text-xs"
              onClick={() => handleExport('stock', 'pdf')}
              isLoading={loadingType === 'stock-pdf'}
            >
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </Card>

      </div>
    </PageContainer>
  );
}
