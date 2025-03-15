import React from "react";
import {
  PinAssignment,
  TeensyModelData,
  Requirement,
  CapabilityDetail,
  DigitalInterface,
} from "@/types";
import { CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PinAssignmentResultsProps {
  success: boolean;
  assignments: PinAssignment[];
  requirements: Requirement[];
  modelData: TeensyModelData;
  capabilityDetails: Record<string, CapabilityDetail>;
  conflicts?: any[];
}

const PinAssignmentResults: React.FC<PinAssignmentResultsProps> = ({
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

  // Separate single pin requirements from peripheral requirements
  const singlePinRequirements = requirements.filter(
    (req) => req.type === "single-pin"
  );
  const peripheralRequirements = requirements.filter(
    (req) => req.type === "peripheral"
  );

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

  // Get connection info for requirement
  const getConnectionInfo = (requirement: Requirement, pinIds: string[]) => {
    if (
      requirement.type === "peripheral" &&
      requirement.allocation === "port"
    ) {
      const firstPin = getPinInfo(pinIds[0]);
      if (firstPin?.interfaces?.[requirement.capability]) {
        const interfaceData = firstPin.interfaces[requirement.capability];
        if (typeof interfaceData === "object" && "port" in interfaceData) {
          return `${requirement.capability.toUpperCase()}${
            interfaceData.port
          } Port`;
        }
      }
    }
    return (
      requirement.capability.charAt(0).toUpperCase() +
      requirement.capability.slice(1)
    );
  };

  // Export pin assignments as CSV
  const exportAsCSV = () => {
    const csvRows = [];
    csvRows.push(["Pin", "Pin Name", "Function", "Role", "Connection"]);

    Object.entries(assignmentsByRequirement).forEach(
      ([reqId, assignmentGroup]) => {
        const requirement = getRequirement(reqId);
        if (!requirement) return;

        assignmentGroup.forEach((assignment) => {
          const pin = getPinInfo(assignment.pinId);
          if (!pin) return;

          const role = getPinRole(assignment.pinId, requirement);
          const connection = getConnectionInfo(
            requirement,
            assignmentGroup.map((a) => a.pinId)
          );

          csvRows.push([
            pin.number,
            pin.name || pin.id,
            requirement.capability,
            role,
            connection,
          ]);
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

  // Pill component to display pin assignment
  const PinAssignmentPill = ({
    pinId,
    requirement,
  }: {
    pinId: string;
    requirement: Requirement;
  }) => {
    const pin = getPinInfo(pinId);
    if (!pin) return null;

    const role = getPinRole(pinId, requirement);
    const peripheralColor = capabilityDetails[requirement.capability]?.color;

    return (
      <div className="inline-flex items-center rounded-full border border-gray-200 overflow-hidden mr-2 mb-2">
        {/* Pin number (neutral color) */}
        <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium">
          {pin.number}
        </div>
        {/* Pin peripheral (color coded) */}
        <div
          className="px-2 py-1 text-xs font-medium"
          style={{
            backgroundColor: peripheralColor?.bg || "#ccc",
            color: peripheralColor?.text || "#000",
          }}
        >
          {role.toString()}
        </div>
      </div>
    );
  };

  // Get all single pin assignments
  const singlePinAssignmentsIds = singlePinRequirements.map((req) => req.id);
  const singlePinAssignmentsList = Object.entries(assignmentsByRequirement)
    .filter(([reqId]) => singlePinAssignmentsIds.includes(reqId))
    .flatMap(([reqId, pinAssignments]) =>
      pinAssignments.map((assignment) => ({
        ...assignment,
        requirement: getRequirement(reqId),
      }))
    );

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

      {/* Single Pin Requirements (grouped in one card) */}
      {singlePinAssignmentsList.length > 0 && (
        <Card className="p-3 bg-white border-gray-200 mb-4">
          <div className="flex items-center gap-4">
            <Badge
              className="min-w-[90px] justify-center border-0"
              style={{
                backgroundColor: "#000",
                color: "#fff",
              }}
            >
              Single Pins
            </Badge>
            <div className="flex items-center flex-wrap">
              {singlePinAssignmentsList.map(
                ({ pinId, requirement }) =>
                  requirement && (
                    <PinAssignmentPill
                      key={`single-${pinId}`}
                      pinId={pinId}
                      requirement={requirement}
                    />
                  )
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Peripheral Requirements (one card per requirement) */}
      {peripheralRequirements.map((requirement) => {
        const reqAssignments = assignmentsByRequirement[requirement.id] || [];
        if (reqAssignments.length === 0) return null;

        const peripheral = requirement.capability;
        const detail = capabilityDetails[peripheral];
        const connectionInfo = getConnectionInfo(
          requirement,
          reqAssignments.map((a) => a.pinId)
        );

        return (
          <Card
            key={requirement.id}
            className="p-3 bg-white border-gray-200 mb-4"
          >
            <div className="flex items-center gap-4 mb-3">
              <Badge
                className="min-w-[110px] justify-center border-0"
                style={{
                  backgroundColor: detail?.color.bg || "#ccc",
                  color: detail?.color.text || "#000",
                }}
              >
                {requirement.label ||
                  peripheral.charAt(0).toUpperCase() + peripheral.slice(1)}
              </Badge>
            </div>
            <CardContent className="p-0">
              <div className="flex items-center flex-wrap">
                {reqAssignments.map((assignment) => (
                  <PinAssignmentPill
                    key={`${requirement.id}-${assignment.pinId}`}
                    pinId={assignment.pinId}
                    requirement={requirement}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

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

export default PinAssignmentResults;
