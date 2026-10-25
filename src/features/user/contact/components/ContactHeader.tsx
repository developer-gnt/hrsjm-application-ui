import React from 'react';
import { HomeHeader } from '../../home/components/HomeHeader';

interface ContactHeaderProps {
  onBack?: () => void;
  onPressSearch?: () => void;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  unreadCount?: number;
}

/**
 * Contact screen header: delegates to the unified official HRSJM User Header.
 */
export const ContactHeader: React.FC<ContactHeaderProps> = ({
  onBack,
  onPressNotifications,
  onPressProfile,
  unreadCount = 3,
}) => {
  return (
    <HomeHeader
      activeNav="contact"
      onBack={onBack}
      onPressNotifications={onPressNotifications}
      onPressProfile={onPressProfile}
      unreadCount={unreadCount}
    />
  );
};
