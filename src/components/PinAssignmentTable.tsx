import React from "react";
import {
  TeensyModelData,
  Requirement,
  CapabilityDetail,
  DigitalInterface,
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

interface PinAssignmentTableProps {
  success: boolean;
  requirements: Requirement[];
  modelData: TeensyModelData;
  capabilityDetails: Record<string, CapabilityDetail>;
  conflicts?: any[];
}

// Helper structure to manage table data
interface TableGroup {
  type: string;
  rowSpan: number;
  color: { bg: string; text: string };
  rows: {
    pinNumbers: string;
    functions: Array<{ text: string; color: { bg: string; text: string } }>;
  }[];
}

const PinAssignmentTable: React.FC<PinAssignmentTableProps> = ({
  success,
  requirements,
  modelData,
  capabilityDetails,
  conflicts = [],
}) => {
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
      rowSpan: 0,
      color: { bg: "#000", text: "#fff" },
      rows: [],
    };

    // Process requirements and organize them
    requirements.forEach((requirement) => {
      if (requirement.type === "single-pin") {
        // Handle single pin requirements
        const singlePinId = requirement.assignedBlocks![0].pinIds[0];
        const pin = getPinInfo(singlePinId);
        if (!pin) return;
        const role = getPinRole(singlePinId, requirement);
        tableGroups["Single Pins"].rows.push({
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
                return pin?.number || 0;
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

            tableGroups[requirement.id].rows.push({
              pinNumbers,
              functions,
            });
          });

          tableGroups[requirement.id].rowSpan =
            tableGroups[requirement.id].rows.length;
        } else {
          // For non-port based peripherals
          if (!tableGroups[requirement.id]) {
            tableGroups[requirement.id] = {
              type:
                capabilityDetails[requirement.capability]?.label ||
                requirement.id,
              rowSpan: 0,
              color: capabilityDetails[requirement.capability]?.color || {
                bg: "#ccc",
                text: "#000",
              },
              rows: [],
            };
          }

          // Each pin gets its own row for other requirement types
          requirement.assignedBlocks!.forEach((block) => {
            const pin = getPinInfo(block.pinIds[0]);
            if (!pin) return;

            const role = getPinRole(block.pinIds[0], requirement);
            tableGroups[requirement.id].rows.push({
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

          tableGroups[requirement.id].rowSpan =
            tableGroups[requirement.id].rows.length;
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
      delete tableGroups["Single Pins"];
    }

    // Add other peripherals in a consistent order
    const peripheralOrder = ["Analog", "Digital", "PWM"];
    peripheralOrder.forEach((type) => {
      if (tableGroups[type] && tableGroups[type].rows.length > 0) {
        orderedGroups.push(tableGroups[type]);
        delete tableGroups[type];
      }
    });

    // Add Serial, I2C, SPI, CAN ports - these will be named like "Serial 1", "Serial 2", etc.
    const portPatterns = ["Serial", "I2C", "SPI", "CAN"];
    portPatterns.forEach((pattern) => {
      // Find all keys that start with this pattern
      const portKeys = Object.keys(tableGroups).filter((key) =>
        key.startsWith(pattern)
      );

      // Sort by port number
      portKeys.sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ""));
        const numB = parseInt(b.replace(/[^0-9]/g, ""));
        return numA - numB;
      });

      // Add sorted port groups
      portKeys.forEach((key) => {
        if (tableGroups[key] && tableGroups[key].rows.length > 0) {
          orderedGroups.push(tableGroups[key]);
          delete tableGroups[key];
        }
      });
    });

    // Add any remaining groups
    Object.values(tableGroups).forEach((group) => {
      if (group.rows.length > 0) {
        orderedGroups.push(group);
      }
    });

    return orderedGroups;
  };

  const renderTableRows = () => {
    const tableGroups = prepareTableData();
    let rows: JSX.Element[] = [];

    tableGroups.forEach((group) => {
      group.rows.forEach((row, rowIndex) => {
        const isFirstRowInGroup = rowIndex === 0;

        rows.push(
          <TableRow key={`${group.type}-${rowIndex}`}>
            {isFirstRowInGroup ? (
              <TableCell
                className="font-medium text-center"
                rowSpan={group.rowSpan}
                style={{
                  verticalAlign: "middle",
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                <Badge
                  className="items-center justify-center min-w-[80px] border-0"
                  style={{
                    backgroundColor: group.color.bg,
                    color: group.color.text,
                  }}
                >
                  {group.type}
                </Badge>
              </TableCell>
            ) : null}

            <TableCell className="text-center">{row.pinNumbers}</TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-1">
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

  if (!success) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
        <div>
          <h4 className="font-medium">Assignment Failed</h4>
          <p className="text-sm mt-1">
            Unable to find a valid pin assignment for your requirements. Please
            review your configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-1/2 font-medium text-center">
                Type
              </TableHead>
              <TableHead className="w-1/8 font-medium text-center">
                Pin
              </TableHead>
              <TableHead className="w-1/8 font-medium">Function</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
          <div>
            <h4 className="font-medium">Conflicts Detected</h4>
            <p className="text-sm mt-1">
              {conflicts.length} conflicts were detected in the pin assignment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinAssignmentTable;
