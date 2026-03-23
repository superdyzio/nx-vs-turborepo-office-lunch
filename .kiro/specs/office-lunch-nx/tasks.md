# Implementation Plan: office-lunch-nx

## Overview

Migrate the `office-lunch` Angular 21 app from `base/` into an Nx monorepo at `nx/`. Each task builds incrementally: workspace scaffold → shared libs → data layer → auth → features → shell wiring. No business logic changes — only structural reorganisation and import path updates.

## Tasks

- [x] 1. Scaffold the Nx workspace root
  - Create `nx/package.json` with Angular 21, Nx, Vitest, ESLint, and all other dependencies from `base/package.json`; add `build`, `serve`, `test`, and `lint` scripts
  - Create `nx/nx.json` with `defaultProject: "office-lunch"` and task pipeline (`build` depends on `^build`, `test` depends on `^build`)
  - Create `nx/tsconfig.base.json` with all compiler options from `base/tsconfig.json` and path aliases for all 10 libraries
  - Create `nx/eslint.config.js` with `@nx/enforce-module-boundaries` rules and scope tags as defined in the design
  - Create `nx/vitest-utils/angular-inline-resources.ts` by extracting the `angularInlineResources` plugin from `base/vitest.config.ts`
  - Create `nx/vitest.workspace.ts` referencing all library and app vitest configs
  - Create `nx/apps/` and `nx/libs/` directories (with `.gitkeep` if needed)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 14.1_

- [x] 2. Create the shared/models library
  - [x] 2.1 Create `nx/libs/shared/models/` structure with `src/lib/` and `index.ts`
    - Copy all six model files from `base/src/app/models/` into `nx/libs/shared/models/src/lib/`
    - Write `index.ts` barrel file re-exporting all model interfaces
    - Create `project.json` with `lint` and `test` targets; tag with `scope:shared`
    - Create `vitest.config.ts` using `jsdom` environment and `angularInlineResources` plugin
    - _Requirements: 4.1, 4.3, 15.2_

  - [x] 2.2 Write property test: all base model files have a migrated equivalent
    - **Property 2: All base source files have a migrated equivalent** (scoped to models)
    - **Validates: Requirements 13.1**

- [x] 3. Create the shared/ui library
  - [x] 3.1 Create `nx/libs/shared/ui/` structure with `src/lib/` and `index.ts`
    - Copy all six component directories from `base/src/app/shared/components/` into `nx/libs/shared/ui/src/lib/`
    - Copy `base/src/styles/_variables.scss` and `base/src/styles/_mixins.scss` into `nx/libs/shared/ui/src/styles/`
    - Write `index.ts` barrel file exporting all six components and the `TableColumn`/`TableRowAction` types
    - Update any intra-library relative imports (none expected — components are self-contained)
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:shared`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 3.1, 3.4, 3.5, 15.2_

  - [x] 3.2 Write property test: no cross-boundary relative imports in shared/ui
    - **Property 1: No cross-boundary relative imports**
    - **Validates: Requirements 13.2, 13.3**

- [x] 4. Create the data-access library
  - [x] 4.1 Create `nx/libs/data-access/` structure with `src/lib/repositories/` and `index.ts`
    - Copy `base/src/app/services/local-storage.service.ts` and its spec into `nx/libs/data-access/src/lib/`
    - Copy all six repository files and their specs from `base/src/app/services/repositories/` into `nx/libs/data-access/src/lib/repositories/`
    - Update all model imports in every file to use `@office-lunch/shared/models`
    - Write `index.ts` barrel file exporting `LocalStorageService` and all six repositories
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:data-access`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 5.1, 5.3, 5.4, 15.2_

  - [x] 4.2 Write property test: data-access imports models only from @office-lunch/shared/models
    - **Property 3: Data-access library imports models only from the shared/models alias**
    - **Validates: Requirements 5.3**

- [x] 5. Create the auth library
  - [x] 5.1 Create `nx/libs/auth/` structure with `src/lib/` and `index.ts`
    - Copy `base/src/app/services/auth.service.ts` and its spec into `nx/libs/auth/src/lib/`
    - Copy `base/src/app/guards/auth.guard.ts` and `admin.guard.ts` into `nx/libs/auth/src/lib/`
    - Update imports: models → `@office-lunch/shared/models`, repositories/services → `@office-lunch/data-access`
    - Write `index.ts` barrel file exporting `AuthService`, `authGuard`, `adminGuard`
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:auth`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 6.1, 6.3, 6.4, 15.2_

  - [x] 5.2 Write property test: no cross-boundary relative imports in auth
    - **Property 1: No cross-boundary relative imports**
    - **Validates: Requirements 13.2, 13.3**

- [x] 6. Create the util library
  - [x] 6.1 Create `nx/libs/util/` structure with `src/lib/` and `index.ts`
    - Copy `base/src/app/helpers/init-db.ts` and its spec into `nx/libs/util/src/lib/`
    - Update model imports to use `@office-lunch/shared/models`
    - Write `index.ts` barrel file exporting `initDb`
    - Create `project.json` with `test` and `lint` targets; tag with `scope:util`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 12.1, 12.3, 12.4, 15.2_

- [x] 7. Checkpoint — shared and data layers
  - Ensure all tests pass for `shared/models`, `shared/ui`, `data-access`, `auth`, and `util` by running each project's Vitest config
  - Ask the user if questions arise.

- [x] 8. Create the feature-login library
  - [x] 8.1 Create `nx/libs/feature-login/` structure with `src/lib/login/` and `index.ts`
    - Copy `base/src/app/features/login/` files into `nx/libs/feature-login/src/lib/login/`
    - Update imports: auth → `@office-lunch/auth`, shared UI → `@office-lunch/shared/ui`
    - Write `index.ts` barrel file exporting `LoginComponent`
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:feature`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 7.1, 7.3, 7.4, 15.2_

