# Requirements Document

## Introduction

This spec covers the migration of the existing Angular 21 `office-lunch` application from the `base` folder into an Nx monorepo structure located in the `nx` folder at the workspace root. The migration reorganises the codebase into `apps` (the shell/host Angular application) and `libs` (feature libraries and shared libraries), while preserving all existing functionality. The `base` folder is treated as read-only source material and must not be modified.

The resulting Nx workspace will support independent library builds, clear dependency boundaries, and a scalable structure for future feature development.

## Glossary

- **Nx_Workspace**: The Nx monorepo located at `nx/` in the workspace root.
- **Shell_App**: The Angular application in `nx/apps/office-lunch/` that bootstraps the app, defines top-level routing, and imports feature libraries.
- **Feature_Lib**: An Nx library under `nx/libs/` that encapsulates a single feature (e.g., login, voting, ordering, departure, admin).
- **Shared_Lib**: An Nx library under `nx/libs/shared/` that provides reusable UI components, models, services, guards, and helpers consumed by multiple feature libraries.
- **Data_Access_Lib**: An Nx library under `nx/libs/data-access/` that contains repositories and the local-storage service.
- **Barrel_File**: An `index.ts` file at the root of each library that re-exports the library's public API.
- **Path_Alias**: A TypeScript path mapping (e.g., `@office-lunch/shared`) configured in `tsconfig.base.json` that resolves to a library's barrel file.
- **Nx_Project_Config**: The `project.json` file in each app or library that defines Nx targets (build, test, lint).
- **Base_App**: The existing Angular 21 application in the `base/` folder, which is the source of all files to be migrated.

---

## Requirements

### Requirement 1: Nx Workspace Initialisation

**User Story:** As a developer, I want an Nx monorepo scaffold in the `nx` folder, so that I have a structured workspace to host the migrated application and its libraries.

#### Acceptance Criteria

1. THE Nx_Workspace SHALL contain a root `package.json` with Nx as a dev dependency and scripts for `build`, `test`, `lint`, and `serve`.
2. THE Nx_Workspace SHALL contain a `nx.json` configuration file that defines the default project and task pipeline.
3. THE Nx_Workspace SHALL contain a `tsconfig.base.json` that declares Path_Aliases for every library in the workspace.
4. THE Nx_Workspace SHALL contain an `apps/` directory and a `libs/` directory at its root.
5. WHEN a developer runs `npm install` in the `nx/` directory, THE Nx_Workspace SHALL install all required Angular 21 and Nx dependencies without errors.

---

### Requirement 2: Shell Application Setup

**User Story:** As a developer, I want the shell Angular application in `apps/office-lunch`, so that it serves as the entry point that bootstraps the app and wires together all feature libraries.

#### Acceptance Criteria

1. THE Shell_App SHALL reside at `nx/apps/office-lunch/` and contain `src/main.ts`, `src/index.html`, `src/styles.scss`, and `src/app/app.config.ts`.
2. THE Shell_App SHALL define top-level routes that lazy-load each Feature_Lib's entry component using the corresponding Path_Alias.
3. THE Shell_App SHALL include an `Nx_Project_Config` (`project.json`) with `build`, `serve`, `test`, and `lint` targets.
4. WHEN the Shell_App is built using the Nx build target, THE Shell_App SHALL produce a deployable output without compilation errors.
5. THE Shell_App SHALL import global styles from `src/styles.scss`, which in turn imports the shared SCSS variables and mixins migrated from the Base_App.

---

### Requirement 3: Shared UI Library

**User Story:** As a developer, I want a shared UI library at `libs/shared/ui`, so that reusable components (button, input, card, badge, modal, table) are available to all feature libraries via a single import path.

#### Acceptance Criteria

1. THE Shared_Lib SHALL reside at `nx/libs/shared/ui/` and export all six shared components (`AppButtonComponent`, `AppInputComponent`, `AppCardComponent`, `AppBadgeComponent`, `AppModalComponent`, `AppTableComponent`) through its Barrel_File (`index.ts`).
2. THE Shared_Lib SHALL be importable by any Feature_Lib using the Path_Alias `@office-lunch/shared/ui`.
3. WHEN a Feature_Lib imports a component from `@office-lunch/shared/ui`, THE Shared_Lib SHALL resolve to the correct component without circular dependency errors.
4. THE Shared_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.
5. THE Shared_Lib SHALL contain all SCSS files (component styles, `_variables.scss`, `_mixins.scss`) migrated from the Base_App.

