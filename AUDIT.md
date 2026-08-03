# eventive — Project Audit

**Repo:** `YassinAliYassin/eventive`
**Audit date:** August 2026
**Type:** Marketing site for an upcoming Zimbabwe events company (React + Vite + TS + Express + Tailwind)
**Status:** Live deployed site

---

## Component scores (0–10)

| Area | Score | Notes |
| --- | --- | --- |
| Architecture | 8.5 | Clean SPA with a data layer (`src/data/`), marketing sections, and a small Express/Vite server. Components exported from composable modules. |
| Code quality | 8.0 | TypeScript throughout, ESLint configured, declarative data-driven sections. |
| Security | 7.5 | Uses `helmet`, `cors`, `express-rate-limit` on the server. Secrets handled via env (Gemini). No committed secrets found. |
| Documentation | 3.0 | README was a single placeholder line. (Fully rewritten in this pass.) |
| Maintainability | 7.5 | Small, self-contained marketing component files; data separated from presentation. |
| Performance | 7.5 | Vite production build + SWC; analytics via `@vercel/analytics`. No obvious leaks. |
| Developer experience | 6.5 | `npm run dev`, lint, type-check, build, analyze all present. No CI. |
| Business readiness | 3.5 | Live site but no roadmap, no CHANGELOG, no contributor process (now added). |

**Overall weighted score: ~6.5** — a clean, well-built marketing site that was missing production process tooling and documentation.

---

## Improvements

### High priority

- **H1 — Continuous integration.** No CI existed. Add a workflow that installs, lints, type-checks, and builds on every push/PR. *(done in this pass)*
- **H2 — Production README.** The repo had a one-line placeholder. *(done in this pass)*

### Medium priority

- **M1 — Add a test harness.** The repo has `@testing-library/react` in devDependencies but no test script. Consider a smoke/render test for each marketing section.
- **M2 — CHANGELOG + release process.** Templates added; tag releases going forward.
- **M3 — Graceful handling of the `preinstall: npm install -g tsx`.** Global installs are slow and can be flaky in CI; prefer a local devDependency (currently `tsx` is globally installed via preinstall).

### Low priority

- **L1 — Lighthouse/CSP hardening** for the public site.
- **L2 — Screenshots** in README (placeholder added).
- **L3 — Environment variable documentation** (Gemini key, analytics measure IDs).

---

## Security audit notes

- Server uses `helmet`, `cors`, and `express-rate-limit`. **Good baseline.**
- Gemini key is passed via env; **no real secrets committed.** Confirmed.
- Deployment config and domain/registrar are **intentionally not touched** in this pass.

---

## Tech debt estimate

- **Minimal.** The app is small and clean. Debt is mostly **process**: no CI (now added), no tests wired up, placeholder README (now fixed).
- Estimated effort to clear all listed items: **1–1.5 days**.
- Estimated total outstanding tech debt: **low (~1 day).**

---

## Recommendation

Docs + hygiene + CI only. No public API changes; deployment config (`server.ts`,
ports, hosting) left untouched.
