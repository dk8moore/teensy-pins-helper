import React, { useState } from "react";
import RenderBoard from "./RenderBoard";
import {
  TeensyDataResult,
  TeensyModelData,
  // BoardUIData,
} from "@/types"; // Adjust the import path as needed

interface TeensyBoardProps {
  data: TeensyDataResult;
  onPinClick: (pinName: string, pinMode: string) => void;
  selectedPinMode: string | null;
  onPinModeSelect: (mode: string) => void;
  assignedPins?: string[];
}

const TeensyBoard: React.FC<TeensyBoardProps> = ({
  data,
  onPinClick,
  selectedPinMode,
  onPinModeSelect,
  assignedPins = [],
}) => {
  const [highlightedCapability, setHighlightedCapability] = useState<
    string | null
  >(null);

  // Add this constant at the top level of the component:
  const getAllPinModes = (modelData: TeensyModelData): string[] => {
    // Get unique designations from pins
    const designations = new Set(
      modelData.pins
        .filter((pin) => pin.designation)
        .map((pin) => pin.designation as string)
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
      <div className="flex items-center justify-center h-64 bg-background rounded-lg">
        <div className="text-muted-foreground">Loading board...</div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex items-center justify-center h-64 bg-destructive/10 rounded-lg">
        <div className="text-destructive">{data.error}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-6">
      {/* Pin Mode Legend - Left Side */}
      <div className="flex flex-col justify-center gap-1.5 py-2 min-w-[90px] mr-4">
        {data.modelData &&
          getAllPinModes(data.modelData).map((mode) => (
            <button
              key={mode}
              className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors w-full
              ${
                selectedPinMode === mode
                  ? "ring-1 ring-primary bg-accent/50"
                  : "hover:bg-accent/30"
              }`}
              onClick={() => {
                handleModeSelect(mode);
                onPinModeSelect(mode);
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
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
      </div>

      {/* Board Visualization - Centered */}
      <div className="flex-shrink-0">
        {data.modelData && data.boardUIData && (
          <RenderBoard
            modelData={data.modelData}
            boardUIData={data.boardUIData}
            onPinClick={handlePinClick}
            selectedPinMode={selectedPinMode}
            highlightedCapability={highlightedCapability}
            assignedPins={assignedPins} // Pass through to SVG
          />
        )}
      </div>
    </div>
  );
};

export default TeensyBoard;
