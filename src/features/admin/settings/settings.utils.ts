// Client-side validation rules for the settings module. Password rules mirror
// the backend's own password constraints (reset-password DTO: min 8, max 72).
// NOTE: the backend does not expose a change-password endpoint yet (reported
// gap) - these validators are wired into the disabled UI so integration is a
// contract-only change once the endpoint ships.

export interface PasswordValidation {
  valid: boolean;
  error: string | null;
}

export function validatePassword(password: string): PasswordValidation {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  if (password.length > 72) {
    return { valid: false, error: 'Password must be at most 72 characters.' };
  }
  return { valid: true, error: null };
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): PasswordValidation {
  if (password !== confirmation) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true, error: null };
}

export interface ProfileEditInput {
  fullName: string;
  email: string;
}

export interface ProfileEditValidation {
  valid: boolean;
  fullNameError: string | null;
  emailError: string | null;
}

export function validateProfileEdit(input: ProfileEditInput): ProfileEditValidation {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const fullNameError =
    fullName.length < 2
      ? 'Name must be at least 2 characters.'
      : fullName.length > 255
        ? 'Name must be at most 255 characters.'
        : null;
  // The backend PATCH /auth/me requires a valid email when one is provided.
  const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Enter a valid email address.'
    : null;
  return {
    valid: fullNameError === null && emailError === null,
    fullNameError,
    emailError,
  };
}
