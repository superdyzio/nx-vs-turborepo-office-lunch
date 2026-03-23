# Implementation Plan: office-lunch-turborepo

## Overview

Migrate the `office-lunch` Angular 21 app from `base/` into a Turborepo monorepo at `turborepo/`. Each task builds incrementally: workspace scaffold → shared packages → data layer → auth → features → shell wiring. No business logic changes — only structural reorganisation and import path updates.

## Tasks

- [ ] 1. Scaffold the Turborepo workspace root
  - Create `turborepo/package.json` with `workspaces: ["apps/*", "packages/*"]`, `turbo` as a dev dependency, and root `build`, `test`, `lint`, `dev` scripts
  - Create `turborepo/turbo.json` with pipeline tasks: `build` (`dependsOn: ["^build"]`, `outputs: ["dist/**"]`), `test` (`dependsOn: ["^build"]`), `lint` (no deps), `dev` (`persistent: true, cache: false`)
  - Create `turborepo/tsconfig.json` with all compiler options from `base/tsconfig.json` and path aliases for all 10 packages
  - Create `turborepo/eslint.config.js` with `no-restricted-imports` rules to prevent relative cross-package imports
  - Create `turborepo/vitest-utils/angular-inline-resources.ts` by extracting the `angularInlineResources` plugin from `base/vitest.config.ts`
  - Create `turborepo/vitest.workspace.ts` referencing all package and app vitest configs
  - Create `turborepo/apps/` and `turborepo/packages/` directories (with `.gitkeep` if needed)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 14.1, 14.2, 14.3, 14.4_

- [ ] 2. Create the shared-models package
  - [ ] 2.1 Create `turborepo/packages/shared-models/` structure with `src/lib/` and `index.ts`
    - Copy all six model files from `base/src/app/models/` into `turborepo/packages/shared-models/src/lib/`
    - Write `index.ts` barrel file re-exporting all model interfaces
    - Create `package.json` with `name: "@office-lunch/shared-models"` and `lint` and `test` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 4.1, 4.3, 15.2_

  - [ ] 2.2 Write property test: all base model files have a migrated equivalent
    - **Property 2: All base source files have a migrated equivalent** (scoped to models)
    - **Validates: Requirements 13.1**

- [ ] 3. Create the shared-ui package
  - [ ] 3.1 Create `turborepo/packages/shared-ui/` structure with `src/lib/`, `src/styles/`, and `index.ts`
    - Copy all six component directories from `base/src/app/shared/components/` into `turborepo/packages/shared-ui/src/lib/`
    - Copy `base/src/styles/_variables.scss` and `base/src/styles/_mixins.scss` into `turborepo/packages/shared-ui/src/styles/`
    - Write `index.ts` barrel file exporting all six components and the `TableColumn`/`TableRowAction` types
    - Create `package.json` with `name: "@office-lunch/shared-ui"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 3.1, 3.4, 3.5, 15.2_

  - [ ] 3.2 Write property test: no cross-boundary relative imports in shared-ui
    - **Property 1: No cross-boundary relative imports**
    - **Validates: Requirements 13.2, 13.3**

- [ ] 4. Create the data-access package
  - [ ] 4.1 Create `turborepo/packages/data-access/` structure with `src/lib/repositories/` and `index.ts`
    - Copy `base/src/app/services/local-storage.service.ts` and its spec into `turborepo/packages/data-access/src/lib/`
    - Copy all six repository files and their specs from `base/src/app/services/repositories/` into `turborepo/packages/data-access/src/lib/repositories/`
    - Update all model imports in every file to use `@office-lunch/shared-models`
    - Write `index.ts` barrel file exporting `LocalStorageService` and all six repositories
    - Create `package.json` with `name: "@office-lunch/data-access"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 5.1, 5.3, 5.4, 15.2_

  - [ ] 4.2 Write property test: data-access imports models only from @office-lunch/shared-models
    - **Property 3: Data-access package imports models only from the shared-models alias**
    - **Validates: Requirements 5.3**

- [ ] 5. Create the auth package
  - [ ] 5.1 Create `turborepo/packages/auth/` structure with `src/lib/` and `index.ts`
    - Copy `base/src/app/services/auth.service.ts` and its spec into `turborepo/packages/auth/src/lib/`
    - Copy `base/src/app/guards/auth.guard.ts` and `admin.guard.ts` into `turborepo/packages/auth/src/lib/`
    - Update imports: models → `@office-lunch/shared-models`, repositories/services → `@office-lunch/data-access`
    - Write `index.ts` barrel file exporting `AuthService`, `authGuard`, `adminGuard`
    - Create `package.json` with `name: "@office-lunch/auth"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 6.1, 6.3, 6.4, 15.2_

  - [ ] 5.2 Write property test: no cross-boundary relative imports in auth
    - **Property 1: No cross-boundary relative imports**
    - **Validates: Requirements 13.2, 13.3**

- [ ] 6. Create the util package
  - [ ] 6.1 Create `turborepo/packages/util/` structure with `src/lib/` and `index.ts`
    - Copy `base/src/app/helpers/init-db.ts` and its spec into `turborepo/packages/util/src/lib/`
    - Update model imports to use `@office-lunch/shared-models`
    - Write `index.ts` barrel file exporting `initDb`
    - Create `package.json` with `name: "@office-lunch/util"` and `test` and `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 12.1, 12.3, 12.4, 15.2_

