import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

/**
 * Converte array de objetos para CSV e dispara o download.
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const separator = ",";
  const keys = Object.keys(data[0]);

  const csvContent =
    keys.join(separator) +
    "\n" +
    data
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? "" : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : String(cell);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Gera um PDF com tabela formatada
 */
export function exportToPDF(title: string, head: string[], body: any[][], filename: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text("Navallia SaaS", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(title, 14, 30);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 36);

  // Tabela
  autoTable(doc, {
    startY: 45,
    head: [head],
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    styles: { fontSize: 9 },
  });

  doc.save(`${filename}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
}
