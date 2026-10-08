import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MemberCauseListScreen } from './MemberCauseListScreen';
import { MemberCauseDetailsScreen } from './MemberCauseDetailsScreen';
import { MemberCause } from '../types/causes.types';

export const MemberCausesContainer: React.FC = () => {
  const [selectedCause, setSelectedCause] = useState<MemberCause | null>(null);

  if (selectedCause) {
    return (
      <MemberCauseDetailsScreen
        cause={selectedCause}
        onBack={() => setSelectedCause(null)}
        onDonationSuccess={() => {
          // Keep detail updated or return
        }}
      />
    );
  }

  return (
    <MemberCauseListScreen
      onViewCauseDetails={cause => setSelectedCause(cause)}
      onDonateCause={cause => {
        // Handled by card / list modal
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
