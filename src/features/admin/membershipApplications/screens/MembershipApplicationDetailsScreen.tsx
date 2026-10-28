import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipDetailsHeader } from '../components/MembershipDetailsHeader';
import { MembershipApplicantSummaryCard } from '../components/MembershipApplicantSummaryCard';
import { MembershipDetailsInfoTab } from '../components/MembershipDetailsInfoTab';
import { MembershipDocumentsTab } from '../components/MembershipDocumentsTab';
import { MembershipActivityLogTab } from '../components/MembershipActivityLogTab';
import { MembershipDetailsBottomBar } from '../components/MembershipDetailsBottomBar';
import {
  ConfirmationType,
  MembershipStatusConfirmationModal,
} from '../components/MembershipStatusConfirmationModal';
import { membershipApplicationsStore } from '../services/membershipApplicationsStore';
import { ApplicationStatus, MembershipApplicationItem } from '../types/membershipApplications.types';

export type DetailsTabKey = 'details' | 'documents' | 'activity';

interface MembershipApplicationDetailsScreenProps {
  applicationId?: string;
  onBack?: () => void;
  onStatusChange?: (newStatus: ApplicationStatus) => void;
  route?: any;
  navigation?: any;
}

export const MembershipApplicationDetailsScreen: React.FC<MembershipApplicationDetailsScreenProps> = ({
  applicationId: propApplicationId,
  onBack: propOnBack,
  onStatusChange,
  route: propRoute,
  navigation: propNavigation,
}) => {
  const insets = useSafeAreaInsets();
  let routeHook: any = null;
  let navHook: any = null;
  try {
    routeHook = useRoute<any>();
  } catch {}
  try {
    navHook = useNavigation<any>();
  } catch {}

  const applicationId =
    propApplicationId ||
    propRoute?.params?.applicationId ||
    propRoute?.params?.id ||
    routeHook?.params?.applicationId ||
    routeHook?.params?.id ||
    '';

  const onBack = () => {
    if (propOnBack) {
      propOnBack();
    } else if (propNavigation?.goBack) {
      propNavigation.goBack();
    } else if (navHook?.goBack) {
      navHook.goBack();
    }
  };

  const [activeTab, setActiveTab] = useState<DetailsTabKey>('details');
  const [underReviewActive, setUnderReviewActive] = useState(false);
  const [confirmationType, setConfirmationType] = useState<ConfirmationType | null>(null);

  const [application, setApplication] = useState<MembershipApplicationItem | undefined>(() =>
    applicationId ? membershipApplicationsStore.getApplicationById(applicationId) : undefined
  );
  const [loading, setLoading] = useState<boolean>(() => !application && Boolean(applicationId));

  useEffect(() => {
    let mounted = true;
    if (applicationId) {
      const existing = membershipApplicationsStore.getApplicationById(applicationId);
      if (existing) {
        setApplication(existing);
        setLoading(false);
      } else {
        setLoading(true);
      }
      membershipApplicationsStore
        .fetchApplicationById(applicationId)
        .then(fetched => {
          if (mounted && fetched) {
            setApplication(fetched);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    const unsubscribe = membershipApplicationsStore.subscribe(() => {
      if (mounted && applicationId) {
        const updated = membershipApplicationsStore.getApplicationById(applicationId);
        if (updated) setApplication(updated);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [applicationId]);

  const handleSelectStatus = async (newStatus: ApplicationStatus, notes?: string) => {
    if (!applicationId) return;
    await membershipApplicationsStore.updateStatus(applicationId, newStatus, notes);
    onStatusChange?.(newStatus);
  };

  const handleUnderReviewPress = () => {
    if (application?.status === 'approved') return;
    setUnderReviewActive(true);
    handleSelectStatus('under_review');
  };

  const handleApprovePress = () => {
    // Show confirmation modal
    if (application?.status !== 'approved') {
      setConfirmationType('approve');
    }
  };

  const handleRejectPress = () => {
    // Show confirmation modal
    if (application?.status !== 'rejected') {
      setConfirmationType('reject');
    }
  };

  const handleConfirmAction = (reason?: string) => {
    if (confirmationType === 'approve') {
      handleSelectStatus('approved');
      setUnderReviewActive(false);
    } else if (confirmationType === 'reject') {
      handleSelectStatus('rejected', reason || 'Incomplete documents');
      setUnderReviewActive(false);
    }
    setConfirmationType(null);
  };

  const handleCloseConfirmation = () => {
    setConfirmationType(null);
  };

  if (loading && !application) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <MembershipDetailsHeader
          paddingTop={insets.top}
          onBack={onBack}
        />
        <View style={styles.notFoundContainer}>
          <ActivityIndicator size="large" color="#0B2F52" />
          <Text style={[styles.notFoundText, { marginTop: 12 }]}>
            Loading application details...
          </Text>
        </View>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <MembershipDetailsHeader
          paddingTop={insets.top}
          onBack={onBack}
        />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Application Not Found</Text>
          <Text style={styles.notFoundText}>
            Unable to find membership application with ID: {applicationId || 'N/A'}
          </Text>
          <TouchableOpacity style={styles.returnButton} onPress={onBack}>
            <Text style={styles.returnButtonText}>Back to Applications</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderTabButtons = () => {
    const tabs: { key: DetailsTabKey; label: string }[] = [
      { key: 'details', label: 'Application Details' },
      { key: 'documents', label: 'Documents' },
      { key: 'activity', label: 'Activity Log' },
    ];

    return (
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <MembershipDetailsInfoTab application={application} />;
      case 'documents':
        return <MembershipDocumentsTab application={application} />;
      case 'activity':
        return (
          <MembershipActivityLogTab
            application={application}
            underReviewActive={underReviewActive}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MembershipDetailsHeader
        paddingTop={insets.top}
        onBack={onBack}
        onNotificationsPress={() => {}}
        onProfilePress={() => {}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MembershipApplicantSummaryCard application={application} />

        {renderTabButtons()}
        {renderTabContent()}
      </ScrollView>

      <MembershipDetailsBottomBar
        bottomInset={insets.bottom}
        status={application.status}
        underReviewActive={underReviewActive}
        onBack={onBack}
        onUnderReviewPress={handleUnderReviewPress}
        onApprovePress={handleApprovePress}
        onRejectPress={handleRejectPress}
      />

      {/* Confirmation Modal */}
      <MembershipStatusConfirmationModal
        visible={confirmationType !== null}
        type={confirmationType}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: BorderRadius.button,
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DBE5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34516D',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2F52',
    marginBottom: 6,
  },
  notFoundText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  returnButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.button,
    backgroundColor: '#06294D',
  },
  returnButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MembershipApplicationDetailsScreen;
