import React, { useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export type StepperStatus = 'applied' | 'under_review' | 'approved' | 'rejected';

export interface StepData {
  stepNumber: number;
  key: StepperStatus;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  isInactive: boolean;
  circleBg: string;
  circleBorder: string;
  circleNumberColor: string;
  labelColor: string;
  labelFontWeight: '700' | '600' | '500';
  haloBg: string;
  hasHalo: boolean;
}

export interface StepperConfiguration {
  currentStatus: StepperStatus;
  steps: StepData[];
  lineColors: string[];
  lines: {
    line1Color: string; // Step 1 -> Step 2
    line2Color?: string; // Step 2 -> Step 3
    line3Color?: string; // Step 3 -> Step 4
  };
}

// Design system colors matching reference image and Section 4 of Master Prompt
export const STEPPER_COLORS = {
  applied: '#174EA6', // Navy Blue
  underReview: '#F0A51B', // Golden Yellow
  approved: '#16A34A', // Green
  rejected: '#DC2626', // Red
  inactiveCircleBg: '#FFFFFF',
  inactiveBorder: '#D9E1EA',
  inactiveNumber: '#94A3B8',
  inactiveLabel: '#94A3B8',
  mainText: '#10244A',
  // Halo / Glow auras
  appliedHalo: 'rgba(23, 78, 166, 0.16)',
  underReviewHalo: 'rgba(240, 165, 27, 0.22)',
  approvedHalo: 'rgba(22, 163, 74, 0.20)',
  rejectedHalo: 'rgba(220, 38, 38, 0.20)',
};

/**
 * Normalizes any raw status string into one of the 4 stepper states.
 */
export function normalizeStepperStatus(rawStatus?: string | null): StepperStatus {
  if (!rawStatus) return 'applied';
  const s = String(rawStatus).toLowerCase().trim();
  if (s === 'approved' || s === 'active' || s.includes('approve')) {
    return 'approved';
  }
  if (s === 'rejected' || s === 'cancelled' || s === 'expired' || s.includes('reject')) {
    return 'rejected';
  }
  if (
    s === 'under_review' ||
    s === 'under review' ||
    s === 'in_review' ||
    s === 'review' ||
    s.includes('review')
  ) {
    return 'under_review';
  }
  return 'applied';
}

/**
 * Derives the dynamic step configuration based on current application status.
 *
 * Rules:
 * 1. Initial states ('applied' & 'under_review'): Approved and Rejected are NOT visible.
 *    Only 2 steps are shown: [1 Applied] and [2 Under Review].
 * 2. When admin approves ('approved'): Shows only Approved, NOT Rejected.
 *    3 steps shown: [1 Applied] -> [2 Under Review] -> [3 Approved].
 * 3. When admin rejects ('rejected'): Shows only Rejected, NOT Approved.
 *    3 steps shown: [1 Applied] -> [2 Under Review] -> [3 Rejected].
 */
export function getStatusStepConfiguration(
  rawStatus?: string | null
): StepperConfiguration {
  const currentStatus = normalizeStepperStatus(rawStatus);

  if (currentStatus === 'applied') {
    // STATE 1: Applied (Initial: Step 1 active blue; Step 2 inactive gray; Approved/Rejected hidden)
    return {
      currentStatus,
      steps: [
        {
          stepNumber: 1,
          key: 'applied',
          label: 'Applied',
          isCompleted: false,
          isActive: true,
          isInactive: false,
          circleBg: STEPPER_COLORS.applied,
          circleBorder: STEPPER_COLORS.applied,
          circleNumberColor: '#FFFFFF',
          labelColor: STEPPER_COLORS.mainText,
          labelFontWeight: '700',
          haloBg: STEPPER_COLORS.appliedHalo,
          hasHalo: true,
        },
        {
          stepNumber: 2,
          key: 'under_review',
          label: 'Under Review',
          isCompleted: false,
          isActive: false,
          isInactive: true,
          circleBg: STEPPER_COLORS.inactiveCircleBg,
          circleBorder: STEPPER_COLORS.inactiveBorder,
          circleNumberColor: STEPPER_COLORS.inactiveNumber,
          labelColor: STEPPER_COLORS.inactiveLabel,
          labelFontWeight: '500',
          haloBg: 'transparent',
          hasHalo: false,
        },
      ],
      lineColors: [STEPPER_COLORS.inactiveBorder],
      lines: {
        line1Color: STEPPER_COLORS.inactiveBorder,
      },
    };
  }

  if (currentStatus === 'under_review') {
    // STATE 2: Under Review (Initial: Step 1 completed blue; Step 2 active golden; Line 1->2 active; Approved/Rejected hidden)
    return {
      currentStatus,
      steps: [
        {
          stepNumber: 1,
          key: 'applied',
          label: 'Applied',
          isCompleted: true,
          isActive: false,
          isInactive: false,
          circleBg: STEPPER_COLORS.applied,
          circleBorder: STEPPER_COLORS.applied,
          circleNumberColor: '#FFFFFF',
          labelColor: STEPPER_COLORS.mainText,
          labelFontWeight: '700',
          haloBg: 'transparent',
          hasHalo: false,
        },
        {
          stepNumber: 2,
          key: 'under_review',
          label: 'Under Review',
          isCompleted: false,
          isActive: true,
          isInactive: false,
          circleBg: STEPPER_COLORS.underReview,
          circleBorder: STEPPER_COLORS.underReview,
          circleNumberColor: '#FFFFFF',
          labelColor: STEPPER_COLORS.mainText,
          labelFontWeight: '700',
          haloBg: STEPPER_COLORS.underReviewHalo,
          hasHalo: true,
        },
      ],
      lineColors: [STEPPER_COLORS.applied],
      lines: {
        line1Color: STEPPER_COLORS.applied,
      },
    };
  }

  if (currentStatus === 'approved') {
    // STATE 3: Approved (Steps 1 & 2 completed; Step 3 active green; Rejected is completely hidden)
    return {
      currentStatus,
      steps: [
        {
          stepNumber: 1,
          key: 'applied',
          label: 'Applied',
          isCompleted: true,
          isActive: false,
          isInactive: false,
          circleBg: STEPPER_COLORS.applied,
          circleBorder: STEPPER_COLORS.applied,
          circleNumberColor: '#FFFFFF',
          labelColor: STEPPER_COLORS.mainText,
          labelFontWeight: '600',
          haloBg: 'transparent',
          hasHalo: false,
        },
        {
          stepNumber: 2,
          key: 'under_review',
          label: 'Under Review',
          isCompleted: true,
          isActive: false,
          isInactive: false,
          circleBg: STEPPER_COLORS.underReview,
          circleBorder: STEPPER_COLORS.underReview,
          circleNumberColor: '#FFFFFF',
          labelColor: STEPPER_COLORS.mainText,
          labelFontWeight: '600',
          haloBg: 'transparent',
          hasHalo: false,
        },
        {
          stepNumber: 3,
          key: 'approved',
          label: 'Approved',
          isCompleted: false,
          isActive: true,
          isInactive: false,
          circleBg: STEPPER_COLORS.approved,
          circleBorder: STEPPER_COLORS.approved,
          circleNumberColor: '#FFFFFF',
          labelColor: STEPPER_COLORS.approved,
          labelFontWeight: '700',
          haloBg: STEPPER_COLORS.approvedHalo,
          hasHalo: true,
        },
      ],
      lineColors: [STEPPER_COLORS.applied, STEPPER_COLORS.approved],
      lines: {
        line1Color: STEPPER_COLORS.applied,
        line2Color: STEPPER_COLORS.approved,
      },
    };
  }

  // STATE 4: Rejected (Steps 1 & 2 completed; Step 3 active red; Approved is completely hidden)
  return {
    currentStatus: 'rejected',
    steps: [
      {
        stepNumber: 1,
        key: 'applied',
        label: 'Applied',
        isCompleted: true,
        isActive: false,
        isInactive: false,
        circleBg: STEPPER_COLORS.applied,
        circleBorder: STEPPER_COLORS.applied,
        circleNumberColor: '#FFFFFF',
        labelColor: STEPPER_COLORS.mainText,
        labelFontWeight: '600',
        haloBg: 'transparent',
        hasHalo: false,
      },
      {
        stepNumber: 2,
        key: 'under_review',
        label: 'Under Review',
        isCompleted: true,
        isActive: false,
        isInactive: false,
        circleBg: STEPPER_COLORS.underReview,
        circleBorder: STEPPER_COLORS.underReview,
        circleNumberColor: '#FFFFFF',
        labelColor: STEPPER_COLORS.mainText,
        labelFontWeight: '600',
        haloBg: 'transparent',
        hasHalo: false,
      },
      {
        stepNumber: 3,
        key: 'rejected',
        label: 'Rejected',
        isCompleted: false,
        isActive: true,
        isInactive: false,
        circleBg: STEPPER_COLORS.rejected,
        circleBorder: STEPPER_COLORS.rejected,
        circleNumberColor: '#FFFFFF',
        labelColor: STEPPER_COLORS.rejected,
        labelFontWeight: '700',
        haloBg: STEPPER_COLORS.rejectedHalo,
        hasHalo: true,
      },
    ],
    lineColors: [STEPPER_COLORS.applied, STEPPER_COLORS.rejected],
    lines: {
      line1Color: STEPPER_COLORS.applied,
      line2Color: STEPPER_COLORS.rejected,
    },
  };
}

export interface ApplicationStatusStepProps {
  step: StepData;
  onPress?: () => void;
}

/**
 * Individual Step Circle + Label component.
 */
export const ApplicationStatusStep: React.FC<ApplicationStatusStepProps> = ({
  step,
  onPress,
}) => {
  const content = (
    <View style={styles.stepColumn}>
      {/* Outer Halo Wrapper (keeps layout completely stable across all states) */}
      <View
        style={[
          styles.haloWrapper,
          { backgroundColor: step.haloBg },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: step.circleBg,
              borderColor: step.circleBorder,
            },
          ]}
          accessibilityLabel={`Step ${step.stepNumber} ${step.label}, ${
            step.isActive ? 'current active status' : step.isCompleted ? 'completed' : 'pending'
          }`}
        >
          <Text
            style={[
              styles.circleNumberText,
              { color: step.circleNumberColor },
            ]}
          >
            {step.stepNumber}
          </Text>
        </View>
      </View>

      {/* Label directly underneath */}
      <Text
        style={[
          styles.stepLabelText,
          {
            color: step.labelColor,
            fontWeight: step.labelFontWeight,
          },
        ]}
        numberOfLines={2}
      >
        {step.label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.stepTouchable}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.stepTouchable}>{content}</View>;
};

