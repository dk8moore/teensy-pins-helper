import {
  Requirement,
  SinglePinRequirement,
  MultiPinRequirement,
  OptimizationResult,
  TeensyModelData,
  AssignableBlock,
  DigitalInterface,
  PeripheralInterface,
  Pin,
  CapabilityDetail,
  Assignment,
} from "@/types";

function buildBlocksForRequirements(
  requirements: MultiPinRequirement[],
  otherRequestedInterfaces: string[],
  assignments: Assignment[],
  modelDataPins: Pin[]
): MultiPinRequirement[] {
  let requirementsWithBlocks: MultiPinRequirement[] = [];
  for (const requirement of requirements) {
    const blocks = buildRequirementAssignableBlocks(
      requirement,
      otherRequestedInterfaces,
      assignments,
      modelDataPins
    );
    requirementsWithBlocks.push({
      ...requirement,
      assignableBlocks: blocks,
    });
  }
  return requirementsWithBlocks;
}

function buildRequirementAssignableBlocks(
  requirement: Requirement,
  otherRequestedInterfaces: string[],
  assignments: Assignment[],
  modelDataPins: Pin[]
): AssignableBlock[] {
  let assignableBlocks: AssignableBlock[] = [];

  switch (requirement.allocation) {
    case "pin":
      {
        // Filter pins that support the required peripheral
        let supportedPins = modelDataPins.filter(
          (pin) =>
            pin.interfaces &&
            typeof pin.interfaces === "object" && // TODO: Not sure about this
            Object.keys(pin.interfaces).includes(requirement.capability)
        );

        // Filter additionally supportedPins on the requested GPIO port
        // TODO: add support for FlexIO
        if (
          requirement.capability === "digital" &&
          !["A", "R"].includes(requirement.gpioPort!)
        ) {
          supportedPins = supportedPins.filter((pin) => {
            if (pin.interfaces && pin.interfaces.digital) {
              const digitalPinContent = pin.interfaces
                .digital as DigitalInterface;
              if (
                digitalPinContent.gpio.port.toString() === requirement.gpioPort
              ) {
                return true;
              }
            }
            return false;
          });
        }

        // Filter pins that are not already assigned
        const availablePins = supportedPins.filter(
          (pin) =>
            !assignments.some((assignment) => {
              return assignment.block.pinIds.includes(pin.id);
            })
        );
        for (const pin of availablePins) {
          // Calculate required peripheral count
          const requiredPeripheralCount = pin.interfaces
            ? otherRequestedInterfaces.filter((iface) =>
                Object.keys(pin.interfaces || {}).includes(iface)
              ).length
            : 0;
          // Calculate total peripheral count
          const totalPeripheralCount = pin.interfaces
            ? Object.keys(pin.interfaces).length
            : 0;

          assignableBlocks.push({
            blockInPeripheralId: pin.number,
            pinIds: [pin.id],
            grouping:
              requirement.gpioPort! === "A"
                ? pin.interfaces?.digital &&
                  typeof pin.interfaces.digital !== "string"
                  ? (pin.interfaces.digital as DigitalInterface).gpio?.port!
                  : false
                : false,
            requiredPeripheralCount,
            totalPeripheralCount,
          });
        }
      }
      break;
    case "port":
      // Filter pins that support the required peripheral
      const supportedPins = modelDataPins.filter(
        (pin) =>
          pin.interfaces &&
          typeof pin.interfaces === "object" && // This should be good because we're searching for port types
          Object.keys(pin.interfaces).includes(requirement.capability)
      );

      const supportedPorts: Record<number, Record<string, string[]>> = {};
      supportedPins.forEach((pin) => {
        if (pin.interfaces && pin.interfaces[requirement.capability]) {
          const interfaceContent = pin.interfaces[requirement.capability];
          if (
            typeof interfaceContent === "object" &&
            "port" in interfaceContent
          ) {
            const peripheralInterface = interfaceContent as PeripheralInterface;
            const port = peripheralInterface.port;

            if (!supportedPorts[port]) {
              supportedPorts[port] = {};
            }

            // Check if the pin is required or if optional pins should be included
            if (
              peripheralInterface.required ||
              requirement.includeOptionalPins
            ) {
              if (!supportedPorts[port][peripheralInterface.name]) {
                supportedPorts[port][peripheralInterface.name] = [];
              }
              supportedPorts[port][peripheralInterface.name].push(pin.id);
            }
          }
        }
      });

      Object.keys(supportedPorts).forEach((portNumber) => {
        let pinCombinations: string[][] = [];
        pinCombinations = createPinCombinations(
          supportedPorts[+portNumber],
          []
        );
        pinCombinations.forEach((combination) => {
          assignableBlocks.push({
            blockInPeripheralId: Number(portNumber),
            pinIds: combination,
            grouping: false,
            requiredPeripheralCount: supportedPins
              .filter((pin) => combination.includes(pin.id))
              .reduce((sum, pin) => {
                if (!pin.interfaces) return sum;
                // Count requested interfaces that the pin supports
                const otherRequiredPeripheralCount =
                  otherRequestedInterfaces.filter((iface) =>
                    Object.keys(pin.interfaces || {}).includes(iface)
                  ).length;
                return sum + otherRequiredPeripheralCount;
              }, 0),
            totalPeripheralCount: supportedPins
              .filter((pin) => combination.includes(pin.id))
              .reduce((sum, pin) => {
                return (
                  sum +
                  (pin.interfaces ? Object.keys(pin.interfaces).length : 0)
                );
              }, 0),
          });
        });
      });
      break;
    default:
      break;
  }

  return assignableBlocks;
}

