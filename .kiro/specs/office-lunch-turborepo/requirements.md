# Requirements Document

## Introduction

This spec covers the migration of the existing Angular 21 `office-lunch` application from the `base/` folder into a Turborepo monorepo structure located in the `turborepo/` folder at the workspace root. The migration reorganises the codebase into `apps` (the Angular application) and `packages` (shared libraries), while preserving all existing functionality. The `base/` folder is treated as read-only source material and must not be modified.

The resulting Turborepo workspace will support incremental builds via caching, clear package boundaries, and a scalable structure for future feature development — following Turborepo conventions rather than Nx conventions.

## Glossary

- **Turborepo_Workspace**: The Turborepo monorepo located at `turborepo/` in the workspace root.
- **turbo.json**: The Turborepo pipeline configuration file at the root of the Turborepo_Workspace that defines task dependencies and caching behaviour.
- **Shell_App**: The Angular application in `turborepo/apps/office-lunch/` that bootstraps the app, defines top-level routing, and imports feature packages.
- **Package**: A workspace member under `turborepo/packages/` that encapsulates a cohesive set of functionality (models, UI components, data access, auth, features, or utilities).
- **Barrel_File**: An `index.ts` file at the root of each package that re-exports the package's public API.
- **Path_Alias**: A TypeScript path mapping (e.g., `@office-lunch/shared-models`) configured in the root `tsconfig.json` that resolves to a package's barrel file.
- **Base_App**: The existing Angular 21 application in the `base/` folder, which is the source of all files to be migrated.
- **Pipeline**: The set of task definitions in `turbo.json` that describe how `build`, `test`, `lint`, and `dev` tasks relate to each other across packages.
- **Workspace_Root**: The `turborepo/` directory containing `package.json`, `turbo.json`, `tsconfig.json`, and the `apps/` and `packages/` directories.

---

## Requirements

### Requirement 1: Turborepo Workspace Initialisation

**User Story:** As a developer, I want a Turborepo monorepo scaffold in the `turborepo/` folder, so that I have a structured workspace to host the migrated application and its packages.

#### Acceptance Criteria

1. THE Turborepo_Workspace SHALL contain a root `package.json` that declares npm workspaces pointing to `apps/*` and `packages/*`, and includes `turbo` as a dev dependency.
2. THE Turborepo_Workspace SHALL contain a `turbo.json` that defines a Pipeline with tasks for `build`, `test`, `lint`, and `dev`, where `build` depends on upstream `^build` outputs.
3. THE Turborepo_Workspace SHALL contain a root `tsconfig.json` that declares Path_Aliases for every package in the workspace.
4. THE Turborepo_Workspace SHALL contain an `apps/` directory and a `packages/` directory at its root.
5. WHEN a developer runs `npm install` in the `turborepo/` directory, THE Turborepo_Workspace SHALL install all required Angular 21 and Turborepo dependencies without errors.

---

### Requirement 2: Shell Application Setup

**User Story:** As a developer, I want the shell Angular application in `apps/office-lunch`, so that it serves as the entry point that bootstraps the app and wires together all feature packages.

#### Acceptance Criteria

1. THE Shell_App SHALL reside at `turborepo/apps/office-lunch/` and contain `src/main.ts`, `src/index.html`, `src/styles.scss`, and `src/app/app.config.ts`.
2. THE Shell_App SHALL define top-level routes that lazy-load each feature package's entry component using the corresponding Path_Alias.
3. THE Shell_App SHALL include a `package.json` with `build`, `dev`, `test`, and `lint` scripts that delegate to the Angular CLI.
4. WHEN the Shell_App is built using `turbo build`, THE Shell_App SHALL produce a deployable output without compilation errors.
5. THE Shell_App SHALL import global styles from `src/styles.scss`, which in turn imports the shared SCSS variables and mixins migrated from the Base_App.

---

### Requirement 3: Shared UI Package

**User Story:** As a developer, I want a shared UI package at `packages/shared-ui`, so that reusable components (button, input, card, badge, modal, table) are available to all feature packages via a single import path.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/shared-ui/` and export all six shared components (`AppButtonComponent`, `AppInputComponent`, `AppCardComponent`, `AppBadgeComponent`, `AppModalComponent`, `AppTableComponent`) through its Barrel_File (`index.ts`).
2. THE Package SHALL be importable by any feature package using the Path_Alias `@office-lunch/shared-ui`.
3. WHEN a feature package imports a component from `@office-lunch/shared-ui`, THE Package SHALL resolve to the correct component without circular dependency errors.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.
5. THE Package SHALL contain all SCSS files (component styles, `_variables.scss`, `_mixins.scss`) migrated from the Base_App.

---

### Requirement 4: Shared Models Package

**User Story:** As a developer, I want a shared models package at `packages/shared-models`, so that all TypeScript interfaces and types are defined once and shared across feature and data-access packages.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/shared-models/` and export all model interfaces (`User`, `Restaurant`, `Dish`, `Order`, `VotingRound`, `VoteEntry`, `VetoEntry`, `VotingResult`, `DepartureResponse`, `Settings`) through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/shared-models`.
3. THE Package SHALL include a `package.json` with `lint` and `test` scripts.
4. WHEN any package imports a model from `@office-lunch/shared-models`, THE Package SHALL resolve without circular dependency errors.

---

### Requirement 5: Data Access Package

**User Story:** As a developer, I want a data-access package at `packages/data-access`, so that all repositories and the local-storage service are centralised and reusable across feature packages.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/data-access/` and export `LocalStorageService`, `UserRepository`, `RestaurantRepository`, `OrderRepository`, `VoteRepository`, `SessionRepository`, and `SettingsRepository` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/data-access`.
3. THE Package SHALL import models exclusively from `@office-lunch/shared-models`.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.
5. WHEN a feature package injects a repository from `@office-lunch/data-access`, THE Package SHALL provide the service without circular dependency errors.

---

### Requirement 6: Auth Package

**User Story:** As a developer, I want an auth package at `packages/auth`, so that `AuthService`, `authGuard`, and `adminGuard` are encapsulated and reusable across the shell app and feature packages.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/auth/` and export `AuthService`, `authGuard`, and `adminGuard` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/auth`.
3. THE Package SHALL import `UserRepository` and `LocalStorageService` from `@office-lunch/data-access` and models from `@office-lunch/shared-models`.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.
5. WHEN the Shell_App applies `authGuard` or `adminGuard` to a route, THE Package SHALL correctly redirect unauthenticated or unauthorised users.

---

### Requirement 7: Login Feature Package

**User Story:** As a developer, I want a login feature package at `packages/feature-login`, so that the login UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/feature-login/` and export `LoginComponent` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/feature-login`.
3. THE Package SHALL import `AuthService` from `@office-lunch/auth` and shared UI components from `@office-lunch/shared-ui`.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.

---

### Requirement 8: Departure Feature Package

**User Story:** As a developer, I want a departure feature package at `packages/feature-departure`, so that the departure UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/feature-departure/` and export `DepartureComponent` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/feature-departure`.
3. THE Package SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared-models`, and shared UI components from `@office-lunch/shared-ui`.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.

