import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import {
  CategoryArrowRightIcon,
  IndividualMemberIcon,
  ProfessionalMemberIcon,
  StudentMemberIcon,
} from './MembershipIcons';

export type MembershipCategoryType = 'individual' | 'student' | 'professional';

export interface MembershipCategoryItem {
  id: MembershipCategoryType;
  title: string;
  subtitleLine2?: string;
  description: string;
  icon: React.ReactNode;
}

interface MembershipCategoriesSectionProps {
  selectedCategory?: MembershipCategoryType | null;
  onSelectCategory?: (categoryId: MembershipCategoryType) => void;
}

export const MembershipCategoriesSection: React.FC<MembershipCategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: MembershipCategoryItem[] = [
    {
      id: 'individual',
      title: 'Individual',
      subtitleLine2: 'Member',
      description: 'For individuals who want to support and participate.',
      icon: <IndividualMemberIcon size={18} color="#0F2860" />,
    },
    {
      id: 'student',
      title: 'Student',
      subtitleLine2: 'Member',
      description: 'For students who want to learn and get involved.',
      icon: <StudentMemberIcon size={18} color="#0F2860" />,
    },
    {
      id: 'professional',
      title: 'Professional',
      subtitleLine2: 'Member',
      description: 'For working professionals who want to contribute their skills and time.',
      icon: <ProfessionalMemberIcon size={18} color="#0F2860" />,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Membership Categories</Text>

      {/* 3 Horizontal Cards Row */}
      <View style={styles.cardsRow}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => onSelectCategory?.(cat.id)}
              accessibilityRole="button"
              accessibilityLabel={`${cat.title} ${cat.subtitleLine2 || ''}`}
              accessibilityState={{ selected: isSelected }}
            >
              {/* Header row inside card: Icon badge + Title */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                  {cat.icon}
                </View>
                <View style={styles.titleWrapper}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {cat.title}
                  </Text>
                  {cat.subtitleLine2 && (
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {cat.subtitleLine2}
                    </Text>
                  )}
                </View>
              </View>

              {/* Description */}
              <Text style={styles.cardDescription} numberOfLines={4}>
                {cat.description}
              </Text>

              {/* Bottom Action Arrow */}
              <View style={styles.bottomRow}>
                <View style={[styles.arrowCircle, isSelected && styles.arrowCircleSelected]}>
                  <CategoryArrowRightIcon size={11} color="#0F2860" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 9,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1.5,
    borderColor: '#EBF0F7',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
    justifyContent: 'space-between',
  },
  categoryCardSelected: {
    borderColor: '#EAA224',
    backgroundColor: '#FFFDF9',
    shadowColor: '#EAA224',
    shadowOpacity: 0.15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF8E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexShrink: 0,
  },
  iconCircleSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 13,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 13.5,
    marginBottom: 6,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF3D6',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircleSelected: {
    backgroundColor: '#FDE68A',
    borderColor: '#EAA224',
  },
});
