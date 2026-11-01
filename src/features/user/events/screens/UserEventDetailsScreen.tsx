import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
  UserFontFamilies,
} from '../../../../core/theme';
import { AppIcon, type IconName } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import type { UserEvent } from '../data/user-events';

const DEFAULT_EVENT_IMAGE = require('../../../../assets/images/event-legal-awareness.jpg');

interface UserEventDetailsScreenProps {
  event: UserEvent;
  onBack: () => void;
  onRegister?: () => void;
}

export const UserEventDetailsScreen: React.FC<UserEventDetailsScreenProps> = ({
  event,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [coverSource, setCoverSource] = React.useState<any>(event.image || DEFAULT_EVENT_IMAGE);

  React.useEffect(() => {
    setCoverSource(event.image || DEFAULT_EVENT_IMAGE);
  }, [event.image]);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  const handleOpenMap = async () => {
    const targetPlace =
      event.venue && event.location && event.venue !== event.location
        ? `${event.venue}, ${event.location}`
        : event.venue || event.location || 'Mumbai';
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetPlace)}`;

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(mapUrl, '_blank');
        return;
      }

      const supported = await Linking.canOpenURL(mapUrl);
      if (supported) {
        await Linking.openURL(mapUrl);
      } else {
        await Linking.openURL(`geo:0,0?q=${encodeURIComponent(targetPlace)}`);
      }
    } catch {
      Linking.openURL(mapUrl);
    }
  };

  const eventYear = React.useMemo(() => {
    if (event.rawEvent?.start_at) {
      const d = new Date(event.rawEvent.start_at);
      if (!isNaN(d.getFullYear())) return String(d.getFullYear());
    }
    const parts = event.date?.split(' ');
    if (parts && parts.length >= 3 && !isNaN(Number(parts[2]))) {
      return parts[2];
    }
    return String(new Date().getFullYear());
  }, [event]);

  const status = event.status?.toUpperCase() || 'UPCOMING';
  const isCompleted = status === 'COMPLETED';
  const isCancelled = status === 'CANCELLED';
  const statusLabel = isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Upcoming';
  const statusIcon = isCompleted ? 'check-circle' : isCancelled ? 'x-circle' : 'calendar';

  const venueText = (event.venue || event.location || 'HRSJM Centre').trim();
  const locationText = (event.location || '').trim();
  const hasDistinctLocation =
    Boolean(locationText && venueText) &&
    locationText.toLowerCase() !== venueText.toLowerCase() &&
    !venueText.toLowerCase().includes(locationText.toLowerCase());

  const subtitle =
    event.rawEvent?.short_information?.trim() ||
    (event.rawEvent?.organized_by ? `Organized by ${event.rawEvent.organized_by}` : null);

  // Dynamic feature pills matching event specifications
  const targetAudience = event.rawEvent?.target_audience || 'Open to All';
  const isOnline =
    event.rawEvent?.event_type === 'ONLINE' || event.rawEvent?.event_type === 'VIRTUAL';
  const formatLabel = isOnline ? 'Online\nEvent' : 'Offline\nEvent';
  const entryLabel = event.rawEvent?.registration_required ? 'Registration\nRequired' : 'Free\nEntry';

  const eventFeatures = [
    {
      icon: 'users' as const,
      label: targetAudience.includes('\n')
        ? targetAudience
        : targetAudience.length > 12
        ? `${targetAudience.slice(0, 11)}…`
        : targetAudience,
    },
    { icon: (isOnline ? 'globe' : 'map-pin') as IconName, label: formatLabel },
    { icon: 'heart' as const, label: entryLabel },
    { icon: 'graduation-cap' as const, label: 'Certificate\nProvided' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader onBack={onBack} activeNav="events" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          <Image
            source={coverSource}
            style={styles.coverImage}
            resizeMode="cover"
            onError={() => {
              setCoverSource(DEFAULT_EVENT_IMAGE);
            }}
          />
          <View style={styles.coverShade} />
          <View style={styles.dateCard}>
            <Text style={styles.coverDateDay}>{event.day}</Text>
            <Text style={styles.coverDateMonth}>
              {event.month} {eventYear}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isCompleted && styles.statusBadgeCompleted,
              isCancelled && styles.statusBadgeCancelled,
            ]}
          >
            <AppIcon
              name={statusIcon as any}
              size={14}
              color={
                isCompleted
                  ? '#166534'
                  : isCancelled
                  ? '#991B1B'
                  : AdminColors.primaryDark
              }
            />
            <Text
              style={[
                styles.statusText,
                isCompleted && styles.statusTextCompleted,
                isCancelled && styles.statusTextCancelled,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.pillContainer}>
            <Text style={styles.categoryPill}>{event.category}</Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {subtitle && subtitle !== event.title ? (
            <Text style={styles.description}>{subtitle}</Text>
          ) : null}

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <View style={styles.infoIcon}>
                <AppIcon name="calendar" size={18} color={AdminColors.primaryDark} />
              </View>
              <View style={styles.infoCopy}>
                <Text style={styles.infoLabel}>Date &amp; Time</Text>
                <Text style={styles.infoValue}>{event.date}</Text>
                <Text style={styles.infoSubValue}>{event.time}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCell}>
              <View style={styles.infoIcon}>
                <AppIcon name="map-pin" size={18} color={AdminColors.primaryDark} />
              </View>
              <View style={styles.infoCopy}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{venueText}</Text>
                {hasDistinctLocation ? (
                  <Text style={styles.infoSubValue}>{locationText}</Text>
                ) : null}
                <TouchableOpacity
                  onPress={handleOpenMap}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${venueText} on Google Maps`}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mapLink}>View on Map →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.featureRow}>
            {eventFeatures.map(feature => (
              <View key={feature.label} style={styles.featureItem}>
                <AppIcon name={feature.icon} size={20} color={AdminColors.primaryDark} />
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.bodyText}>
              {event.description?.trim() ||
                'HRSJM supports individuals and communities in accessing justice through comprehensive legal awareness, human rights education, and civic empowerment initiatives.'}
            </Text>
          </View>

          {Array.isArray(event.topics) && event.topics.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Topics</Text>
              {event.topics.map(topic => (
                <View key={topic} style={styles.topicRow}>
                  <View style={styles.topicCheck}>
                    <AppIcon name="check" size={10} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  coverWrap: {
    height: 210,
    backgroundColor: AdminColors.primaryDark,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 29, 64, 0.12)',
  },
  dateCard: {
    position: 'absolute',
    left: Spacing.md,
    top: Spacing.md,
    minWidth: 54,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  coverDateDay: {
    color: AdminColors.primaryDark,
    fontSize: 22,
    lineHeight: 25,
    fontWeight: '800',
  },
  coverDateMonth: {
    color: AdminColors.primaryDark,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  statusBadge: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 11,
    paddingVertical: 5,
    ...Shadows.card,
  },
  statusBadgeCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextCompleted: {
    color: '#166534',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  detailCard: {
    marginTop: -14,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  pillContainer: {
    flexDirection: 'row',
  },
  categoryPill: {
    overflow: 'hidden',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGoldLight,
    color: AdminColors.primaryDark,
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    fontSize: 11.5,
    fontWeight: '700',
  },
  eventTitle: {
    marginTop: Spacing.sm,
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  description: {
    color: AdminColors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: Spacing.xs + 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: Spacing.md + 2,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: AdminColors.border,
  },
  infoCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    minWidth: 0,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  infoCopy: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: AdminColors.textMuted,
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    color: AdminColors.primaryDark,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
  },
  infoSubValue: {
    color: AdminColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '500',
    marginTop: 1,
  },
  infoDivider: {
    width: 1,
    backgroundColor: AdminColors.border,
    marginHorizontal: Spacing.sm,
  },
  mapLink: {
    color: '#174A78',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: Spacing.md + 2,
  },
  featureItem: {
    flex: 1,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: 10,
    backgroundColor: AdminColors.cardSurface,
    paddingVertical: 8,
    paddingHorizontal: 2,
    gap: 4,
  },
  featureLabel: {
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    marginBottom: Spacing.xs + 2,
  },
  bodyText: {
    color: AdminColors.textSecondary,
    fontSize: 13.5,
    lineHeight: 21,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  topicCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    color: AdminColors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
    flex: 1,
  },
});
