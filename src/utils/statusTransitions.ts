import { COMPLAINT_STATUS, ComplaintStatus, UserRole, USER_ROLES } from './constants';

/**
 * Defines allowed status transitions based on user role
 */
export const STATUS_TRANSITIONS: Record<UserRole, Record<ComplaintStatus, ComplaintStatus[]>> = {
  [USER_ROLES.CITIZEN]: {
    [COMPLAINT_STATUS.NEW]: [],
    [COMPLAINT_STATUS.ASSIGNED]: [],
    [COMPLAINT_STATUS.IN_PROGRESS]: [],
    [COMPLAINT_STATUS.RESOLVED]: [COMPLAINT_STATUS.CLOSED],
    [COMPLAINT_STATUS.CLOSED]: [],
    [COMPLAINT_STATUS.REJECTED]: [],
  },
  [USER_ROLES.OFFICER]: {
    [COMPLAINT_STATUS.NEW]: [],
    [COMPLAINT_STATUS.ASSIGNED]: [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.REJECTED],
    [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.ASSIGNED],
    [COMPLAINT_STATUS.RESOLVED]: [],
    [COMPLAINT_STATUS.CLOSED]: [],
    [COMPLAINT_STATUS.REJECTED]: [],
  },
  [USER_ROLES.ADMIN]: {
    [COMPLAINT_STATUS.NEW]: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.REJECTED],
    [COMPLAINT_STATUS.ASSIGNED]: [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.NEW, COMPLAINT_STATUS.REJECTED],
    [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.ASSIGNED],
    [COMPLAINT_STATUS.RESOLVED]: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.IN_PROGRESS],
    [COMPLAINT_STATUS.CLOSED]: [],
    [COMPLAINT_STATUS.REJECTED]: [COMPLAINT_STATUS.NEW],
  },
};

/**
 * Check if a status transition is allowed for a given role
 */
export function canTransitionStatus(
  role: UserRole,
  currentStatus: ComplaintStatus,
  newStatus: ComplaintStatus
): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[role]?.[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * Get allowed next statuses for a given role and current status
 */
export function getAllowedNextStatuses(
  role: UserRole,
  currentStatus: ComplaintStatus
): ComplaintStatus[] {
  return STATUS_TRANSITIONS[role]?.[currentStatus] || [];
}
