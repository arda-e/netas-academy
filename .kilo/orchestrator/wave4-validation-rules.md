# Wave 4 Validation Rules

Declarative validation gates for the Wave 4 parallel refactor execution harness. The supervisor agent runs these rules after each worker completes and before marking a unit as `completed`.

## Rule Structure

Each rule has:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (e.g., `V-U01-01`) |
| `unitId` | Which unit this validates |
| `phase` | `pre-dispatch` \| `post-edit` \| `post-build` \| `integration` |
| `type` | `build` \| `lint` \| `test` \| `schema` \| `manual` \| `cross-cutting` |
| `command` | Bash command to run (for automated checks) |
| `expectedOutput` | What constitutes a pass (exit code, text match) |
| `onFailure` | `block` \| `warn` \| `retry` |

---

## Pre-Dispatch Gates

These run before dispatching any worker to a unit.

| ID | Unit | Check | Command / Method | Expected | On Failure |
|----|------|-------|------------------|----------|------------|
| V-PRE-01 | ALL | Upstream dependencies satisfied | Read `wave4-state.json`; verify all `dependencies.upstreamUnits` are `completed` | All deps completed | `block` |
| V-PRE-02 | ALL | No exclusive lock conflict | Check `fileLocks` in state; verify no in-progress unit holds exclusive lock on shared files | No conflicts | `block` |
| V-PRE-03 | U08 | P1-01 gate satisfied | Verify P1-01 public endpoint security/rate-limit behavior is settled on target branch | Confirmed settled | `block` |
| V-PRE-04 | U06, U08 | Baseline failures classified | Verify `FAILING_TESTS.md` has been read and classified by Unit 0 | Classification exists in state | `block` |

---

## Post-Edit Automated Gates

These run after a worker completes its edits, before the unit is marked completed.

### Frontend Units (U01, U02, U03, U04, U05, U07)

| ID | Unit | Gate | Command | Expected | On Failure |
|----|------|------|---------|----------|------------|
| V-U01-01 | U01 | Frontend build | `npm run build:frontend` | exit 0 | `block` |
| V-U01-02 | U01 | Frontend lint | `npm run lint` | exit 0 | `block` |
| V-U01-03 | U01 | Source tests | `npm test --prefix frontend` | exit 0 (relevant tests) | `block` |
| V-U02-01 | U02 | Frontend build | `npm run build:frontend` | exit 0 | `block` |
| V-U02-02 | U02 | Frontend lint | `npm run lint` | exit 0 | `block` |
| V-U02-03 | U02 | Source tests | `npm test --prefix frontend` | exit 0 (relevant tests) | `block` |
| V-U03-01 | U03 | Frontend build | `npm run build:frontend` | exit 0 | `block` |
| V-U03-02 | U03 | Frontend lint | `npm run lint` | exit 0 | `block` |
| V-U03-03 | U03 | Source tests | `npm test --prefix frontend` | exit 0 (relevant tests) | `block` |
| V-U04-01 | U04 | Frontend build | `npm run build:frontend` | exit 0 | `block` |
| V-U04-02 | U04 | Frontend lint | `npm run lint` | exit 0 | `block` |
| V-U04-03 | U04 | Source tests | `npm test --prefix frontend` | exit 0 (relevant tests) | `block` |
| V-U05-01 | U05 | Frontend build | `npm run build:frontend` | exit 0 | `block` |
| V-U05-02 | U05 | Frontend lint | `npm run lint` | exit 0 | `block` |
| V-U05-03 | U05 | Source tests | `npm test --prefix frontend` | exit 0 (relevant tests) | `block` |
| V-U07-01 | U07 | Frontend build | `npm run build:frontend` | exit 0 | `block` |
| V-U07-02 | U07 | Frontend lint | `npm run lint` | exit 0 | `block` |
| V-U07-03 | U07 | Source tests | `npm test --prefix frontend` | exit 0 (relevant tests) | `block` |

### Backend Units (U06, U08)

