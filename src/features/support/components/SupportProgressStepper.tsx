import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';

interface SupportProgressStepperProps {
  currentStep: 1 | 2 | 3;
}

interface StepItem {
  number: number;
  label: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: 'Ticket Details' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Submitted' },
];

export const SupportProgressStepper: React.FC<SupportProgressStepperProps> = ({
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepperRow}>
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step Node */}
              <View style={styles.stepNode}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      (isCompleted || isActive) && styles.circleTextActive,
                    ]}
                  >
                    {isCompleted ? '✓' : step.number}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                    isCompleted && styles.labelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connecting Line between steps */}
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    step.number < currentStep && styles.lineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNode: {
    alignItems: 'center',
    width: 86,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  circleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  circleTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  labelActive: {
    color: AdminColors.primary,
    fontWeight: '800',
  },
  labelCompleted: {
    color: '#10B981',
    fontWeight: '700',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
    marginHorizontal: 4,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
});
