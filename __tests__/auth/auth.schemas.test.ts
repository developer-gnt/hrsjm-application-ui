import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
  ACCOUNT_TYPE_OPTIONS,
  zodErrorsToFieldErrors,
} from '../../src/features/auth/types/auth.schemas';

/**
 * Validation constraints must mirror the backend DTOs exactly
 * (LoginDto: identifier min 3; ResetPasswordDto: 8–72 + confirm match).
 */
describe('auth validation schemas', () => {
  describe('loginSchema', () => {
    it('accepts a valid identifier and password', () => {
      const result = loginSchema.safeParse({
        identifier: '9876543210',
        password: 'secret',
      });
      expect(result.success).toBe(true);
    });

    it('rejects identifiers shorter than 3 chars (LoginDto MinLength)', () => {
      const result = loginSchema.safeParse({ identifier: 'ab', password: 'x' });
      expect(result.success).toBe(false);
    });

    it('rejects empty passwords (LoginDto MinLength 1)', () => {
      const result = loginSchema.safeParse({ identifier: '9876543210', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('accepts a valid identifier', () => {
      expect(
        forgotPasswordSchema.safeParse({ identifier: 'admin@hrsjm.org' }).success,
      ).toBe(true);
    });

    it('rejects identifiers shorter than 3 chars', () => {
      expect(forgotPasswordSchema.safeParse({ identifier: 'ab' }).success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts matching passwords within 8–72 chars', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: 'AdminPass#1',
        confirm_password: 'AdminPass#1',
      });
      expect(result.success).toBe(true);
    });

    it('rejects passwords shorter than 8 chars', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: 'short12',
        confirm_password: 'short12',
      });
      expect(result.success).toBe(false);
    });

    it('rejects passwords longer than 72 chars', () => {
      const longPassword = 'a'.repeat(73);
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: longPassword,
        confirm_password: longPassword,
      });
      expect(result.success).toBe(false);
    });

    it('rejects mismatched confirm_password (MatchConstraint)', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: 'AdminPass#1',
        confirm_password: 'AdminPass#2',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = zodErrorsToFieldErrors(result.error);
        expect(errors.confirm_password).toBe('Passwords do not match');
      }
    });

    it('rejects missing reset token', () => {
      const result = resetPasswordSchema.safeParse({
        token: '',
        password: 'AdminPass#1',
        confirm_password: 'AdminPass#1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validPayload = {
      full_name: 'HRSJM New Member',
      email: 'newmember@hrsjm.org',
      mobile_number: '9888880002',
      password: 'MemberPass#1',
      confirm_password: 'MemberPass#1',
      accepts_terms: true as const,
    };

    it('accepts a complete valid payload', () => {
      expect(registerSchema.safeParse(validPayload).success).toBe(true);
    });

    it('rejects names shorter than 2 chars (RegisterDto MinLength)', () => {
      expect(
        registerSchema.safeParse({ ...validPayload, full_name: 'A' }).success,
      ).toBe(false);
    });

    it('rejects invalid emails', () => {
      expect(
        registerSchema.safeParse({ ...validPayload, email: 'not-an-email' })
          .success,
      ).toBe(false);
    });

    it('rejects mobile numbers that are not 10 digits', () => {
      expect(
        registerSchema.safeParse({ ...validPayload, mobile_number: '98888800' })
          .success,
      ).toBe(false);
      expect(
        registerSchema.safeParse({ ...validPayload, mobile_number: '988888000X' })
          .success,
      ).toBe(false);
    });

    it('enforces the strength checklist from the design (upper, lower, digit)', () => {
      expect(
        registerSchema.safeParse({ ...validPayload, password: 'memberpass1' })
          .success,
      ).toBe(false);
      expect(
        registerSchema.safeParse({ ...validPayload, password: 'MEMBERPASS1' })
          .success,
      ).toBe(false);
      expect(
        registerSchema.safeParse({ ...validPayload, password: 'MemberPass' })
          .success,
      ).toBe(false);
    });

    it('rejects mismatched confirm_password', () => {
      expect(
        registerSchema.safeParse({
          ...validPayload,
          confirm_password: 'MemberPass#2',
        }).success,
      ).toBe(false);
    });

    it('requires acceptance of the Terms & Conditions', () => {
      expect(
        registerSchema.safeParse({ ...validPayload, accepts_terms: false })
          .success,
      ).toBe(false);
    });

    it('maps account types to backend public roles', () => {
      const roleByName = Object.fromEntries(
        ACCOUNT_TYPE_OPTIONS.map(o => [o.key, o.role_name]),
      );
      // General User and Member share the backend MEMBER role; ADMIN is never
      // offered for self-registration (backend allowlist).
      expect(roleByName.GENERAL_USER).toBeUndefined();
      expect(roleByName.MEMBER).toBe('MEMBER');
      expect(roleByName.DONATION_SEEKER).toBe('DONATION_SEEKER');
      expect(roleByName.ORGANISATION).toBe('DONOR');
    });
  });

  describe('zodErrorsToFieldErrors', () => {
    it('maps the first message per field', () => {
      const result = resetPasswordSchema.safeParse({
        token: '',
        password: 'x',
        confirm_password: 'y',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = zodErrorsToFieldErrors(result.error);
        expect(errors.token).toBeDefined();
        expect(errors.password).toBe('Password must be at least 8 characters');
        expect(errors.confirm_password).toBeDefined();
      }
    });
  });
});