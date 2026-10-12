import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';

export const AboutVisionMissionSection: React.FC = () => {
  return (
    <View>
      <View style={styles.heading}>
        <View style={styles.accentLine} />
        <Text style={styles.title}>Our Vision & Mission</Text>
        <Text style={styles.subtitle}>
          Guiding principles driving our commitment to equality and social justice
        </Text>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.card, styles.missionCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, styles.missionIconCircle]}>
              <AppIcon
                name="shield-check"
                size={22}
                color={AdminColors.primaryDark}
              />
            </View>
            <Text style={styles.cardTitle}>Our Mission</Text>
          </View>
          <Text style={styles.cardDescription}>
            To protect fundamental human rights, eliminate social inequalities,
            and empower vulnerable individuals through legal literacy, active
            advocacy, and rapid grassroots intervention.
          </Text>
        </View>

        <View style={[styles.card, styles.visionCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, styles.visionIconCircle]}>
              <AppIcon
                name="globe"
                size={22}
                color={AdminColors.primaryDark}
              />
            </View>
            <Text style={styles.cardTitle}>Our Vision</Text>
          </View>
          <Text style={styles.cardDescription}>
            A just, inclusive, and equitable society where every individual's
            dignity, liberty, and equal rights are preserved, respected, and
            protected by law.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginBottom: Spacing.sm,
  },
  accentLine: {
    width: 28,
    height: 2.5,
    marginBottom: 4,
    backgroundColor: AdminColors.accentGold,
    borderRadius: 1,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: AdminColors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xs,
  },
  card: {
    flex: 1,
    minHeight: 156,
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.card,
    justifyContent: 'flex-start',
  },
  missionCard: {
    backgroundColor: '#EEF4FF',
    borderColor: '#D7E3F7',
  },
  visionCard: {
    backgroundColor: '#FFF8E8',
    borderColor: '#FBE5A5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.xs,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIconCircle: {
    backgroundColor: '#DCE9FF',
  },
  visionIconCircle: {
    backgroundColor: '#FCE9B8',
  },
  cardTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  cardDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17.5,
  },
});
