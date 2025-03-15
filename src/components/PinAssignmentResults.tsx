import React, { useState } from "react";
import {
  PinAssignment,
  TeensyModelData,
  Requirement,
  CapabilityDetail,
} from "@/types";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Track which panels are expanded
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {}
  );

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
    }

    return "";
  };

  // Toggle panel expansion
  const togglePanel = (reqId: string) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [reqId]: !prev[reqId],
    }));
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
            pin.name,
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
    link.setAttribute("download", `pin_assignments_${selectedModel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract the selected model from the requirements or model data
  const selectedModel = modelData?.id || "teensy";

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
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
          <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
          <div>
            <h4 className="font-medium">Assignment Successful</h4>
            <p className="text-sm mt-1">
              All requirements have been successfully mapped to available pins.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(assignmentsByRequirement).map(
          ([reqId, assignmentGroup]) => {
            const requirement = getRequirement(reqId);
            if (!requirement) return null;

            const isExpanded = expandedPanels[reqId] !== false; // Default to expanded
            const capability = requirement.capability;
            const detail = capabilityDetails[capability];
            // Get port/connection information if available
            const connectionInfo = getConnectionInfo(
              requirement,
              assignmentGroup.map((a) => a.pinId)
            );

            return (
              <div key={reqId} className="border rounded-md overflow-hidden">
                <div
                  className={`p-3 flex justify-between items-center cursor-pointer`}
                  onClick={() => togglePanel(reqId)}
                  style={{
                    backgroundColor: detail?.color.bg || "#e5e7eb",
                    color: detail?.color.text || "#1f2937",
                  }}
                >
                  <div className="font-medium">
                    {requirement.label ||
                      requirement.capability.charAt(0).toUpperCase() +
                        requirement.capability.slice(1)}
                    {requirement.type === "peripheral" && (
                      <span className="ml-2">({connectionInfo})</span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>

                {isExpanded && (
                  <div className="p-4 bg-white">
                    <div className="space-y-2">
                      {assignmentGroup.map((assignment) => {
                        const pin = getPinInfo(assignment.pinId);
                        if (!pin) return null;

                        const role = getPinRole(assignment.pinId, requirement);

                        return (
                          <div key={pin.id} className="flex items-center">
                            <div className="w-16 font-mono font-medium">
                              Pin {pin.number}
                            </div>
                            <div className="text-gray-500">──</div>
                            <div className="ml-2">{role || "Generic"}</div>
                          </div>
                        );
                      })}

                      <div className="mt-4 pt-3 border-t text-sm text-gray-500">
                        Connected to: {connectionInfo}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
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

      <div className="flex justify-end mt-6 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
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
