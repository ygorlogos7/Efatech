# EfaTech ERP - PRD (Product Requirements Document)

## Original Problem Statement
Hospedar o repositório GitHub (https://github.com/ygorlogos7/Efatech.git) no Emergent.
Domínio customizado: efatechpro.com.br
Banco de dados: Neon PostgreSQL (mantido)

## Architecture
- **Framework:** Next.js 16.2.1 (React 19)
- **Database:** PostgreSQL via Neon Cloud
- **ORM:** Prisma 5.22.0 com driverAdapters
- **Auth:** NextAuth.js 5 (JWT strategy, Credentials provider)
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Runtime:** Node.js 20.20.2
- **Hosting:** Emergent Agent Platform

## User Personas
- **Admin ERP:** Gestor da empresa que utiliza o sistema para controle completo
- **Vendedor:** Funcionário que registra vendas e atendimentos
- **Financeiro:** Responsável por contas a pagar/receber

## Core Requirements (Static)
1. Sistema ERP completo com módulos integrados
2. Autenticação segura com NextAuth
3. Banco de dados Neon PostgreSQL
4. Domínio customizado efatechpro.com.br

## What's Been Implemented
- [2026-04-14] Repositório clonado e configurado no Emergent
- [2026-04-14] Prisma configurado com driverAdapters para Neon
- [2026-04-14] Server Actions CSRF fix (allowedOrigins + allowedForwardedHosts)
- [2026-04-14] AUTH_TRUST_HOST habilitado para NextAuth
- [2026-04-14] Dashboard dinâmico (dados reais do banco, não mockados)
- [2026-04-14] Actions criadas: contratos.ts, relatorios.ts, dashboard.ts
- [2026-04-14] Todos os 17 módulos testados e funcionando
- [2026-04-14] Favicon SVG e titulo dinamico por modulo implementados
- [2026-04-14] Card Pagamentos corrigido (icone engrenagem)

## Prioritized Backlog

### P0 (Critical)
- ✅ Hosting configurado
- ✅ Todos os módulos funcionando
- ✅ Dashboard com dados reais
- DNS propagação completa para efatechpro.com.br

### P1 (Important)
- Certificado SSL para domínio customizado
- Configuração de dados da empresa
- Backup automatizado do banco Neon

### P2 (Nice to have)
- Módulo PDV (Ponto de Venda)
- Notificações por e-mail para contas a vencer
- Integração com WhatsApp para atendimentos
- Dashboard com mais métricas e KPIs

## Next Tasks
1. Verificar propagação DNS do domínio
2. Configurar dados da empresa
3. Popular catálogo de produtos/serviços
4. Configurar notas fiscais
