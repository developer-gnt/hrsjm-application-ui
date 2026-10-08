import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, FontFamilies, Spacing } from '../../../../core/theme';
import { ContactHeader } from '../components/ContactHeader';
import { ContactHero } from '../components/ContactHero';
import { ContactActionsRow } from '../components/ContactActionCard';
import { ContactForm } from '../components/ContactForm';
import { ContactDetailsSection } from '../components/ContactDetailsSection';
import { ContactMapSection } from '../components/ContactMapSection';
import { ContactFinalCta } from '../components/ContactFinalCta';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import { CONTACT_ACTIONS } from '../data/contact-content';

export interface ContactUsScreenProps {
  /** Returns to the previous User screen (temporary router back navigation). */
  onBack?: () => void;
  onOpenRights?: () => void;
  /** Opens the About page (About tab in the shared six-tab navigation). */
  onOpenAbout?: () => void;
}

/**
 * Reference-locked Contact Us page — a standalone User App screen:
 * header, navy contact hero, four quick-action cards, the "Send Us a
 * Message" form with UI-only validation, "Our Contact Details" 2x2 grid,
 * "Find Us on Map" with the office info card, the "Open in Google Maps"
 * action, the closing navy CTA and the five-tab bottom navigation
 * (Home · About · Rights · Events · News).
 */
export const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
  onBack,
  onOpenRights,
  onOpenAbout,
}) => {
  const showComingSoon = (feature: string) => {
    // UI PHASE ONLY placeholder for actions that ship with later phases.
    Alert.alert(feature, `"${feature}" is part of an upcoming phase.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ContactHeader
        onBack={onBack}
        onPressSearch={() => showComingSoon('Search')}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ContactHero />

          <View style={styles.actionsSection}>
            <ContactActionsRow
              actions={CONTACT_ACTIONS}
              onPressAction={action => showComingSoon(action.title)}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formHeading}>Send Us a Message</Text>
            <Text style={styles.formSupporting}>
              Have a question, suggestion or need support? Fill out the form
              below and our team will get back to you.
            </Text>
            <ContactForm />
          </View>

          <View style={styles.detailsSection}>
            <ContactDetailsSection
              onLinkPress={() => showComingSoon('View on Maps')}
            />
          </View>

          <ContactMapSection />

          <View style={styles.ctaSection}>
            <ContactFinalCta />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <UserBottomNavigation
        activeTab="contact"
        onTabPress={tab => {
          if (tab.id === 'home') {
            onBack?.();
          } else if (tab.id === 'rights') {
            onOpenRights?.();
          } else if (tab.id === 'about') {
            onOpenAbout?.();
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  actionsSection: {
    marginTop: Spacing.lg,
  },
  formSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  formHeading: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  formSupporting: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: AdminColors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  detailsSection: {
    marginTop: Spacing.xl,
  },
  ctaSection: {
    marginTop: Spacing.xl,
  },
});