---

### Requirement 4: Shared Models Library

**User Story:** As a developer, I want a shared models library at `libs/shared/models`, so that all TypeScript interfaces and types are defined once and shared across feature and data-access libraries.

#### Acceptance Criteria

1. THE Shared_Lib SHALL reside at `nx/libs/shared/models/` and export all six model interfaces (`User`, `Restaurant`, `Dish`, `Order`, `VotingRound`, `VoteEntry`, `VetoEntry`, `VotingResult`, `DepartureResponse`, `Settings`) through its Barrel_File.
2. THE Shared_Lib SHALL be importable using the Path_Alias `@office-lunch/shared/models`.
3. THE Shared_Lib SHALL include an `Nx_Project_Config` with `lint` and `test` targets.
4. WHEN any library imports a model from `@office-lunch/shared/models`, THE Shared_Lib SHALL resolve without circular dependency errors.

---

### Requirement 5: Data Access Library

**User Story:** As a developer, I want a data-access library at `libs/data-access`, so that all repositories and the local-storage service are centralised and reusable across feature libraries.

#### Acceptance Criteria

1. THE Data_Access_Lib SHALL reside at `nx/libs/data-access/` and export `LocalStorageService`, `UserRepository`, `RestaurantRepository`, `OrderRepository`, `VoteRepository`, `SessionRepository`, and `SettingsRepository` through its Barrel_File.
2. THE Data_Access_Lib SHALL be importable using the Path_Alias `@office-lunch/data-access`.
3. THE Data_Access_Lib SHALL import models exclusively from `@office-lunch/shared/models`.
4. THE Data_Access_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.
5. WHEN a Feature_Lib injects a repository from `@office-lunch/data-access`, THE Data_Access_Lib SHALL provide the service without circular dependency errors.

---

### Requirement 6: Auth Library

**User Story:** As a developer, I want an auth library at `libs/auth`, so that `AuthService`, `authGuard`, and `adminGuard` are encapsulated and reusable across the shell app and feature libraries.

#### Acceptance Criteria

1. THE Feature_Lib SHALL reside at `nx/libs/auth/` and export `AuthService`, `authGuard`, and `adminGuard` through its Barrel_File.
2. THE Feature_Lib SHALL be importable using the Path_Alias `@office-lunch/auth`.
3. THE Feature_Lib SHALL import `UserRepository` and `LocalStorageService` from `@office-lunch/data-access` and models from `@office-lunch/shared/models`.
4. THE Feature_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.
5. WHEN the Shell_App applies `authGuard` or `adminGuard` to a route, THE Feature_Lib SHALL correctly redirect unauthenticated or unauthorised users.

---

### Requirement 7: Login Feature Library

**User Story:** As a developer, I want a login feature library at `libs/feature-login`, so that the login UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Feature_Lib SHALL reside at `nx/libs/feature-login/` and export `LoginComponent` through its Barrel_File.
2. THE Feature_Lib SHALL be importable using the Path_Alias `@office-lunch/feature-login`.
3. THE Feature_Lib SHALL import `AuthService` from `@office-lunch/auth` and shared UI components from `@office-lunch/shared/ui`.
4. THE Feature_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.

---

### Requirement 8: Departure Feature Library

**User Story:** As a developer, I want a departure feature library at `libs/feature-departure`, so that the departure UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Feature_Lib SHALL reside at `nx/libs/feature-departure/` and export `DepartureComponent` through its Barrel_File.
2. THE Feature_Lib SHALL be importable using the Path_Alias `@office-lunch/feature-departure`.
3. THE Feature_Lib SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared/models`, and shared UI components from `@office-lunch/shared/ui`.
4. THE Feature_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.

---

### Requirement 9: Voting Feature Library

**User Story:** As a developer, I want a voting feature library at `libs/feature-voting`, so that the voting UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Feature_Lib SHALL reside at `nx/libs/feature-voting/` and export `VotingComponent` through its Barrel_File.
2. THE Feature_Lib SHALL be importable using the Path_Alias `@office-lunch/feature-voting`.
3. THE Feature_Lib SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared/models`, and shared UI components from `@office-lunch/shared/ui`.
4. THE Feature_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.

---

### Requirement 10: Ordering Feature Library

