import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AdminHeader, AdminHeaderProps } from '../../../app/navigation/AdminHeader';

export interface MemberHeaderProps extends AdminHeaderProps {
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onDonatePress?: () => void;
}

/**
 * Unified institutional header for Member Portal matching Admin design:
 * - Hamburger menu (â˜°)
 * - Official Emblem & HRSJM Brand Logo
 * - Donate Now button (matching User header experience)
 * - Notification Bell with badge counter
 * - Profile Avatar with dropdown options
 */
export const MemberHeader: React.FC<MemberHeaderProps> = props => {
  const navigation = useNavigation<any>();

  const handleDonate = () => {
    if (props.onDonatePress) {
      props.onDonatePress();
    } else if (props.onPressDonate) {
      props.onPressDonate();
    } else if (navigation?.navigate) {
      navigation.navigate('UserActionPage', { pageId: 'donate' });
    }
  };

  return (
    <AdminHeader
      isMemberHeader={true}
      showDonate={props.showDonate ?? false}
      onPressDonate={handleDonate}
      {...props}
      onPressNotifications={props.onNotificationsPress || props.onPressNotifications}
      unreadCount={props.unreadCount}
    />
  );
};
