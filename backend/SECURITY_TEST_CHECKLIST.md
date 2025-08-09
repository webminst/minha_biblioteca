# Checklist Prático de Testes de Segurança para Endpoints

Este checklist pode ser usado manualmente ou como base para automação de testes de segurança.

## 1. Testes de Autenticação e Sessão

- [ ] Testar login com credenciais válidas e inválidas
- [ ] Testar brute force no login (com e sem rate limit)
- [ ] Testar fluxo de registro de usuário
- [ ] Testar fluxo de refresh token (replay, expiração, rotação)
- [ ] Testar fluxo de 2FA (ativação, verificação, desativação, backup codes)
- [ ] Testar logout e revogação de tokens

## 2. Testes de Autorização

- [ ] Tentar acessar endpoints privados sem autenticação
- [ ] Tentar acessar endpoints privados com token inválido/expirado
- [ ] Tentar acessar recursos de outros usuários (escalada horizontal)
- [ ] Tentar acessar rotas administrativas sem permissão

## 3. Testes de Injeção

- [ ] Testar SQL/NoSQL Injection em todos os campos de entrada
- [ ] Testar Command Injection onde aplicável

## 4. Testes de Rate Limiting e Brute Force

- [ ] Testar limites de requisições em endpoints sensíveis (login, registro, refresh, etc.)
- [ ] Tentar bypassar o rate limit

## 5. Testes de XSS e CSRF

- [ ] Testar XSS em campos de entrada e respostas
- [ ] Testar CSRF em endpoints sensíveis (se aplicável)

## 6. Testes de Exposição de Dados

- [ ] Verificar se dados sensíveis aparecem em respostas, erros ou logs
- [ ] Testar vazamento de informações em mensagens de erro

## 7. Testes de Integração e Serviços Externos

- [ ] Testar segurança das integrações com Redis e APIs externas
- [ ] Testar acesso não autorizado a serviços internos

## 8. Testes de Configuração

- [ ] Verificar headers de segurança (CORS, CSP, HSTS, etc.)
- [ ] Verificar exposição de arquivos de configuração e logs

---

Este checklist pode ser adaptado conforme o escopo do projeto evoluir.
