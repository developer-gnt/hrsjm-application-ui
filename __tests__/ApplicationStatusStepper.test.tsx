import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  ApplicationStatusStepper,
  getStatusStepConfiguration,
  STEPPER_COLORS,
} from '../src/features/membership/components/stepper/ApplicationStatusStepper';
import { MembershipApplicationDetailsScreen } from '../src/features/admin/membershipApplications/screens/MembershipApplicationDetailsScreen';
import { membershipApplicationsStore } from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('Master Prompt: Dynamic Application Status Stepper Verification', () => {
  beforeEach(async () => {
    await act(async () => {
      membershipApplicationsStore.resetForTest();
    });
  });

  describe('Section 10: Step Configuration Unit Tests (Test A - Test D)', () => {
    it('Test A: Applied — Step 1 active blue, Step 2 inactive gray; Approved & Rejected hidden', () => {
      const config = getStatusStepConfiguration('applied');
      expect(config.currentStatus).toBe('applied');
      expect(config.steps).toHaveLength(2);

      // Step 1: Active Navy Blue (#174EA6)
      const step1 = config.steps[0];
      expect(step1.stepNumber).toBe(1);
      expect(step1.isActive).toBe(true);
      expect(step1.isCompleted).toBe(false);
      expect(step1.circleBg).toBe(STEPPER_COLORS.applied);
      expect(step1.label).toBe('Applied');
      expect(step1.hasHalo).toBe(true);

      // Step 2: Inactive Gray
      const step2 = config.steps[1];
      expect(step2.stepNumber).toBe(2);
      expect(step2.isInactive).toBe(true);
      expect(step2.circleBorder).toBe(STEPPER_COLORS.inactiveBorder);
      expect(step2.label).toBe('Under Review');

      // Approved & Rejected are NOT visible until admin changes status
      const labels = config.steps.map(s => s.label);
      expect(labels).not.toContain('Approved');
      expect(labels).not.toContain('Rejected');

      // Connecting line: 1 inactive line
      expect(config.lineColors).toEqual([STEPPER_COLORS.inactiveBorder]);
      expect(config.lines.line1Color).toBe(STEPPER_COLORS.inactiveBorder);
    });

    it('Test B: Under Review — Step 1 completed, Step 2 active gold; Approved & Rejected hidden', () => {
      const config = getStatusStepConfiguration('under_review');
      expect(config.currentStatus).toBe('under_review');
      expect(config.steps).toHaveLength(2);

      // Step 1: Completed
      const step1 = config.steps[0];
      expect(step1.stepNumber).toBe(1);
      expect(step1.isCompleted).toBe(true);
      expect(step1.circleBg).toBe(STEPPER_COLORS.applied);

      // Step 2: Active Golden Yellow (#F0A51B)
      const step2 = config.steps[1];
      expect(step2.stepNumber).toBe(2);
      expect(step2.isActive).toBe(true);
      expect(step2.circleBg).toBe(STEPPER_COLORS.underReview);
      expect(step2.hasHalo).toBe(true);

      // Approved & Rejected are NOT visible until admin changes status
      const labels = config.steps.map(s => s.label);
      expect(labels).not.toContain('Approved');
      expect(labels).not.toContain('Rejected');

      // Line 1->2 completed
      expect(config.lineColors).toEqual([STEPPER_COLORS.applied]);
      expect(config.lines.line1Color).toBe(STEPPER_COLORS.applied);
    });

    it('Test C: Approved — Steps 1 & 2 completed, Step 3 active green; Rejected is completely hidden', () => {
      const config = getStatusStepConfiguration('approved');
      expect(config.currentStatus).toBe('approved');
      expect(config.steps).toHaveLength(3);

      // Steps 1 & 2 completed
      expect(config.steps[0].stepNumber).toBe(1);
      expect(config.steps[0].isCompleted).toBe(true);
      expect(config.steps[1].stepNumber).toBe(2);
      expect(config.steps[1].isCompleted).toBe(true);

      // Step 3: Active Green (#16A34A)
      const step3 = config.steps[2];
      expect(step3.stepNumber).toBe(3);
      expect(step3.isActive).toBe(true);
      expect(step3.circleBg).toBe(STEPPER_COLORS.approved);
      expect(step3.labelColor).toBe(STEPPER_COLORS.approved);
      expect(step3.label).toBe('Approved');
      expect(step3.hasHalo).toBe(true);

      // Rejected MUST NOT be present
      const labels = config.steps.map(s => s.label);
      expect(labels).toContain('Approved');
      expect(labels).not.toContain('Rejected');

      // Lines
      expect(config.lineColors).toEqual([STEPPER_COLORS.applied, STEPPER_COLORS.approved]);
      expect(config.lines.line1Color).toBe(STEPPER_COLORS.applied);
      expect(config.lines.line2Color).toBe(STEPPER_COLORS.approved);
    });

    it('Test D: Rejected — Steps 1 & 2 completed, Step 3 active red; Approved is completely hidden', () => {
      const config = getStatusStepConfiguration('rejected');
      expect(config.currentStatus).toBe('rejected');
      expect(config.steps).toHaveLength(3);

      // Steps 1 & 2 completed
      expect(config.steps[0].stepNumber).toBe(1);
      expect(config.steps[0].isCompleted).toBe(true);
      expect(config.steps[1].stepNumber).toBe(2);
      expect(config.steps[1].isCompleted).toBe(true);

      // Step 3: Active Red (#DC2626)
      const step3 = config.steps[2];
      expect(step3.stepNumber).toBe(3);
      expect(step3.isActive).toBe(true);
      expect(step3.circleBg).toBe(STEPPER_COLORS.rejected);
      expect(step3.labelColor).toBe(STEPPER_COLORS.rejected);
      expect(step3.label).toBe('Rejected');
      expect(step3.hasHalo).toBe(true);

      // Approved MUST NOT be present
      const labels = config.steps.map(s => s.label);
      expect(labels).toContain('Rejected');
      expect(labels).not.toContain('Approved');

      // Lines
      expect(config.lineColors).toEqual([STEPPER_COLORS.applied, STEPPER_COLORS.rejected]);
      expect(config.lines.line1Color).toBe(STEPPER_COLORS.applied);
      expect(config.lines.line2Color).toBe(STEPPER_COLORS.rejected);
    });
  });

  describe('Integration with Admin Actions (Test E & Test F)', () => {
    const renderAdminDetails = async (applicationId: string) => {
      let renderer: any;
      await act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider
            initialMetrics={{
              frame: { x: 0, y: 0, width: 390, height: 844 },
              insets: { top: 47, left: 0, right: 0, bottom: 34 },
            }}
          >
            <MembershipApplicationDetailsScreen
              applicationId={applicationId}
              onBack={jest.fn()}
            />
          </SafeAreaProvider>
        );
      });
      return renderer!;
    };

    it('Test E: Stepper is NOT in Admin screen, and updates user stepper when Admin approves application', async () => {
      const renderer = await renderAdminDetails('app-1');
      const root = renderer.root;

      // Stepper is NOT in the admin screen
      const adminJson = JSON.stringify(renderer.toJSON());
      expect(adminJson).not.toContain('Application Status Stepper');

      // Admin clicks Under Review then Approve
      const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
      await act(async () => {
        underReviewBtn.props.onPress();
      });

      const approveBtn = root.findByProps({ accessibilityLabel: 'Approve Application' });
      await act(async () => {
        approveBtn.props.onPress();
      });

      // Confirm in modal
      const confirmModal = root.findByProps({ accessibilityLabel: 'Confirm Approval' });
      await act(async () => {
        confirmModal.props.onPress();
      });

      // Application status in store is updated to approved
      const app = membershipApplicationsStore.getApplicationById('app-1');
      expect(app?.status).toBe('approved');

      // User's stepper reflecting the approved status shows only 3 steps (with Approved, no Rejected)
      let userStepperRenderer: any;
      act(() => {
        userStepperRenderer = ReactTestRenderer.create(
          <ApplicationStatusStepper status={app?.status} />
        );
      });
      const userStepperJson = JSON.stringify(userStepperRenderer.toJSON());
      expect(userStepperJson).toContain('Application Status Stepper, current status is approved');
      expect(userStepperJson).toContain('Approved');
      expect(userStepperJson).not.toContain('Rejected');
    });

    it('Test F: Stepper is NOT in Admin screen, and updates user stepper when Admin rejects application with reason', async () => {
      const renderer = await renderAdminDetails('app-1');
      const root = renderer.root;

      // Stepper is NOT in the admin screen
      const adminJson = JSON.stringify(renderer.toJSON());
      expect(adminJson).not.toContain('Application Status Stepper');

      // Click Under Review
      const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
      await act(async () => {
        underReviewBtn.props.onPress();
      });

      // Click Reject
      const rejectBtn = root.findByProps({ accessibilityLabel: 'Reject Application' });
      await act(async () => {
        rejectBtn.props.onPress();
      });

      // Confirm Rejection modal
      const confirmModal = root.findByProps({ accessibilityLabel: 'Confirm Rejection' });
      await act(async () => {
        confirmModal.props.onPress();
      });

      // Application status in store is updated to rejected
      const app = membershipApplicationsStore.getApplicationById('app-1');
      expect(app?.status).toBe('rejected');

      // User's stepper reflecting the rejected status shows only 3 steps (with Rejected, no Approved)
      let userStepperRenderer: any;
      act(() => {
        userStepperRenderer = ReactTestRenderer.create(
          <ApplicationStatusStepper status={app?.status} />
        );
      });
      const userStepperJson = JSON.stringify(userStepperRenderer.toJSON());
      expect(userStepperJson).toContain('Application Status Stepper, current status is rejected');
      expect(userStepperJson).toContain('Rejected');
      expect(userStepperJson).not.toContain('Approved');
    });

    it('Test G: Component renders dynamic steps and hides Approved/Rejected until status changes', () => {
      // 1. Initial State: under_review (only Applied and Under Review visible)
      let renderer: any;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ApplicationStatusStepper status="under_review" showCard title="Application Progress" />
        );
      });

      let rootText = JSON.stringify(renderer.toJSON());
      expect(rootText).toContain('Application Progress');
      expect(rootText).toContain('Applied');
      expect(rootText).toContain('Under Review');
      expect(rootText).not.toContain('Approved');
      expect(rootText).not.toContain('Rejected');

      // 2. Approved State: only Applied, Under Review, Approved visible (Rejected hidden)
      act(() => {
        renderer = ReactTestRenderer.create(
          <ApplicationStatusStepper status="approved" showCard title="Application Progress" />
        );
      });
      rootText = JSON.stringify(renderer.toJSON());
      expect(rootText).toContain('Applied');
      expect(rootText).toContain('Under Review');
      expect(rootText).toContain('Approved');
      expect(rootText).not.toContain('Rejected');

      // 3. Rejected State: only Applied, Under Review, Rejected visible (Approved hidden)
      act(() => {
        renderer = ReactTestRenderer.create(
          <ApplicationStatusStepper status="rejected" showCard title="Application Progress" />
        );
      });
      rootText = JSON.stringify(renderer.toJSON());
      expect(rootText).toContain('Applied');
      expect(rootText).toContain('Under Review');
      expect(rootText).toContain('Rejected');
      expect(rootText).not.toContain('Approved');
    });
  });
});