---

### Requirement 9: Voting Feature Package

**User Story:** As a developer, I want a voting feature package at `packages/feature-voting`, so that the voting UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/feature-voting/` and export `VotingComponent` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/feature-voting`.
3. THE Package SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared-models`, and shared UI components from `@office-lunch/shared-ui`.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.

---

### Requirement 10: Ordering Feature Package

**User Story:** As a developer, I want an ordering feature package at `packages/feature-ordering`, so that the ordering UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/feature-ordering/` and export `OrderingComponent` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/feature-ordering`.
3. THE Package SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared-models`, and shared UI components from `@office-lunch/shared-ui`.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.

---

### Requirement 11: Admin Feature Package

**User Story:** As a developer, I want an admin feature package at `packages/feature-admin`, so that all four admin sub-features (dashboard, menu-management, settings, user-management) are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/feature-admin/` and export `DashboardComponent`, `MenuManagementComponent`, `SettingsComponent`, and `UserManagementComponent` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/feature-admin`.
3. THE Package SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared-models`, and shared UI components from `@office-lunch/shared-ui`.
4. THE Package SHALL include a `package.json` with `build`, `test`, and `lint` scripts.

---

### Requirement 12: Utility Package

**User Story:** As a developer, I want a utility package at `packages/util`, so that helper functions (e.g., `initDb`) are available to any package or the shell app without duplication.

#### Acceptance Criteria

1. THE Package SHALL reside at `turborepo/packages/util/` and export `initDb` through its Barrel_File.
2. THE Package SHALL be importable using the Path_Alias `@office-lunch/util`.
3. THE Package SHALL import models from `@office-lunch/shared-models`.
4. THE Package SHALL include a `package.json` with `test` and `lint` scripts.

---

### Requirement 13: File Migration Completeness

**User Story:** As a developer, I want every source file from the Base_App copied into the correct Turborepo package or app, so that no functionality is lost during migration.

#### Acceptance Criteria

1. THE Turborepo_Workspace SHALL contain a migrated equivalent for every `.ts`, `.html`, `.scss`, and `.spec.ts` file present in `base/src/`.
2. WHEN a file is migrated, THE Turborepo_Workspace SHALL update all import paths within that file to use the appropriate Path_Alias instead of relative cross-package paths.
3. THE Turborepo_Workspace SHALL NOT contain any import that crosses package boundaries using relative paths (e.g., `../../packages/auth`).
4. THE Turborepo_Workspace SHALL preserve all existing test files (`.spec.ts`) in their corresponding package's `src/lib/` directory.

---

### Requirement 14: Turborepo Pipeline Configuration

**User Story:** As a developer, I want a properly configured Turborepo pipeline, so that tasks run in the correct order with caching and incremental builds.

#### Acceptance Criteria

1. THE turbo.json SHALL define a `build` task with `dependsOn: ["^build"]` so that upstream packages are built before downstream consumers.
2. THE turbo.json SHALL define a `test` task with `dependsOn: ["^build"]` so that all dependencies are built before tests run.
3. THE turbo.json SHALL define a `lint` task with no upstream dependencies so that linting can run in parallel across all packages.
4. THE turbo.json SHALL define a `dev` task marked as persistent so that the Angular dev server runs continuously.
5. WHEN a developer runs `turbo build`, THE Turborepo_Workspace SHALL build all packages and the Shell_App in dependency order without errors.
6. WHEN a developer runs `turbo build` a second time without changes, THE Turborepo_Workspace SHALL restore all outputs from cache and report tasks as cached.

---

### Requirement 15: Test Configuration

**User Story:** As a developer, I want each package and the shell app to have a working Vitest configuration, so that all existing tests can be run within the Turborepo workspace.

#### Acceptance Criteria

1. THE Turborepo_Workspace SHALL include a root-level `vitest.workspace.ts` that references all package and app test configurations.
2. EACH package and the Shell_App SHALL have a `vitest.config.ts` that uses `jsdom` as the test environment and includes the `angularInlineResources` plugin migrated from the Base_App.
3. WHEN a developer runs the `test` script for any package, THE Turborepo_Workspace SHALL execute all `.spec.ts` files in that package and report results.
4. THE Turborepo_Workspace SHALL preserve all existing test assertions from the Base_App without modification.
