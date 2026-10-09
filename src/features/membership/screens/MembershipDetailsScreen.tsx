import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BecomeMemberHeader } from '../components/BecomeMemberHeader';
import { MembershipDetailsHero } from '../components/MembershipDetailsHero';
import { MembershipEmptyState } from '../components/MembershipEmptyState';
import { MembershipQuickActions } from '../components/MembershipQuickActions';
import { MembershipInformationCard } from '../components/MembershipInformationCard';
import {
  MembershipBenefitsSection,
  BenefitItem,
} from '../components/MembershipBenefitsSection';
import { MembershipValidityCard } from '../components/MembershipValidityCard';
import {
  MembershipDocumentsSection,
  DocumentItem,
} from '../components/MembershipDocumentsSection';
import { MembershipRenewCtaButton } from '../components/MembershipRenewCtaButton';
import { MembershipCertificateModal } from '../components/MembershipCertificateModal';
import {
  DonationsBottomNav,
  MEMBER_NAV_ITEMS,
} from '../../admin/donations/components/DonationsBottomNav';
import {
  useMembershipDetailsData,
  MembershipDetailsData,
} from '../hooks/useMembershipDetailsData';
import {
  navigateToCreateAccount,
  navigateToDashboard,
  navigateToMembershipApplications,
  navigateToProfile,
  navigateToProfileIdCard,
  navigateToRenewMembership,
} from '../../../core/navigation/appRouter';

interface MembershipDetailsScreenProps {
  onBack?: () => void;
  onSearchPress?: () => void;
  onCardPress?: () => void;
  onMemberCardPress?: () => void;
  onBenefitsPress?: () => void;
  onDocumentsPress?: () => void;
  onRenewPress?: () => void;
  onBenefitItemPress?: (benefit: BenefitItem) => void;
  onDocumentItemPress?: (doc: DocumentItem) => void;
  initialData?: Partial<MembershipDetailsData>;
}

