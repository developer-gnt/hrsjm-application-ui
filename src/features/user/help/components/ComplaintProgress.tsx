import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, Spacing } from '../../../../core/theme';

interface StepProgressItem {
  id: string;
  label: string;
  active?: boolean;
  completed?: boolean;
}

interface ComplaintProgressProps {
  steps: StepProgressItem[];
  activeStep: number;
}

export const ComplaintProgress: React.FC<ComplaintProgressProps> = ({
  steps,
  activeStep,
}) => (
  <View style={styles.progressRow}>
    {steps.map((step, index) => {
      const isActive = index === activeStep;
      const isComplete = index < activeStep;

      return (
        <React.Fragment key={step.id}>
          <View style={styles.stepWrap}>
            <View
              style={[
                styles.stepCircle,
                isActive && styles.activeStepCircle,
                isComplete && styles.completeStepCircle,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  isActive && styles.activeStepNumber,
                  isComplete && styles.completeStepNumber,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                isActive && styles.activeStepLabel,
                isComplete && styles.completeStepLabel,
              ]}
              numberOfLines={2}
            >
              {step.label}
            </Text>
          </View>

          {index < steps.length - 1 && <View style={styles.connector} />}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepWrap: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AdminColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  activeStepCircle: {
    backgroundColor: AdminColors.accentGold,
    borderColor: AdminColors.accentGold,
  },
  completeStepCircle: {
    backgroundColor: AdminColors.primaryDark,
    borderColor: AdminColors.primaryDark,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.textSecondary,
  },
  activeStepNumber: {
    color: AdminColors.textOnDark,
  },
  completeStepNumber: {
    color: AdminColors.textOnDark,
  },
  stepLabel: {
    marginTop: Spacing.xs,
    textAlign: 'center',
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  activeStepLabel: {
    color: AdminColors.primaryDark,
  },
  completeStepLabel: {
    color: AdminColors.primaryDark,
  },
  connector: {
    flex: 0.75,
    height: 2,
    backgroundColor: AdminColors.border,
    marginTop: 14,
  },
});
