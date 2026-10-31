import React from 'react';
import { AdminHeader } from '../../../app/navigation/AdminHeader';

interface RenewMembershipHeaderProps {
  paddingTop?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const RenewMembershipHeader: React.FC<RenewMembershipHeaderProps> = ({
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

export default RenewMembershipHeader;
