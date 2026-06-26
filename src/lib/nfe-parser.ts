/**
 * Parser de NF-e (Nota Fiscal Eletrônica) — padrão SEFAZ
 * Suporta: nfeProc (processada) e NFe (sem envelope)
 */

export interface NFeProduct {
  code:      string;   // cProd
  name:      string;   // xProd
  barcode:   string;   // cEAN
  unit:      string;   // uCom
  quantity:  number;   // qCom
  unitPrice: number;   // vUnCom
  totalPrice: number;  // vProd
  ncm:       string;   // NCM
}

export interface NFeParsed {
  number:      string;       // nNF
  series:      string;       // serie
  emittedAt:   string;       // dhEmi (ISO date)
  supplier:    string;       // emit > xNome
  supplierCnpj:string;       // emit > CNPJ
  totalValue:  number;       // total > ICMSTot > vNF
  products:    NFeProduct[];
}

function getText(parent: Element, tag: string): string {
  return parent.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
}

function getNumber(parent: Element, tag: string): number {
  const v = getText(parent, tag);
  return v ? parseFloat(v.replace(",", ".")) : 0;
}

export function parseNFe(xmlString: string): NFeParsed {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(xmlString, "application/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("XML inválido ou corrompido.");

  // Suporta nfeProc e NFe direto
  const infNFe =
    doc.getElementsByTagName("infNFe")[0] ??
    doc.getElementsByTagName("NFe")[0];

  if (!infNFe) throw new Error("Arquivo não é uma NF-e válida (tag infNFe não encontrada).");

  // ── Identificação ──────────────────────────────────────────────────────────
  const ide   = infNFe.getElementsByTagName("ide")[0];
  const emit  = infNFe.getElementsByTagName("emit")[0];
  const total = infNFe.getElementsByTagName("total")[0];

  const number      = getText(ide, "nNF");
  const series      = getText(ide, "serie");
  const emittedAt   = getText(ide, "dhEmi");
  const supplier    = getText(emit, "xNome") || getText(emit, "xFant");
  const supplierCnpj= getText(emit, "CNPJ");
  const totalValue  = getNumber(total?.getElementsByTagName("ICMSTot")[0] ?? total, "vNF");

  // ── Itens ──────────────────────────────────────────────────────────────────
  const detNodes = infNFe.getElementsByTagName("det");
  const products: NFeProduct[] = [];

  for (let i = 0; i < detNodes.length; i++) {
    const det  = detNodes[i];
    const prod = det.getElementsByTagName("prod")[0];
    if (!prod) continue;

    const barcode = getText(prod, "cEAN");

    products.push({
      code:       getText(prod, "cProd"),
      name:       getText(prod, "xProd"),
      barcode:    barcode === "SEM GTIN" ? "" : barcode,
      unit:       mapUnit(getText(prod, "uCom")),
      quantity:   getNumber(prod, "qCom"),
      unitPrice:  getNumber(prod, "vUnCom"),
      totalPrice: getNumber(prod, "vProd"),
      ncm:        getText(prod, "NCM"),
    });
  }

  if (products.length === 0) throw new Error("Nenhum produto encontrado na nota fiscal.");

  return { number, series, emittedAt, supplier, supplierCnpj, totalValue, products };
}

/** Normaliza unidades da NF-e para o sistema */
function mapUnit(unit: string): "unit" | "ml" | "g" | "box" {
  const u = unit.toUpperCase();
  if (["UN", "PC", "UNID", "UNIDADE", "CX"].includes(u)) return "unit";
  if (["ML", "L", "LT", "LITRO"].includes(u))             return "ml";
  if (["G", "GR", "KG", "KGS"].includes(u))               return "g";
  if (["CX", "PCT", "CAIXA", "PACOTE"].includes(u))       return "box";
  return "unit";
}
