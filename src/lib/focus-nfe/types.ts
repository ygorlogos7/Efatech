export type FocusAmbiente = "homologacao" | "producao";

export interface FocusNfeItemPayload {
  numero_item: number;
  codigo_produto: string;
  descricao: string;
  cfop: string;
  unidade_comercial: string;
  quantidade_comercial: number;
  valor_unitario_comercial: number;
  valor_bruto: number;
  unidade_tributavel: string;
  quantidade_tributavel: number;
  valor_unitario_tributavel: number;
  codigo_ncm?: string;
  icms_origem?: number;
  icms_situacao_tributaria?: string;
  pis_situacao_tributaria?: string;
  cofins_situacao_tributaria?: string;
}

export interface FocusNfePayload {
  natureza_operacao: string;
  data_emissao: string;
  tipo_documento: number;
  finalidade_emissao: number;
  local_destino: number;
  consumidor_final: number;
  presenca_comprador: number;
  cnpj_emitente: string;
  nome_emitente?: string;
  nome_fantasia_emitente?: string;
  telefone_emitente?: string;
  inscricao_estadual_emitente?: string;
  regime_tributario_emitente?: number;
  logradouro_emitente?: string;
  numero_emitente?: string;
  bairro_emitente?: string;
  municipio_emitente?: string;
  uf_emitente?: string;
  cep_emitente?: string;
  nome_destinatario: string;
  cpf_destinatario?: string;
  cnpj_destinatario?: string;
  logradouro_destinatario?: string;
  numero_destinatario?: string;
  bairro_destinatario?: string;
  municipio_destinatario?: string;
  uf_destinatario?: string;
  cep_destinatario?: string;
  indicador_inscricao_estadual_destinatario?: string;
  valor_produtos: number;
  valor_total: number;
  modalidade_frete: number;
  items: FocusNfeItemPayload[];
}

export interface FocusNfeResponse {
  status?: string;
  motivo?: string;
  chave?: string;
  url_danfe?: string;
  caminho_xml_nota_fiscal?: string;
  numero?: string;
  serie?: string;
  [key: string]: unknown;
}
