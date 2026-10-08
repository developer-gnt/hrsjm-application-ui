import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BecomeMemberHeader } from '../components/BecomeMemberHeader';
import { BecomeMemberHero } from '../components/BecomeMemberHero';
import { WhyBecomeMemberSection } from '../components/WhyBecomeMemberSection';
import {
  MembershipCategoriesSection,
  MembershipCategoryType,
} from '../components/MembershipCategoriesSection';
import { BecomeMemberCtaButton } from '../components/BecomeMemberCtaButton';
import { updateRegistrationState } from '../../auth/state/registrationState';
import {
  navigateToCreateAccount,
  navigateToMembershipCategories,
} from '../../../core/navigation/appRouter';

interface BecomeMemberScreenProps {
  onBack?: () => void;
  onSearchPress?: () => void;
  onBenefitCardPress?: (cardId: string) => void;
  onCategorySelect?: (categoryId: MembershipCategoryType) => void;
  onCtaPress?: (selectedCategory: MembershipCategoryType | null) => void;
  initialCategory?: MembershipCategoryType | null;
}

export const BecomeMemberScreen: React.FC<BecomeMemberScreenProps> = ({
  onBack,
  onSearchPress,
  onBenefitCardPress,
  onCategorySelect,
  onCtaPress,
  initialCategory = 'individual',
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = React.useState<MembershipCategoryType | null>(
    initialCategory
  );

  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history?.length > 1) {
      (globalThis as any).window.history.back();
    } else {
      Alert.alert('Navigation', 'Back button pressed');
    }
  };

  const handleSearch = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      Alert.alert('Search', 'Search feature');
    }
  };

  const handleSelectCategory = (categoryId: MembershipCategoryType) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
  };

  const handleCtaPress = () => {
    // Update local registration state with member type
    const categoryLabelMap: Record<MembershipCategoryType, string> = {
      individual: 'Individual Member',
      student: 'Student Member',
      professional: 'Professional Member',
    };
    const currentCat = selectedCategory || 'individual';

    updateRegistrationState({
      accountType: 'member',
      accountTypeLabel: categoryLabelMap[currentCat] || 'Member',
    });

    if (onCtaPress) {
      onCtaPress(selectedCategory);
    } else {
      navigateToMembershipCategories();
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View
        style={[
          styles.mainShell,
          isTabletOrDesktop && {
            alignSelf: 'center',
            width: contentMaxWidth,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: '#E2E8F0',
          },
        ]}
      >
        {/* Top Header */}
        <BecomeMemberHeader
          paddingTop={insets.top}
          onBack={handleBack}
          onSearchPress={handleSearch}
        />

        {/* Main Scroll Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Phase 1: Hero Section */}
          <BecomeMemberHero />

          {/* Phase 2: Why Become a Member Section */}
          <WhyBecomeMemberSection onCardPress={onBenefitCardPress} />

          {/* Phase 3: Membership Categories Section */}
          <MembershipCategoriesSection
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* Phase 4: Main CTA Button */}
          <BecomeMemberCtaButton
            title="Become a Member"
            onPress={handleCtaPress}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainShell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
