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
import { AdminColors, Spacing, BorderRadius, Typography, FontFamilies } from '../../../core/theme';
import { AdminHeader } from '../../../app/navigation/AdminHeader';
import { HeroBanner } from '../../user/home/components/HeroBanner';
import { QuickActionsRow } from '../../user/home/components/QuickActionCard';
import { AboutSection } from '../../user/home/components/AboutSection';
import { AboutVideoModal } from '../../user/home/components/AboutVideoModal';
import { useAboutVideo } from '../../user/home/services/about-video.service';
import { CategoryIconRow } from '../../user/home/components/CategoryIconCard';
import { SectionHeader } from '../../user/home/components/SectionHeader';
import { ImpactSection } from '../../user/home/components/ImpactSection';
import { HomeEventCard } from '../../user/home/components/HomeEventCard';
import { NewsCard } from '../../user/home/components/NewsCard';
import { AppCard } from '../../../core/components/common/AppCard';
import { AssistanceStatusBadge } from '../../admin/assistance/components/AssistanceStatusBadge';
import { CreateSeekerScreen } from '../../admin/assistance/screens/CreateSeekerScreen';
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
import { Phone } from '../../../core/components/icons';
import { getEventsList } from '../../admin/content/events/services/events.service';
import type { EventListItem } from '../../admin/content/events/types/events.types';
import { fetchLatestPublishedNews } from '../../user/news/services/user-news.service';
import type { HomeEvent, HomeNewsItem } from '../../user/home/types/home.types';
import type {
  AssistanceRequest,
  CreateAssistanceRequestPayload,
} from '../../admin/assistance/types/assistance.types';

const mapEventToHomeEvent = (item: EventListItem): HomeEvent => {
  let day = '25';
  let month = 'OCT';
  if (item.startAt) {
    try {
      const d = new Date(item.startAt);
      if (!isNaN(d.getTime())) {
        day = String(d.getDate()).padStart(2, '0');
        month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      }
    } catch {
      // fallback
    }
  }

  return {
    id: item.id,
    title: item.title,
    day,
    month,
    location: item.location || 'Mumbai, Maharashtra',
    imageAssetName: 'home/events/rights-workshop.png',
    imageUrl: item.coverImageUrl || undefined,
  };
};

