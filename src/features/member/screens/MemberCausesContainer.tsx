import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MemberCauseListScreen } from './MemberCauseListScreen';
import { MemberCauseDetailsScreen } from './MemberCauseDetailsScreen';
import { MemberCause } from '../types/causes.types';

export interface MemberCausesContainerProps {
  onSelectCause?: (cause: MemberCause) => void;
  onClose?: () => void;
  hideHeader?: boolean;
}

export const MemberCausesContainer: React.FC<MemberCausesContainerProps> = ({
  onSelectCause,
  onClose,
  hideHeader = false,
}) => {
  const [selectedCause, setSelectedCause] = useState<MemberCause | null>(null);

  if (selectedCause) {
    return (
      <MemberCauseDetailsScreen
        cause={selectedCause}
        onBack={() => setSelectedCause(null)}
        onDonationSuccess={(donatedAmount) => {
          setSelectedCause(prev => {
            if (!prev) return null;
            const updatedRaised = Math.min(prev.targetAmount, prev.raisedAmount + donatedAmount);
            return {
              ...prev,
              raisedAmount: updatedRaised,
              donorCount: prev.donorCount + 1,
              status: updatedRaised >= prev.targetAmount ? 'closed' : prev.status,
            };
          });
        }}
      />
    );
  }

  return (
    <MemberCauseListScreen
      hideHeader={hideHeader}
      onViewCauseDetails={cause => {
        if (onSelectCause) {
          onSelectCause(cause);
        } else {
          setSelectedCause(cause);
        }
      }}
      onDonateCause={cause => {
        if (onSelectCause) {
          onSelectCause(cause);
        } else {
          setSelectedCause(cause);
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
