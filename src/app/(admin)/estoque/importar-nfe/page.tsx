"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Upload, CheckCircle2, AlertTriangle,
  Trash2, ChevronLeft, Package, DollarSign,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { parseNFe, NFeParsed, NFeProduct } from "@/lib/nfe-parser";
import { stockService } from "@/services/stock.service";
import { ProductUnit } from "@/types/stock";

// ── Linha editável de produto ──────────────────────────────────────────────────

interface ImportRow extends NFeProduct {
  import:    boolean;
  category:  string;
  minStock:  number;
  sellPrice: number;
}

const UNIT_OPTIONS: ProductUnit[] = ["unit", "ml", "g", "box"];
const UNIT_LABELS: Record<ProductUnit, string> = {
  unit: "Unid.", ml: "mL", g: "g", box: "Caixa",
};

// ── Formatters ─────────────────────────────────────────────────────────────────

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString("pt-BR"); }
  catch { return iso; }
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function ImportarNFePage() {
  const router = useRouter();
  const { barbershopId } = useAuth();
  const { success, error } = useToast();

  const [dragging, setDragging]   = useState(false);
  const [parsed, setParsed]       = useState<NFeParsed | null>(null);
  const [rows, setRows]           = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone]           = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // ── Parse XML ────────────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".xml")) {
      setParseError("Selecione um arquivo XML de NF-e.");
      return;
    }
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xml  = e.target?.result as string;
        const data = parseNFe(xml);
        setParsed(data);
        setRows(
          data.products.map((p) => ({
            ...p,
            import:    true,
            category:  "Produtos",
            minStock:  2,
            sellPrice: parseFloat((p.unitPrice * 1.5).toFixed(2)),
          }))
        );
      } catch (err: any) {
        setParseError(err.message || "Erro ao processar o arquivo XML.");
      }
    };
    reader.readAsText(file, "latin1");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Row update ───────────────────────────────────────────────────────────────

  const updateRow = (index: number, key: keyof ImportRow, value: any) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  // ── Import ───────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!barbershopId) return;
    const toImport = rows.filter((r) => r.import);
    if (toImport.length === 0) {
      error("Nenhum produto selecionado", "Marque ao menos um produto para importar.");
      return;
    }

    setImporting(true);
    let created = 0;

    try {
      for (const row of toImport) {
        await stockService.createProduct(barbershopId, {
          name:        row.name,
          description: `Importado da NF-e ${parsed?.number} — ${parsed?.supplier}`,
          category:    row.category,
          price:       row.sellPrice,
          costPrice:   row.unitPrice,
          stock:       row.quantity,
          minStock:    row.minStock,
          unit:        row.unit as ProductUnit,
          barcode:     row.barcode || undefined,
          active:      true,
        });
        created++;
      }

      setDone(true);
      success(
        "Importação concluída",
        `${created} produto(s) cadastrado(s) no estoque.`
      );
    } catch (err: any) {
      error("Erro na importação", err.message || "Tente novamente.");
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = rows.filter((r) => r.import).length;

  // ── Render ───────────────────────────────────────────────────────────────────

  if (done) {
    return (
      <PageContainer title="Importar NF-e">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white uppercase">
            Importação concluída!
          </h2>
          <p className="text-[#A3A3A3] text-sm">
            Os produtos foram cadastrados no estoque com sucesso.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => { setParsed(null); setRows([]); setDone(false); }}>
              Importar outra NF-e
            </Button>
            <Button onClick={() => router.push("/estoque")}>
              Ver estoque
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Importar NF-e"
      description="Cadastre produtos automaticamente via nota fiscal eletrônica (XML)."
      actions={
        <Button variant="outline" onClick={() => router.push("/estoque")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      }
    >
      <div className="mt-4 space-y-6">

        {/* ── Upload zone ── */}
        {!parsed && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className="rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-12 gap-4 text-center cursor-pointer"
            style={{
              borderColor: dragging ? "#92400E" : "#2a2a2a",
              background:  dragging ? "rgba(146,64,14,0.06)" : "#1a1a1a",
            }}
            onClick={() => document.getElementById("nfe-file-input")?.click()}
          >
            <div className="h-14 w-14 rounded-xl bg-[#92400E]/10 border border-[#92400E]/20 flex items-center justify-center">
              <FileText className="h-7 w-7 text-[#92400E]" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white uppercase tracking-wide">
                Arraste o arquivo XML aqui
              </p>
              <p className="text-sm text-[#A3A3A3] mt-1">
                ou clique para selecionar — NF-e padrão SEFAZ (.xml)
              </p>
            </div>
            <input
              id="nfe-file-input"
              type="file"
              accept=".xml"
              className="hidden"
              onChange={onFileInput}
            />
          </div>
        )}

        {/* ── Parse error ── */}
        {parseError && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid rgba(239,68,68,0.5)" }}
          >
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Erro ao processar XML</p>
              <p className="text-sm text-red-400/70 mt-0.5">{parseError}</p>
            </div>
          </div>
        )}

        {/* ── NF-e info ── */}
        {parsed && (
          <>
            <div
              className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
              style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderTop: "2px solid #92400E" }}
            >
              <div>
                <p className="text-[10px] text-[#505050] uppercase tracking-widest mb-0.5">Fornecedor</p>
                <p className="text-sm font-semibold text-white truncate">{parsed.supplier}</p>
                <p className="text-[11px] text-[#505050]">{parsed.supplierCnpj}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#505050] uppercase tracking-widest mb-0.5">NF-e Nº</p>
                <p className="text-sm font-semibold text-white">{parsed.number} / Série {parsed.series}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#505050] uppercase tracking-widest mb-0.5">Emissão</p>
                <p className="text-sm font-semibold text-white">{fmtDate(parsed.emittedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#505050] uppercase tracking-widest mb-0.5">Total da Nota</p>
                <p className="text-sm font-bold text-[#F5F5DC]">{fmtCurrency(parsed.totalValue)}</p>
              </div>
            </div>

            {/* ── Products review table ── */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #2a2a2a" }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ background: "#1c1c1c", borderBottom: "1px solid #2a2a2a" }}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#92400E]" />
                  <span className="font-display text-sm font-semibold text-white uppercase tracking-wide">
                    Produtos da Nota ({rows.length})
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-[#A3A3A3] hover:text-white transition-colors"
                    onClick={() => setRows((r) => r.map((p) => ({ ...p, import: true })))}
                  >
                    Selecionar todos
                  </button>
                  <span className="text-[#2a2a2a]">|</span>
                  <button
                    className="text-xs text-[#A3A3A3] hover:text-white transition-colors"
                    onClick={() => setRows((r) => r.map((p) => ({ ...p, import: false })))}
                  >
                    Desmarcar todos
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: "#161616" }}>
                    <tr className="text-[#505050] text-[11px] uppercase tracking-wider">
                      <th className="px-3 py-2.5 text-center w-10">Imp.</th>
                      <th className="px-3 py-2.5 text-left">Produto</th>
                      <th className="px-3 py-2.5 text-center">Qtd.</th>
                      <th className="px-3 py-2.5 text-center">Unid.</th>
                      <th className="px-3 py-2.5 text-right">Custo unit.</th>
                      <th className="px-3 py-2.5 text-right">Preço venda</th>
                      <th className="px-3 py-2.5 text-left">Categoria</th>
                      <th className="px-3 py-2.5 text-center">Est. mín.</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: "1px solid #2a2a2a" }}>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #222",
                          background: row.import ? "transparent" : "rgba(0,0,0,0.2)",
                          opacity:    row.import ? 1 : 0.45,
                        }}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.import}
                            onChange={(e) => updateRow(i, "import", e.target.checked)}
                            className="accent-[#92400E] w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Name */}
                        <td className="px-3 py-2">
                          <input
                            value={row.name}
                            onChange={(e) => updateRow(i, "name", e.target.value)}
                            className="w-full bg-transparent text-white text-sm border-b border-transparent hover:border-[#2a2a2a] focus:border-[#92400E] outline-none transition-colors py-0.5 min-w-[180px]"
                          />
                          {row.barcode && (
                            <p className="text-[10px] text-[#505050] mt-0.5">EAN: {row.barcode}</p>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.quantity}
                            onChange={(e) => updateRow(i, "quantity", Number(e.target.value))}
                            className="w-16 bg-transparent text-white text-center border-b border-transparent hover:border-[#2a2a2a] focus:border-[#92400E] outline-none transition-colors py-0.5"
                          />
                        </td>

                        {/* Unit */}
                        <td className="px-3 py-2 text-center">
                          <select
                            value={row.unit}
                            onChange={(e) => updateRow(i, "unit", e.target.value)}
                            className="bg-transparent text-[#A3A3A3] text-xs outline-none cursor-pointer"
                          >
                            {UNIT_OPTIONS.map((u) => (
                              <option key={u} value={u} style={{ background: "#1c1c1c" }}>
                                {UNIT_LABELS[u]}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Cost price */}
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={row.unitPrice}
                            onChange={(e) => updateRow(i, "unitPrice", Number(e.target.value))}
                            className="w-24 bg-transparent text-[#A3A3A3] text-right border-b border-transparent hover:border-[#2a2a2a] focus:border-[#92400E] outline-none transition-colors py-0.5"
                          />
                        </td>

                        {/* Sell price */}
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={row.sellPrice}
                            onChange={(e) => updateRow(i, "sellPrice", Number(e.target.value))}
                            className="w-24 bg-transparent text-white font-semibold text-right border-b border-transparent hover:border-[#2a2a2a] focus:border-[#92400E] outline-none transition-colors py-0.5"
                          />
                        </td>

                        {/* Category */}
                        <td className="px-3 py-2">
                          <input
                            value={row.category}
                            onChange={(e) => updateRow(i, "category", e.target.value)}
                            className="w-full bg-transparent text-[#A3A3A3] text-sm border-b border-transparent hover:border-[#2a2a2a] focus:border-[#92400E] outline-none transition-colors py-0.5 min-w-[100px]"
                          />
                        </td>

                        {/* Min stock */}
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.minStock}
                            onChange={(e) => updateRow(i, "minStock", Number(e.target.value))}
                            className="w-14 bg-transparent text-[#A3A3A3] text-center border-b border-transparent hover:border-[#2a2a2a] focus:border-[#92400E] outline-none transition-colors py-0.5"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Summary + actions ── */}
            <div
              className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ background: "#1c1c1c", border: "1px solid #2a2a2a" }}
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-[#505050] uppercase tracking-widest">Selecionados</p>
                  <p className="font-display text-xl font-bold text-white">{selectedCount} / {rows.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#505050] uppercase tracking-widest">Custo total</p>
                  <p className="font-display text-xl font-bold text-[#F5F5DC]">
                    {fmtCurrency(
                      rows
                        .filter((r) => r.import)
                        .reduce((acc, r) => acc + r.unitPrice * r.quantity, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setParsed(null); setRows([]); }}
                  disabled={importing}
                >
                  Trocar arquivo
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                  isLoading={importing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {selectedCount} produto{selectedCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
