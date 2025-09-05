## Contributing Guide

### Code Style
- TypeScript everywhere; strict mode. Prefer explicit types for public APIs.
- Validate all inputs with zod at boundaries.
- Keep functions small with clear names; handle error cases first.

### Testing
- Unit tests with Vitest under packages/* (domain logic).
- Integration tests for API (to be added) using mocked DB/Redis.
- E2E tests for booking wizard and payments (to be added).

### Branching
- Use feature branches named `feat/<area>-<short-desc>`.
- Open PRs with a checklist: tests added, docs updated, security reviewed.

### Security
- No secrets in frontend; use env vars on server.
- Keep dependencies updated; run audit in CI.