- [x] 9. Create the feature-departure library
  - [x] 9.1 Create `nx/libs/feature-departure/` structure with `src/lib/departure/` and `index.ts`
    - Copy `base/src/app/features/departure/` files into `nx/libs/feature-departure/src/lib/departure/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared/models`, shared UI → `@office-lunch/shared/ui`
    - Write `index.ts` barrel file exporting `DepartureComponent`
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:feature`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 8.1, 8.3, 8.4, 15.2_

- [x] 10. Create the feature-voting library
  - [x] 10.1 Create `nx/libs/feature-voting/` structure with `src/lib/voting/` and `index.ts`
    - Copy `base/src/app/features/voting/` files into `nx/libs/feature-voting/src/lib/voting/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared/models`, shared UI → `@office-lunch/shared/ui`
    - Write `index.ts` barrel file exporting `VotingComponent`
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:feature`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 9.1, 9.3, 9.4, 15.2_

- [x] 11. Create the feature-ordering library
  - [x] 11.1 Create `nx/libs/feature-ordering/` structure with `src/lib/ordering/` and `index.ts`
    - Copy `base/src/app/features/ordering/` files into `nx/libs/feature-ordering/src/lib/ordering/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared/models`, shared UI → `@office-lunch/shared/ui`
    - Write `index.ts` barrel file exporting `OrderingComponent`
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:feature`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 10.1, 10.3, 10.4, 15.2_

- [x] 12. Create the feature-admin library
  - [x] 12.1 Create `nx/libs/feature-admin/` structure with `src/lib/` subdirectories and `index.ts`
    - Copy all four admin component directories from `base/src/app/features/admin/` into `nx/libs/feature-admin/src/lib/`
    - Update imports: data-access → `@office-lunch/data-access`, models → `@office-lunch/shared/models`, shared UI → `@office-lunch/shared/ui`
    - Write `index.ts` barrel file exporting `DashboardComponent`, `MenuManagementComponent`, `SettingsComponent`, `UserManagementComponent`
    - Create `project.json` with `build`, `test`, and `lint` targets; tag with `scope:feature`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 11.1, 11.3, 11.4, 15.2_

- [x] 13. Checkpoint — feature libraries
  - Ensure all feature library lint targets pass (no cross-boundary import violations)
  - Ask the user if questions arise.

- [x] 14. Create the shell application
  - [x] 14.1 Create `nx/apps/office-lunch/` structure with `src/app/` and config files
    - Copy `base/src/main.ts`, `base/src/index.html`, `base/src/test-setup.ts` into `nx/apps/office-lunch/src/`
    - Copy `base/src/styles.scss` into `nx/apps/office-lunch/src/`; update the `@use` path to reference `@office-lunch/shared/ui`'s styles
    - Copy `base/src/app/app.ts`, `app.html`, `app.scss`, `app.spec.ts` into `nx/apps/office-lunch/src/app/`
    - Copy `base/src/app/app.config.ts` into `nx/apps/office-lunch/src/app/`
    - Write `nx/apps/office-lunch/src/app/app.routes.ts` with all routes using path alias lazy-loads (`@office-lunch/feature-*`) and importing guards from `@office-lunch/auth`
    - Create `tsconfig.app.json` and `tsconfig.spec.json` extending `../../tsconfig.base.json`
    - Create `project.json` with `build` (`@angular/build:application`), `serve` (`@angular/build:dev-server`), `test`, and `lint` targets; tag with `scope:app`
    - Create `vitest.config.ts` using `jsdom` environment
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 15.2_

  - [x] 14.2 Write property test: all base source files have a migrated equivalent (full workspace check)
    - **Property 2: All base source files have a migrated equivalent**
    - **Validates: Requirements 13.1**

  - [x] 14.3 Write property test: no cross-boundary relative imports across all workspace files
    - **Property 1: No cross-boundary relative imports**
    - **Validates: Requirements 13.2, 13.3**

  - [x] 14.4 Write property test: every library has a vitest.config.ts with jsdom environment
    - **Property 4: Every library has a vitest config with jsdom environment**
    - **Validates: Requirements 15.2**

- [x] 15. Final checkpoint — full workspace
  - Ensure all tests pass across all projects by running each project's Vitest config
  - Ensure all lint targets pass (no boundary violations, no TypeScript errors)
  - Ask the user if questions arise.

## Notes

- The `base/` folder must not be modified at any point
- All import path rewrites are the only code changes — no business logic is altered
- Property tests use `fast-check` (already in `base/package.json` devDependencies)
- Each property test file should include the tag comment: `// Feature: office-lunch-nx, Property N: <property_text>`