export interface SeekerHomeScreenProps {
  navigation?: any;
  onNavigateToRequests?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToRights?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToNews?: () => void;
  onNavigateToComplaint?: () => void;
  onNavigateToApply?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const SeekerHomeScreen: React.FC<SeekerHomeScreenProps> = ({
  navigation,
  onNavigateToApply,
  onNavigateToRequests,
  onNavigateToSupport,
  onNavigateToRights,
  onNavigateToEvents,
  onNavigateToNews,
  onNavigateToComplaint,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const user = useAuthStore(state => state.user);

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<HomeEvent[]>(UPCOMING_EVENTS);
  const [latestNews, setLatestNews] = useState<HomeNewsItem[]>(LATEST_NEWS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isApplyPageVisible, setIsApplyPageVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const { video: aboutVideo, fetchAboutVideo } = useAboutVideo();

  useEffect(() => {
    fetchAboutVideo();
  }, [fetchAboutVideo]);

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

  const loadDynamicEventsAndNews = React.useCallback(async () => {
    try {
      const [eventsRes, newsItems] = await Promise.all([
        getEventsList({ limit: 10 }),
        fetchLatestPublishedNews(5),
      ]);

      if (eventsRes && Array.isArray(eventsRes.events) && eventsRes.events.length > 0) {
        const upcomingList = eventsRes.events.filter(e => e.status === 'UPCOMING');
        const listToDisplay = upcomingList.length > 0 ? upcomingList : eventsRes.events;
        setUpcomingEvents(listToDisplay.map(mapEventToHomeEvent));
      }

      if (Array.isArray(newsItems) && newsItems.length > 0) {
        setLatestNews(newsItems);
      }
    } catch (err) {
      console.warn('Error loading dynamic events and news in SeekerHomeScreen:', err);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    loadDynamicEventsAndNews();

    // Auto-refresh periodically so newly added events & news appear automatically
    const intervalId = setInterval(loadDynamicEventsAndNews, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadDynamicEventsAndNews]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
    loadDynamicEventsAndNews();
  };

  const handleOpenApply = () => {
    if (onNavigateToApply) {
      onNavigateToApply();
    } else if (navigation?.navigate) {
      navigation.navigate('AddSeeker');
    } else {
      setIsApplyPageVisible(true);
    }
  };

  const latestRequest = requests.length > 0 ? requests[0] : null;

  if (isApplyPageVisible) {
    return (
      <CreateSeekerScreen
        navigation={navigation}
        onBack={() => setIsApplyPageVisible(false)}
        onSuccess={created => {
          setIsApplyPageVisible(false);
          loadRequests();
          setFeedbackConfig({
            visible: true,
            tone: 'success',
            title: 'Application Submitted',
            message:
              'Your assistance request has been submitted successfully. Our field assessment team will review it.',
          });
        }}
      />
    );
  }

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
        {/* Hero Banner with Compassion Message */}
        <HeroBanner showCta={false} />

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
                  onPress={handleOpenApply}
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
                handleOpenApply();
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
                  navigation.navigate('SeekerRights');
                }
              } else if (action.id === 'complaint') {
                if (onNavigateToComplaint) {
                  onNavigateToComplaint();
                } else if (navigation) {
                  navigation.navigate('FileComplaint');
                }
              }
            }}
          />
        </View>

        {/* Emergency Helpline Banner */}
        <View style={styles.section}>
          <View style={styles.helplineBanner}>
            <View style={{ marginRight: 10 }}>
              <Phone size={22} color="#0D47A1" strokeWidth={2} />
            </View>
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
                if (onNavigateToEvents) {
                  onNavigateToEvents();
                } else if (navigation) {
                  navigation.navigate('SeekerEvents');
                }
              }}
            />
            {upcomingEvents.length <= 1 ? (
              <HomeEventCard
                event={upcomingEvents[0] || UPCOMING_EVENTS[0]}
                onPress={() => {
                  if (onNavigateToEvents) {
                    onNavigateToEvents();
                  } else if (navigation) {
                    navigation.navigate('SeekerEvents');
                  }
                }}
              />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {upcomingEvents.map(event => (
                  <HomeEventCard
                    key={event.id}
                    event={event}
                    onPress={() => {
                      if (onNavigateToEvents) {
                        onNavigateToEvents();
                      } else if (navigation) {
                        navigation.navigate('SeekerEvents');
                      }
                    }}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Latest News & Stories of Hope */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Stories of Hope & News"
              linkLabel="View All"
              onLinkPress={() => {
                if (onNavigateToNews) {
                  onNavigateToNews();
                } else if (navigation) {
                  navigation.navigate('News');
                }
              }}
            />
            <View style={styles.newsList}>
              {latestNews.slice(0, 2).map(item => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onPress={() => {
                    if (onNavigateToNews) {
                      onNavigateToNews();
                    } else if (navigation) {
                      navigation.navigate('News');
                    }
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* About HRSJM Section */}
        <View style={styles.section}>
          <AboutSection
            description={aboutVideo.summaryText}
            duration={aboutVideo.duration}
            thumbnailUrl={aboutVideo.thumbnailUrl}
            onMorePress={() => {
              if (navigation) navigation.navigate('About');
            }}
            onMediaPress={() => setVideoModalVisible(true)}
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



      {/* About Video Modal */}
      <AboutVideoModal
        visible={videoModalVisible}
        onClose={() => setVideoModalVisible(false)}
        video={aboutVideo}
        onOpenAbout={() => {
          setVideoModalVisible(false);
          if (navigation) navigation.navigate('About');
        }}
        onOpenDonate={() => {
          setVideoModalVisible(false);
          if (navigation) navigation.navigate('UserActionPage', { pageId: 'donate' });
        }}
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
    borderRadius: BorderRadius.card,
    borderColor: '#DCE4EC',
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
    color: '#06294D',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  activeAidReason: {
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
  },
  activeAidRef: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  amountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FAD465',
  },
  amountBarLabel: {
    fontSize: 12,
    color: '#34516D',
  },
  amountBarValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2F52',
  },
  stepperWrap: {
    marginTop: 4,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
    paddingTop: 8,
  },
  trackLink: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
    marginTop: 4,
  },
  trackLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06294D',
  },
  needAidCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: '#EDF2F7',
    borderColor: '#DBE5EE',
    borderWidth: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
  },
  needAidContent: {
    alignItems: 'flex-start',
  },
  needAidBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06294D',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  needAidTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2F52',
    lineHeight: 22,
    marginBottom: 6,
  },
  needAidDesc: {
    fontSize: 12,
    color: '#34516D',
    lineHeight: 18,
    marginBottom: 12,
  },
  applyNowBtn: {
    backgroundColor: '#FAD465',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.button,
  },
  applyNowBtnText: {
    color: '#011F39',
    fontWeight: '700',
    fontSize: 13,
  },
  helplineBanner: {
    marginHorizontal: Spacing.base,
    backgroundColor: '#FFF9E6',
    borderColor: '#FAD465',
    borderWidth: 1,
    borderRadius: BorderRadius.card,
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
    color: '#718096',
  },
  helplinePhone: {
    fontSize: 14,
    fontWeight: '800',
    color: '#06294D',
    marginTop: 1,
  },
  carousel: {
    paddingRight: Spacing.base,
    gap: Spacing.sm,
  },
  newsList: {
    gap: Spacing.sm,
  },
});

export default SeekerHomeScreen;
