import {
  Requirement,
  ValidationError,
  ValidationErrorType,
  CapabilityDetail,
} from "@/types";

/**
 * Validates if all single-pin requirements are assigned to peripherals
 * @param {Array} requirements - List of requirements to validate
 * @returns {Array} List of validation errors
 */
export function validateSinglePinMissingPeripherals(
  requirements: Requirement[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  requirements
    .filter((req) => req.type === "single-pin")
    .forEach((req) => {
      if (!req.peripheral) {
        errors.push({
          type: ValidationErrorType.SINGLE_PIN_MISSING_PERIPHERAL,
          message: `Single-pin requirement for Pin ${req.number} is not assigned to a peripheral`,
          details: {
            requirementId: req.id,
          },
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
export function validateSinglePinConflicts(
  requirements: Requirement[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const pinAssignments = new Map<string, Requirement>();

  // Check only single-pin requirements
  requirements
    .filter((req) => req.type === "single-pin")
    .forEach((req) => {
      if (pinAssignments.has(req.pin)) {
        const conflictingReq = pinAssignments.get(req.pin);
        if (conflictingReq) {
          errors.push({
            type: ValidationErrorType.SINGLE_PIN_CONFLICT,
            message: `Pin ${req.number} (${req.pin}) is assigned to multiple requirements`,
            details: {
              pin: req.pin,
              conflictingRequirements: [conflictingReq.id, req.id],
            },
          });
        }
      } else {
        pinAssignments.set(req.pin, req);
      }
    });

  return errors;
}

/**
 * Validates if resource limits (ports or pins) are exceeded if peripheral is not digital
 * @param {Array} requirements - List of requirements to validate
 * @param {Object} capabilityDetails - Capability details for the board model
 * @returns {Array} List of validation errors
 */
export function validateAllocationLimitsWithoutDigital(
  requirements: Requirement[],
  capabilityDetails: Record<string, CapabilityDetail>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const resourceCounts = {
    port: new Map<string, number>(),
    pin: new Map<string, number>(),
  };

  requirements.forEach((req) => {
    const key = req?.peripheral;
    if (!key || req.type === "single-pin" || key === "digital") return;

    const allocation = capabilityDetails[key]?.allocation;
    if (!allocation || !["port", "pin"].includes(allocation)) return;

    const currentCount =
      resourceCounts[allocation as "port" | "pin"].get(key) || 0;
    const newCount = currentCount + req.count;
    const maxResources = capabilityDetails[key]?.max || 0;

    if (newCount > maxResources) {
      const errorType =
        allocation === "port"
          ? ValidationErrorType.PORT_LIMIT_EXCEEDED
          : ValidationErrorType.PIN_LIMIT_EXCEEDED;

      const resourceLabel = allocation === "port" ? "ports" : "pins";

      const existingError = errors.find(
        (error) => error.details.peripheral === key && error.type === errorType
      );

      if (existingError && existingError.details.requested !== undefined) {
        existingError.details.requested = newCount;
      } else {
        errors.push({
          type: errorType,
          message: `Maximum number of ${capabilityDetails[key]?.label} ${resourceLabel} (${maxResources}) exceeded`,
          details: {
            peripheral: key,
            requested: newCount,
            maximum: maxResources,
          },
        });
      }
    }

    resourceCounts[allocation as "port" | "pin"].set(key, newCount);
  });

  return errors;
}

/**
 * Validates if pin limits for digital peripheral are exceeded (takes in consideration gpio ports)
 * @param {Array} requirements - List of requirements to validate
 * @param {Object} capabilityDetails - Capability details for the board model
 * @returns {Array} List of validation errors
 */
export function validateAllocationLimitsDigital(
  requirements: Requirement[],
  capabilityDetails: Record<string, CapabilityDetail>
): ValidationError[] {
  const errors: ValidationError[] = [];
  let resourceCounts: Map<string, number> = new Map();
  let totalPins = 0;
  const maxPins = capabilityDetails["digital"]?.max || 0;

  requirements.forEach((req) => {
    const key = req?.peripheral;
    if (!key || key !== "digital") return;

    totalPins += req.count;
    const maxResources =
      capabilityDetails[key]?.gpioPinCount[req.gpioPort!] || 0;

    if (!["A", "R"].includes(req.gpioPort!)) {
      const currentCount = resourceCounts.get(req.gpioPort!) || 0;
      const newCount = currentCount + req.count;

      if (newCount > maxResources) {
        const errorType = ValidationErrorType.GPIO_PIN_LIMIT_EXCEEDED;

        const existingError = errors.find(
          (error) =>
            error.details.peripheral === key &&
            error.details.gpioPort === req.gpioPort &&
            error.type === errorType
        );

        if (existingError && existingError.details.requested !== undefined) {
          existingError.details.requested = newCount;
        } else {
          errors.push({
            type: errorType,
            message: `Maximum number of ${capabilityDetails[key]?.label} GPIO ${req.gpioPort} pins (${maxResources}) exceeded`,
            details: {
              peripheral: key,
              gpioPort: req.gpioPort,
              requested: newCount,
              maximum: maxResources,
            },
          });
        }
      }
      resourceCounts.set(req.gpioPort!, newCount);
    }

    if (totalPins > capabilityDetails["digital"]?.max!) {
      const errorType = ValidationErrorType.PIN_LIMIT_EXCEEDED;

      const existingError = errors.find(
        (error) => error.details.peripheral === key && error.type === errorType
      );

      if (existingError && existingError.details.requested !== undefined) {
        existingError.details.requested = totalPins;
      } else {
        errors.push({
          type: errorType,
          message: `Maximum number of ${capabilityDetails[key]?.label} pins (${maxPins}) exceeded`,
          details: {
            peripheral: key,
            requested: totalPins,
            maximum: capabilityDetails["digital"]?.max!,
          },
        });
      }
    }
  });

  return errors;
}

/**
 * Main validation function that checks all early-detectable conflicts
 * @param {Array} requirements - List of requirements to validate
 * @param {Object} capabilityDetails - Capability details for the board model
 * @returns {Array} List of all validation errors
 */
export function validateAllRequirements(
  requirements: Requirement[],
  capabilityDetails: Record<string, CapabilityDetail>
): ValidationError[] {
  const errors: ValidationError[] = [
    ...validateSinglePinMissingPeripherals(requirements),
    ...validateSinglePinConflicts(requirements),
    ...validateAllocationLimitsWithoutDigital(requirements, capabilityDetails),
    ...validateAllocationLimitsDigital(requirements, capabilityDetails),
  ];

  return errors;
}
