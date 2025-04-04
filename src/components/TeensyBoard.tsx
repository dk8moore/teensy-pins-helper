import React, { useState, useEffect } from "react";
import RenderBoard from "./RenderBoard";
import { TeensyDataResult } from "@/types";
import { CardFooter } from "@/components/ui/card";

interface TeensyBoardProps {
  data: TeensyDataResult;
  onPinClick: (pinName: string) => void;
  assignedPins?: string[];
  assignments?: Record<string, { type: string }>;
  calculationSuccessTimestamp?: number | null;
}

const TeensyBoard: React.FC<TeensyBoardProps> = ({
  data,
  onPinClick,
  assignedPins = [],
  assignments = {},
  calculationSuccessTimestamp,
}) => {
  const [activeLegendItem, setActiveLegendItem] = useState<string | null>(null);

  useEffect(() => {
    if (calculationSuccessTimestamp && assignedPins.length > 0) {
      setActiveLegendItem("assignments");
    }
    // Intentionally not resetting when timestamp becomes null,
    // reset happens elsewhere or user changes selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculationSuccessTimestamp]); // Depend only on the timestamp

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

  const handlePinClick = (pinName: string): void => {
    // Call parent handler
    onPinClick(pinName);
  };

  const handleLegendItemClick = (itemId: string | null): void => {
    setActiveLegendItem((prevItem) => (prevItem === itemId ? null : itemId));
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
            onPinClick={handlePinClick} // Pass simplified handler
            assignedPins={assignedPins}
            assignments={assignments}
            activeLegendItem={activeLegendItem}
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
                // Update condition to use activeLegendItem
                activeLegendItem === mode
                  ? "ring-1 ring-primary bg-accent/50"
                  : "hover:bg-accent/30"
              }`}
              // Update onClick handler
              onClick={() => handleLegendItemClick(mode)}
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

        {assignedPins && assignedPins.length > 0 && (
          <button
            key="assignments" // Add key
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
            ${
              // Update condition to use activeLegendItem
              activeLegendItem === "assignments"
                ? "ring-1 ring-primary bg-accent/50"
                : "hover:bg-accent/30"
            }`}
            // Update onClick handler
            onClick={() => handleLegendItemClick("assignments")}
          >
            <span className="text-sm text-foreground">Assignments</span>
          </button>
        )}
      </CardFooter>
    </div>
  );
};

export default TeensyBoard;
