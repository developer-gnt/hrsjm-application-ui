import React from 'react';
import { AdminHeader, AdminHeaderProps } from '../../../app/navigation/AdminHeader';

export interface MembershipTopBarProps extends AdminHeaderProps {
  onBackPress?: () => void;
}

export const MembershipTopBar: React.FC<MembershipTopBarProps> = ({
  showBack,
  onBackPress,
  onBack,
  ...rest
}) => {
  return (
    <AdminHeader
      showBack={showBack}
      onBack={onBackPress || onBack}
      {...rest}
    />
  );
};

export default MembershipTopBar;
