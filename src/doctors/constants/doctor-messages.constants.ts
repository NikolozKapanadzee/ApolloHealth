export const DOCTOR_ERROR_MESSAGES = {
  DOCTOR: {
    LICENSE_IN_USE: 'License number already in use',
    NOT_FOUND: 'Doctor does not exist',
  },
} as const;

export const DOCTOR_SUCCESS_MESSAGES = {
  DOCTOR: {
    UPDATED: 'Doctor has been updated successfully',
    DELETED: 'Doctor has been deleted successfully',
  },
} as const;