export interface ApplicationStatusStepperProps {
  status?: string | null;
  showCard?: boolean;
  title?: string;
  style?: StyleProp<ViewStyle>;
  onStepPress?: (stepNumber: number, stepKey: StepperStatus) => void;
}

/**
 * Dynamic four-step horizontal progress stepper matching the reference design.
 */
export const ApplicationStatusStepper: React.FC<ApplicationStatusStepperProps> = ({
  status,
  showCard = false,
  title,
  style,
  onStepPress,
}) => {
  const config = useMemo(() => getStatusStepConfiguration(status), [status]);

  const stepperContent = (
    <View
      style={[
        styles.stepperContainer,
        config.steps.length === 2 && styles.twoStepsContainer,
        config.steps.length === 3 && styles.threeStepsContainer,
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Application Status Stepper, current status is ${config.currentStatus}`}
    >
      {/* Background Connecting Lines Layer */}
      <View style={styles.connectingLinesLayer} pointerEvents="none">
        {/* Spacer before Circle 1 center */}
        <View style={styles.lineSpacer} />

        {/* Dynamic Connecting Line Segments */}
        {config.lineColors.map((lineColor, index) => (
          <View
            key={`line-segment-${index}`}
            style={[
              styles.lineSegment,
              { backgroundColor: lineColor },
            ]}
          />
        ))}

        {/* Spacer after last Circle center */}
        <View style={styles.lineSpacer} />
      </View>

      {/* Dynamic Steps Row (evenly distributed across horizontal space) */}
      <View style={styles.stepsRow}>
        {config.steps.map(step => (
          <ApplicationStatusStep
            key={step.key}
            step={step}
            onPress={
              onStepPress ? () => onStepPress(step.stepNumber, step.key) : undefined
            }
          />
        ))}
      </View>
    </View>
  );

  if (showCard) {
    return (
      <View style={styles.cardWrapper}>
        {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
        {stepperContent}
      </View>
    );
  }

  return stepperContent;
};

const OUTER_HALO_SIZE = 54;
const INNER_CIRCLE_SIZE = 40;
const LINE_THICKNESS = 4;
// Align line vertically with center of outer halo: (54 - 4) / 2 = 25
const LINE_TOP_OFFSET = (OUTER_HALO_SIZE - LINE_THICKNESS) / 2;

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  stepperContainer: {
    width: '100%',
    position: 'relative',
    paddingVertical: 6,
  },
  twoStepsContainer: {
    maxWidth: 340,
    alignSelf: 'center',
  },
  threeStepsContainer: {
    maxWidth: 480,
    alignSelf: 'center',
  },
  connectingLinesLayer: {
    position: 'absolute',
    top: LINE_TOP_OFFSET,
    left: 0,
    right: 0,
    height: LINE_THICKNESS,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  lineSpacer: {
    flex: 1, // padding to reach center of first/last circle
  },
  lineSegment: {
    flex: 2, // span between adjacent circle centers
    height: LINE_THICKNESS,
    borderRadius: LINE_THICKNESS / 2,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 2,
  },
  stepTouchable: {
    flex: 1,
    alignItems: 'center',
  },
  stepColumn: {
    alignItems: 'center',
    width: '100%',
  },
  haloWrapper: {
    width: OUTER_HALO_SIZE,
    height: OUTER_HALO_SIZE,
    borderRadius: OUTER_HALO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
    borderRadius: INNER_CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  circleNumberText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
  stepLabelText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 2,
  },
});

export default ApplicationStatusStepper;
