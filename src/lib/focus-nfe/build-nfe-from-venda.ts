import { FocusNfePayload } from "./types";

function digitsOnly(v?: string | null) {
  return (v || "").replace(/\D/g, "");
}

function normalizeInscricaoEstadual(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) return undefined;
  if (raw.toLowerCase() === "isento") return "ISENTO";
  const digits = digitsOnly(raw);
  return digits || undefined;
}

function numberOrZero(value: unknown) {
  return Number(value || 0);
}

export function buildNfePayloadFromVenda(venda: any, empresaEmitente: any): FocusNfePayload {
  const cliente = venda?.Cliente;
  const endCli = cliente?.Endereco?.[0];
  const emitCnpj = digitsOnly(empresaEmitente?.Cnpj);
  const destDoc = digitsOnly(cliente?.CPFCNPJ);
  const destCnpj = destDoc.length > 11 ? destDoc : undefined;
  const destCpf = destDoc.length === 11 ? destDoc : undefined;
  const itens = (venda?.Itens || []).map((item: any, idx: number) => {
    const produto = item?.Produtos;
    const qty = numberOrZero(item?.Quantidade) || 1;
    const total = numberOrZero(item?.ValorTotal);
    const unit = qty > 0 ? total / qty : total;
    return {
      numero_item: idx + 1,
      codigo_produto: String(produto?.Cod_CodigoBarras || produto?.Id || idx + 1),
      descricao: String(produto?.Cod_Nome || `Produto ${idx + 1}`),
      cfop: String(produto?.cod_cfop || "5102"),
      unidade_comercial: String(produto?.unidade_comercial || "UN"),
      quantidade_comercial: qty,
      valor_unitario_comercial: unit,
      valor_bruto: total,
      unidade_tributavel: String(produto?.unidade_comercial || "UN"),
      quantidade_tributavel: qty,
      valor_unitario_tributavel: unit,
      codigo_ncm: produto?.cod_ncm ? String(produto.cod_ncm) : undefined,
      icms_origem: produto?.icms_origem ?? 0,
      icms_situacao_tributaria: produto?.icms_cst_csosn ? String(produto.icms_cst_csosn) : undefined,
      pis_situacao_tributaria: produto?.pis_cst ? String(produto.pis_cst) : undefined,
      cofins_situacao_tributaria: produto?.cofins_cst ? String(produto.cofins_cst) : undefined,
    };
  });

  const ufEmit = String(empresaEmitente?.Uf || "SP");
  const ufDest = String(endCli?.UF || ufEmit);

  return {
    natureza_operacao: "Venda de mercadoria",
    data_emissao: new Date(venda?.DataVenda || new Date()).toISOString(),
    tipo_documento: 1,
    finalidade_emissao: 1,
    local_destino: ufEmit === ufDest ? 1 : 2,
    consumidor_final: 1,
    presenca_comprador: 1,
    cnpj_emitente: emitCnpj,
    nome_emitente: empresaEmitente?.RazaoSocial || undefined,
    nome_fantasia_emitente: empresaEmitente?.NomeFantasia || empresaEmitente?.RazaoSocial || undefined,
    telefone_emitente: digitsOnly(empresaEmitente?.Telefone) || undefined,
    inscricao_estadual_emitente: normalizeInscricaoEstadual(empresaEmitente?.InscricaoEstadual),
    regime_tributario_emitente: Number(empresaEmitente?.RegimeTributario) === 3 ? 3 : Number(empresaEmitente?.RegimeTributario) === 2 ? 2 : 1,
    logradouro_emitente: empresaEmitente?.Logradouro || undefined,
    numero_emitente: empresaEmitente?.Numero || undefined,
    bairro_emitente: empresaEmitente?.Bairro || undefined,
    municipio_emitente: empresaEmitente?.Cidade || undefined,
    uf_emitente: ufEmit,
    cep_emitente: digitsOnly(empresaEmitente?.Cep) || undefined,
    nome_destinatario: cliente?.Nome || "CONSUMIDOR FINAL",
    cnpj_destinatario: destCnpj,
    cpf_destinatario: destCpf,
    logradouro_destinatario: endCli?.Logradouro || undefined,
    numero_destinatario: endCli?.Numero || undefined,
    bairro_destinatario: endCli?.Bairro || undefined,
    municipio_destinatario: endCli?.Cidade || undefined,
    uf_destinatario: endCli?.UF || undefined,
    cep_destinatario: digitsOnly(endCli?.Cep) || undefined,
    indicador_inscricao_estadual_destinatario: "9",
    valor_produtos: numberOrZero(venda?.TotalProdutos || venda?.Total),
    valor_total: numberOrZero(venda?.Total),
    modalidade_frete: 9,
    items: itens,
  };
}
