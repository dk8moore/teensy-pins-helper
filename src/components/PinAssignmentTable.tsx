import React, { useState } from "react";
import {
  TeensyModelData,
  Requirement,
  CapabilityDetail,
  DigitalInterface,
  PeripheralInterface,
} from "@/types";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface PinAssignmentTableProps {
  success: boolean;
  requirements: Requirement[];
  modelData: TeensyModelData;
  capabilityDetails: Record<string, CapabilityDetail>;
  unassignedRequirements?: any[];
  onHoverPins: (pinIds: string[], color: string | null) => void; // Callback for hover
}

// Helper structure to manage table data
interface TableGroup {
  type: string;
  groupId: string; // Requirement ID or "Single Pins"
  rowSpan: number;
  color: { bg: string; text: string };
  rows: {
    pinIds: string[]; // Store IDs directly
    pinNumbers: string; // Keep for display
    port?: number;
    functions: Array<{ text: string; color: { bg: string; text: string } }>;
  }[];
}

const PinAssignmentTable: React.FC<PinAssignmentTableProps> = ({
  success,
  requirements,
  modelData,
  capabilityDetails,
  unassignedRequirements = [],
  onHoverPins, // Receive the callback
}) => {
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);

  // Find the pin information from modelData
  const getPinInfo = (pinId: string) => {
    return modelData.pins.find((pin) => pin.id === pinId);
  };

  // Get the pin role (name) based on the requirement capability
  const getPinRole = (pinId: string, requirement: Requirement) => {
    const pin = getPinInfo(pinId);
    if (!pin || !pin.interfaces || !pin.interfaces[requirement.capability]) {
      return "";
    }

    const interfaceData = pin.interfaces[requirement.capability];
    if (typeof interfaceData === "object" && "name" in interfaceData) {
      return interfaceData.name;
    } else {
      switch (requirement.capability) {
        case "digital":
          const digitalInterfaceData = interfaceData as DigitalInterface;
          return `${digitalInterfaceData.gpio.port}.${digitalInterfaceData.gpio.bit}`;
        case "analog":
        case "pwm":
        case "audio":
          return interfaceData;
        default:
          return "Unknown interface";
      }
    }
  };

  // Organize data for table rendering
  const prepareTableData = () => {
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
      if (
        !requirement.assignedBlocks ||
        requirement.assignedBlocks.length === 0
      )
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
  };

  const handleMouseEnterGroupHeader = (group: TableGroup) => {
    const allPinIds = group.rows.flatMap((row) => row.pinIds);
    setHoveredGroupId(group.groupId); // Indicate the group header is active
    setHoveredRowKey(null); // Ensure no specific row is marked as hovered
    onHoverPins(allPinIds, group.color.bg); // Highlight all pins for the group
  };

  const handleMouseEnterSpecificRow = (
    row: TableGroup["rows"][0],
    group: TableGroup,
    rowKey: string
  ) => {
    setHoveredGroupId(group.groupId); // Still set group ID to highlight the Type cell
    setHoveredRowKey(rowKey); // Set the key for the specifically hovered row
    onHoverPins(row.pinIds, group.color.bg); // Highlight ONLY this row's pins
  };

  const handleMouseLeaveGeneral = () => {
    setHoveredGroupId(null);
    setHoveredRowKey(null);
    onHoverPins([], null);
  };

  const renderTableRows = () => {
    const tableGroups = prepareTableData();
    let rows: JSX.Element[] = [];

    tableGroups.forEach((group) => {
      group.rows.forEach((row, rowIndex) => {
        const isFirstRowInGroup = rowIndex === 0;
        const isLastRowInGroup = rowIndex === group.rows.length - 1;
        const uniqueRowKey = `${group.groupId}-${rowIndex}`;

        // --- Determine Highlight States ---
        // Is the group's header currently being hovered?
        const isGroupHeaderHovered =
          hoveredGroupId === group.groupId && hoveredRowKey === null;
        // Is THIS specific row currently being hovered?
        const isSpecificRowHovered = hoveredRowKey === uniqueRowKey;
        // Is the Type cell associated with this row's group currently needing highlight?
        // (This happens if the header OR any row in the group is hovered)
        const shouldHighlightTypeCell = hoveredGroupId === group.groupId;

        rows.push(
          <TableRow
            className={cn(
              // Base mobile styles
              "block overflow-hidden",
              // --- Conditional Card Grouping Styles ---
              isFirstRowInGroup &&
                "rounded-t-md border-t border-l border-r shadow-sm", // Top of card
              !isFirstRowInGroup && "border-l border-r", // Sides for middle/last
              !isLastRowInGroup && "border-b", // Bottom border for first/middle
              isLastRowInGroup && "rounded-b-md border-b", // Bottom of card
              isLastRowInGroup && "mb-4", // Margin below the group
              // --- End Conditional Card Grouping ---

              isGroupHeaderHovered && "bg-muted", // Muted group highlight
              isSpecificRowHovered && "bg-muted", // Distinct specific row highlight

              "lg:table-row lg:mb-0 lg:border-b lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:rounded-none lg:shadow-none",
              "transition-colors data-[state=selected]:bg-muted"
            )}
            key={uniqueRowKey}
            onMouseEnter={() => {
              handleMouseEnterSpecificRow(row, group, uniqueRowKey);
            }}
            onMouseLeave={handleMouseLeaveGeneral}
          >
            {isFirstRowInGroup ? (
              <TableCell
                style={{
                  borderRight: "1px solid #e5e7eb",
                  cursor: "pointer", // Indicate hoverability
                }}
                onMouseEnter={() => handleMouseEnterGroupHeader(group)}
                onMouseLeave={handleMouseLeaveGeneral} // Keep leave handler here too
                className={cn(
                  // Base mobile styles for first cell
                  "block w-full p-3 font-medium text-left",
                  "bg-muted/50",
                  "border-b",

                  // --- Conditional Card Grouping Styles ---
                  shouldHighlightTypeCell && "bg-muted", // Highlight if group is hovered

                  // --- Desktop Overrides ---
                  "lg:table-cell lg:w-auto lg:text-center lg:align-middle lg:border-b-0 lg:border-r lg:bg-transparent lg:p-4"
                )}
                rowSpan={isFirstRowInGroup ? group.rowSpan : undefined}
              >
                <Badge
                  className="items-center justify-center min-w-[80px] border-0 pointer-events-none" // Prevent badge stealing hover
                  style={{
                    backgroundColor: group.color.bg,
                    color: group.color.text,
                  }}
                >
                  {group.type}
                </Badge>
              </TableCell>
            ) : null}

            <TableCell
              className="block text-right relative pl-[50%] py-2 px-4 border-b lg:table-cell lg:text-center lg:relative lg:pl-0 lg:py-4 lg:px-4 lg:border-b-0 lg:p-4 lg:align-middle"
              data-label="Port"
            >
              {row.port !== undefined ? row.port : "-"}
            </TableCell>

            <TableCell
              className="block text-right relative pl-[50%] py-2 px-4 border-b lg:table-cell lg:text-center lg:relative lg:pl-0 lg:py-4 lg:px-4 lg:border-b-0 lg:p-4 lg:align-middle"
              data-label="Pin"
            >
              {row.pinNumbers}
            </TableCell>

            <TableCell
              className="block text-right relative pl-[50%] py-2 px-4 border-b lg:table-cell lg:text-center lg:relative lg:pl-0 lg:py-4 lg:px-4 lg:border-b-0 lg:p-4 lg:align-middle"
              data-label="Function"
            >
              <div className="flex flex-wrap gap-1 justify-end lg:justify-center">
                {row.functions.map((func, funcIndex) => (
                  <span
                    key={`function-${funcIndex}`}
                    className="px-2 py-1 rounded-md text-xs font-medium inline-block"
                    style={{
                      backgroundColor: func.color.bg,
                      color: func.color.text,
                    }}
                  >
                    {func.text}
                  </span>
                ))}
              </div>
            </TableCell>
          </TableRow>
        );
      });
    });

    return rows;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {
        /*unassignedRequirements.length > 0*/ !success && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
            <div>
              <h4 className="font-medium">Assignment Problem Detected</h4>
              <p className="text-sm mt-1">
                It was not possible to assign {unassignedRequirements.length}{" "}
                requirements.
              </p>
            </div>
          </div>
        )
      }
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start mb-6">
          <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-800">
              Assignment Successful
            </h4>
            <p className="text-sm mt-1 text-green-700">
              All requirements have been successfully mapped to available pins.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 rounded-md lg:border lg:shadow-sm overflow-hidden flex flex-col">
        <Table className="responsive-table lg:table-fixed">
          <TableHeader className="hidden lg:table-header-group" sticky>
            <TableRow className="bg-muted/50">
              <TableHead className="lg:w-1/3 font-medium text-center">
                Type
              </TableHead>
              <TableHead className="lg:w-1/12 font-medium text-center">
                Port
              </TableHead>
              <TableHead className="lg:w-3/12 font-medium text-center">
                Pin
              </TableHead>
              <TableHead className="lg:w-1/3 font-medium text-center">
                Function
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PinAssignmentTable;
