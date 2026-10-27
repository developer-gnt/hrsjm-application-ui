import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck } from '../../../core/components/icons';
import { useAuthStore } from '../store/authStore';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

const LOGO_SOURCE = require('../../../assets/logo/logo.png');

type SplashScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

/**
 * Boot decision screen: token validation & initial route determination.
 * High-end institutional splash & loading screen with ambient glow,
 * breathing seal animation, smooth progress bar, and official security badges.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const didRun = useRef(false);
  const [loadingText, setLoadingText] = useState('Initializing secure session...');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    // 1. Entrance fade & spring scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous breathing pulse for seal glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.07,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 3. Continuous smooth indeterminate progress bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 200,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: -60,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Dynamic loading status messages for enhanced UX
    const statusTimer = setTimeout(() => {
      setLoadingText('Connecting to HRSJM network...');
    }, 800);

    return () => clearTimeout(statusTimer);
  }, [fadeAnim, scaleAnim, glowPulse, progressAnim]);

  useEffect(() => {
    if (didRun.current) {
      return;
    }
    didRun.current = true;

    const decide = async () => {
      const startTime = Date.now();
      const restored = await useAuthStore.getState().restoreSession();

      // Enforce a minimum 1.2s smooth splash experience to prevent jarring UI flicker
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1200 - elapsed);
      if (remaining > 0) {
        await new Promise(r => setTimeout(r, remaining));
      }

      if (!restored) {
        navigation.replace('Login');
      }
      // On success RootNavigator swaps to the authenticated area and this
      // screen unmounts; no navigation needed here.
    };

    decide();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient background glow & decorative concentric rings */}
      <View style={styles.ambientBackground}>
        <View style={styles.outerRing} />
      </View>

      {/* Main Brand & Logo Card */}
      <Animated.View
        style={[
          styles.contentWrap,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Pulsing Aura Behind Emblem */}
        <Animated.View
          style={[
            styles.emblemHalo,
            {
              transform: [{ scale: glowPulse }],
            },
          ]}
        >
          <Image source={LOGO_SOURCE} style={styles.emblemImage} resizeMode="contain" />
        </Animated.View>

        {/* Brand Wordmark & Official Titles */}
        <View style={styles.typographyContainer}>
          <Text style={styles.brandTitle}>HRSJM</Text>
          <View style={styles.goldDivider} />
          <Text style={styles.missionText}>
            HUMAN RIGHTS & SOCIAL JUSTICE MISSION
          </Text>
          <Text style={styles.hindiText}>
            मानव अधिकार <Text style={styles.goldBullet}>•</Text> सामाजिक न्याय
          </Text>
        </View>

        {/* High-End Indeterminate Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  transform: [{ translateX: progressAnim }],
                },
              ]}
            />
          </View>
          <Text style={styles.progressStatusText}>{loadingText}</Text>
        </View>
      </Animated.View>

      {/* Institutional Security & Trust Footer */}
      <View style={styles.footer}>
        <View style={styles.trustBadge}>
          <ShieldCheck size={14} color="#FAD465" strokeWidth={2.4} />
          <Text style={styles.trustText}>Official National Human Rights Portal</Text>
        </View>
        <Text style={styles.versionText}>
          HRSJM Portal • v1.0.0 • 256-Bit Encrypted
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03182E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ambientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  outerRing: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(250, 212, 101, 0.05)',
  },
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 380,
  },
  emblemHalo: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: 'rgba(250, 212, 101, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(250, 212, 101, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FAD465',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  emblemImage: {
    width: 110,
    height: 110,
  },
  typographyContainer: {
    alignItems: 'center',
    marginTop: 22,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(250, 212, 101, 0.35)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  goldDivider: {
    width: 44,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FAD465',
    marginTop: 8,
    marginBottom: 8,
  },
  missionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FAD465',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 16,
  },
  hindiText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#E2E8F0',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  goldBullet: {
    color: '#FAD465',
    fontWeight: '800',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 34,
    width: '100%',
  },
  progressTrack: {
    width: 180,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    width: 65,
    height: 3.5,
    backgroundColor: '#FAD465',
    borderRadius: 2,
  },
  progressStatusText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250, 212, 101, 0.15)',
    marginBottom: 6,
  },
  trustText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});