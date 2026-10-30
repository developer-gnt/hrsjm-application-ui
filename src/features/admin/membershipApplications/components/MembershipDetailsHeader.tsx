import React from 'react';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';

interface MembershipDetailsHeaderProps {
  paddingTop?: number;
  onBack: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const MembershipDetailsHeader: React.FC<MembershipDetailsHeaderProps> = ({
  onBack,
  onNotificationsPress,
  onProfilePress,
}) => {
  return (
    <AdminHeader
      showBack={true}
      onBack={onBack}
      onPressNotifications={onNotificationsPress}
      onPressProfile={onProfilePress}
    />
  );
};

export default MembershipDetailsHeader;
