import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';

export interface StoryItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  accentColor: string;
  rightAchieved: string;
  rating: number;
}

const STORIES: StoryItem[] = [
  {
    id: 's1',
    quote:
      '"HRSJM helped me file a Zero FIR when the local station refused. Within 48 hours, my case was registered and justice was on the way."',
    name: 'Priya Sharma',
    role: 'Women\'s Rights Advocate, Mumbai',
    initials: 'PS',
    avatarBg: '#FEF3C7',
    accentColor: '#EAA532',
    rightAchieved: 'Right to FIR',
    rating: 5,
  },
  {
    id: 's2',
    quote:
      '"My son was denied school admission despite having the legal right to education. HRSJM intervened and he\'s now studying in a government school."',
    name: 'Rajesh Kumar',
    role: 'Parent & Community Leader, Thane',
    initials: 'RK',
    avatarBg: '#E0E7FF',
    accentColor: '#4F46E5',
    rightAchieved: 'Right to Education',
    rating: 5,
  },
  {
    id: 's3',
    quote:
      '"The free legal aid programme connected me with a lawyer who helped me recover my rightful wages from my employer. Life-changing support."',
    name: 'Sunita Devi',
    role: 'Garment Worker, Dharavi',
    initials: 'SD',
    avatarBg: '#DCFCE7',
    accentColor: '#16A34A',
    rightAchieved: 'Labour Rights',
    rating: 5,
  },
  {
    id: 's4',
    quote:
      '"When no one listened to our housing complaints, HRSJM organised our community and we successfully stopped an illegal eviction drive."',
    name: 'Mohammed Iqbal',
    role: 'Resident Welfare Association, Kurla',
    initials: 'MI',
    avatarBg: '#FEE2E2',
    accentColor: '#DC2626',
    rightAchieved: 'Housing Rights',
    rating: 5,
  },
];

export const SuccessStoriesSection: React.FC = () => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(300, width * 0.82);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {STORIES.map(story => (
        <View
          key={story.id}
          style={[styles.card, { width: cardWidth, borderLeftColor: story.accentColor }]}
        >
          {/* Quote icon */}
          <View style={[styles.quoteIconWrap, { backgroundColor: story.avatarBg }]}>
            <Text style={[styles.quoteIcon, { color: story.accentColor }]}>"</Text>
          </View>

          {/* Quote text */}
          <Text style={styles.quoteText}>{story.quote}</Text>

          {/* Achievement badge */}
          <View style={[styles.achievementBadge, { backgroundColor: story.avatarBg }]}>
            <AppIcon name="check" size={12} color={story.accentColor} />
            <Text style={[styles.achievementText, { color: story.accentColor }]}>
              {story.rightAchieved}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={[styles.avatar, { backgroundColor: story.avatarBg }]}>
              <Text style={[styles.avatarText, { color: story.accentColor }]}>
                {story.initials}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{story.name}</Text>
              <Text style={styles.authorRole} numberOfLines={1}>{story.role}</Text>
            </View>
            {/* Stars */}
            <View style={styles.starsRow}>
              {Array.from({ length: story.rating }, (_, i) => (
                <AppIcon key={i} name="star" size={11} color="#EAA532" />
              ))}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    gap: Spacing.md,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    paddingLeft: Spacing.base + 2,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: AdminColors.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  quoteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quoteIcon: {
    fontFamily: FontFamilies.serif,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  quoteText: {
    fontFamily: FontFamilies.serif,
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  achievementText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: Spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  authorRole: {
    fontSize: 11,
    lineHeight: 15,
    color: AdminColors.textSecondary,
    marginTop: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    flexShrink: 0,
  },
});
