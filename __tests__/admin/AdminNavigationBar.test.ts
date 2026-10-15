import { AppRoutes } from '../../src/core/constants/routes';
import { PermissionKeys } from '../../src/core/permissions/permission.constants';
import { getPermittedAdminTabs } from '../../src/app/navigation/AdminNavigationBar';

describe('getPermittedAdminTabs', () => {
  it('keeps the dashboard and More tabs available without module permissions', () => {
    expect(getPermittedAdminTabs([]).map(tab => tab.name)).toEqual([
      AppRoutes.ADMIN_DASHBOARD_TAB,
      AppRoutes.ADMIN_MORE_TAB,
    ]);
  });

  it('shows only module tabs granted by the loaded permissions', () => {
    expect(
      getPermittedAdminTabs([
        PermissionKeys.MEMBERSHIP_READ,
        PermissionKeys.SUPPORT_MANAGE,
      ]).map(tab => tab.name),
    ).toEqual([
      AppRoutes.ADMIN_DASHBOARD_TAB,
      AppRoutes.ADMIN_MEMBERS_TAB,
      AppRoutes.ADMIN_COMPLAINTS_TAB,
      AppRoutes.ADMIN_MORE_TAB,
    ]);
  });
});
