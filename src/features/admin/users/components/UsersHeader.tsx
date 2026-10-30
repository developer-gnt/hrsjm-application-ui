import React from 'react';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';

interface UsersHeaderProps {
  paddingTop?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  onNotificationsPress,
  onProfilePress,
}) => {
  return (
    <AdminHeader
      onPressNotifications={onNotificationsPress}
      onPressProfile={onProfilePress}
    />
  );
};

export default UsersHeader;
