import { VALIDATION_RULES, useFormValidation } from '@/composables/useFormValidation';
import { beforeEach, describe, expect, it } from 'vitest';

interface FormData extends Record<string, unknown> {
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
}

describe('useFormValidation', () => {
  let formData: FormData;
  let validation: ReturnType<typeof useFormValidation<FormData>>;

  beforeEach(() => {
    formData = {
      email: '',
      password: '',
      username: '',
      confirmPassword: '',
    };
  });

  describe('Email Validation', () => {
    it('validates correct email format', () => {
      validation = useFormValidation(formData, {
        email: VALIDATION_RULES.email,
      });

      validation.formData.email = 'test@example.com';
      validation.validateForm();

      const emailState = validation.validationState.email;
      expect(emailState?.error).toBe(null);
      expect(validation.isFormValid.value).toBe(true);
    });

    it('shows error for invalid email format', () => {
      validation = useFormValidation(formData, {
        email: VALIDATION_RULES.email,
      });

      validation.formData.email = 'invalid-email';
      validation.validateForm();

      const emailState = validation.validationState.email;
      expect(emailState?.error).toBe('Please enter a valid email address');
      expect(validation.isFormValid.value).toBe(false);
    });

    it('shows error for empty email', () => {
      validation = useFormValidation(formData, {
        email: VALIDATION_RULES.email,
      });

      validation.formData.email = '';
      validation.validateForm();

      const emailState = validation.validationState.email;
      expect(emailState?.error).toBe('Email is required');
      expect(validation.isFormValid.value).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('validates strong password', () => {
      validation = useFormValidation(formData, {
        password: VALIDATION_RULES.password,
      });

      validation.formData.password = 'StrongPass123!';
      validation.validateForm();

      const passwordState = validation.validationState.password;
      expect(passwordState?.error).toBe(null);
      expect(validation.isFormValid.value).toBe(true);
    });

    it('shows error for weak password', () => {
      validation = useFormValidation(formData, {
        password: VALIDATION_RULES.password,
      });

      validation.formData.password = 'weak';
      validation.validateForm();

      const passwordState = validation.validationState.password;
      expect(passwordState?.error).toBe('Password must be at least 8 characters');
      expect(validation.isFormValid.value).toBe(false);
    });
  });

  describe('Username Validation', () => {
    it('validates correct username format', () => {
      validation = useFormValidation(formData, {
        username: VALIDATION_RULES.username,
      });

      validation.formData.username = 'valid_username123';
      validation.validateForm();

      const usernameState = validation.validationState.username;
      expect(usernameState?.error).toBe(null);
      expect(validation.isFormValid.value).toBe(true);
    });

    it('shows error for username with special characters', () => {
      validation = useFormValidation(formData, {
        username: VALIDATION_RULES.username,
      });

      validation.formData.username = 'user@name';
      validation.validateForm();

      const usernameState = validation.validationState.username;
      expect(usernameState?.error).toBe('Username format is invalid');
      expect(validation.isFormValid.value).toBe(false);
    });

    it('shows error for short username', () => {
      validation = useFormValidation(formData, {
        username: VALIDATION_RULES.username,
      });

      validation.formData.username = 'ab';
      validation.validateForm();

      const usernameState = validation.validationState.username;
      expect(usernameState?.error).toBe('Username must be at least 3 characters');
      expect(validation.isFormValid.value).toBe(false);
    });

    it('shows error for long username', () => {
      validation = useFormValidation(formData, {
        username: VALIDATION_RULES.username,
      });

      validation.formData.username = 'a'.repeat(21);
      validation.validateForm();

      const usernameState = validation.validationState.username;
      expect(usernameState?.error).toBe('Username must be no more than 20 characters');
      expect(validation.isFormValid.value).toBe(false);
    });
  });

  describe('Confirm Password Validation', () => {
    it('validates matching passwords', () => {
      validation = useFormValidation(formData, {
        password: VALIDATION_RULES.password,
        confirmPassword: VALIDATION_RULES.confirmPassword,
      });

      validation.formData.password = 'StrongPass123!';
      validation.formData.confirmPassword = 'StrongPass123!';
      validation.validateForm();

      const confirmPasswordState = validation.validationState.confirmPassword;
      expect(confirmPasswordState?.error).toBe(null);
      expect(validation.isFormValid.value).toBe(true);
    });

    it('shows error for non-matching passwords', () => {
      validation = useFormValidation(formData, {
        password: VALIDATION_RULES.password,
        confirmPassword: VALIDATION_RULES.confirmPassword,
      });

      validation.formData.password = 'StrongPass123!';
      validation.formData.confirmPassword = 'DifferentPass123!';
      validation.validateForm();

      const confirmPasswordState = validation.validationState.confirmPassword;
      expect(confirmPasswordState?.error).toBe('Passwords do not match');
      expect(validation.isFormValid.value).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('validates entire form', () => {
      validation = useFormValidation(formData, {
        email: VALIDATION_RULES.email,
        password: VALIDATION_RULES.password,
        username: VALIDATION_RULES.username,
        confirmPassword: VALIDATION_RULES.confirmPassword,
      });

      validation.formData.email = 'test@example.com';
      validation.formData.password = 'StrongPass123!';
      validation.formData.username = 'testuser';
      validation.formData.confirmPassword = 'StrongPass123!';

      const isValid = validation.validateForm();

      expect(isValid).toBe(true);
      expect(validation.validationState.email?.error).toBe(null);
      expect(validation.validationState.password?.error).toBe(null);
      expect(validation.validationState.username?.error).toBe(null);
      expect(validation.validationState.confirmPassword?.error).toBe(null);
    });

    it('returns false for invalid form', () => {
      validation = useFormValidation(formData, {
        email: VALIDATION_RULES.email,
        password: VALIDATION_RULES.password,
        username: VALIDATION_RULES.username,
        confirmPassword: VALIDATION_RULES.confirmPassword,
      });

      validation.formData.email = 'invalid-email';
      validation.formData.password = 'weak';
      validation.formData.username = 'ab';
      validation.formData.confirmPassword = 'different';

      const isValid = validation.validateForm();

      expect(isValid).toBe(false);
      expect(validation.validationState.email?.error).toBe('Please enter a valid email address');
      expect(validation.validationState.password?.error).toBe(
        'Password must be at least 8 characters'
      );
      expect(validation.validationState.username?.error).toBe(
        'Username must be at least 3 characters'
      );
      expect(validation.validationState.confirmPassword?.error).toBe('Passwords do not match');
    });
  });

  describe('Real-time Validation', () => {
    it('validates on blur', () => {
      validation = useFormValidation(
        formData,
        {
          email: VALIDATION_RULES.email,
        },
        { validateOnBlur: true }
      );

      validation.formData.email = 'invalid-email';
      validation.handleFieldBlur('email');

      expect(validation.validationState.email?.error).toBe('Please enter a valid email address');
    });

    it('validates on input', () => {
      validation = useFormValidation(
        formData,
        {
          email: VALIDATION_RULES.email,
        },
        { validateOnInput: true }
      );

      validation.formData.email = 'test@example.com';
      validation.handleFieldInput('email');

      expect(validation.validationState.email?.error).toBe(null);
    });
  });

  describe('Error Clearing', () => {
    it('clears errors when clearErrors is called', () => {
      validation = useFormValidation(formData, {
        email: VALIDATION_RULES.email,
      });

      validation.formData.email = 'invalid-email';
      validation.validateForm();
      expect(validation.validationState.email?.error).toBe('Please enter a valid email address');

      validation.clearErrors();
      expect(validation.validationState.email?.error).toBe(null);
    });
  });
});
