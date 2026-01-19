/**
 * Generates a unique complaint ID in the format: CMP-YYYY-XXXXXX
 * Example: CMP-2026-000123
 */
export function generateComplaintId(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequenceNumber).padStart(6, '0');
  return `CMP-${year}-${paddedSequence}`;
}

/**
 * Extracts the sequence number from a complaint ID
 */
export function extractSequenceFromComplaintId(complaintId: string): number {
  const parts = complaintId.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid complaint ID format');
  }
  return parseInt(parts[2], 10);
}
