# Contributing to eventive

Thank you for your interest in contributing! This project is part of a portfolio
of production web/TypeScript applications and is maintained with care.

## Ways to contribute

- Report bugs and request features via the GitHub issue templates.
- Improve documentation (README, CHANGELOG, inline comments).
- Fix bugs and add small, safe improvements.
- Review open pull requests.

## Development workflow

1. Fork the repo (or work on a feature branch for direct contributors).
2. Create a branch: `git checkout -b feature/my-change` or
   `git checkout -b fix/my-bugfix`.
3. Make your changes — keep them small, focused, and reviewable.
4. Run the verification suites (see the repo README):
   ```bash
   npm install
   npm run type-check   # or the repo's equivalent
   npm run build        # or the repo's equivalent
   npm test             # if tests exist
   ```
5. Commit with a clear, conventional message:
   `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
6. Push and open a pull request against `main`.

## Code style

Formatting and linting are handled by the repo's tooling (Prettier/ESLint where
configured). Match the surrounding style; do not reformat unrelated code.

## Pull request checklist

- [ ] Does not change public APIs or break existing behaviour.
- [ ] Builds and passes type-checking and tests locally.
- [ ] Keeps secrets out of the repo (use env vars / `.env.local`).
- [ ] Updates documentation (README / CHANGELOG) where relevant.

## Security

Never commit real secrets, API keys, or Firebase private keys. If you discover a
security issue, do **not** open a public issue — see `SECURITY.md` for the
responsible-disclosure process.
