# Release Checklist

**Purpose**: Ensure all releases meet quality standards and avoid common pitfalls.

**Last Updated**: 2025-10-29 (Post v0.1.1 lessons learned)

---

## 🎯 Pre-Release Validation (REQUIRED)

### Step 1: Run Validation Script

```bash
pnpm validate:release
```

This script simulates the CI environment locally and checks:

- ✅ Fresh dependency install (no stale cache)
- ✅ Build succeeds
- ✅ Lint passes (zero errors)
- ✅ Type check passes (zero errors)
- ✅ Security audit clean (no moderate+ vulnerabilities)
- ✅ Tests pass (excluding performance benchmarks)
- ✅ Code formatting consistent (Prettier)

**❗ CRITICAL**: If this script fails, **DO NOT** create a release PR. Fix issues first.

### Step 2: Verify Git State

```bash
git status
# Should show clean working tree or only intended changes
```

---

## 📝 Release Process

### 1. Update Version and Changelog

```bash
# Update version in all package.json files
# packages/core/package.json
# packages/sdk/package.json
# packages/ai-local/package.json
# packages/types/package.json

# Update CHANGELOG.md with:
# - New version number
# - Release date
# - Summary of changes (Security, Features, Fixes, etc.)
```

### 2. Create Release Branch

```bash
git checkout -b release/vX.Y.Z
git add -A
git commit -m "chore(release): prepare vX.Y.Z"
git push origin release/vX.Y.Z
```

### 3. Create Pull Request

```bash
gh pr create \
  --title "Release vX.Y.Z" \
  --body-file CHANGELOG.md \
  --base main \
  --label "release"
```

### 4. Wait for CI Validation

**Expected CI checks** (all must pass):

- ✅ Type Check
- ✅ Lint
- ✅ Security Audit
- ✅ Test (ubuntu-latest, Node 20)
- ✅ Test (ubuntu-latest, Node 22)
- ✅ Test (macos-latest, Node 20)
- ✅ Test (macos-latest, Node 22)
- ✅ Build

**If CI fails:**

1. Review failure logs: `gh run view --log-failed`
2. Fix issues on release branch
3. Push fixes
4. CI will re-run automatically

### 5. Merge and Tag

```bash
# After PR approval and CI passes:
gh pr merge --merge --delete-branch

# Switch to main and tag
git checkout main
git pull origin main
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

### 6. Verify Release Workflow

```bash
# Watch release workflow
gh run watch

# Expected outcomes:
# ✅ Build all packages
# ✅ Run tests
# ✅ Mirror to public repo: github.com/bejarcode/music-reasoning-sdk
# ✅ Push tag to public repo
# ⏸️ npm publish (currently disabled)
```

### 7. Create GitHub Release

```bash
gh release create vX.Y.Z \
  --title "vX.Y.Z: [Brief Description]" \
  --notes-file CHANGELOG.md \
  --latest
