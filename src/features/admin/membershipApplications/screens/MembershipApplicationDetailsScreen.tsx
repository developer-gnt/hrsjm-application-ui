import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipDetailsHeader } from '../components/MembershipDetailsHeader';
import { MembershipApplicantSummaryCard } from '../components/MembershipApplicantSummaryCard';
import { MembershipDetailsInfoTab } from '../components/MembershipDetailsInfoTab';
import { MembershipDocumentsTab } from '../components/MembershipDocumentsTab';
import { MembershipActivityLogTab } from '../components/MembershipActivityLogTab';
import { MembershipDetailsBottomBar } from '../components/MembershipDetailsBottomBar';
import { MembershipStatusDropUpModal } from '../components/MembershipStatusDropUpModal';
import { membershipApplicationsStore } from '../services/membershipApplicationsStore';
import { ApplicationStatus, MembershipApplicationItem } from '../types/membershipApplications.types';

export type DetailsTabKey = 'details' | 'documents' | 'activity';

interface MembershipApplicationDetailsScreenProps {
  applicationId: string;
  onBack: () => void;
  onStatusPress?: () => void;
  onStatusChange?: (newStatus: ApplicationStatus) => void;
}

export const MembershipApplicationDetailsScreen: React.FC<MembershipApplicationDetailsScreenProps> = ({
  applicationId,
  onBack,
  onStatusPress,
  onStatusChange,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<DetailsTabKey>('details');
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const [application, setApplication] = useState<MembershipApplicationItem | undefined>(() =>
    membershipApplicationsStore.getApplicationById(applicationId)
  );

  useEffect(() => {
    const unsubscribe = membershipApplicationsStore.subscribe(() => {
      setApplication(membershipApplicationsStore.getApplicationById(applicationId));
    });
    return unsubscribe;
  }, [applicationId]);

  const handleSelectStatus = (newStatus: ApplicationStatus) => {
    membershipApplicationsStore.updateStatus(applicationId, newStatus);
    onStatusChange?.(newStatus);
  };

  const handleOpenStatusModal = () => {
    setStatusModalVisible(true);
    onStatusPress?.();
  };

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
            Unable to find membership application with ID: {applicationId}
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
        {tabs.map(tab => {
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
        return <MembershipActivityLogTab application={application} />;
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
        onBack={onBack}
        onStatusPress={handleOpenStatusModal}
      />

      <MembershipStatusDropUpModal
        visible={statusModalVisible}
        currentStatus={application.status}
        onClose={() => setStatusModalVisible(false)}
        onSelectStatus={handleSelectStatus}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#0F2860',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
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
    color: '#0F2860',
    marginBottom: 6,
  },
  notFoundText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  returnButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    backgroundColor: '#0F2860',
  },
  returnButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
