/**
 * Nome exibido no DANFE/XML da NF-e (cabeçalho do emitente).
 * CNPJ e IE continuam vindo da empresa interna selecionada na emissão.
 * Endereço/telefone abaixo podem ser fixos para padronizar DANFE.
 */
export const NFE_EMITENTE_RAZAO_SOCIAL =
  process.env.NFE_EMITENTE_RAZAO_SOCIAL?.trim() ||
  "EFATECH ASSISTENCIA E ACESSORIOS LTDA";

export const NFE_EMITENTE_NOME_FANTASIA =
  process.env.NFE_EMITENTE_NOME_FANTASIA?.trim() || "EfaTech";

export const NFE_EMITENTE_LOGRADOURO =
  process.env.NFE_EMITENTE_LOGRADOURO?.trim() || "Praca Lauro Gomes";

export const NFE_EMITENTE_NUMERO =
  process.env.NFE_EMITENTE_NUMERO?.trim() || "20";

export const NFE_EMITENTE_BAIRRO =
  process.env.NFE_EMITENTE_BAIRRO?.trim() || "Centro";

export const NFE_EMITENTE_CIDADE =
  process.env.NFE_EMITENTE_CIDADE?.trim() || "Sao Bernardo do Campo";

export const NFE_EMITENTE_UF =
  process.env.NFE_EMITENTE_UF?.trim() || "SP";

export const NFE_EMITENTE_CEP =
  process.env.NFE_EMITENTE_CEP?.trim() || "09710-040";

export const NFE_EMITENTE_TELEFONE =
  process.env.NFE_EMITENTE_TELEFONE?.trim() || "11910918448";
