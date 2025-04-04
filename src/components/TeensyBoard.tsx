import React, { useState } from "react";
import RenderBoard from "./RenderBoard";
import { TeensyDataResult } from "@/types";
import { CardFooter } from "@/components/ui/card";

// Define type for hovered pins state passed down
interface HoveredPinsState {
  pinIds: string[];
  color: string | null;
}

interface TeensyBoardProps {
  data: TeensyDataResult;
  onPinClick: (pinName: string, pinMode: string) => void;
  selectedPinMode: string | null;
  onPinModeSelect: (mode: string) => void;
  assignedPins?: string[];
  assignments?: Record<string, { type: string }>;
  hoveredPins?: HoveredPinsState; // Add hoveredPins prop
}

const TeensyBoard: React.FC<TeensyBoardProps> = ({
  data,
  onPinClick,
  selectedPinMode,
  onPinModeSelect,
  assignedPins = [],
  assignments = {},
  hoveredPins = { pinIds: [], color: null }, // Default value
}) => {
  const [highlightedCapability, setHighlightedCapability] = useState<
    string | null
  >(null);

  const [showAssignments, setShowAssignments] = useState<boolean>(false);

  // Get all pin modes (interfaces) from the model data
  const getAllPinModes = (modelData: any): string[] => {
    // Get unique designations from pins
    const designations = new Set(
      modelData.pins
        .filter((pin: any) => pin.designation)
        .map((pin: any) => pin.designation as string)
    );

    // Combine with interfaces (formerly capabilities)
    return [...modelData.interfaces]; //, ...Array.from(designations)];
  };

  const handlePinClick = (pinName: string, mode: string): void => {
    // Call parent handler
    onPinClick(pinName, mode);
  };

  const handleModeSelect = (modeId: string): void => {
    // Toggle highlight - if same mode clicked again, turn off highlight
    setHighlightedCapability((prevMode) =>
      prevMode === modeId ? null : modeId
    );
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background rounded-lg">
        <div className="text-muted-foreground">Loading board...</div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex items-center justify-center h-full bg-destructive/10 rounded-lg">
        <div className="text-destructive">{data.error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board Visualization - Using flex-grow to take available space */}
      <div className="w-full flex-grow">
        {data.modelData && data.boardUIData && (
          <RenderBoard
            modelData={data.modelData}
            boardUIData={data.boardUIData}
            onPinClick={handlePinClick}
            selectedPinMode={selectedPinMode}
            highlightedCapability={highlightedCapability}
            assignedPins={assignedPins}
            showAssignments={showAssignments}
            assignments={assignments}
            hoveredPins={hoveredPins} // Pass down hovered pins state
          />
        )}
      </div>

      {/* Legend in footer - horizontal arrangement */}
      <CardFooter className="pt-4 border-t flex flex-wrap gap-2 flex-shrink-0">
        {data.modelData &&
          getAllPinModes(data.modelData).map((mode) => (
            <button
              key={mode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
              ${
                selectedPinMode === mode
                  ? "ring-1 ring-primary bg-accent/50"
                  : "hover:bg-accent/30"
              }`}
              onClick={() => {
                handleModeSelect(mode);
                onPinModeSelect(mode);
                setShowAssignments(false);
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    data.boardUIData?.capabilityDetails[mode]?.color.bg ||
                    "#ccc",
                }}
              />
              <span className="text-sm text-foreground">
                {data.boardUIData?.capabilityDetails[mode]?.label || mode}
              </span>
            </button>
          ))}

        {/* New Assignments button - only show if there are assignments */}
        {assignedPins && assignedPins.length > 0 && (
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
        ${
          showAssignments
            ? "ring-1 ring-primary bg-accent/50"
            : "hover:bg-accent/30"
        }`}
            onClick={() => {
              setShowAssignments(!showAssignments);
              setHighlightedCapability(null); // Clear highlighted capability when toggling assignments
              onPinModeSelect(""); // Clear mode selection when toggling assignments
            }}
          >
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-foreground">Assignments</span>
          </button>
        )}
      </CardFooter>
    </div>
  );
};

export default TeensyBoard;
