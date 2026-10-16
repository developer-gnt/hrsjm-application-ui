import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, Spacing, BorderRadius, Typography } from '../../../core/theme';
import { AdminHeader } from '../../../app/navigation/AdminHeader';
import { HeroBanner } from '../../user/home/components/HeroBanner';
import { QuickActionsRow } from '../../user/home/components/QuickActionCard';
import { AboutSection } from '../../user/home/components/AboutSection';
import { CategoryIconRow } from '../../user/home/components/CategoryIconCard';
import { SectionHeader } from '../../user/home/components/SectionHeader';
import { ImpactSection } from '../../user/home/components/ImpactSection';
import { HomeEventCard } from '../../user/home/components/HomeEventCard';
import { NewsCard } from '../../user/home/components/NewsCard';
import { AppCard } from '../../../core/components/common/AppCard';
import { AssistanceStatusBadge } from '../../admin/assistance/components/AssistanceStatusBadge';
import { AddSeekerModal } from '../../admin/assistance/components/AddSeekerModal';
import { AppFeedbackModal } from '../../../core/components/common/AppFeedbackModal';
import { SeekerTimelineStepper } from '../components/SeekerTimelineStepper';
import { AdminSidebar } from '../../../app/navigation/AdminSidebar';
import { assistanceService } from '../../admin/assistance/services/assistance.service';
import { useAuthStore } from '../../auth/store/authStore';
import { getApiErrorMessage } from '../../../core/api/client';
import {
  SEEKER_QUICK_ACTIONS,
  LATEST_NEWS,
  RIGHTS_CATEGORIES,
  UPCOMING_EVENTS,
  WHAT_WE_DO_ITEMS,
} from '../../user/home/data/home-preview-data';
import { getImpactStats } from '../../user/home/data/impact-stats-provider';
import type {
  AssistanceRequest,
  CreateAssistanceRequestPayload,
} from '../../admin/assistance/types/assistance.types';