**User Story:** As a developer, I want an ordering feature library at `libs/feature-ordering`, so that the ordering UI and its logic are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Feature_Lib SHALL reside at `nx/libs/feature-ordering/` and export `OrderingComponent` through its Barrel_File.
2. THE Feature_Lib SHALL be importable using the Path_Alias `@office-lunch/feature-ordering`.
3. THE Feature_Lib SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared/models`, and shared UI components from `@office-lunch/shared/ui`.
4. THE Feature_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.

---

### Requirement 11: Admin Feature Library

**User Story:** As a developer, I want an admin feature library at `libs/feature-admin`, so that all four admin sub-features (dashboard, menu-management, settings, user-management) are self-contained and lazy-loadable.

#### Acceptance Criteria

1. THE Feature_Lib SHALL reside at `nx/libs/feature-admin/` and export `DashboardComponent`, `MenuManagementComponent`, `SettingsComponent`, and `UserManagementComponent` through its Barrel_File.
2. THE Feature_Lib SHALL be importable using the Path_Alias `@office-lunch/feature-admin`.
3. THE Feature_Lib SHALL import repositories from `@office-lunch/data-access`, models from `@office-lunch/shared/models`, and shared UI components from `@office-lunch/shared/ui`.
4. THE Feature_Lib SHALL include an `Nx_Project_Config` with `build`, `test`, and `lint` targets.

---

### Requirement 12: Utility Library (Helpers)

**User Story:** As a developer, I want a utility library at `libs/util`, so that helper functions (e.g., `initDb`) are available to any library or the shell app without duplication.

#### Acceptance Criteria

1. THE Shared_Lib SHALL reside at `nx/libs/util/` and export `initDb` through its Barrel_File.
2. THE Shared_Lib SHALL be importable using the Path_Alias `@office-lunch/util`.
3. THE Shared_Lib SHALL import models from `@office-lunch/shared/models`.
4. THE Shared_Lib SHALL include an `Nx_Project_Config` with `test` and `lint` targets.

---

### Requirement 13: File Migration Completeness

**User Story:** As a developer, I want every source file from the Base_App copied into the correct Nx library or app, so that no functionality is lost during migration.

#### Acceptance Criteria

1. THE Nx_Workspace SHALL contain a migrated equivalent for every `.ts`, `.html`, `.scss`, and `.spec.ts` file present in `base/src/`.
2. WHEN a file is migrated, THE Nx_Workspace SHALL update all import paths within that file to use the appropriate Path_Alias instead of relative cross-library paths.
3. THE Nx_Workspace SHALL NOT contain any import that crosses library boundaries using relative paths (e.g., `../../libs/auth`).
4. THE Nx_Workspace SHALL preserve all existing test files (`.spec.ts`) in their corresponding library's `src/lib/` directory.

---

### Requirement 14: Dependency Boundary Enforcement

**User Story:** As a developer, I want Nx dependency constraints configured, so that libraries cannot import from libraries they are not allowed to depend on.

#### Acceptance Criteria

1. THE Nx_Workspace SHALL define ESLint `@nx/enforce-module-boundaries` rules in the root `eslint.config.js` that prevent Feature_Libs from importing from other Feature_Libs directly.
2. THE Nx_Workspace SHALL configure boundary rules so that `shared/ui` and `shared/models` cannot import from Feature_Libs or Data_Access_Lib.
3. THE Nx_Workspace SHALL configure boundary rules so that `data-access` cannot import from Feature_Libs.
4. WHEN a developer introduces a forbidden import, THE Nx_Workspace SHALL report an ESLint error identifying the boundary violation.

---

### Requirement 15: Test Configuration

**User Story:** As a developer, I want each library and the shell app to have a working Vitest configuration, so that all existing tests can be run within the Nx workspace.

#### Acceptance Criteria

1. THE Nx_Workspace SHALL include a root-level `vitest.workspace.ts` (or equivalent) that references all library and app test configurations.
2. EACH library and the Shell_App SHALL have a `vitest.config.ts` that uses `jsdom` as the test environment and includes the `angularInlineResources` plugin migrated from the Base_App.
3. WHEN a developer runs the Nx `test` target for any project, THE Nx_Workspace SHALL execute all `.spec.ts` files in that project and report results.
4. THE Nx_Workspace SHALL preserve all existing test assertions from the Base_App without modification.
