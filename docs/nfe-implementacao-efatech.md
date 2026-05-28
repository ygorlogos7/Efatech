# Implementacao NF-e no Efatech

Este documento resume como foi feita a implementacao da NF-e no projeto, os principais erros encontrados durante os testes e as plataformas utilizadas.

## 1) Objetivo

Implementar emissao de NF-e integrada com Focus NFe, com:

- emissao a partir de venda;
- controle de ambiente (homologacao/producao);
- download de DANFE (PDF) e XML dentro do sistema;
- salvamento local de arquivos (opcional);
- envio automatico por e-mail ao cliente;
- interface de configuracoes de notas.

## 2) Plataformas e servicos usados

- **Next.js 16** (frontend + server actions + rotas API).
- **Prisma + PostgreSQL (Neon)** para persistencia.
- **Focus NFe API** para emissao/autorizacao/download de documentos fiscais.
- **Resend** para envio de e-mails transacionais (NF-e, verificacao, etc.).
- **Cloudflare DNS** para configuracao SPF/DKIM/MX do dominio de envio.
- **Gmail** usado como caixa de teste para validar recebimento e anexos.

## 3) Arquitetura implementada (resumo)

### Emissao NF-e

- Action principal: `src/actions/notas.ts` (`emitirNfeFromVenda`).
- Fluxo:
  1. valida cadastros (emitente, cliente, itens fiscais);
  2. monta payload NF-e com `buildNfePayloadFromVenda`;
  3. envia para Focus;
  4. consulta status ate estado final (autorizado/rejeitado);
  5. grava em `NotaFiscal`;
  6. incrementa numeracao em `NotasConfig`;
  7. dispara rotinas adicionais (salvar local e e-mail automatico).

### Configuracoes de notas

- Pagina: `src/app/(dashboard)/notas/opcoes/configuracoes/page.tsx`.
- Action: `saveNotasConfig` / `getNotasConfig` em `src/actions/notas.ts`.
- Campos adicionados:
  - `SalvarArquivosLocal` (boolean)
  - `PastaExportacaoLocal` (string nullable)

### Download DANFE/XML no ERP

- Rotas API:
  - `src/app/api/notas/[id]/danfe/route.ts`
  - `src/app/api/notas/[id]/xml/route.ts`
- Servico:
  - `src/lib/focus-nfe/notas-arquivos.ts`
- Comportamento:
  - so permite download quando NF-e esta autorizada;
  - baixa na Focus com autenticacao da API e entrega arquivo no ERP.

### Salvamento local de XML/PDF

- Servico: `src/lib/focus-nfe/export-local.ts`.
- Acionado apos autorizacao quando habilitado nas configuracoes.
- Nomeia arquivos por serie/numero/ref e grava em pasta configurada.

### Envio automatico por e-mail (NF-e)

- Implementado em `src/actions/notas.ts`.
- Anexa `NFe-<numero>.pdf` e `NFe-<numero>.xml`.
- Usa remetente priorizando `EMAIL_FROM` (com fallback).

## 4) Principais erros encontrados e solucao

### 4.1 `Unknown argument SalvarArquivosLocal` (Prisma)

- **Causa:** client Prisma em memoria sem campos novos.
- **Solucao:** ajuste de persistencia e leitura com compatibilidade; atualizacao de schema/client.

### 4.2 Download retornando erro com status 200

- **Causa:** Focus retornava JSON/HTML (painel) no lugar do binario PDF/XML em alguns cenarios.
- **Solucao:** validacao de conteudo real:
  - PDF por assinatura `%PDF`;
  - XML por conteudo iniciando em `<`;
  - fallback por caminhos de arquivo retornados (`caminho_danfe`, `caminho_xml_nota_fiscal`).

### 4.3 HTML do painel Focus no lugar do DANFE

- **Causa:** URL de painel/sessao sendo usada como se fosse endpoint de API.
- **Solucao:** bloquear URL de painel e usar somente endpoints/caminhos validos da Focus API.

### 4.4 E-mail automatico falhando com `gmail.com domain is not verified`

- **Causa:** remetente configurado com Gmail (`NEXT_PUBLIC_SENDER_EMAIL`) em vez de dominio verificado.
- **Solucao:** usar dominio proprio verificado no Resend (`EMAIL_FROM` / `noreply@efatechpro.com.br`) e reiniciar servidor.

### 4.5 Logo quebrada no e-mail da NF-e

- **Causa:** template montando imagem com base em `localhost` durante testes.
- **Solucao:** fallback para URL publica da logo (`NFE_EMAIL_LOGO_URL` / app URL publica).

## 5) Variaveis de ambiente relevantes

- `FOCUS_NFE_TOKEN`
- `FOCUS_NFE_TOKEN_PROD`
- `FOCUS_NFE_BASE_URL`
- `FOCUS_NFE_BASE_URL_PROD`
- `EMAIL_FROM`
- `NEXT_PUBLIC_SENDER_EMAIL` (compatibilidade/fallback)
- `RESEND_API_KEY`
- `NFE_EMAIL_LOGO_URL` (opcional, recomendado para logo publica em e-mail)
- `NFE_EMITENTE_*` (nome/endereco/telefone fixos do emitente no payload)

## 6) Regras operacionais importantes

- Em **homologacao**, DANFE pode exibir sem valor fiscal (esperado).
- Em **producao**, todo documento tem valor juridico real.
- Cliente final nao precisa acessar painel Focus: tudo pode ser entregue pelo ERP (download e e-mail).

## 7) Resultado final

Fluxo NF-e completo funcionando no Efatech:

- emissao;
- autorizacao;
- download de PDF/XML;
- salvamento local opcional;
- envio automatico por e-mail com template visual padronizado;
- segregacao correta entre empresas de cadastro e empresas internas (emitentes).
