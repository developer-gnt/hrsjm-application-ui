import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MembershipCategoriesHeader } from '../components/MembershipCategoriesHeader';
import { MembershipPostCard } from '../components/MembershipPostCard';
import {
  CommunityIcon,
  CounselorIcon,
  CrownLionIcon,
  DistrictHierarchyIcon,
  IndividualMemberIcon,
  LegalCouncilIcon,
  MinorityCouncilIcon,
  PoliticalCouncilIcon,
  ShieldAmbassadorIcon,
  StateDirectorIcon,
  WomenCouncilIcon,
} from '../components/MembershipIcons';
import {
  DISTRICT_STATE_POSTS,
  LETTER_PAD_POSTS,
  NATIONAL_LEVEL_POSTS,
  MembershipPostData,
} from '../data/membershipCategoriesData';
import {
  navigateToBecomeMember,
  navigateToCreateAccount,
} from '../../../core/navigation/appRouter';
import { updateRegistrationState } from '../../auth/state/registrationState';
import { BorderRadius, Spacing } from '../../../core';
import { MembershipVerificationNotice } from '../components/MembershipVerificationNotice';

interface MembershipCategoriesScreenProps {
  onBack?: () => void;
  onApplyPost?: (post: MembershipPostData) => void;
}

export const MembershipCategoriesScreen: React.FC<MembershipCategoriesScreenProps> = ({
  onBack,
  onApplyPost,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 460 : width;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigateToBecomeMember();
    }
  };

  const handleApply = (post: MembershipPostData) => {
    updateRegistrationState({
      accountType: 'member',
      accountTypeLabel: post.postName,
    });

    if (onApplyPost) {
      onApplyPost(post);
    } else {
      navigateToCreateAccount();
    }
  };

  const getPostIcon = (post: MembershipPostData) => {
    switch (post.iconType) {
      case 'user':
        return <IndividualMemberIcon size={20} color="#1E40AF" />;
      case 'community':
        return <CommunityIcon size={20} color="#059669" />;
      case 'crown':
        return <CrownLionIcon size={20} color="#1E40AF" />;
      case 'counselor':
        return <CounselorIcon size={20} color="#059669" />;
      case 'shield':
        return <ShieldAmbassadorIcon size={20} color="#1E40AF" />;
      case 'director':
        return <StateDirectorIcon size={20} color="#059669" />;
      case 'scale':
        return <LegalCouncilIcon size={20} color="#1E40AF" />;
      case 'minority':
        return <MinorityCouncilIcon size={20} color="#059669" />;
      case 'women':
        return <WomenCouncilIcon size={20} color="#1E40AF" />;
      case 'political':
        return <PoliticalCouncilIcon size={20} color="#059669" />;
      case 'hierarchy':
      default:
        return (
          <DistrictHierarchyIcon
            size={20}
            color={post.buttonVariant === 'green' ? '#059669' : '#1E40AF'}
          />
        );
    }
  };

  const bottomPadding = Math.max(insets.bottom, 20) + Spacing.lg;

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
            shadowColor: '#0F2860',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          },
        ]}
      >
        {/* Navy Header */}
        <MembershipCategoriesHeader
          paddingTop={insets.top}
          onBack={handleBack}
        />

        {/* Scrollable Categories List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Section 1 Heading */}
          <View style={styles.sectionHeaderBanner}>
            <Text style={styles.sectionHeaderText}>District & State Level Posts</Text>
          </View>

          {/* Phase 2: District & State Level Posts Cards */}
          <View style={styles.postsGroupContainer}>
            {DISTRICT_STATE_POSTS.map((post) => (
              <MembershipPostCard
                key={post.id}
                id={post.id}
                postName={post.postName}
                qualification={post.qualification}
                fee={post.fee}
                validity={post.validity}
                checklistItems={post.checklistItems}
                kitItems={post.kitItems}
                icon={getPostIcon(post)}
                iconBgColor={post.iconBgColor}
                buttonVariant={post.buttonVariant}
                onApply={() => handleApply(post)}
              />
            ))}
          </View>

          {/* Section 2 Heading */}
          <View style={styles.sectionHeaderBanner}>
            <Text style={styles.sectionHeaderText}>Letter Pad Posts</Text>
          </View>

          {/* Phase 3: Letter Pad Posts Cards */}
          <View style={styles.postsGroupContainer}>
            {LETTER_PAD_POSTS.map((post) => (
              <MembershipPostCard
                key={post.id}
                id={post.id}
                postName={post.postName}
                qualification={post.qualification}
                fee={post.fee}
                validity={post.validity}
                checklistItems={post.checklistItems}
                kitItems={post.kitItems}
                icon={getPostIcon(post)}
                iconBgColor={post.iconBgColor}
                buttonVariant={post.buttonVariant}
                onApply={() => handleApply(post)}
              />
            ))}
          </View>

          {/* Section 3 Heading */}
          <View style={styles.sectionHeaderBanner}>
            <Text style={styles.sectionHeaderText}>National Level Posts</Text>
          </View>

          {/* Phase 4: National Level Posts Cards */}
          <View style={styles.postsGroupContainer}>
            {NATIONAL_LEVEL_POSTS.map((post) => (
              <MembershipPostCard
                key={post.id}
                id={post.id}
                postName={post.postName}
                qualification={post.qualification}
                fee={post.fee}
                validity={post.validity}
                checklistItems={post.checklistItems}
                kitItems={post.kitItems}
                icon={getPostIcon(post)}
                iconBgColor={post.iconBgColor}
                buttonVariant={post.buttonVariant}
                onApply={() => handleApply(post)}
              />
            ))}
          </View>

          {/* Phase 5: Verification & Policy Notice */}
          <MembershipVerificationNotice />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  mainShell: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
  sectionHeaderBanner: {
    backgroundColor: '#DCE6F5',
    paddingVertical: 7,
    paddingHorizontal: Spacing.base,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  sectionHeaderText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
  },
  postsGroupContainer: {
    marginBottom: Spacing.xs,
  },
});

