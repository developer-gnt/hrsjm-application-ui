import React from 'react';
import { AdminHeader } from '../../../app/navigation/AdminHeader';

interface BecomeMemberHeaderProps {
  paddingTop?: number;
  onBack?: () => void;
  onSearchPress?: () => void;
}

export const BecomeMemberHeader: React.FC<BecomeMemberHeaderProps> = ({
  onBack,
}) => {
  return <AdminHeader showBack={Boolean(onBack)} onBack={onBack} />;
};

export default BecomeMemberHeader;
