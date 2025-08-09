# Escopo Inicial de Testes de Segurança e Pentest

## Endpoints de Autenticação e Sessão

- POST /auth/register
- POST /auth/login
- POST /auth/verify
- POST /auth/refresh
- POST /auth2fa/setup
- POST /auth2fa/enable
- POST /auth2fa/verify
- POST /auth2fa/disable
- POST /auth2fa/backup-codes/regenerate
- GET  /auth2fa/status
- POST /auth_with_dto/register
- POST /auth_with_dto/login
- POST /auth_with_dto/refresh
- PUT  /auth_with_dto/profile
- POST /auth_with_dto/logout

## Endpoints de Dados Sensíveis

- Todas as rotas de usuários, livros, sermões, áreas, autores, etc.
- Exemplos:
  - GET/POST/PUT/DELETE /books, /books/:id
  - GET/POST/PUT/DELETE /sermons, /sermons/:id
  - GET/POST/PUT/DELETE /users, /users/:id

## Endpoints Públicos e Privados

- GET /sermons, /sermons/latest, /sermons/stats, /sermons/series, /sermons/speakers, /sermons/books, /sermons/suggestions, /sermons/series/:name, /sermons/speaker/:name, /sermons/search/:term, /sermons/:id, /sermons/:id/ratings
- POST /sermons/:id/rate
- POST/PUT/PATCH/DELETE /sermons/:id
- GET /books, /books/latest, /books/search/:term, /books/stats, /books/authors, /books/areas, /books/publishers, /books/series, /books/popular, /books/author/:name, /books/area/:area, /books/suggestions, /books/:id/related, /books/:id, /books/:id/ratings
- POST /books/:id/rate
- POST/PUT/DELETE /books/:id

## Endpoints de Administração e Auditoria

- POST /adminCleanInvalidAreas/clean-invalid-areas
- GET /audit/logs, /audit/logs/:traceId, /audit/users/:userId/logs, /audit/actions/:action/logs, /audit/critical, /audit/stats, /audit/summary, /audit/export, /audit/config, /audit/health, /audit/auto-populate
- POST /audit/cleanup, /audit/generate-test-data

## Integrações e Serviços Externos

- Testar endpoints que interagem com Redis, APIs externas, etc.

## Observações

- Priorizar testes em endpoints de autenticação, refresh token, 2FA, dados sensíveis e rotas administrativas.
- Testar tanto rotas públicas quanto privadas.
- Incluir testes de rate limiting, brute force, injeção, XSS, CSRF, vazamento de dados e configuração.

---

Este arquivo pode ser expandido conforme novas rotas e integrações forem identificadas.
