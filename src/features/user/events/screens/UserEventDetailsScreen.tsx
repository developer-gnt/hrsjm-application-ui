import React from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, FontFamilies, Shadows, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { UserEvent } from '../data/user-events';

interface UserEventDetailsScreenProps {
  event: UserEvent;
  onBack: () => void;
  onRegister: () => void;
}

const EVENT_FEATURES = [
  { icon: 'users' as const, label: 'Open to\nAll' },
  { icon: 'map-pin' as const, label: 'Offline\nEvent' },
  { icon: 'heart' as const, label: 'Free\nEntry' },
  { icon: 'graduation-cap' as const, label: 'Certificate\nProvided' },
];

export const UserEventDetailsScreen: React.FC<UserEventDetailsScreenProps> = ({
  event,
  onBack,
  onRegister,
}) => {
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  const handleShare = async () => {
    await Share.share({
      message: `${event.title}\n${event.date} · ${event.time}\n${event.venue}`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to Events"
        >
          <AppIcon name="chevron-left" size={20} color={AdminColors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share event"
        >
          <AppIcon name="share" size={19} color={AdminColors.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          <Image source={event.image} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.coverShade} />
          <View style={styles.dateCard}>
            <Text style={styles.coverDateDay}>{event.day}</Text>
            <Text style={styles.coverDateMonth}>{event.month} 2026</Text>
          </View>
          <View style={styles.statusBadge}>
            <AppIcon name="calendar" size={12} color={AdminColors.primaryDark} />
            <Text style={styles.statusText}>Upcoming</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.categoryPill}>{event.category}</Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <View style={styles.infoIcon}>
                <AppIcon name="calendar" size={18} color={AdminColors.primaryDark} />
              </View>
              <View style={styles.infoCopy}>
                <Text style={styles.infoLabel}>Date &amp; Time</Text>
                <Text style={styles.infoValue}>{event.date}</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCell}>
              <View style={styles.infoIcon}>
                <AppIcon name="map-pin" size={18} color={AdminColors.primaryDark} />
              </View>
              <View style={styles.infoCopy}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{event.venue}</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
                <TouchableOpacity
                  onPress={() => Alert.alert(event.venue, event.location)}
                  accessibilityRole="button"
                >
                  <Text style={styles.mapLink}>View on Map →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.featureRow}>
            {EVENT_FEATURES.map(feature => (
              <View key={feature.label} style={styles.featureItem}>
                <AppIcon name={feature.icon} size={19} color={AdminColors.primaryDark} />
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.bodyText}>
              {event.description} HRSJM supports individuals and communities in accessing justice.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Topics</Text>
            {event.topics.map(topic => (
              <View key={topic} style={styles.topicRow}>
                <View style={styles.topicCheck}>
                  <AppIcon name="check" size={10} color={AdminColors.textOnDark} />
                </View>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={onRegister}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Register for Event"
        >
          <Text style={styles.registerText}>Register for Event</Text>
          <AppIcon name="arrow-right" size={18} color={AdminColors.primaryDark} />
        </TouchableOpacity>
      </View>
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
  header: {
    minHeight: 58,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  coverWrap: {
    height: 178,
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
    minWidth: 45,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  coverDateDay: {
    color: AdminColors.primaryDark,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },
  coverDateMonth: {
    color: AdminColors.primaryDark,
    fontSize: 7,
    lineHeight: 10,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    fontWeight: '700',
  },
  detailCard: {
    marginTop: -14,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGoldLight,
    color: AdminColors.primaryDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '700',
  },
  eventTitle: {
    marginTop: Spacing.xs,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 23,
    lineHeight: 25,
    fontWeight: '700',
  },
  description: {
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: AdminColors.border,
  },
  infoCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    minWidth: 0,
  },
  infoIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: AdminColors.textSecondary,
    fontSize: 9,
    marginBottom: 2,
  },
  infoValue: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '600',
  },
  infoDivider: {
    width: 1,
    backgroundColor: AdminColors.border,
    marginHorizontal: Spacing.xs,
  },
  mapLink: {
    color: '#2D66A0',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  featureItem: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    gap: 3,
  },
  featureLabel: {
    color: AdminColors.primaryDark,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  bodyText: {
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: Spacing.xs,
  },
  topicCheck: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    color: AdminColors.textSecondary,
    fontSize: 9,
    lineHeight: 12,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
  },
  registerButton: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGold,
  },
  registerText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
});
