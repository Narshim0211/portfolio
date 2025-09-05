# ADR-0001: Modular Monolith with Clear Boundaries

## Context
We need strong separation of concerns, shared types, and simple deploys early while retaining the option to split later.

## Decision
Adopt a modular monolith with workspaces:
- apps (api, web, worker)
- packages (contracts, data-access, core-domain, messaging, notifications)

## Consequences
- Faster local dev, single repo governance
- Clear seams to extract services later if needed
- Shared zod contracts prevent drift