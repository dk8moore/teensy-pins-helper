/**
 * @typedef {Object} ValidationError
 * @property {string} type - The type of validation error
 * @property {string} message - User-friendly error message
 * @property {Object} details - Additional error details
 */

/**
 * @typedef {Object} PinAssignment
 * @property {'peripheral'|'single'} type - Type of assignment
 * @property {string} mode - Mode of operation (spi, i2c, etc.)
 * @property {string} requirementId - ID of the requirement this assignment fulfills
 */

export const ValidationErrorTypes = {
  SINGLE_PIN_CONFLICT: 'SINGLE_PIN_CONFLICT',
  SINGLE_PIN_MISSING_PERIPHERAL: 'SINGLE_PIN_MISSING_PERIPHERAL',
  PORT_LIMIT_EXCEEDED: 'PORT_LIMIT_EXCEEDED',
  PIN_LIMIT_EXCEEDED: 'PIN_LIMIT_EXCEEDED',
  INVALID_REQUIREMENT: 'INVALID_REQUIREMENT'
};