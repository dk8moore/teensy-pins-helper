import { ValidationErrorTypes } from './types';

/**
 * Validates if all single-pin requirements are assigned to peripherals
 * @param {Array} requirements - List of requirements to validate
 * @returns {Array} List of validation errors
 */
export function validateSinglePinMissingPeripherals(requirements) {
  const errors = [];

  requirements
    .filter(req => req.type === 'single-pin')
    .forEach(req => {
      if (!req.peripheral) {
        errors.push({
          type: ValidationErrorTypes.SINGLE_PIN_MISSING_PERIPHERAL,
          message: `Single-pin requirement for Pin ${req.number} is not assigned to a peripheral`,
          details: {
            requirementId: req.id
          }
        });
      }
    });

  return errors;
}

/**
 * Validates if there are any conflicts between single-pin requirements
 * @param {Array} requirements - List of requirements to validate
 * @returns {Array} List of validation errors
 */
export function validateSinglePinConflicts(requirements) {
  const errors = [];
  const pinAssignments = new Map();

  // Check only single-pin requirements
  requirements
    .filter(req => req.type === 'single-pin')
    .forEach(req => {
      if (pinAssignments.has(req.pin)) {
        errors.push({
          type: ValidationErrorTypes.SINGLE_PIN_CONFLICT,
          message: `Pin ${req.number} (${req.pin}) is assigned to multiple requirements`,
          details: {
            pin: req.pin,
            conflictingRequirements: [
              pinAssignments.get(req.pin).id,
              req.id
            ]
          }
        });
      } else {
        pinAssignments.set(req.pin, req);
      }
    });

  return errors;
}

/**
 * Validates if resource limits (ports or pins) are exceeded
 * @param {Array} requirements - List of requirements to validate
 * @param {Object} capabilityDetails - Capability details for the board model
 * @returns {Array} List of validation errors
 */
export function validateAllocationLimits(requirements, capabilityDetails) {
  const errors = [];
  const resourceCounts = {
    port: new Map(),
    pin: new Map()
  };

  requirements.forEach(req => {
    const key = req?.peripheral;
    if (!key || req.type === 'single-pin') return;

    const allocation = capabilityDetails[key]?.allocation;
    if (!allocation || !['port', 'pin'].includes(allocation)) return;

    const currentCount = resourceCounts[allocation].get(key) || 0;
    const newCount = currentCount + req.count;
    const maxResources = capabilityDetails[key]?.max;

    if (newCount > maxResources) {
      const errorType = allocation === 'port' 
        ? ValidationErrorTypes.PORT_LIMIT_EXCEEDED 
        : ValidationErrorTypes.PIN_LIMIT_EXCEEDED;

      const resourceLabel = allocation === 'port' ? 'ports' : 'pins';
      
      const existingError = errors.find(error => 
        error.details.peripheral === key && error.type === errorType
      );

      if (existingError) {
        existingError.details.requested = newCount;
      } else {
        errors.push({
          type: errorType,
          message: `Maximum number of ${capabilityDetails[key]?.label} ${resourceLabel} (${maxResources}) exceeded`,
          details: {
            peripheral: key,
            requested: newCount,
            maximum: maxResources
          }
        });
      }
    }

    resourceCounts[allocation].set(key, newCount);
  });

  return errors;
}

/**
 * Main validation function that checks all early-detectable conflicts
 * @param {Array} requirements - List of requirements to validate
 * @param {Object} capabilityDetails - Capability details for the board model
 * @returns {Array} List of all validation errors
 */
export function validateAllRequirements(requirements, capabilityDetails) {
  const errors = [
    ...validateSinglePinMissingPeripherals(requirements),
    ...validateSinglePinConflicts(requirements),
    ...validateAllocationLimits(requirements, capabilityDetails)
  ];

  return errors;
}
