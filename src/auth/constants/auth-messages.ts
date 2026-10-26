export const AUTH_ERROR_MESSAGES = {
  AUTH: {
    EMAIL_IN_USE: 'Email is in use',
    PHONE_IN_USE: 'Number is in use',
    INVALID_CREDENTIALS: 'Invalid Credentials',
  },
} as const;
export const AUTH_SUCCESS_MESSAGES = {
  AUTH: {
    REGISTERED: 'Registration finished successfully',
    LOGIN: 'User Has logged in successfully',
  },
} as const;

export const AUTH_STAFF_MESSAGES = {
  AUTH: {
    REGISTRATION: 'New staff member created successfully',
  },
} as const;
