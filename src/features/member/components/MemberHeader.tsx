import React from 'react';
import { AdminHeader, AdminHeaderProps } from '../../../app/navigation/AdminHeader';

export interface MemberHeaderProps extends AdminHeaderProps {
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

/**
 * Unified institutional header for Member Portal matching Admin design:
 * - Hamburger menu (☰)
 * - Official Emblem & HRSJM Brand Logo
 * - Notification Bell with badge counter
 * - Profile Avatar with dropdown options
 */
export const MemberHeader: React.FC<MemberHeaderProps> = props => {
  return (
    <AdminHeader
      {...props}
      onPressNotifications={props.onNotificationsPress || props.onPressNotifications}
      unreadCount={props.unreadCount ?? 0}
    />
  );
};