function createPinCombinations(
  pinFunctions: Record<string, string[]>,
  previousBlock: string[][]
): string[][] {
  let output: string[][] = [];
  if (Object.keys(pinFunctions).length === 0) {
    return previousBlock;
  }
  // Take the first element of the pinFunctions object
  for (const f of pinFunctions[Object.keys(pinFunctions)[0]]) {
    if (previousBlock.length === 0) {
      output.push([f]);
    } else {
      for (const block of previousBlock) {
        let newBlock = [...block];
        newBlock.push(f);
        output.push(newBlock);
      }
    }
  }
  // Copy pinFunctions and remove first element
  let newPinFunctions = { ...pinFunctions };
  delete newPinFunctions[Object.keys(newPinFunctions)[0]];
  return createPinCombinations(newPinFunctions, output);
}

function getRequirementsInterfacesList(requirements: Requirement[]): string[] {
  let interfaces: string[] = [];
  requirements.forEach((requirement) => {
    interfaces.push(requirement.capability);
  });
  return interfaces;
}

function computeRequirementsMetrics(
  requirements: MultiPinRequirement[]
): MultiPinRequirement[] {
  let scoredRequirements: MultiPinRequirement[] = [];

  for (const requirement of requirements) {
    if (requirement.gpioPort === "A") {
      const groups: Record<string | number, AssignableBlock[]> = {};
      requirement.assignableBlocks!.forEach((block) => {
        // The grouping property represents the GPIO port
        const groupKey = block.grouping;
        if (groupKey !== false) {
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(block);
        }
      });
      // 2. Filter out groups that don't have enough pins to satisfy the request
      const validGroups = Object.entries(groups).filter(
        ([_, blocks]) =>
          blocks.length >=
          requirement.count - requirement.assignedBlocks!.length
      );

      if (validGroups.length === 0) {
        // No group has enough pins to satisfy the request
        // Not sure this is going to happen => in theory we should drop the requirement here and now
      }

      const groupsWithMetrics = validGroups.map(([groupKey, blocks]) => {
        const availabilityRatio =
          (requirement.count - requirement.assignedBlocks!.length) /
          blocks.length;
        const groupMetrics = {
          groupKey,
          blocks,
          availabilityRatio,
        };
        return groupMetrics;
      });
      // 4. Sort groups
      groupsWithMetrics.sort((a, b) => {
        if (a.availabilityRatio !== b.availabilityRatio) {
          // Primary rule -> group with lowest availabilityRatio first => higher flexibility for other pins
          return b.availabilityRatio - a.availabilityRatio;
        } else {
          // Secondary rule -> group with highest number of assignable blocks first
          return a.blocks.length - b.blocks.length;
        }
      });
      const bestGroup = groupsWithMetrics[0];
      scoredRequirements.push({
        ...requirement,
        metrics: {
          availabilityRatio: bestGroup.availabilityRatio,
        },
      });
    } else {
      const availabilityRatio =
        (requirement.count - requirement.assignedBlocks!.length) /
        requirement.assignableBlocks!.length;
      scoredRequirements.push({
        ...requirement,
        metrics: {
          availabilityRatio,
        },
      });
    }
  }

  return scoredRequirements;
}

