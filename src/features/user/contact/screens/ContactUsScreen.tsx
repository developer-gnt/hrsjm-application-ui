import React, { useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, Spacing, UserFontFamilies } from '../../../../core/theme';
import { ContactHeader } from '../components/ContactHeader';
import { ContactHero } from '../components/ContactHero';
import { ContactActionsRow } from '../components/ContactActionCard';
import { ContactForm } from '../components/ContactForm';
import { ContactDetailsSection } from '../components/ContactDetailsSection';
import { ContactMapSection, GOOGLE_MAPS_SEARCH_URL } from '../components/ContactMapSection';
import { ContactFinalCta } from '../components/ContactFinalCta';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import { CONTACT_ACTIONS } from '../data/contact-content';
import type { ContactDetailCard } from '../types/contact.types';

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
  showBottomNav?: boolean;
  hideBottomNav?: boolean;
}

/**
 * Contact Us page — a standalone User App screen:
 * header, navy contact hero, four quick-action cards, the "Send Us a
 * Message" form with interactive Subject selection, "Our Contact Details" 2x2 grid,
 * "Find Us on Map" with dynamic Google Maps navigation, the closing navy CTA,
 * and bottom navigation.
 */
export const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
  onBack,
  onOpenRights,
  onOpenAbout,
  onOpenGetHelp,
  onOpenEvents,
  onOpenNews,
  showBottomNav = false,
  hideBottomNav = true,
}) => {
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<any>(null);
  const [formY, setFormY] = useState(0);

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `"${feature}" is part of an upcoming phase.`);
  };

  const handleCall = async () => {
    const phoneUrl = 'tel:+912212345678';
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(phoneUrl, '_self');
        return;
      }
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          'Call HRSJM',
          'Primary Helpline: +91 22 1234 5678\nAlternate: +91 98765 43210\nMonday - Friday, 10:00 AM - 6:00 PM',
        );
      }
    } catch {
      Alert.alert('Call HRSJM', 'Please dial +91 22 1234 5678 to connect with our support team.');
    }
  };

  const handleEmail = () => {
    if (formY > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: formY - 10, animated: true });
    } else {
      Linking.openURL('mailto:info@hrsjm.org?subject=Inquiry%20to%20HRSJM').catch(() => {});
    }
  };

  const handleOpenGoogleMaps = async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(GOOGLE_MAPS_SEARCH_URL, '_blank');
        return;
      }
      const canOpen = await Linking.canOpenURL(GOOGLE_MAPS_SEARCH_URL);
      if (canOpen) {
        await Linking.openURL(GOOGLE_MAPS_SEARCH_URL);
      } else {
        await Linking.openURL(
          `geo:19.0728,72.8797?q=${encodeURIComponent('123 Justice Lane, Kurla West, Mumbai')}`,
        );
      }
    } catch {
      Linking.openURL(GOOGLE_MAPS_SEARCH_URL);
    }
  };

  const handleGetHelp = () => {
    if (onOpenGetHelp) {
      onOpenGetHelp();
    } else {
      try {
        navigation?.navigate('FileComplaint');
      } catch {
        // Fallback if not inside navigation container
      }
    }
  };

  const handleActionPress = (actionId: string) => {
    switch (actionId) {
      case 'call':
        handleCall();
        break;
      case 'email':
        handleEmail();
        break;
      case 'visit':
        handleOpenGoogleMaps();
        break;
      case 'help':
        handleGetHelp();
        break;
      default:
        break;
    }
  };

  const handleDetailCardLinkPress = (card: ContactDetailCard) => {
    if (card.id === 'address') {
      handleOpenGoogleMaps();
    } else if (card.id === 'phone') {
      handleCall();
    } else if (card.id === 'email') {
      Linking.openURL('mailto:info@hrsjm.org?subject=Inquiry%20to%20HRSJM').catch(() => {});
    } else {
      showComingSoon(card.title);
    }
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
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ContactHero />

          <View style={styles.actionsSection}>
            <ContactActionsRow
              actions={CONTACT_ACTIONS}
              onPressAction={action => handleActionPress(action.id)}
            />
          </View>

          <View
            style={styles.formSection}
            onLayout={e => setFormY(e.nativeEvent.layout.y)}
          >
            <Text style={styles.formHeading}>Send Us a Message</Text>
            <Text style={styles.formSupporting}>
              Have a question, suggestion or need support? Fill out the form
              below and our team will get back to you.
            </Text>
            <ContactForm />
          </View>

          <View style={styles.detailsSection}>
            <ContactDetailsSection
              onLinkPress={handleDetailCardLinkPress}
            />
          </View>

          <ContactMapSection onOpenMaps={handleOpenGoogleMaps} />

          <View style={styles.ctaSection}>
            <ContactFinalCta />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showBottomNav && !hideBottomNav && (
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
      )}
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
  actionsSection: {
    marginTop: -Spacing.md,
    marginBottom: Spacing.base,
    zIndex: 2,
  },
  formSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    position: 'relative',
    zIndex: 100,
  },
  formHeading: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: Spacing.xs,
  },
  formSupporting: {
    fontSize: 12.5,
    lineHeight: 18,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.base,
  },
  detailsSection: {
    paddingTop: Spacing.base,
    position: 'relative',
    zIndex: 1,
  },
  ctaSection: {
    paddingTop: Spacing.base,
  },
});
