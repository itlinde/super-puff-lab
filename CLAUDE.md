# The Super Puff Lab

Read `SPEC.md` before any work. It is the source of truth; ask Isabella instead of guessing.

- Build in slices (SPEC §8). Check in with Isabella after each slice and wait for approval.
- Never write marketing copy. Use Aritzia's verbatim copy from `src/data/variants.ts` or mark `[COPY: …]`.
- Use tokens from `src/styles/tokens.css`; don't hardcode colours, sizes or spacing in UI code.
- Don't add dependencies without asking.
- Verify visually: `npm run dev`, then `node scripts/shots.mjs http://localhost:5173 <outDir> name=query…` renders screenshots headlessly.
- `npm run build` (typecheck + Vite build) must pass before committing.
