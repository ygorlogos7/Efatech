# EfaTech ERP - Guia de Hospedagem no Emergent

## ✅ Status do Deployment

Seu sistema ERP EfaTech foi hospedado com sucesso no Emergent!

### 🌐 URLs de Acesso

- **URL Temporária (Preview)**: https://74ca45c6-fa8a-4584-8723-09939e8e1666.preview.emergentagent.com
- **URL do Domínio Customizado**: https://efatechpro.com.br (após configuração DNS)

---

## 🔧 Configuração DNS no Registro.com.br

Para que seu domínio **efatechpro.com.br** aponte para o sistema hospedado no Emergent, siga estas etapas:

### Passo 1: Acesse o Painel do Registro.com.br
1. Faça login em https://registro.br
2. Acesse a seção "Meus Domínios"
3. Selecione o domínio **efatechpro.com.br**
4. Clique em "Editar Zona" ou "DNS"

### Passo 2: Configure os Registros DNS

Adicione os seguintes registros DNS:

#### Opção A - Usando CNAME (Recomendado)
```
Tipo: CNAME
Nome: @ (ou deixe em branco para root)
Valor: 74ca45c6-fa8a-4584-8723-09939e8e1666.preview.emergentagent.com
TTL: 3600
```

#### Opção B - Usando registros A (se CNAME não funcionar para root)
```
Tipo: A
Nome: @ 
Valor: [IP do servidor Emergent - solicitar ao suporte]
TTL: 3600

Tipo: CNAME
Nome: www
Valor: 74ca45c6-fa8a-4584-8723-09939e8e1666.preview.emergentagent.com
TTL: 3600
```

### Passo 3: Aguarde a Propagação
- A propagação DNS pode levar de 1 a 48 horas
- Você pode verificar o status em: https://dnschecker.org

---

## 📊 Informações Técnicas

### Stack Tecnológica
- **Framework**: Next.js 16.2.1
- **Banco de Dados**: PostgreSQL (Neon)
- **ORM**: Prisma 5.22.0
- **Autenticação**: NextAuth.js 5
- **UI**: React 19 + Tailwind CSS
- **Node.js**: v20.20.2

### Banco de Dados
- **Provider**: Neon (PostgreSQL)
- **Status**: ✅ Conectado e sincronizado
- **Migrations**: Aplicadas com sucesso

### Variáveis de Ambiente Configuradas
- ✅ DATABASE_URL (Neon PostgreSQL)
- ✅ AUTH_SECRET (NextAuth)
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL

---

## 🚀 Como Acessar o Sistema

1. **Acesso Temporário**: Use a URL Preview fornecida acima
2. **Após Configuração DNS**: Acesse https://efatechpro.com.br

---

## 📝 Comandos Úteis

### Verificar Status do Servidor
```bash
sudo supervisorctl status nextjs
```

### Reiniciar o Servidor
```bash
sudo supervisorctl restart nextjs
```

### Ver Logs em Tempo Real
```bash
tail -f /var/log/supervisor/nextjs.out.log
```

### Ver Erros
```bash
tail -f /var/log/supervisor/nextjs.err.log
```

---

## 🔐 Próximos Passos Recomendados

1. **Configurar DNS** seguindo as instruções acima
2. **Criar Usuário Administrador** no sistema
3. **Configurar Backup** do banco de dados Neon
4. **Testar Todas as Funcionalidades** do ERP
5. **Configurar Certificado SSL** (será automático após DNS)

---

## 📞 Suporte

Se precisar de ajuda adicional:
- Suporte Emergent: suporte@emergentagent.com
- Documentação Neon: https://neon.tech/docs
- Documentação Next.js: https://nextjs.org/docs

---

## ✨ Módulos do Sistema ERP

Seu sistema inclui os seguintes módulos:
- 📊 Dashboard
- 👥 Clientes e Fornecedores
- 📦 Produtos e Serviços
- 💰 Financeiro (Contas a Pagar/Receber)
- 📋 Ordens de Serviço
- 💵 Vendas (Produtos e Serviços)
- 📄 Orçamentos
- 🏪 Estoque
- 📜 Notas Fiscais (NFe, NFSe, NFCe)
- 📞 Atendimento ao Cliente
- 📊 Relatórios Completos
- ⚙️ Configurações do Sistema

---

**Sistema hospedado em**: 14/04/2026
**Desenvolvido por**: Efatech
**Hospedagem**: Emergent Agent Platform
