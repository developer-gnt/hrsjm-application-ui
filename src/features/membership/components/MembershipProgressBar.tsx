import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';

interface MembershipProgressBarProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { step: 1, label: 'Personal\nInformation' },
  { step: 2, label: 'Address\nDetails' },
  { step: 3, label: 'Document\nUpload' },
];

export function MembershipProgressBar({ currentStep }: MembershipProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {/* Step 1 */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.circle,
              currentStep === 1 && styles.circleActive,
              currentStep > 1 && styles.circleCompleted,
            ]}>
            {currentStep > 1 ? (
              <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep === 1 && styles.stepNumberActive,
                ]}>
                1
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.label,
              currentStep === 1 && styles.labelActive,
              currentStep > 1 && styles.labelCompleted,
            ]}>
            {STEPS[0].label}
          </Text>
        </View>

        {/* Connecting Line 1 -> 2 */}
        <View
          style={[
            styles.connectorLine,
            currentStep > 1 && styles.connectorLineActive,
          ]}
        />

        {/* Step 2 */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.circle,
              currentStep === 2 && styles.circleActive,
              currentStep > 2 && styles.circleCompleted,
            ]}>
            {currentStep > 2 ? (
              <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep === 2 && styles.stepNumberActive,
                ]}>
                2
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.label,
              currentStep === 2 && styles.labelActive,
              currentStep > 2 && styles.labelCompleted,
            ]}>
            {STEPS[1].label}
          </Text>
        </View>

        {/* Connecting Line 2 -> 3 */}
        <View
          style={[
            styles.connectorLine,
            currentStep > 2 && styles.connectorLineActive,
          ]}
        />

        {/* Step 3 */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.circle,
              currentStep === 3 && styles.circleActive,
            ]}>
            <Text
              style={[
                styles.stepNumber,
                currentStep === 3 && styles.stepNumberActive,
              ]}>
              3
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              currentStep === 3 && styles.labelActive,
            ]}>
            {STEPS[2].label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    width: 84,
    zIndex: 2,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleActive: {
    backgroundColor: '#1B3B8C',
    borderColor: '#1B3B8C',
    shadowColor: '#1B3B8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  circleCompleted: {
    backgroundColor: '#1B3B8C',
    borderColor: '#1B3B8C',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },
  labelActive: {
    color: '#1B3B8C',
    fontWeight: '700',
  },
  labelCompleted: {
    color: '#1B3B8C',
    fontWeight: '600',
  },
  connectorLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 15,
    marginHorizontal: -8,
    zIndex: 1,
  },
  connectorLineActive: {
    backgroundColor: '#1B3B8C',
  },
});

export default MembershipProgressBar;
