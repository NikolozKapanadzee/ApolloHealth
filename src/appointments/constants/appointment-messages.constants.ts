export const APPOINTMENT_ERROR_MESSAGES = {
  APPOINTMENT: {
    NOT_FOUND: 'Appointment does not exist',
    DOCTOR_NOT_FOUND: 'Doctor does not exist',
    PATIENT_NOT_FOUND: 'Patient does not exist',
    INVALID_PATIENT_ROLE: 'Selected user is not a patient',
    PATIENT_ID_REQUIRED: 'patientId is required when booking for another user',
    SCHEDULED_IN_PAST: 'Appointment must be scheduled in the future',
    SLOT_TAKEN: 'This time slot is already booked for the doctor',
    NOT_SCHEDULED: 'Only scheduled appointments can be modified this way',
    INVALID_STATUS_TRANSITION: 'Invalid appointment status change',
  },
} as const;

export const APPOINTMENT_SUCCESS_MESSAGES = {
  APPOINTMENT: {
    CREATED: 'Appointment has been scheduled successfully',
    UPDATED: 'Appointment has been updated successfully',
    CANCELLED: 'Appointment has been cancelled successfully',
  },
} as const;
