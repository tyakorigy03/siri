
// src/utils/generateId.js - Generate Readable Transaction IDs
/**
 * Generate readable IDs in format: PREFIX-TIMESTAMP-SEQUENCE
 * Example: SAL-123456-0001, PO-789012-0023
 * 
 * @param {string} prefix - ID prefix (e.g., 'SAL', 'PO', 'PI')
 * @param {number} sequence - Sequential number
 * @returns {string} Generated ID
 */
function generateId(prefix, sequence = 1) {
  const timestamp = Date.now().toString().slice(-6);
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${paddedSequence}`;
}

/**
 * Generate sale number in format: SAL-YYYY-NNNN
 * @param {number} sequence - Sequential number for the year
 * @returns {string} Sale number
 */
function generateSaleNumber(sequence) {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `SAL-${year}-${paddedSequence}`;
}

/**
 * Generate invoice number in format: INV-YYYY-NNNN
 * @param {number} sequence - Sequential number for the year
 * @returns {string} Invoice number
 */
function generateInvoiceNumber(sequence) {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `INV-${year}-${paddedSequence}`;
}

/**
 * Generate tracking number for deliveries
 * @param {number} sequence - Sequential number
 * @returns {string} Tracking number
 */
function generateTrackingNumber(sequence) {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `TRK-${year}-${paddedSequence}`;
}

/**
 * Generate employee number
 * @param {number} sequence - Sequential number
 * @returns {string} Employee number
 */
function generateEmployeeNumber(sequence) {
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `EMP-${paddedSequence}`;
}

module.exports = {
  generateId,
  generateSaleNumber,
  generateInvoiceNumber,
  generateTrackingNumber,
  generateEmployeeNumber
};