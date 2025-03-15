import React from "react";
import {
  PinAssignment,
  TeensyModelData,
  Requirement,
  CapabilityDetail,
  DigitalInterface,
  PeripheralInterface,
} from "@/types";
import { CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  assignments: PinAssignment[];
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
  assignments,
  requirements,
  modelData,
  capabilityDetails,
  conflicts = [],
}) => {
  // Group assignments by requirement
  const assignmentsByRequirement = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.requirementId]) {
      acc[assignment.requirementId] = [];
    }
    acc[assignment.requirementId].push(assignment);
    return acc;
  }, {} as Record<string, PinAssignment[]>);

  // Find the pin information from modelData
  const getPinInfo = (pinId: string) => {
    return modelData.pins.find((pin) => pin.id === pinId);
  };

  // Find the requirement information
  const getRequirement = (requirementId: string) => {
    return requirements.find((req) => req.id === requirementId);
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

  // Get port number for peripherals
  const getPortNumber = (pinId: string, requirement: Requirement) => {
    const pin = getPinInfo(pinId);
    if (!pin || !pin.interfaces || !pin.interfaces[requirement.capability]) {
      return null;
    }

    const interfaceData = pin.interfaces[requirement.capability];
    if (typeof interfaceData === "object" && "port" in interfaceData) {
      const peripheralInterface = interfaceData as PeripheralInterface;
      return peripheralInterface.port;
    }
    return null;
  };

  // Export pin assignments as CSV
  const exportAsCSV = () => {
    const csvRows = [];
    csvRows.push(["Type", "Pin Number", "Function"]);

    Object.entries(assignmentsByRequirement).forEach(
      ([reqId, assignmentGroup]) => {
        const requirement = getRequirement(reqId);
        if (!requirement) return;

        let typeName =
          requirement.type === "single-pin"
            ? "Single Pins"
            : requirement.label ||
              requirement.capability.charAt(0).toUpperCase() +
                requirement.capability.slice(1);

        // Add port number for peripherals with ports
        if (requirement.capability === "serial") {
          const portNumber = getPortNumber(
            assignmentGroup[0].pinId,
            requirement
          );
          if (portNumber) {
            typeName = `${typeName} ${portNumber}`;
          }
        }

        assignmentGroup.forEach((assignment) => {
          const pin = getPinInfo(assignment.pinId);
          if (!pin) return;

          const role = getPinRole(assignment.pinId, requirement);

          csvRows.push([typeName, pin.number, role]);
        });
      }
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `pin_assignments_${modelData.name.replace(/\s+/g, "_").toLowerCase()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      const reqAssignments = assignmentsByRequirement[requirement.id] || [];
      if (reqAssignments.length === 0) return;

      if (requirement.type === "single-pin") {
        // Handle single pin requirements
        reqAssignments.forEach((assignment) => {
          const pin = getPinInfo(assignment.pinId);
          if (!pin) return;

          const role = getPinRole(assignment.pinId, requirement);
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
        });
        tableGroups["Single Pins"].rowSpan =
          tableGroups["Single Pins"].rows.length;
      } else {
        // Handle peripheral requirements
        const typeName =
          requirement.capability.charAt(0).toUpperCase() +
          requirement.capability.slice(1);

        // Check if we need to handle this as a port-based requirement
        const isPortBased =
          requirement.capability === "serial" ||
          requirement.capability === "i2c" ||
          requirement.capability === "spi" ||
          requirement.capability === "can";

        if (isPortBased) {
          // Group by port number
          const portGroupings: Record<string, PinAssignment[]> = {};

          reqAssignments.forEach((assignment) => {
            const pin = getPinInfo(assignment.pinId);
            if (!pin) return;

            const portNumber = getPortNumber(assignment.pinId, requirement);
            const portKey = `${typeName} ${portNumber}`;

            if (!portGroupings[portKey]) {
              portGroupings[portKey] = [];
            }

            portGroupings[portKey].push(assignment);
          });

          // Create a table group for each port
          Object.entries(portGroupings).forEach(
            ([portKey, portAssignments]) => {
              if (!tableGroups[portKey]) {
                tableGroups[portKey] = {
                  type: portKey,
                  rowSpan: 1, // Each port gets one row
                  color: capabilityDetails[requirement.capability]?.color || {
                    bg: "#ccc",
                    text: "#000",
                  },
                  rows: [],
                };
              }

              // Sort pins by number for consistent display
              portAssignments.sort((a, b) => {
                const pinA = getPinInfo(a.pinId);
                const pinB = getPinInfo(b.pinId);
                return (pinA?.number || 0) - (pinB?.number || 0);
              });

              // Build the functions and pin numbers
              const pinNumbers = portAssignments
                .map((a) => {
                  const pin = getPinInfo(a.pinId);
                  return pin?.number || 0;
                })
                .join(", ");

              const functions = portAssignments.map((a) => {
                return {
                  text: getPinRole(a.pinId, requirement).toString(),
                  color: capabilityDetails[requirement.capability]?.color || {
                    bg: "#ccc",
                    text: "#000",
                  },
                };
              });

              tableGroups[portKey].rows.push({
                pinNumbers,
                functions,
              });
            }
          );
        } else {
          // For non-port based peripherals (like analog, pwm, digital)
          if (!tableGroups[typeName]) {
            tableGroups[typeName] = {
              type: typeName,
              rowSpan: 0,
              color: capabilityDetails[requirement.capability]?.color || {
                bg: "#ccc",
                text: "#000",
              },
              rows: [],
            };
          }

          // Group digital pins by GPIO port if they have the same port
          if (
            requirement.capability === "digital" &&
            requirement.gpioPort &&
            requirement.gpioPort !== "R" &&
            requirement.gpioPort !== "A"
          ) {
            // Sort pins to ensure consistent grouping
            const sortedPins = [...reqAssignments].sort((a, b) => {
              const pinA = getPinInfo(a.pinId);
              const pinB = getPinInfo(b.pinId);
              return (pinA?.number || 0) - (pinB?.number || 0);
            });

            // Create array of pin numbers to display together
            const pinNumbers = sortedPins
              .map((a) => {
                const pin = getPinInfo(a.pinId);
                return pin?.number || 0;
              })
              .join(", ");

            // Create functions to display alongside
            const functions = sortedPins.map((a) => {
              return {
                text: getPinRole(a.pinId, requirement).toString(),
                color: capabilityDetails[requirement.capability]?.color || {
                  bg: "#ccc",
                  text: "#000",
                },
              };
            });

            tableGroups[typeName].rows.push({
              pinNumbers,
              functions,
            });
          } else {
            // Each pin gets its own row for other requirement types
            reqAssignments.forEach((assignment) => {
              const pin = getPinInfo(assignment.pinId);
              if (!pin) return;

              const role = getPinRole(assignment.pinId, requirement);
              tableGroups[typeName].rows.push({
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
          }

          tableGroups[typeName].rowSpan = tableGroups[typeName].rows.length;
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

    tableGroups.forEach((group, groupIndex) => {
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

  if (!success && assignments.length === 0) {
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
              <TableHead className="w-1/3 font-medium text-center">
                Type
              </TableHead>
              <TableHead className="w-1/4 font-medium text-center">
                Pin Number
              </TableHead>
              <TableHead className="w-1/3 font-medium">Function</TableHead>
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

      <div className="flex justify-end mt-6 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 h-9 rounded-md border-gray-200 shadow-sm hover:bg-accent hover:text-accent-foreground"
          onClick={exportAsCSV}
        >
          <Download className="h-4 w-4" />
          Export Pins as CSV
        </Button>
      </div>
    </div>
  );
};

export default PinAssignmentTable;