export const MembershipDetailsScreen: React.FC<MembershipDetailsScreenProps> = ({
  onBack,
  onSearchPress,
  onCardPress,
  onMemberCardPress,
  onBenefitsPress,
  onDocumentsPress,
  onRenewPress,
  onBenefitItemPress,
  onDocumentItemPress,
  initialData,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const memberData = useMembershipDetailsData(initialData);

  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;

  const scrollViewRef = React.useRef<any>(null);
  const sectionPositions = React.useRef<{ [key: string]: number }>({});

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentItem | null>(null);

  const handleSectionLayout = (key: string) => (event: any) => {
    sectionPositions.current[key] = event.nativeEvent.layout.y;
  };

  const scrollToSection = (key: string, elementId?: string) => {
    // 1. Web browser smooth scrolling
    const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
    if (elementId && web.document?.getElementById) {
      const el = web.document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    // 2. React Native ScrollView scrolling
    const yPos = sectionPositions.current[key];
    if (typeof yPos === 'number' && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: Math.max(0, yPos - 12),
        animated: true,
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history?.length > 1) {
      (globalThis as any).window.history.back();
    } else {
      navigateToProfile();
    }
  };

  const handleSearch = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      Alert.alert('Search', 'Search membership features and updates');
    }
  };

  const handleStartRegistration = () => {
    navigateToCreateAccount();
  };

  const handleMemberCardPress = () => {
    if (onMemberCardPress) {
      onMemberCardPress();
    } else {
      scrollToSection('memberInfo', 'section-member-info');
    }
  };

  const handleBenefitItemPress = (benefit: BenefitItem) => {
    if (onBenefitItemPress) {
      onBenefitItemPress(benefit);
    } else {
      Alert.alert(benefit.title, benefit.description);
    }
  };

  const handleBenefitsPress = () => {
    if (onBenefitsPress) {
      onBenefitsPress();
    } else {
      scrollToSection('benefits', 'section-benefits');
    }
  };

  const handleDocumentItemPress = (doc: DocumentItem) => {
    if (onDocumentItemPress) {
      onDocumentItemPress(doc);
    }
    setSelectedDoc(doc);
    setModalVisible(true);
  };

  const handleDocumentsPress = () => {
    if (onDocumentsPress) {
      onDocumentsPress();
    } else {
      scrollToSection('documents', 'section-documents');
    }
  };

  const handleRenewPress = () => {
    if (onRenewPress) {
      onRenewPress();
    } else {
      scrollToSection('renew', 'section-renew');
    }
  };

  const handleBottomRenewCtaPress = () => {
    if (onRenewPress) {
      onRenewPress();
    } else {
      navigateToRenewMembership();
    }
  };

  const handleBottomTabPress = (tabKey: string) => {
    if (tabKey === 'home') {
      navigateToDashboard();
    } else if (tabKey === 'profile') {
      // Already on membership profile
    } else if (tabKey === 'complaints') {
      navigateToMembershipApplications();
    } else {
      Alert.alert(
        'HRSJM NGO',
        `${tabKey.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())} section`
      );
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

        {/* Scrollable Content Shell */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 70 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Phase 1: Hero Section */}
          <MembershipDetailsHero />

          {/* Member Details Feed */}
          {memberData.hasData ? (
            <>
              {/* Four Quick Action Cards */}
              <MembershipQuickActions
                onMemberCardPress={handleMemberCardPress}
                onBenefitsPress={handleBenefitsPress}
                onDocumentsPress={handleDocumentsPress}
                onRenewPress={handleRenewPress}
              />

              {/* Phase 2: Membership Information Rows (Member Card Section) */}
              <View
                nativeID="section-member-info"
                onLayout={handleSectionLayout('memberInfo')}
              >
                <MembershipInformationCard
                  fullName={memberData.fullName}
                  membershipType={memberData.membershipType}
                  memberId={memberData.memberId}
                  dob={memberData.dob}
                  joinDate={memberData.joinDate}
                  validTill={memberData.validTill}
                  status={memberData.status}
                />
              </View>

              {/* Phase 3: Membership Benefits (2x3 Grid) */}
              <View
                nativeID="section-benefits"
                onLayout={handleSectionLayout('benefits')}
              >
                <MembershipBenefitsSection onBenefitPress={handleBenefitItemPress} />
              </View>

              {/* Phase 3: Membership Validity Card */}
              <View
                nativeID="section-validity"
                onLayout={handleSectionLayout('validity')}
              >
                <MembershipValidityCard
                  validTill={memberData.validTill}
                  totalDuration={memberData.totalDuration}
                  daysRemaining={memberData.daysRemaining}
                  status={memberData.status}
                />
              </View>

              {/* Phase 4: Membership Documents */}
              <View
                nativeID="section-documents"
                onLayout={handleSectionLayout('documents')}
              >
                <MembershipDocumentsSection
                  status={memberData.status}
                  onDocumentPress={handleDocumentItemPress}
                />
              </View>

              {/* Phase 4: Renew Membership Button */}
              <View
                nativeID="section-renew"
                onLayout={handleSectionLayout('renew')}
              >
                <MembershipRenewCtaButton onPress={handleBottomRenewCtaPress} />
              </View>
            </>
          ) : (
            <MembershipEmptyState onStartRegistration={handleStartRegistration} />
          )}
        </ScrollView>

        {/* Phase 1: Bottom Navigation */}
        <DonationsBottomNav
          bottomInset={insets.bottom}
          activeKey="profile"
          items={MEMBER_NAV_ITEMS}
          onTabPress={handleBottomTabPress}
        />

        {/* Phase 4: Document Preview & Download Modal */}
        <MembershipCertificateModal
          visible={modalVisible}
          document={selectedDoc}
          memberData={memberData}
          onClose={() => setModalVisible(false)}
        />
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
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingTop: 0,
  },
});