| ID | Unit | Gate | Command | Expected | On Failure |
|----|------|------|---------|----------|------------|
| V-U06-01 | U06 | Backend build | `npm run build:backend` | exit 0 | `block` |
| V-U06-02 | U06 | Backend tests | `npm run test --prefix backend` | exit 0 (minus known baselines) | `block` |
| V-U08-01 | U08 | Backend build | `npm run build:backend` | exit 0 | `block` |
| V-U08-02 | U08 | Backend tests | `npm run test --prefix backend` | exit 0 (minus known baselines) | `block` |
| V-U08-03 | U08 | Seed workflow | `npm run seed:demo` | exit 0 | `block` |

---

## Cross-Cutting Invariants

These apply to ALL units. The supervisor checks them by reading diffs and state after each worker completes.

| ID | Invariant | Check Method | On Violation |
|----|-----------|-------------|-------------|
| V-CC-01 | No Turkish IA/routes changed | `git diff` for route renames outside unit scope | `block`, report |
| V-CC-02 | No PII logged | Diff shows no emails, phones, TCKN, bodies, auth headers | `block`, report |
| V-CC-03 | No scope creep | Changed files are subset of unit's `fileOwnership.modify` + `fileOwnership.create` | `block`, handoff |
| V-CC-04 | No generated/dependency edits | No changes in `.next/`, `node_modules/`, `dist/` | `block` |
| V-CC-05 | File size limits | No new module >200 lines; no monolith growth | `warn` |
| V-CC-06 | Turkish copy preserved | Labels, placeholders unchanged unless explicitly allowed | `block` |
| V-CC-07 | No broad read-only discovery | Worker instructions forbid it; verify worker output does not mention scanning | `block` |
| V-CC-08 | Worker stayed in write boundary | All changed files are in unit's `fileOwnership.modify` or `fileOwnership.create` | `block`, handoff |

---

## Integration Validation (Unit 9 Only)

These run during Phase 3 after Unit 9 completes reconciliation.

| ID | Check | Details | On Failure |
|----|-------|---------|------------|
| V-U09-01 | Shared client contract | Verify cache→validate→retry→log order; no duplicate logs, no swallowed errors | `block` |
| V-U09-02 | Cross-unit behavior | Editorial pages render with consistent cache, validation, and media | `block` |
| V-U09-03 | No-store boundaries | Registration status and mutation paths remain uncached | `block` |
| V-U09-04 | Runtime smoke: build | Build both apps (`npm run build`) | `block` |
| V-U09-05 | Runtime smoke: startup | Start backend + frontend against demo data | `block` |
| V-U09-06 | Runtime smoke: pages | Load representative list/detail pages | `block` |
| V-U09-07 | Runtime smoke: proxy | Exercise public proxy submit routes with safe test payloads | `block` |
| V-U09-08 | Runtime smoke: Strapi-down | Force Strapi-unavailable path; verify 502 proxy behavior | `block` |
| V-U09-09 | Runtime smoke: plugin | Strapi starts with notification plugin; seed data intact | `block` |
| V-U09-10 | Baseline separation | Known failures from `FAILING_TESTS.md` separated from new regressions | `block` |

---

## Baseline Failure Filtering

For Units 6 and 8, the supervisor must filter known pre-existing failures from validation output. The baseline is defined in `backend/tests/FAILING_TESTS.md`:

| Category | Count | Filter Rule |
|----------|-------|-------------|
| contact-submission kvkkConsent | 9 | Subtract from `npm run test --prefix backend` failure count |
| TCKN masking | 3 | Subtract from failure count |
| SPL/SOAP XML parsing | 4 | Subtract from failure count |
| U06 blog-author schema test | 1 | Already fixed; do not subtract |

The supervisor should:
1. Run `npm run test --prefix backend` and capture all failures
2. Compare against the known baseline list
3. Report known baseline failures separately as `knownBaselineFailures`
4. Only `block` the unit if there are NEW failures beyond the baseline

---

## Validation Execution Protocol

The supervisor runs validation in this order for each unit:

1. **Pre-dispatch**: Check state, acquire locks, verify gates
2. **Dispatch worker**: via `task` tool with `wave4-worker` agent type
3. **Wait for completion**: Worker returns results
4. **Post-edit automated**: Run build/lint/test commands
5. **Cross-cutting manual**: Read diffs, check invariants
6. **Update state**: Mark unit as `completed`, `failed`, or `blocked`
7. **Log**: Record all validation outcomes in `validationLog`
