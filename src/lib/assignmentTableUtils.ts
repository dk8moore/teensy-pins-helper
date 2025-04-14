import {
  Requirement,
  CapabilityDetail,
  Pin,
  TableGroup,
  PeripheralInterface,
  DigitalInterface,
} from "@/types";

// Organize data for table rendering
export function prepareTableData(
  requirements: Requirement[],
  capabilityDetails: Record<string, CapabilityDetail>,
  getPinInfo: (pinId: string) => Pin | undefined,
  getPinRole: (
    pinId: string,
    requirement: Requirement
  ) => string | DigitalInterface
): TableGroup[] {
  // First organize by requirement type (single pin, digital, analog, etc.)
  const tableGroups: Record<string, TableGroup> = {};

  // Special handling for single pins (always first)
  tableGroups["Single Pins"] = {
    type: "Single Pins",
    groupId: "single-pins",
    rowSpan: 0,
    color: { bg: "#000", text: "#fff" },
    rows: [],
  };

  // Process requirements and organize them
  requirements.forEach((requirement) => {
    if (!requirement.assignedBlocks || requirement.assignedBlocks.length === 0)
      return;

    if (requirement.type === "single-pin") {
      // Handle single pin requirements
      const singlePinId = requirement.assignedBlocks![0].pinIds[0];
      const pin = getPinInfo(singlePinId);
      if (!pin) return;
      const role = getPinRole(singlePinId, requirement);
      tableGroups["Single Pins"].rows.push({
        pinIds: [singlePinId], // Store ID
        pinNumbers: pin.number.toString(),
        functions: [
          {
            text: role.toString(),
            color: capabilityDetails[requirement.capability]?.color || {
              bg: "#ccc",
              text: "#000",
            },
          },
        ],
      });
      tableGroups["Single Pins"].rowSpan =
        tableGroups["Single Pins"].rows.length;
    } else {
      // Handle peripheral requirements
      if (
        capabilityDetails[requirement.capability]?.allocation === "port" ||
        (requirement.capability === "digital" &&
          requirement.gpioPort &&
          requirement.gpioPort !== "R")
      ) {
        requirement.assignedBlocks!.forEach((block) => {
          if (!tableGroups[requirement.id]) {
            tableGroups[requirement.id] = {
              type:
                capabilityDetails[requirement.capability]?.label ||
                requirement.id,
              groupId: requirement.id,
              rowSpan: 1, // Each block gets its own row
              color: capabilityDetails[requirement.capability]?.color || {
                bg: "#ccc",
                text: "#000",
              },
              rows: [],
            };
          }

          // Build the functions and pin numbers
          const pinNumbers = block.pinIds
            .map((pinId) => {
              const pin = getPinInfo(pinId);
              return pin?.number ?? "?"; // Use nullish coalescing
            })
            .join(", ");

          const functions = block.pinIds.map((pinId) => {
            return {
              text: getPinRole(pinId, requirement).toString(),
              color: capabilityDetails[requirement.capability]?.color || {
                bg: "#ccc",
                text: "#000",
              },
            };
          });

          let portNum: number | undefined = undefined;
          if (requirement.capability !== "digital") {
            const pinPorts = block.pinIds
              .map((pinId) => {
                const pin = getPinInfo(pinId);
                const pinPeripheral = pin?.interfaces?.[
                  requirement.capability
                ] as PeripheralInterface | undefined;
                return pinPeripheral?.port;
              })
              .filter((p): p is number => p !== undefined); // Filter out undefined
            portNum = pinPorts.length > 0 ? pinPorts[0] : undefined;
          } else {
            const pinPorts = block.pinIds
              .map((pinId) => {
                const pin = getPinInfo(pinId);
                const pinDigitalPeripheral = pin?.interfaces?.[
                  requirement.capability
                ] as DigitalInterface | undefined;
                return pinDigitalPeripheral?.gpio?.port;
              })
              .filter((p): p is number => p !== undefined);
            portNum = pinPorts.length > 0 ? pinPorts[0] : undefined;
          }

          tableGroups[requirement.id].rows.push({
            port: portNum,
            pinIds: block.pinIds, // Store IDs
            pinNumbers,
            functions,
          });
        });

        if (tableGroups[requirement.id]) {
          tableGroups[requirement.id].rowSpan =
            tableGroups[requirement.id].rows.length;
        }
      } else {
        // For non-port based peripherals like Analog, PWM, Digital (GPIO R)
        if (!tableGroups[requirement.id]) {
          tableGroups[requirement.id] = {
            type:
              capabilityDetails[requirement.capability]?.label ||
              requirement.id,
            groupId: requirement.id,
            rowSpan: 0,
            color: capabilityDetails[requirement.capability]?.color || {
              bg: "#ccc",
              text: "#000",
            },
            rows: [],
          };
        }

        // Each pin gets its own row for these requirement types
        requirement.assignedBlocks!.forEach((block) => {
          if (!block.pinIds || block.pinIds.length === 0) return;
          const pinId = block.pinIds[0];
          const pin = getPinInfo(pinId);
          if (!pin) return;

          const role = getPinRole(pinId, requirement);
          tableGroups[requirement.id].rows.push({
            pinIds: [pinId], // Store ID
            pinNumbers: pin.number.toString(),
            functions: [
              {
                text: role.toString(),
                color: capabilityDetails[requirement.capability]?.color || {
                  bg: "#ccc",
                  text: "#000",
                },
              },
            ],
          });
        });
        if (tableGroups[requirement.id]) {
          tableGroups[requirement.id].rowSpan =
            tableGroups[requirement.id].rows.length;
        }
      }
    }
  });

  // Order categories for display
  const orderedGroups: TableGroup[] = [];

  // Single Pins always first
  if (
    tableGroups["Single Pins"] &&
    tableGroups["Single Pins"].rows.length > 0
  ) {
    orderedGroups.push(tableGroups["Single Pins"]);
  }
  delete tableGroups["Single Pins"]; // Remove it regardless of whether it was added

  // Add other peripherals in a consistent order based on capability details order if possible
  const capabilityOrder = Object.keys(capabilityDetails);
  capabilityOrder.forEach((capKey) => {
    const groupKey = Object.keys(tableGroups).find(
      (key) => tableGroups[key]?.groupId === capKey
    );
    if (groupKey && tableGroups[groupKey]?.rows.length > 0) {
      orderedGroups.push(tableGroups[groupKey]);
      delete tableGroups[groupKey];
    }
  });

  // Add any remaining groups (should ideally not happen with the above logic)
  Object.values(tableGroups).forEach((group) => {
    if (group.rows.length > 0) {
      orderedGroups.push(group);
    }
  });

  return orderedGroups;
}
