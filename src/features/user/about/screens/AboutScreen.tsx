import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AboutHeader } from '../components/AboutHeader';
import { AboutHeroSection } from '../components/AboutHeroSection';
import { BeliefSection } from '../components/BeliefSection';
import { ClosingCtaSection } from '../components/ClosingCtaSection';
import { LeadershipSection } from '../components/LeadershipSection';
import { MissionVisionSection } from '../components/MissionVisionSection';
import { ValuesSection } from '../components/ValuesSection';
import { WhoWeAreSection } from '../components/WhoWeAreSection';

export interface AboutScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  onBack,
  onNavigate,
}) => (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
    <AboutHeader onBack={onBack} />
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <AboutHeroSection />
      <View style={styles.section}>
        <WhoWeAreSection />
      </View>
      <View style={styles.section}>
        <BeliefSection />
      </View>
      <View style={styles.section}>
        <MissionVisionSection />
      </View>
      <View style={styles.section}>
        <ValuesSection />
      </View>
      <View style={styles.section}>
        <LeadershipSection />
      </View>
      <ClosingCtaSection onNavigate={onNavigate} />
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F3',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F7F7F3',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 18,
  },
});

export default AboutScreen;