- [ ] 7. Checkpoint — shared and data layers
  - Ensure all tests pass for `shared-models`, `shared-ui`, `data-access`, `auth`, and `util` by running each package's Vitest config
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Create the feature-login package
  - [ ] 8.1 Create `turborepo/packages/feature-login/` structure with `src/lib/login/` and `index.ts`
    - Copy `base/src/app/features/login/` files into `turborepo/packages/feature-login/src/lib/login/`
    - Update imports: auth → `@office-lunch/auth`, shared UI → `@office-lunch/shared-ui`
    - Write `index.ts` barrel file exporting `LoginComponent`
    - Create `package.json` with `name: "@office-lunch/feature-login"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 7.1, 7.3, 7.4, 15.2_

- [ ] 9. Create the feature-departure package
  - [ ] 9.1 Create `turborepo/packages/feature-departure/` structure with `src/lib/departure/` and `index.ts`
    - Copy `base/src/app/features/departure/` files into `turborepo/packages/feature-departure/src/lib/departure/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared-models`, shared UI → `@office-lunch/shared-ui`
    - Write `index.ts` barrel file exporting `DepartureComponent`
    - Create `package.json` with `name: "@office-lunch/feature-departure"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 8.1, 8.3, 8.4, 15.2_

- [ ] 10. Create the feature-voting package
  - [ ] 10.1 Create `turborepo/packages/feature-voting/` structure with `src/lib/voting/` and `index.ts`
    - Copy `base/src/app/features/voting/` files into `turborepo/packages/feature-voting/src/lib/voting/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared-models`, shared UI → `@office-lunch/shared-ui`
    - Write `index.ts` barrel file exporting `VotingComponent`
    - Create `package.json` with `name: "@office-lunch/feature-voting"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 9.1, 9.3, 9.4, 15.2_

- [ ] 11. Create the feature-ordering package
  - [ ] 11.1 Create `turborepo/packages/feature-ordering/` structure with `src/lib/ordering/` and `index.ts`
    - Copy `base/src/app/features/ordering/` files into `turborepo/packages/feature-ordering/src/lib/ordering/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared-models`, shared UI → `@office-lunch/shared-ui`
    - Write `index.ts` barrel file exporting `OrderingComponent`
    - Create `package.json` with `name: "@office-lunch/feature-ordering"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 10.1, 10.3, 10.4, 15.2_

- [ ] 12. Create the feature-admin package
  - [ ] 12.1 Create `turborepo/packages/feature-admin/` structure with `src/lib/` subdirectories and `index.ts`
    - Copy all four admin component directories from `base/src/app/features/admin/` into `turborepo/packages/feature-admin/src/lib/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared-models`, shared UI → `@office-lunch/shared-ui`
    - Write `index.ts` barrel file exporting `DashboardComponent`, `MenuManagementComponent`, `SettingsComponent`, `UserManagementComponent`
    - Create `package.json` with `name: "@office-lunch/feature-admin"` and `build`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 11.1, 11.3, 11.4, 15.2_

- [ ] 13. Checkpoint — feature packages
  - Ensure all feature package lint targets pass (no cross-boundary import violations)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Create the shell application
  - [ ] 14.1 Create `turborepo/apps/office-lunch/` structure with `src/app/` and config files
    - Copy `base/src/main.ts`, `base/src/index.html`, `base/src/test-setup.ts` into `turborepo/apps/office-lunch/src/`
    - Copy `base/src/styles.scss` into `turborepo/apps/office-lunch/src/`; update the `@use` path to reference `@office-lunch/shared-ui`'s styles
    - Copy `base/src/app/app.ts`, `app.html`, `app.scss`, `app.spec.ts` into `turborepo/apps/office-lunch/src/app/`
    - Copy `base/src/app/app.config.ts` into `turborepo/apps/office-lunch/src/app/`
    - Write `turborepo/apps/office-lunch/src/app/app.routes.ts` with all routes using path alias lazy-loads (`@office-lunch/feature-*`) and importing guards from `@office-lunch/auth`
    - Create `tsconfig.app.json` and `tsconfig.spec.json` extending `../../tsconfig.json`
    - Create `angular.json` with `build` (`@angular/build:application`), `serve` (`@angular/build:dev-server`), and `test` targets
    - Create `package.json` with `name: "office-lunch"`, all Angular 21 dependencies from `base/package.json`, and `build`, `dev`, `test`, `lint` scripts
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 15.2_

  - [ ] 14.2 Write property test: all base source files have a migrated equivalent (full workspace check)
    - **Property 2: All base source files have a migrated equivalent**
    - **Validates: Requirements 13.1**

  - [ ] 14.3 Write property test: no cross-boundary relative imports across all workspace files
    - **Property 1: No cross-boundary relative imports**
    - **Validates: Requirements 13.2, 13.3**

  - [ ] 14.4 Write property test: every package has a vitest.config.ts with jsdom environment
    - **Property 4: Every package has a vitest config with jsdom environment**
    - **Validates: Requirements 15.2**

  - [ ] 14.5 Write property test: every package has a path alias in root tsconfig.json
    - **Property 5: Every package has a path alias in root tsconfig.json**
    - **Validates: Requirements 1.3**

  - [ ] 14.6 Write property test: vitest.workspace.ts references all package vitest configs
    - **Property 6: vitest.workspace.ts references all package vitest configs**
    - **Validates: Requirements 15.1**

- [ ] 15. Final checkpoint — full workspace
  - Ensure all tests pass across all packages by running each package's Vitest config
  - Ensure all lint targets pass (no boundary violations, no TypeScript errors)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required — no optional tasks
- The `base/` folder must not be modified at any point
- All import path rewrites are the only code changes — no business logic is altered
- Property tests use `fast-check` (already in `base/package.json` devDependencies)
- Each property test file should include the tag comment: `// Feature: office-lunch-turborepo, Property N: <property_text>`
- Turborepo does not enforce module boundaries natively — ESLint `no-restricted-imports` handles this
- Path aliases use hyphens (`shared-models`, `shared-ui`) rather than slashes (`shared/models`) to match Turborepo package naming conventions
