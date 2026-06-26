import { financialService } from "@/services/financial.service";
import { clientService } from "@/services/client.service";
import { stockService } from "@/services/stock.service";
import { format } from "date-fns";

export const reportService = {
  
  async getFinancialReport(barbershopId: string, startDate: string, endDate: string) {
    const transactions = await financialService.getTransactions(barbershopId, startDate, endDate);
    
    const formattedData = transactions.map(t => ({
      Data: format(new Date(t.date), "dd/MM/yyyy"),
      Tipo: t.type === 'income' ? 'Entrada' : 'Saída',
      Categoria: t.category,
      Descrição: t.description || '-',
      Valor: t.amount,
      Método: t.paymentMethod || '-'
    }));

    const pdfColumns = ["Data", "Tipo", "Categoria", "Descrição", "Valor", "Método"];
    const pdfData = formattedData.map(d => [
      d.Data, 
      d.Tipo, 
      d.Categoria, 
      d.Descrição, 
      `R$ ${d.Valor.toFixed(2)}`, 
      d.Método
    ]);

    return { csvData: formattedData, pdfColumns, pdfData };
  },

  async getClientsReport(barbershopId: string) {
    const clients = await clientService.getClients(barbershopId);
    // Idealmente cruzar com Loyalty, mas clients já possui totalSpent e points no navallia (Módulo 3)
    
    const formattedData = clients.map(c => ({
      Nome: c.name,
      Telefone: c.phone || '-',
      Visitas: c.totalAppointments,
      TotalGasto: c.totalSpent,
      Pontos: c.loyaltyPoints,
      Status: c.active ? 'Ativo' : 'Inativo'
    }));

    const pdfColumns = ["Nome", "Telefone", "Visitas", "Total Gasto", "Pontos", "Status"];
    const pdfData = formattedData.map(d => [
      d.Nome,
      d.Telefone,
      d.Visitas.toString(),
      `R$ ${d.TotalGasto.toFixed(2)}`,
      d.Pontos.toString(),
      d.Status
    ]);

    return { csvData: formattedData, pdfColumns, pdfData };
  },

  async getStockReport(barbershopId: string) {
    const products = await stockService.getProducts(barbershopId);
    
    const formattedData = products.map(p => ({
      Produto: p.name,
      Categoria: p.category,
      EstoqueAtual: p.stock,
      EstoqueMinimo: p.minStock,
      Custo: p.costPrice,
      PrecoVenda: p.price,
      Status: p.stock === 0 ? 'Esgotado' : p.stock <= p.minStock ? 'Baixo' : 'OK'
    }));

    const pdfColumns = ["Produto", "Categoria", "Estoque", "Mínimo", "Custo", "Venda", "Status"];
    const pdfData = formattedData.map(d => [
      d.Produto,
      d.Categoria,
      d.EstoqueAtual.toString(),
      d.EstoqueMinimo.toString(),
      `R$ ${d.Custo.toFixed(2)}`,
      `R$ ${d.PrecoVenda.toFixed(2)}`,
      d.Status
    ]);

    return { csvData: formattedData, pdfColumns, pdfData };
  }
};
