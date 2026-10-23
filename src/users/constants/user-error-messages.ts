export const ERROR_MESSAGES = {
  USER: {
    NOT_FOUND: 'User does not exist',
    EMAIL_IN_USE: 'Email already in use',
    PHONE_IN_USE: 'Phone number already in use',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_OTP: 'Invalid or expired verification code',
  },
} as const;

export const SUCCESS_MESSAGES = {
  USER: {
    CREATED: 'User has been created',
    UPDATED: 'User has been updated successfully',
    DELETED: 'User has been deleted successfully',
  },
} as const;