export interface SeekerHomeScreenProps {
  navigation?: any;
  onNavigateToRequests?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToRights?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const SeekerHomeScreen: React.FC<SeekerHomeScreenProps> = ({
  navigation,
  onNavigateToRequests,
  onNavigateToSupport,
  onNavigateToRights,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const user = useAuthStore(state => state.user);

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [feedbackConfig, setFeedbackConfig] = useState<{
    visible: boolean;
    tone: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  }>({
    visible: false,
    tone: 'success',
    title: '',
    message: '',
  });

  const loadRequests = async () => {
    try {
      const res = await assistanceService.list({ page: 1, limit: 10 });
      setRequests(res.items || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleCreateRequest = async (payload: CreateAssistanceRequestPayload) => {
    setIsSubmitting(true);
    try {
      await assistanceService.create(payload);
      setIsApplyModalVisible(false);
      setFeedbackConfig({
        visible: true,
        tone: 'success',
        title: 'Application Submitted',
        message:
          'Your assistance request has been submitted successfully. Our field assessment team will review it.',
      });
      loadRequests();
    } catch (err) {
      setFeedbackConfig({
        visible: true,
        tone: 'error',
        title: 'Submission Failed',
        message: getApiErrorMessage(err, 'Failed to submit assistance application.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestRequest = requests.length > 0 ? requests[0] : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {/* Official HRSJM Brand Header */}
      <AdminHeader
        showMenu={false}
        showBack={false}
        onPressNotifications={() => {
          if (onOpenNotifications) {
            onOpenNotifications();
          } else if (navigation) {
            navigation.navigate('Notifications');
          }
        }}
        onPressProfile={() => {
          if (onOpenProfile) {
            onOpenProfile();
          } else if (navigation) {
            navigation.navigate('SeekerProfile');
          }
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Hero Banner with Compassion Message & Gold CTA */}
        <HeroBanner onCtaPress={() => setIsApplyModalVisible(true)} />

        {/* Seeker Active Status / Immediate Aid Card */}
        <View style={styles.section}>
          {latestRequest ? (
            <AppCard style={styles.activeAidCard}>
              <View style={styles.activeAidHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeAidTag}>ACTIVE ASSISTANCE REQUEST</Text>
                  <Text style={styles.activeAidReason}>{latestRequest.reason}</Text>
                  <Text style={styles.activeAidRef}>
                    ASST-{latestRequest.id.slice(0, 8).toUpperCase()} •{' '}
                    {new Date(latestRequest.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <AssistanceStatusBadge status={latestRequest.status} />
              </View>

              <View style={styles.amountBar}>
                <Text style={styles.amountBarLabel}>Requested Aid Amount:</Text>
                <Text style={styles.amountBarValue}>
                  ₹{Number(latestRequest.requested_amount).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Visual 4-Step Timeline Stepper */}
              <View style={styles.stepperWrap}>
                <SeekerTimelineStepper status={latestRequest.status} />
              </View>

              <TouchableOpacity
                style={styles.trackLink}
                onPress={() => {
                  if (onNavigateToRequests) {
                    onNavigateToRequests();
                  } else if (navigation) {
                    navigation.navigate('SeekerRequests');
                  }
                }}
              >
                <Text style={styles.trackLinkText}>
                  View Full Status & Documents History →
                </Text>
              </TouchableOpacity>
            </AppCard>
          ) : (
            <AppCard style={styles.needAidCard}>
              <View style={styles.needAidContent}>
                <Text style={styles.needAidBadge}>HUMANITARIAN ASSISTANCE</Text>
                <Text style={styles.needAidTitle}>
                  Need Emergency Medical, Education, or Legal Relief?
                </Text>
                <Text style={styles.needAidDesc}>
                  HRSJM provides direct financial, legal, and welfare assistance for approved causes. Submit your request for rapid verification.
                </Text>
                <TouchableOpacity
                  style={styles.applyNowBtn}
                  onPress={() => setIsApplyModalVisible(true)}
                >
                  <Text style={styles.applyNowBtnText}>+ Apply for Assistance</Text>
                </TouchableOpacity>
              </View>
            </AppCard>
          )}
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsSection}>
          <QuickActionsRow
            actions={SEEKER_QUICK_ACTIONS}
            onPressAction={action => {
              if (action.id === 'apply-aid') {
                setIsApplyModalVisible(true);
              } else if (action.id === 'track-aid') {
                if (onNavigateToRequests) {
                  onNavigateToRequests();
                } else if (navigation) {
                  navigation.navigate('SeekerRequests');
                }
              } else if (action.id === 'rights') {
                if (onNavigateToRights) {
                  onNavigateToRights();
                } else if (navigation) {
                  navigation.navigate('KnowYourRights');
                }
              } else if (action.id === 'complaint') {
                if (onNavigateToSupport) {
                  onNavigateToSupport();
                } else if (navigation) {
                  navigation.navigate('SeekerSupport');
                }
              }
            }}
          />
        </View>

        {/* Emergency Helpline Banner */}
        <View style={styles.section}>
          <View style={styles.helplineBanner}>
            <Text style={styles.helplineIcon}>📞</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.helplineTitle}>24x7 Emergency Social & Legal Helpline</Text>
              <Text style={styles.helplinePhone}>+91 98888 80004 / 1800-HRSJM-AID</Text>
            </View>
          </View>
        </View>

        {/* Know Your Rights Categories */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Know Your Rights & Legal Aid"
              linkLabel="View All"
              onLinkPress={() => {
                if (onNavigateToRights) {
                  onNavigateToRights();
                } else if (navigation) {
                  navigation.navigate('KnowYourRights');
                }
              }}
            />
            <CategoryIconRow
              items={RIGHTS_CATEGORIES}
              onPressItem={() => {
                if (onNavigateToRights) {
                  onNavigateToRights();
                } else if (navigation) {
                  navigation.navigate('KnowYourRights');
                }
              }}
            />
          </View>
        </View>

        {/* What HRSJM Does */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Relief & Assistance Programs"
              linkLabel="Learn More"
              onLinkPress={() => {
                if (navigation) navigation.navigate('About');
              }}
            />
            <CategoryIconRow
              items={WHAT_WE_DO_ITEMS}
              onPressItem={() => {
                if (navigation) navigation.navigate('About');
              }}
            />
          </View>
        </View>

        {/* Impact Section */}
        <View style={styles.section}>
          <ImpactSection
            stats={getImpactStats()}
            onDetailsPress={() => {
              if (navigation) navigation.navigate('About');
            }}
          />
        </View>

        {/* Upcoming Relief Camps & Events */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Upcoming Relief Camps & Events"
              linkLabel="View All"
              onLinkPress={() => {
                if (navigation) navigation.navigate('Events');
              }}
            />
            <HomeEventCard
              event={UPCOMING_EVENTS[0]}
              onPress={() => {
                if (navigation) navigation.navigate('Events');
              }}
            />
          </View>
        </View>

        {/* Latest News & Stories of Hope */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Stories of Hope & News"
              linkLabel="View All"
              onLinkPress={() => {
                if (navigation) navigation.navigate('News');
              }}
            />
            <NewsCard
              item={LATEST_NEWS[0]}
              onPress={() => {
                if (navigation) navigation.navigate('News');
              }}
            />
          </View>
        </View>

        {/* About HRSJM Section */}
        <View style={styles.section}>
          <AboutSection
            onMorePress={() => {
              if (navigation) navigation.navigate('About');
            }}
          />
        </View>
      </ScrollView>

      {/* Slide-out Sidebar Drawer */}
      <AdminSidebar
        visible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
        onNavigate={(target: string) => {
          setIsSidebarVisible(false);
          if (navigation) navigation.navigate(target);
        }}
      />

      {/* New Assistance Request Modal */}
      <AddSeekerModal
        visible={isApplyModalVisible}
        onClose={() => setIsApplyModalVisible(false)}
        onSubmit={handleCreateRequest}
        isSubmitting={isSubmitting}
      />

      {/* Feedback Toast */}
      <AppFeedbackModal
        visible={feedbackConfig.visible}
        tone={feedbackConfig.tone}
        title={feedbackConfig.title}
        message={feedbackConfig.message}
        onClose={() => setFeedbackConfig(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.base,
  },
  sectionInset: {
    paddingHorizontal: Spacing.base,
  },
  quickActionsSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  activeAidCard: {
    marginHorizontal: Spacing.base,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  activeAidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activeAidTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  activeAidReason: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeAidRef: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  amountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  amountBarLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  amountBarValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperWrap: {
    marginTop: 4,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  trackLink: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  trackLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  needAidCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
    borderWidth: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  needAidContent: {
    alignItems: 'flex-start',
  },
  needAidBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  needAidTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  needAidDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  applyNowBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  applyNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  helplineBanner: {
    marginHorizontal: Spacing.base,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  helplineIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  helplineTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  helplinePhone: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350F',
    marginTop: 1,
  },
});

export default SeekerHomeScreen;
