/** Cabeçalho da loja Efatech Assistência em cupons térmicos (vendas, O.S.). */

export const EMITENTE_CUPOM_NOME = "EFATECH ASSISTÊNCIA TÉCNICA E ACESSÓRIOS";

export type EmpresaCupomFields = {
  Cnpj?: string | null;
  Logradouro?: string | null;
  Numero?: string | null;
  Bairro?: string | null;
  Cidade?: string | null;
  Cep?: string | null;
  Telefone?: string | null;
};

const FALLBACK: Required<EmpresaCupomFields> = {
  Cnpj: "44.425.203/0001-03",
  Logradouro: "Rua Jurubatuba",
  Numero: "933",
  Bairro: "Centro",
  Cidade: "São Bernardo do Campo",
  Cep: "09.725-210",
  Telefone: "(11) 91091-8448",
};

export function dadosEmitenteCupom(empresa?: EmpresaCupomFields | null) {
  const logradouro = empresa?.Logradouro?.trim() || FALLBACK.Logradouro;
  const numero = empresa?.Numero?.trim() || FALLBACK.Numero;
  const bairro = empresa?.Bairro?.trim() || FALLBACK.Bairro;
  const cidade = empresa?.Cidade?.trim() || FALLBACK.Cidade;
  const cep = empresa?.Cep?.trim() || FALLBACK.Cep;

  return {
    nome: EMITENTE_CUPOM_NOME,
    cnpj: empresa?.Cnpj?.trim() || FALLBACK.Cnpj,
    telefone: empresa?.Telefone?.trim() || FALLBACK.Telefone,
    enderecoLinha1: `${logradouro}, ${numero} - ${bairro}`,
    enderecoLinha2: `${cidade} - CEP: ${cep}`,
  };
}
