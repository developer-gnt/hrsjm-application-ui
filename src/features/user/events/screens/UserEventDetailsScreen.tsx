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
            <AppIcon name="calendar" size={14} color={AdminColors.primaryDark} />
            <Text style={styles.statusText}>Upcoming</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.pillContainer}>
            <Text style={styles.categoryPill}>{event.category}</Text>
          </View>
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
                <AppIcon name={feature.icon} size={20} color={AdminColors.primaryDark} />
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
                  <AppIcon name="check" size={10} color="#FFFFFF" strokeWidth={2.4} />
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
          <AppIcon name="arrow-right" size={18} color="#082245" />
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  coverWrap: {
    height: 200,
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
    minWidth: 52,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...Shadows.card,
  },
  statusText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11.5,
    fontWeight: '700',
  },
  eventTitle: {
    marginTop: Spacing.sm,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '700',
  },
  description: {
    color: '#4B5563',
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
    borderColor: '#EAE6DC',
  },
  infoCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    minWidth: 0,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoCopy: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  infoDivider: {
    width: 1,
    backgroundColor: '#EAE6DC',
    marginHorizontal: Spacing.sm,
  },
  mapLink: {
    color: '#2563EB',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 3,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: Spacing.md + 2,
  },
  featureItem: {
    flex: 1,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4DA',
    borderRadius: 10,
    backgroundColor: '#FCFBF7',
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
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    marginBottom: Spacing.xs + 2,
  },
  bodyText: {
    color: '#4B5563',
    fontSize: 13.5,
    lineHeight: 20,
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
    color: '#374151',
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
  },
  registerButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: 12,
    backgroundColor: AdminColors.accentGold,
  },
  registerText: {
    color: '#082245',
    fontSize: 15,
    fontWeight: '700',
  },
});
