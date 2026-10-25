export const USER_ERROR_MESSAGES = {
  USER: {
    NOT_FOUND: 'User does not exist',
  },
} as const;

export const USER_SUCCESS_MESSAGES = {
  USER: {
    CREATED: 'User has been created',
    UPDATED: 'User has been updated successfully',
    DELETED: 'User has been deleted successfully',
  },
} as const;
