// Feature: office-lunch-nx, Property 2: All base source files have a migrated equivalent

import * as fc from 'fast-check';
import { existsSync } from 'fs';
import * as path from 'path';

// **Validates: Requirements 13.1, 13.4**

// Mapping: base/src relative path → nx/ relative path
const FILE_MAP: Array<[string, string]> = [
  // Shell app
  ['src/main.ts', 'apps/office-lunch/src/main.ts'],
  ['src/index.html', 'apps/office-lunch/src/index.html'],
  ['src/styles.scss', 'apps/office-lunch/src/styles.scss'],
  ['src/test-setup.ts', 'apps/office-lunch/src/test-setup.ts'],
  ['src/app/app.ts', 'apps/office-lunch/src/app/app.ts'],
  ['src/app/app.html', 'apps/office-lunch/src/app/app.html'],
  ['src/app/app.scss', 'apps/office-lunch/src/app/app.scss'],
  ['src/app/app.spec.ts', 'apps/office-lunch/src/app/app.spec.ts'],
  ['src/app/app.config.ts', 'apps/office-lunch/src/app/app.config.ts'],
  ['src/app/app.routes.ts', 'apps/office-lunch/src/app/app.routes.ts'],
  // Models
  ['src/app/models/user.model.ts', 'libs/shared/models/src/lib/user.model.ts'],
  ['src/app/models/restaurant.model.ts', 'libs/shared/models/src/lib/restaurant.model.ts'],
  ['src/app/models/order.model.ts', 'libs/shared/models/src/lib/order.model.ts'],
  ['src/app/models/voting.model.ts', 'libs/shared/models/src/lib/voting.model.ts'],
  ['src/app/models/departure.model.ts', 'libs/shared/models/src/lib/departure.model.ts'],
  ['src/app/models/settings.model.ts', 'libs/shared/models/src/lib/settings.model.ts'],
  // Shared UI components
  ['src/app/shared/components/button/app-button.component.ts', 'libs/shared/ui/src/lib/button/app-button.component.ts'],
  ['src/app/shared/components/button/app-button.component.html', 'libs/shared/ui/src/lib/button/app-button.component.html'],
  ['src/app/shared/components/button/app-button.component.scss', 'libs/shared/ui/src/lib/button/app-button.component.scss'],
  ['src/app/shared/components/button/app-button.component.spec.ts', 'libs/shared/ui/src/lib/button/app-button.component.spec.ts'],
  ['src/app/shared/components/card/app-card.component.ts', 'libs/shared/ui/src/lib/card/app-card.component.ts'],
  ['src/app/shared/components/card/app-card.component.html', 'libs/shared/ui/src/lib/card/app-card.component.html'],
  ['src/app/shared/components/card/app-card.component.scss', 'libs/shared/ui/src/lib/card/app-card.component.scss'],
  ['src/app/shared/components/card/app-card.component.spec.ts', 'libs/shared/ui/src/lib/card/app-card.component.spec.ts'],
  ['src/app/shared/components/input/app-input.component.ts', 'libs/shared/ui/src/lib/input/app-input.component.ts'],
  ['src/app/shared/components/input/app-input.component.html', 'libs/shared/ui/src/lib/input/app-input.component.html'],
  ['src/app/shared/components/input/app-input.component.scss', 'libs/shared/ui/src/lib/input/app-input.component.scss'],
  ['src/app/shared/components/input/app-input.component.spec.ts', 'libs/shared/ui/src/lib/input/app-input.component.spec.ts'],
  ['src/app/shared/components/modal/app-modal.component.ts', 'libs/shared/ui/src/lib/modal/app-modal.component.ts'],
  ['src/app/shared/components/modal/app-modal.component.html', 'libs/shared/ui/src/lib/modal/app-modal.component.html'],
  ['src/app/shared/components/modal/app-modal.component.scss', 'libs/shared/ui/src/lib/modal/app-modal.component.scss'],
  ['src/app/shared/components/modal/app-modal.component.spec.ts', 'libs/shared/ui/src/lib/modal/app-modal.component.spec.ts'],
  ['src/app/shared/components/table/app-table.component.ts', 'libs/shared/ui/src/lib/table/app-table.component.ts'],
  ['src/app/shared/components/table/app-table.component.html', 'libs/shared/ui/src/lib/table/app-table.component.html'],
  ['src/app/shared/components/table/app-table.component.scss', 'libs/shared/ui/src/lib/table/app-table.component.scss'],
  ['src/app/shared/components/table/app-table.component.spec.ts', 'libs/shared/ui/src/lib/table/app-table.component.spec.ts'],
  ['src/app/shared/components/badge/app-badge.component.ts', 'libs/shared/ui/src/lib/badge/app-badge.component.ts'],
  ['src/app/shared/components/badge/app-badge.component.html', 'libs/shared/ui/src/lib/badge/app-badge.component.html'],
  ['src/app/shared/components/badge/app-badge.component.scss', 'libs/shared/ui/src/lib/badge/app-badge.component.scss'],
  // SCSS styles
  ['src/styles/_variables.scss', 'libs/shared/ui/src/styles/_variables.scss'],
  ['src/styles/_mixins.scss', 'libs/shared/ui/src/styles/_mixins.scss'],
  // Data access
  ['src/app/services/local-storage.service.ts', 'libs/data-access/src/lib/local-storage.service.ts'],
  ['src/app/services/local-storage.service.spec.ts', 'libs/data-access/src/lib/local-storage.service.spec.ts'],
  ['src/app/services/repositories/order.repository.ts', 'libs/data-access/src/lib/repositories/order.repository.ts'],
  ['src/app/services/repositories/order.repository.spec.ts', 'libs/data-access/src/lib/repositories/order.repository.spec.ts'],
  ['src/app/services/repositories/restaurant.repository.ts', 'libs/data-access/src/lib/repositories/restaurant.repository.ts'],
  ['src/app/services/repositories/restaurant.repository.spec.ts', 'libs/data-access/src/lib/repositories/restaurant.repository.spec.ts'],
  ['src/app/services/repositories/session.repository.ts', 'libs/data-access/src/lib/repositories/session.repository.ts'],
  ['src/app/services/repositories/session.repository.spec.ts', 'libs/data-access/src/lib/repositories/session.repository.spec.ts'],
  ['src/app/services/repositories/settings.repository.ts', 'libs/data-access/src/lib/repositories/settings.repository.ts'],
  ['src/app/services/repositories/settings.repository.spec.ts', 'libs/data-access/src/lib/repositories/settings.repository.spec.ts'],
  ['src/app/services/repositories/user.repository.ts', 'libs/data-access/src/lib/repositories/user.repository.ts'],
  ['src/app/services/repositories/user.repository.spec.ts', 'libs/data-access/src/lib/repositories/user.repository.spec.ts'],
  ['src/app/services/repositories/vote.repository.ts', 'libs/data-access/src/lib/repositories/vote.repository.ts'],
  ['src/app/services/repositories/vote.repository.spec.ts', 'libs/data-access/src/lib/repositories/vote.repository.spec.ts'],
  // Auth
  ['src/app/services/auth.service.ts', 'libs/auth/src/lib/auth.service.ts'],
  ['src/app/services/auth.service.spec.ts', 'libs/auth/src/lib/auth.service.spec.ts'],
  ['src/app/guards/auth.guard.ts', 'libs/auth/src/lib/auth.guard.ts'],
  ['src/app/guards/admin.guard.ts', 'libs/auth/src/lib/admin.guard.ts'],
  // Util
  ['src/app/helpers/init-db.ts', 'libs/util/src/lib/init-db.ts'],
  ['src/app/helpers/init-db.spec.ts', 'libs/util/src/lib/init-db.spec.ts'],
  // Feature components
  ['src/app/features/login/login.component.ts', 'libs/feature-login/src/lib/login/login.component.ts'],
  ['src/app/features/login/login.component.html', 'libs/feature-login/src/lib/login/login.component.html'],
  ['src/app/features/login/login.component.scss', 'libs/feature-login/src/lib/login/login.component.scss'],
  ['src/app/features/departure/departure.component.ts', 'libs/feature-departure/src/lib/departure/departure.component.ts'],
  ['src/app/features/departure/departure.component.html', 'libs/feature-departure/src/lib/departure/departure.component.html'],
  ['src/app/features/departure/departure.component.scss', 'libs/feature-departure/src/lib/departure/departure.component.scss'],
  ['src/app/features/voting/voting.component.ts', 'libs/feature-voting/src/lib/voting/voting.component.ts'],
  ['src/app/features/voting/voting.component.html', 'libs/feature-voting/src/lib/voting/voting.component.html'],
  ['src/app/features/voting/voting.component.scss', 'libs/feature-voting/src/lib/voting/voting.component.scss'],
  ['src/app/features/ordering/ordering.component.ts', 'libs/feature-ordering/src/lib/ordering/ordering.component.ts'],
  ['src/app/features/ordering/ordering.component.html', 'libs/feature-ordering/src/lib/ordering/ordering.component.html'],
  ['src/app/features/ordering/ordering.component.scss', 'libs/feature-ordering/src/lib/ordering/ordering.component.scss'],
  ['src/app/features/admin/dashboard/dashboard.component.ts', 'libs/feature-admin/src/lib/dashboard/dashboard.component.ts'],
  ['src/app/features/admin/dashboard/dashboard.component.html', 'libs/feature-admin/src/lib/dashboard/dashboard.component.html'],
  ['src/app/features/admin/dashboard/dashboard.component.scss', 'libs/feature-admin/src/lib/dashboard/dashboard.component.scss'],
  ['src/app/features/admin/menu-management/menu-management.component.ts', 'libs/feature-admin/src/lib/menu-management/menu-management.component.ts'],
  ['src/app/features/admin/menu-management/menu-management.component.html', 'libs/feature-admin/src/lib/menu-management/menu-management.component.html'],
  ['src/app/features/admin/menu-management/menu-management.component.scss', 'libs/feature-admin/src/lib/menu-management/menu-management.component.scss'],
  ['src/app/features/admin/settings/settings.component.ts', 'libs/feature-admin/src/lib/settings/settings.component.ts'],
  ['src/app/features/admin/settings/settings.component.html', 'libs/feature-admin/src/lib/settings/settings.component.html'],
  ['src/app/features/admin/settings/settings.component.scss', 'libs/feature-admin/src/lib/settings/settings.component.scss'],
  ['src/app/features/admin/user-management/user-management.component.ts', 'libs/feature-admin/src/lib/user-management/user-management.component.ts'],
  ['src/app/features/admin/user-management/user-management.component.html', 'libs/feature-admin/src/lib/user-management/user-management.component.html'],
  ['src/app/features/admin/user-management/user-management.component.scss', 'libs/feature-admin/src/lib/user-management/user-management.component.scss'],
];

const NX_ROOT = path.resolve(__dirname, '../../../..');

describe('Property 2: All base source files have a migrated equivalent (full workspace)', () => {
  it('every base source file has a corresponding file in the nx workspace', () => {
    fc.assert(
      fc.property(fc.constantFrom(...FILE_MAP), ([_basePath, nxPath]) => {
        const fullPath = path.join(NX_ROOT, nxPath);
        return existsSync(fullPath);
      }),
    );
  });
});
