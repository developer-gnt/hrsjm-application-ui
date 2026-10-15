import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AssistanceStatus } from '../../admin/assistance/types/assistance.types';
import { AdminColors } from '../../../core/theme/colors';

interface SeekerTimelineStepperProps {
  status: AssistanceStatus;
  compact?: boolean;
}

interface StepItem {
  number: number;
  label: string;
  sublabel: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: 'Submitted', sublabel: 'Request received' },
  { number: 2, label: 'Review', sublabel: 'Document verification' },
  { number: 3, label: 'Field Visit', sublabel: 'Background assessment' },
  { number: 4, label: 'Decision', sublabel: 'Approval & aid release' },
];

export const SeekerTimelineStepper: React.FC<SeekerTimelineStepperProps> = ({
  status,
  compact = false,
}) => {
  // Determine current active step (1-indexed, 1..4)
  let currentStep = 1;
  let isRejected = false;
  let isApproved = false;

  switch (status) {
    case 'PENDING':
      currentStep = 1;
      break;
    case 'UNDER_REVIEW':
      currentStep = 2;
      break;
    case 'APPROVED':
      currentStep = 4;
      isApproved = true;
      break;
    case 'REJECTED':
      currentStep = 4;
      isRejected = true;
      break;
    case 'CLOSED':
      currentStep = 4;
      isApproved = true;
      break;
    default:
      currentStep = 1;
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, idx) => {
          const isPast = step.number < currentStep || (step.number === 4 && (isApproved || isRejected));
          const isCurrent = step.number === currentStep && !isApproved && !isRejected;
          const isLast = idx === STEPS.length - 1;

          let stepBg = '#E2E8F0';
          let textColor = '#64748B';
          let badgeContent = `${step.number}`;

          if (isPast) {
            if (step.number === 4 && isRejected) {
              stepBg = '#EF4444';
              textColor = '#FFFFFF';
              badgeContent = '✕';
            } else {
              stepBg = '#10B981';
              textColor = '#FFFFFF';
              badgeContent = '✓';
            }
          } else if (isCurrent) {
            stepBg = '#0D9488'; // Seeker teal brand
            textColor = '#FFFFFF';
            badgeContent = '●';
          }

          return (
            <React.Fragment key={step.number}>
              <View style={styles.stepNode}>
                <View style={[styles.circle, { backgroundColor: stepBg }]}>
                  <Text style={[styles.circleText, { color: textColor }]}>
                    {badgeContent}
                  </Text>
                </View>
                {!compact ? (
                  <View style={styles.labelContainer}>
                    <Text
                      style={[
                        styles.label,
                        (isCurrent || isPast) && styles.activeLabel,
                        step.number === 4 && isRejected && { color: '#EF4444' },
                        step.number === 4 && isApproved && { color: '#10B981' },
                      ]}
                      numberOfLines={1}
                    >
                      {step.number === 4
                        ? isRejected
                          ? 'Rejected'
                          : isApproved
                          ? 'Approved'
                          : step.label
                        : step.label}
                    </Text>
                    <Text style={styles.sublabel} numberOfLines={1}>
                      {step.sublabel}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.compactLabel,
                      (isCurrent || isPast) && styles.activeLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                )}
              </View>

              {!isLast ? (
                <View
                  style={[
                    styles.connector,
                    step.number < currentStep && styles.connectorActive,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepNode: {
    alignItems: 'center',
    width: 68,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#0F172A',
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  compactLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 14,
    marginHorizontal: -4,
  },
  connectorActive: {
    backgroundColor: '#10B981',
  },
});
