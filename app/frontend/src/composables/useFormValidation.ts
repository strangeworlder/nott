import { computed, reactive, ref } from 'vue';

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: unknown, formData?: Record<string, unknown>) => string | null;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationState {
  [field: string]: {
    isValid: boolean;
    error: string | null;
    isDirty: boolean;
    isTouched: boolean;
  };
}

export interface FormValidationOptions {
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
  validateOnSubmit?: boolean;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength validation
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Common validation rules
export const VALIDATION_RULES = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: PASSWORD_REGEX,
  },
  loginPassword: {
    required: true,
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  confirmPassword: {
    required: true,
    custom: (value: unknown, formData?: Record<string, unknown>) => {
      const stringValue = value?.toString() || '';
      const password = formData?.password?.toString() || '';
      return stringValue === password ? null : 'Passwords do not match';
    },
  },
} as const;

export function useFormValidation<T extends Record<string, unknown>>(
  initialData: T,
  rules: ValidationRules,
  options: FormValidationOptions = {}
) {
  const { validateOnBlur = true, validateOnInput = false, validateOnSubmit = true } = options;

  // Form data
  const formData = reactive<T>({ ...initialData });

  // Validation state
  const validationState = reactive<ValidationState>({});
  const isFormValid = ref(false);
  const isFormDirty = ref(false);
  const isFormTouched = ref(false);

  // Initialize validation state
  for (const field of Object.keys(rules)) {
    validationState[field] = {
      isValid: true,
      error: null,
      isDirty: false,
      isTouched: false,
    };
  }

  // Validation functions
  const validateField = (field: string, value: unknown): string | null => {
    const rule = rules[field];
    if (!rule) {
      return null;
    }

    // Convert value to string for validation
    const stringValue = value?.toString() || '';

    // Required validation
    if (rule.required && (!value || stringValue.trim() === '')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || stringValue.trim() === '') {
      return null;
    }

    // Email validation
    if (rule.email && !EMAIL_REGEX.test(stringValue)) {
      return 'Please enter a valid email address';
    }

    // Min length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value, formData);
    }

    return null;
  };

  const validateForm = (): boolean => {
    let isValid = true;

    for (const field of Object.keys(rules)) {
      const error = validateField(field, formData[field]);
      const fieldState = validationState[field];
      if (fieldState) {
        fieldState.error = error;
        fieldState.isValid = !error;
      }

      if (error) {
        isValid = false;
      }
    }

    isFormValid.value = isValid;
    return isValid;
  };

  // Update form validity whenever validation state changes
  const updateFormValidity = () => {
    const hasErrors = Object.values(validationState).some((state) => state.error);
    isFormValid.value = !hasErrors;
  };

  // Field event handlers
  const handleFieldBlur = (field: string) => {
    if (validateOnBlur && validationState[field]) {
      const fieldState = validationState[field];
      if (fieldState) {
        fieldState.isTouched = true;
        const error = validateField(field, formData[field]);
        fieldState.error = error;
        fieldState.isValid = !error;
        updateFormValidity();
      }
    }
  };

  const handleFieldInput = (field: string) => {
    const fieldState = validationState[field];
    if (fieldState) {
      fieldState.isDirty = true;
      isFormDirty.value = true;

      if (validateOnInput) {
        const error = validateField(field, formData[field]);
        fieldState.error = error;
        fieldState.isValid = !error;
        updateFormValidity();
      }
    }
  };

  const handleFieldChange = (field: string) => {
    const fieldState = validationState[field];
    if (fieldState) {
      fieldState.isDirty = true;
      isFormDirty.value = true;
    }
  };

  // Form submission
  const handleSubmit = (callback: () => void | Promise<void>) => {
    return async () => {
      if (validateOnSubmit) {
        const isValid = validateForm();
        if (!isValid) {
          return;
        }
      }

      try {
        await callback();
      } catch (error) {
        console.error('Form submission error:', error);
      }
    };
  };

  // Reset form
  const resetForm = () => {
    for (const key of Object.keys(formData)) {
      (formData as Record<string, unknown>)[key] = initialData[key];
    }

    for (const field of Object.keys(validationState)) {
      if (validationState[field]) {
        validationState[field] = {
          isValid: true,
          error: null,
          isDirty: false,
          isTouched: false,
        };
      }
    }

    isFormValid.value = false;
    isFormDirty.value = false;
    isFormTouched.value = false;
  };

  // Clear errors
  const clearErrors = () => {
    for (const field of Object.keys(validationState)) {
      const fieldState = validationState[field];
      if (fieldState) {
        fieldState.error = null;
        fieldState.isValid = true;
      }
    }
    updateFormValidity();
  };

  // Set field error manually
  const setFieldError = (field: string, error: string) => {
    const fieldState = validationState[field];
    if (fieldState) {
      fieldState.error = error;
      fieldState.isValid = false;
      updateFormValidity();
    }
  };

  // Get field props for BaseInput component
  const getFieldProps = (field: string) => {
    return {
      error: validationState[field]?.error || null,
      onBlur: () => handleFieldBlur(field),
      onInput: () => handleFieldInput(field),
      onChange: () => handleFieldChange(field),
    };
  };

  // Computed properties
  const hasErrors = computed(() => {
    return Object.values(validationState).some((state) => state.error);
  });

  const errorCount = computed(() => {
    return Object.values(validationState).filter((state) => state.error).length;
  });

  const touchedFields = computed(() => {
    return Object.keys(validationState).filter(
      (field) => validationState[field]?.isTouched ?? false
    );
  });

  const dirtyFields = computed(() => {
    return Object.keys(validationState).filter((field) => validationState[field]?.isDirty ?? false);
  });

  return {
    // Form data
    formData,

    // Validation state
    validationState,
    isFormValid,
    isFormDirty,
    isFormTouched,

    // Validation functions
    validateField,
    validateForm,

    // Event handlers
    handleFieldBlur,
    handleFieldInput,
    handleFieldChange,
    handleSubmit,

    // Form management
    resetForm,
    clearErrors,
    setFieldError,
    getFieldProps,

    // Computed properties
    hasErrors,
    errorCount,
    touchedFields,
    dirtyFields,
  };
}
