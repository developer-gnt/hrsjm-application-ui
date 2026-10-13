import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import { ContactFaqSection } from '../components/ContactFaqSection';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import { CONTACT_ACTIONS } from '../data/contact-content';

/** Verified organisation contact details. */
const ORG_PHONE = '+912212345678';
const ORG_EMAIL = 'info@hrsjm.org';

export interface ContactUsScreenProps {
  /** Returns to the previous User screen (temporary router back navigation). */
  onBack?: () => void;
  onOpenRights?: () => void;
  /** Opens the About page (About tab in the shared six-tab navigation). */
  onOpenAbout?: () => void;
  /** Opens the Get Help flow. */
  onOpenGetHelp?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
}

/**
 * Reference-locked Contact Us page — a standalone User App screen:
 * header, navy contact hero, four quick-action cards, the "Send Us a
 * Message" form with UI-only validation, "Our Contact Details" 2x2 grid,
 * "Find Us on Map" with the office info card, an FAQ accordion, the
 * closing navy CTA and the five-tab bottom navigation
 * (Home · About · Rights · Events · News).
 */
export const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
  onBack,
  onOpenRights,
  onOpenAbout,
  onOpenGetHelp,
  onOpenEvents,
  onOpenNews,
}) => {
  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `"${feature}" is part of an upcoming phase.`);
  };

  const handleActionPress = async (actionId: string, title: string) => {
    if (actionId === 'help') {
      onOpenGetHelp?.();
      return;
    }
    if (actionId === 'call') {
      const url = `tel:${ORG_PHONE}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Call Us', `Please call us at +91 22 1234 5678`);
      }
      return;
    }
    if (actionId === 'email') {
      const url = `mailto:${ORG_EMAIL}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Email Us', `Please email us at ${ORG_EMAIL}`);
      }
      return;
    }
    if (actionId === 'visit') {
      const mapsUrl = 'https://maps.google.com/?q=Kurla+West,+Mumbai,+Maharashtra+400070';
      const canOpen = await Linking.canOpenURL(mapsUrl);
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        Alert.alert(
          'Office Address',
          'HRSJM\n123 Justice Lane, Kurla (W)\nMumbai, Maharashtra 400070',
        );
      }
      return;
    }
    showComingSoon(title);
  };

  const handleOpenMaps = async () => {
    const mapsUrl = 'https://maps.google.com/?q=Kurla+West,+Mumbai,+Maharashtra+400070';
    const canOpen = await Linking.canOpenURL(mapsUrl);
    if (canOpen) {
      await Linking.openURL(mapsUrl);
    } else {
      Alert.alert(
        'Office Address',
        'HRSJM\n123 Justice Lane, Kurla (W)\nMumbai, Maharashtra 400070',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ContactHeader
        onBack={onBack}
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
          {/* 1. Hero banner */}
          <ContactHero />

          {/* 2. Quick contact action cards */}
          <View style={styles.actionsSection}>
            <ContactActionsRow
              actions={CONTACT_ACTIONS}
              onPressAction={action =>
                handleActionPress(action.id, action.title)
              }
            />
          </View>

          {/* 3. Contact form */}
          <View style={styles.formSection}>
            <Text style={styles.formHeading}>Send Us a Message</Text>
            <Text style={styles.formSupporting}>
              Have a question, suggestion or need support? Fill out the form
              below and our team will get back to you.
            </Text>
            <ContactForm />
          </View>

          {/* 4. Our Contact Details 2×2 grid */}
          <View style={styles.detailsSection}>
            <ContactDetailsSection
              onLinkPress={handleOpenMaps}
            />
          </View>

          {/* 5. Find Us on Map */}
          <ContactMapSection onOpenMaps={handleOpenMaps} />

          {/* 6. FAQ accordion — new section */}
          <View style={styles.faqSection}>
            <ContactFaqSection />
          </View>

          {/* 7. Closing CTA banner */}
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
          } else if (tab.id === 'events') {
            onOpenEvents?.();
          } else if (tab.id === 'news') {
            onOpenNews?.();
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
    paddingBottom: Spacing.xl * 2,
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
  faqSection: {
    marginTop: Spacing.xl,
  },
  ctaSection: {
    marginTop: Spacing.xl,
  },
});

