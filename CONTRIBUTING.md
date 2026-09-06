# Contributing Guidelines

## Development Rules for Enterprise NGO Platform

1. **Strict Typing**: No `any`, implicit any, or unhandled null checks.
2. **Multi-Tenancy**: All database queries and repositories MUST include `organizationId` scoping.
3. **No Secrets in Code**: All keys, passwords, and tokens must go through `src/config/environment.ts` and `.env.example`.
4. **Reusable UI**: Use components from `src/components/ui/` instead of writing custom low-level markup or ad-hoc buttons/inputs.
5. **Accessibility**: All interactive elements must maintain semantic HTML, focus states, and pass WCAG AA contrast guidelines.
6. **Logging Hygiene**: Never log passwords, payment details, or JWTs. The logger in `src/lib/logger.ts` automatically redacts sensitive keys.