```

---

## 🚨 Common Pitfalls (Lessons from v0.1.1)

### Pitfall 1: Local vs CI Environment Mismatch

**Symptom**: Tests pass locally but fail in CI

**Root Cause**: Stale cache, different Node versions, different ESLint configs

**Prevention**:

- ✅ Always run `pnpm validate:release` before creating PR
- ✅ Script clears caches and simulates CI environment
- ✅ Uses `pnpm install --frozen-lockfile` (matches CI)

**Example from v0.1.1**: 60+ TypeScript strict errors found in CI after local linting passed

---

### Pitfall 2: Performance Tests Failing in CI

**Symptom**: Performance benchmarks pass locally but timeout/fail in CI

**Root Cause**: CI runners have variable CPU speeds and background processes

**Prevention**:

- ✅ Performance benchmarks are **excluded from CI** (`vitest.config.ts` ignores `**/benchmarks/**`)
- ✅ Only correctness tests run in CI (unit, integration, golden tests)
- ✅ Performance tests run locally during development only

**Rationale**: Performance tests have 50-250% variance across different hardware. They're important for local validation but unreliable for CI pass/fail gates.

---

### Pitfall 3: ESLint Rules Stricter in CI

**Symptom**: ESLint passes locally but fails in CI with `@typescript-eslint/no-unsafe-*` errors

**Root Cause**:

- Local ESLint uses cached results
- CI runs fresh with stricter TypeScript 5.5+ inference rules

**Prevention**:

- ✅ Validation script clears `.eslintcache` before running
- ✅ Uses `pnpm install --frozen-lockfile` for exact CI dependencies
- ✅ Pre-commit hooks run `eslint --fix` on staged files

**Example from v0.1.1**: tonal.js return values inferred as `error` type without explicit annotations

---

### Pitfall 4: Build Step Required Before Linting

**Symptom**: CI lint fails with "Cannot find type definitions" errors

**Root Cause**: TypeScript types not built yet, ESLint needs `.d.ts` files

**Prevention**:

- ✅ CI workflow runs `build` step before `lint`
- ✅ Validation script also builds before linting
- ✅ Monorepo ensures types package builds first

**Fix Applied in v0.1.1**: Added explicit `pnpm build` step to CI workflow before lint job

---

### Pitfall 5: Forgotten Version Bumps

**Symptom**: Release tagged but package versions still show old version

**Root Cause**: Forgot to update `package.json` files in all packages

**Prevention**:

- ✅ Use checklist (Step 1 above)
- ✅ Verify with: `grep -r '"version":' packages/*/package.json`
- ✅ All should match intended release version

---

## 📊 Release Quality Gates

**Before creating PR, verify:**

- [ ] `pnpm validate:release` passes ✅
- [ ] All `package.json` versions updated to vX.Y.Z
- [ ] `CHANGELOG.md` updated with release notes
- [ ] Git working tree clean (or only intended changes)

**Before merging PR, verify:**

- [ ] All CI checks passed (8 jobs)
- [ ] PR reviewed and approved
- [ ] No merge conflicts with main

**After tagging, verify:**

- [ ] Release workflow completed successfully
- [ ] Public repo mirrored: https://github.com/bejarcode/music-reasoning-sdk
- [ ] Tag exists on public repo
- [ ] GitHub Release created

---

## 🔧 Troubleshooting CI Failures

### CI Failure: Type Check

```bash
# Reproduce locally:
pnpm build  # Build dependencies first
pnpm typecheck

# Common fixes:
# - Add explicit type annotations
# - Ensure all packages built before typecheck
# - Check for circular dependencies
```

### CI Failure: Lint

```bash
# Reproduce locally:
rm -rf node_modules .eslintcache
pnpm install --frozen-lockfile
pnpm build  # Required: ESLint needs .d.ts files
pnpm lint

# Common fixes:
# - Run `pnpm lint --fix` for auto-fixable issues
# - Add type guards for tonal.js values
# - Explicit String() in template literals
```

### CI Failure: Tests

```bash
# Reproduce locally:
pnpm test -- --exclude=**/benchmarks/**

# Common fixes:
# - Check test timeouts (integration tests may need 30s)
# - Ensure model files exist for AI tests
# - Verify environment variables set
```

### CI Failure: Security Audit

```bash
# Reproduce locally:
pnpm audit --audit-level=moderate

# Common fixes:
# - Update vulnerable dependencies: `pnpm update [package]@latest`
# - Check for breaking changes in updated dependencies
# - Run tests after updating
```

---

## 📚 Additional Resources

- **Release Workflow**: `.github/workflows/mirror-release.yml`
- **CI Workflow**: `.github/workflows/ci.yml`
- **Validation Script**: `scripts/validate-release.sh`
- **Release Documentation**: `RELEASE.md`
- **Changelog**: `CHANGELOG.md`

---

## ✅ Post-Release Tasks

After successful release:

1. **Announce Release** (optional):
   - Social media
   - Discord/Slack communities
   - Project website

2. **Monitor for Issues**:

   ```bash
   gh issue list --label "vX.Y.Z"
   ```

3. **Update Documentation** (if needed):
   - Migration guides
   - Breaking changes
   - New features

---

## 🎓 Lessons Learned

### v0.1.1 (2025-10-29)

**Time Investment**: 11+ hours (should have been 3 hours)

**Issues Encountered**:

1. 60+ TypeScript strict errors in CI (not caught locally)
2. Performance tests failing in CI (variable hardware)
3. ESLint config mismatch (local cache vs fresh CI)
4. Build step missing before lint (type definitions unavailable)

**Solutions Implemented**:

1. Created `validate-release.sh` script (simulates CI locally)
2. Excluded performance benchmarks from CI
3. Added build step to CI before linting
4. Documented all pitfalls in this checklist

**Result**: Future releases should take 3-4 hours (not 11+)

---

**Remember**: The validation script is your friend! Always run it before creating a release PR. 🚀
