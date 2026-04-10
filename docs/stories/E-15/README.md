# E-15: GitHub Pages Deployment

**Priority:** P1
**Dependencies:** E-01 complete (Vite base path configured in S-01.15), all v1 epics complete
**Goal:** The app is deployed to `byram.dev/codequest-platform/` via GitHub Actions on every push to `main`.

Deployment is the final step before the platform is publicly accessible. The CI workflow from E-01 handles PRs; this epic handles the deployment to `gh-pages` branch on merges to `main`. Because the Vite base path was configured in E-01 (S-01.15), this epic is mostly GitHub Actions configuration and verification.

## Stories

| # | Story | Size |
|---|-------|------|
| S-15.01 | Verify Vite base path configuration | XS |
| S-15.02 | GitHub Actions deploy workflow | S |
| S-15.03 | Smoke test at live URL | XS |

## Dependency Order

```
S-15.01 (verify base path)
  └── S-15.02 (deploy workflow)
        └── S-15.03 (smoke test)
```

## Notes

The CI workflow (`.github/workflows/ci.yml`) was created in E-01 (S-01.18) and runs on PRs. The deploy workflow (`.github/workflows/deploy.yml`) is new in this epic — it runs on push to `main` and deploys to `gh-pages`. These are two separate workflow files; do not merge them.