function doAssignmentForSinglePinRequirement(
  requirement: SinglePinRequirement
  // assignments: Assignment[]
  // TODO: Check if the same assignment is already present
) {
  let currentSinglePinAssignment: Assignment;

  currentSinglePinAssignment = {
    requirementId: requirement.id,
    block: {
      blockInPeripheralId: requirement.number,
      pinIds: [requirement.pin],
      grouping: false,
      requiredPeripheralCount: 0,
      totalPeripheralCount: 0,
    } as AssignableBlock,
  };

  return currentSinglePinAssignment;
}

function doSingleAssignmentForMultiPinRequirement(
  requirement: Requirement
): Assignment[] {
  let assignments: Assignment[] = [];
  const assignableBlocks = requirement.assignableBlocks as AssignableBlock[];

  if (!requirement.gpioPort || requirement.gpioPort !== "A") {
    // Normal case (no grouping)
    if (
      requirement.count - requirement.assignedBlocks!.length >
      assignableBlocks.length
    ) {
      // TODO: Throw an error here instead of returning an empty array
      return [];
    }
    // Sort assignableBlocks wrt requiredPeripheralCount and use totalPeripheralCount as tie-breaker; sort decreasing for both
    assignableBlocks.sort((a, b) => {
      if (a.requiredPeripheralCount !== b.requiredPeripheralCount) {
        // Primary rule -> lowest number of other requested interfaces first
        return a.requiredPeripheralCount - b.requiredPeripheralCount;
      } else {
        // Secondary rule -> lowest number of total interfaces first
        return a.totalPeripheralCount - b.totalPeripheralCount;
      }
    });

    assignments.push({
      requirementId: requirement.id,
      block: assignableBlocks[0],
    });
  } else {
    // Grouping case
    // 1. Separate blocks into groups
    const groups: Record<string | number, AssignableBlock[]> = {};
    assignableBlocks.forEach((block) => {
      // The grouping property represents the GPIO port
      const groupKey = block.grouping;
      if (groupKey !== false) {
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(block);
      }
    });
    // 2. Filter out groups that don't have enough pins to satisfy the request
    const validGroups = Object.entries(groups).filter(
      ([_, blocks]) => blocks.length >= requirement.count
    );

    if (validGroups.length === 0) {
      // No group has enough pins to satisfy the request
      return [];
    }
    const scoredGroups = validGroups.map(([groupKey, blocks]) => {
      // Sort blocks within the group using the same logic as the normal case
      blocks.sort((a, b) => {
        if (a.requiredPeripheralCount !== b.requiredPeripheralCount) {
          // Primary rule -> lowest number of other requested interfaces first
          return b.requiredPeripheralCount - a.requiredPeripheralCount;
        } else {
          // Secondary rule -> lowest number of total interfaces first
          return b.totalPeripheralCount - a.totalPeripheralCount;
        }
      });

      // Take the top 'request' blocks that would be assigned
      const topBlocks = blocks.slice(0, requirement.count);

      // Calculate group metrics
      const groupMetrics = {
        groupKey,
        blocks: topBlocks,
        // Sum of required peripheral counts for all pins in the group
        totalRequiredPeripheralCount: topBlocks.reduce(
          (sum, block) => sum + block.requiredPeripheralCount,
          0
        ),
        // Sum of total peripheral counts for all pins in the group
        totalPeripheralCount: topBlocks.reduce(
          (sum, block) => sum + block.totalPeripheralCount,
          0
        ),
      };

      return groupMetrics;
    });
    // 4. Sort groups based on the same metrics as individual pins
    scoredGroups.sort((a, b) => {
      if (a.totalRequiredPeripheralCount !== b.totalRequiredPeripheralCount) {
        // Primary rule -> group with lowest number of other requested interfaces first
        return b.totalRequiredPeripheralCount - a.totalRequiredPeripheralCount;
      } else {
        // Secondary rule -> group with lowest number of total interfaces first
        return b.totalPeripheralCount - a.totalPeripheralCount;
      }
    });
    // 5. Assign pins from the best group
    if (scoredGroups.length > 0) {
      const bestGroup = scoredGroups[0];

      // This is for pin-based assignments => port grouping is not available right now (and it shouldn't happen)
      // TODO: probably we should generalize => this is probably what enables the SIDE constraint in requirements
      for (let i = 0; i < requirement.count; i++) {
        // TODO: this may be wrong => we should probably assign only one block (one pin) but somehow forcing the grouping afterwards
        assignments.push({
          requirementId: requirement.id,
          block: bestGroup.blocks[i],
        });
      }
    }
  }

  return assignments;
}

