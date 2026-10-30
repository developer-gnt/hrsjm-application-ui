import React, { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing, UserFontFamilies } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutVideoData } from '../services/about-video.service';

const ABOUT_PREVIEW_IMAGE = require('../../../../assets/images/about-hero-rally.jpg');

export interface AboutVideoModalProps {
  visible: boolean;
  onClose: () => void;
  video: AboutVideoData;
  onOpenAbout?: () => void;
  onOpenDonate?: () => void;
}

export const AboutVideoModal: React.FC<AboutVideoModalProps> = ({
  visible,
  onClose,
  video,
  onOpenAbout,
  onOpenDonate,
}) => {
  const { width, height } = useWindowDimensions();
  const [copiedToast, setCopiedToast] = useState(false);
  const [useHtml5Fallback, setUseHtml5Fallback] = useState(false);

  // Maximum content width for tablet/desktop
  const maxCardWidth = Math.min(width - 32, 540);
  const isWeb = Platform.OS === 'web';

  const handleShare = async () => {
    const url = video.videoUrl || video.embedUrl;
    if (isWeb && typeof navigator !== 'undefined') {
      const nav = navigator as any;
      try {
        if (nav.share) {
          await nav.share({
            title: video.title,
            text: video.subtitle,
            url,
          });
          return;
        }
      } catch {
        // Fallback to clipboard
      }
      try {
        if (nav.clipboard && nav.clipboard.writeText) {
          await nav.clipboard.writeText(url);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 3000);
          return;
        }
      } catch {
        // Fallback
      }
    }

    // Default Linking open
    Linking.openURL(url).catch(() => {});
  };

  const handleExternalOpen = () => {
    const url = video.videoUrl || video.embedUrl;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touch to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close video modal"
        />

        <View style={[styles.card, { width: maxCardWidth, maxHeight: height * 0.9 }]}>
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{video.badgeLabel || 'OFFICIAL VIDEO'}</Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {video.title}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close video modal"
            >
              <AppIcon name="close" size={18} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Video Player Container */}
          <View style={styles.videoPlayerContainer}>
            {isWeb ? (
              useHtml5Fallback ? (
                // Direct HTML5 Video Player
                React.createElement('video', {
                  src: video.fallbackVideoUrl,
                  controls: true,
                  autoPlay: true,
                  playsInline: true,
                  style: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000000',
                  },
                })
              ) : (
                // Responsive Embedded Player
                React.createElement('iframe', {
                  src: video.embedUrl,
                  title: video.title,
                  style: {
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#000000',
                  },
                  allow:
                    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                  allowFullScreen: true,
                })
              )
            ) : (
              // Native Mobile View
              <View style={styles.nativePlayerBox}>
                <Image
                  source={video.thumbnailUrl ? { uri: video.thumbnailUrl } : ABOUT_PREVIEW_IMAGE}
                  style={styles.nativePoster}
                  resizeMode="cover"
                />
                <View style={styles.nativeOverlay}>
                  <TouchableOpacity
                    style={styles.nativePlayButton}
                    onPress={handleExternalOpen}
                    activeOpacity={0.85}
                  >
                    <AppIcon name="play" size={28} color={AdminColors.primaryDark} />
                  </TouchableOpacity>
                  <Text style={styles.nativePlayLabel}>Tap to Watch Full Video</Text>
                </View>
              </View>
            )}

            {/* Video Controls Bar Overlay */}
            <View style={styles.videoMetaBar}>
              <View style={styles.metaPill}>
                <AppIcon name="clock" size={12} color="#FFFFFF" />
                <Text style={styles.metaPillText}>{video.duration}</Text>
              </View>
              <View style={styles.metaPill}>
                <AppIcon name="eye" size={12} color="#FFFFFF" />
                <Text style={styles.metaPillText}>{video.viewsCount}</Text>
              </View>

              {isWeb && (
                <TouchableOpacity
                  onPress={() => setUseHtml5Fallback(prev => !prev)}
                  style={styles.switchPlayerButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchPlayerText}>
                    {useHtml5Fallback ? 'YouTube Player' : 'HTML5 Player'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Scrollable Details Section */}
          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={styles.detailsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title & Subtitle */}
            <View style={styles.titleSection}>
              <Text style={styles.videoTitle}>{video.subtitle || video.title}</Text>
              <Text style={styles.videoYearText}>HRSJM Official Mission Overview • {video.releaseYear}</Text>
            </View>

            {/* Description */}
            <Text style={styles.descriptionText}>{video.description}</Text>

            {/* Key Mission Highlights */}
            <View style={styles.highlightsContainer}>
              <Text style={styles.highlightsHeading}>Core Mission Pillars</Text>
              {video.highlights.map((highlight, idx) => (
                <View key={idx} style={styles.highlightRow}>
                  <View style={styles.checkIconBox}>
                    <AppIcon name="check" size={14} color="#059669" strokeWidth={2.4} />
                  </View>
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {onOpenAbout && (
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={onOpenAbout}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryActionText}>About HRSJM</Text>
                  <AppIcon name="arrow-right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              )}

              {onOpenDonate && (
                <TouchableOpacity
                  style={styles.donateActionButton}
                  onPress={onOpenDonate}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <AppIcon name="heart" size={14} color="#0F2860" />
                  <Text style={styles.donateActionText}>Donate</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.shareActionButton}
                onPress={handleShare}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Share video link"
              >
                <AppIcon name="link" size={15} color="#475569" />
                <Text style={styles.shareActionText}>
                  {copiedToast ? 'Copied!' : 'Share'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 30, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F2860',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  badgePill: {
    backgroundColor: '#E9B82E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 10,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.5,
  },
  headerTitle: {
    flex: 1,
    fontFamily: UserFontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    position: 'relative',
  },
  nativePlayerBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  nativePoster: {
    width: '100%',
    height: '100%',
  },
  nativeOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nativePlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nativePlayLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  videoMetaBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'box-none',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  switchPlayerButton: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  switchPlayerText: {
    color: '#E9B82E',
    fontSize: 10,
    fontWeight: '600',
  },
  detailsScroll: {
    flexGrow: 0,
  },
  detailsContent: {
    padding: 16,
    gap: 12,
  },
  titleSection: {
    gap: 4,
  },
  videoTitle: {
    fontFamily: UserFontFamilies.serif,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    lineHeight: 22,
  },
  videoYearText: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 12,
    color: '#64748B',
  },
  descriptionText: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
  },
  highlightsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  highlightsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIconBox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  primaryActionButton: {
    flex: 1.4,
    backgroundColor: '#0F2860',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  donateActionButton: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  donateActionText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  shareActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareActionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
});
