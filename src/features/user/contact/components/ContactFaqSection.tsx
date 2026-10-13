import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { CONTACT_FAQS } from '../data/contact-content';

// Enable LayoutAnimation on Android.
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen, onToggle }) => (
  <View style={styles.item}>
    <TouchableOpacity
      style={styles.itemHeader}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${question}. ${isOpen ? 'Collapse' : 'Expand'}`}
    >
      <Text style={styles.question}>{question}</Text>
      <AppIcon
        name={isOpen ? 'chevron-up' : 'chevron-down'}
        size={16}
        color={AdminColors.primaryDark}
      />
    </TouchableOpacity>

    {isOpen && (
      <View style={styles.answerWrap}>
        <Text style={styles.answer}>{answer}</Text>
      </View>
    )}
  </View>
);

/**
 * Collapsible FAQ accordion for the Contact Us page.
 * Each item expands/collapses independently.
 */
export const ContactFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Frequently Asked Questions</Text>
      <Text style={styles.subtitle}>
        Find answers to common questions about our services and how we can help you.
      </Text>

      <View style={styles.list}>
        {CONTACT_FAQS.map((faq, index) => (
          <FaqItem
            key={`faq-${index}`}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => toggle(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.base,
  },
  heading: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  subtitle: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: AdminColors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  item: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  question: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  answerWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  answer: {
    fontSize: 12,
    lineHeight: 17.5,
    color: AdminColors.textSecondary,
    marginTop: Spacing.sm,
  },
});