function updateModelDataPins(
  modelDataPins: Pin[],
  assignment: Assignment,
  capabilityDetails: Record<string, CapabilityDetail>
): Pin[] {
  let updatedPins = JSON.parse(JSON.stringify(modelDataPins)) as Pin[];
  // Remove the assigned pins from the list of available pins
  const pinsToRemove = new Set<string>(assignment.block.pinIds);
  updatedPins = updatedPins.filter((pin) => !pinsToRemove.has(pin.id));

  // Remove other pins CAPABILITIES that are not valid anymore because of the assigned pins being removed
  assignment.block.pinIds.forEach((pinId) => {
    const pin = modelDataPins.find((pin) => pin.id === pinId);
    if (!pin || !pin.interfaces) return;

    Object.keys(pin.interfaces).forEach((iface) => {
      if (capabilityDetails[iface].allocation === "port") {
        const pinIface = pin.interfaces![iface] as PeripheralInterface;
        const pinPort = pinIface.port;
        const pinName = pinIface.name;

        // Search for all the other pins that have the same iface and port
        // Within those, search for pins with the same name => if there are none, remove the port; else keep it
        const otherPins = updatedPins.filter(
          (otherPin) =>
            otherPin.interfaces &&
            Object.keys(otherPin.interfaces).includes(iface) &&
            (otherPin.interfaces[iface] as PeripheralInterface).port === pinPort
        );
        const otherPinsWithSameName = otherPins.filter(
          (otherPin) =>
            otherPin.interfaces &&
            (otherPin.interfaces[iface] as PeripheralInterface).name === pinName
        );
        if (otherPinsWithSameName.length === 0) {
          otherPins.forEach((otherPin) => {
            delete otherPin.interfaces![iface];
          });
        }
      }
    });
  });
  return updatedPins;
}

function checkRequirementFullfillment(
  requirement: Requirement,
  assignments: Assignment[]
): boolean {
  let fulfilled = false;
  const assignedBlocks = assignments
    .filter((assignment) => assignment.requirementId === requirement.id)
    .reduce((acc) => {
      return acc + 1;
    }, 0);
  fulfilled = assignedBlocks === requirement.count;
  return fulfilled;
}

// The main logic should follow this concept:
// 1. Number of required ports wrt total ports of the peripheral should be a factor (If I need to assign all 3 I2C ports but less than the 8 serial ports I will assign the I2C first)
//     a. This means that we should sort the peripherals to assign first the ones with the highest ratio of required/total (since they have less flexibility)
//     b. Among the peripherals with the same ratio, we should assign first the one with the least number of total AssignableBlocks
// 2. This is also valid for the PWM and Analog pins, which are in limited number, but they come later in the priority list wrt peripherals
// 3. Digital pins, which are normally the most flexible, when requested with GPIO port should be treated as peripherals, checking the ratio of required/total pins of the GPIO
//     a. This is valid only for a specific GPIO port requested, but if an "Auto" GPIO port is requested, we should assign it after the peripherals as it has higher flexibility than them
// 4. When choosing what port to assign among the available ones, we should sort for the total number of peripherals that the pins involved in each ports support and assign the one with
//    the least number of it (this is to avoid assigning a port that supports many peripherals, avoiding conflicts) but we should also consider the peripheral we will still need to assign,
//    meaning that if a pin has multiple peripherals but any of them are needed, then the total number of supported peripherals should drop, hence its chance to be assigned should increase
// 5. For peripherals we should also consider the uniqueness of the pins involved, but probably this happens for very few pins and the uniqueness would already be somehow considered in the previous considerations
// 6. Side constraints should be a second order constraint to be checked and used as sorting criteria to break ties between ratios
// Optional pins if requested become required as the other pins of the peripheral so they need to be treated together with the required ones
export function optimizePinAssignment(
  requirements: Requirement[],
  modelData: TeensyModelData,
  capabilityDetails: Record<string, CapabilityDetail>
): OptimizationResult {
  let multiPinRequirements: MultiPinRequirement[] = [];
  let assignedRequirements: Requirement[] = [];
  let currentModelDataPins = [...modelData.pins];
  let assignments: Assignment[] = [];

  // Step 1: Assign single pins requirements
  for (const requirement of requirements) {
    if (requirement.type === "single-pin") {
      const currentAssignment =
        doAssignmentForSinglePinRequirement(requirement);
      requirement!.assignedBlocks!.push(currentAssignment.block);
      assignments.push(currentAssignment);
      assignedRequirements.push(requirement);
      currentModelDataPins = updateModelDataPins(
        currentModelDataPins,
        currentAssignment,
        capabilityDetails
      );
    }
  }
  // No need to check conflicts for fixed assignments as they are always valid => validator has already checked them

  // Step 2: Assign peripheral requirements
  for (const requirement of requirements) {
    if (requirement.type === "peripheral") {
      multiPinRequirements.push(requirement);
    }
  }
  while (multiPinRequirements.length > 0) {
    // One iteration means one requirement resolved => NOT ANYMORE -> one iteration means one assignment for one requirement
    // 0. Compute assignable blocks for each requirement
    multiPinRequirements = buildBlocksForRequirements(
      multiPinRequirements,
      getRequirementsInterfacesList(multiPinRequirements),
      assignments,
      currentModelDataPins
    );

    // 1. Compute/update requirements metrics
    multiPinRequirements = computeRequirementsMetrics(multiPinRequirements);
    // 2. Sort requirements on metrics
    multiPinRequirements.sort((a, b) => {
      if (a.metrics!.availabilityRatio !== b.metrics!.availabilityRatio) {
        // Primary rule -> group with lowest availabilityRatio first => we want to use the last (with pop)
        return a.metrics!.availabilityRatio - b.metrics!.availabilityRatio;
      } else {
        // Secondary rule -> group with highest number of assignable blocks first
        return b.assignableBlocks!.length - a.assignableBlocks!.length;
      }
    });

    // 3. Choose the best requirement to be assigned
    const currentRequirement = multiPinRequirements.at(-1); // Careful that pop() removes the last element of the array (we need to reverse sorting to use this) => kept reverse sorting for now
    const currentAssignments = doSingleAssignmentForMultiPinRequirement(
      currentRequirement!
    );

    if (currentAssignments.length > 0) {
      assignments.push(...currentAssignments);
      for (const assignment of currentAssignments) {
        currentRequirement!.assignedBlocks!.push(assignment.block);
        currentModelDataPins = updateModelDataPins(
          currentModelDataPins,
          assignment,
          capabilityDetails
        );
      }

      // Check if the requirement is fulfilled
      if (checkRequirementFullfillment(currentRequirement!, assignments)) {
        assignedRequirements.push(currentRequirement!);
        // Remove the requirement from the list
        multiPinRequirements.pop();
      }
    } else {
      return {
        success: false,
        assignedRequirements,
        unassignedRequirements: [currentRequirement!, ...multiPinRequirements],
      };
    }
    // Validation here?
  }

  return {
    success: assignedRequirements.length > 0,
    assignedRequirements,
    unassignedRequirements: [],
  };
}
