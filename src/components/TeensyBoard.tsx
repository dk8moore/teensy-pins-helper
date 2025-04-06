import React, { useState, useRef, useEffect, useCallback } from "react";
import RenderBoard from "./RenderBoard";
import { TeensyDataResult } from "@/types";
import { SCALE } from "@/lib/utils";

// Define type for hovered pins state passed down
interface HoveredPinsState {
  pinIds: string[];
  color: string | null;
}

interface TeensyBoardProps {
  data: TeensyDataResult;
  onPinClick: (pinName: string, pinMode: string) => void;
  selectedPinMode: string | null;
  assignedPins?: string[];
  assignments?: Record<string, { type: string }>;
  hoveredPins?: HoveredPinsState; // Add hoveredPins prop
  highlightedCapability?: string | null; // Add highlighted capability prop
  showAssignments?: boolean;
}

const TeensyBoard: React.FC<TeensyBoardProps> = ({
  data,
  onPinClick,
  selectedPinMode,
  assignedPins = [],
  assignments = {},
  hoveredPins = { pinIds: [], color: null }, // Default value
  highlightedCapability = null, // Default value
  showAssignments = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialBoardScale, setInitialBoardScale] = useState<number | null>(
    null
  );

  const calculateScale = useCallback(() => {
    if (containerRef.current && data.modelData) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      if (containerWidth === 0 || containerHeight === 0) {
        return null; // Avoid division by zero
      }

      // Get intrinsic SVG dimensions (based on viewBox/SCALE)
      const svgWidth = data.modelData.dimensions.width * SCALE;
      const svgHeight = (data.modelData.dimensions.height + 0.9) * SCALE; // Use the same height calc as in RenderBoard

      // Calculate scale factors to fit width and height
      const scaleX = containerWidth / svgWidth;
      const scaleY = containerHeight / svgHeight;

      // Choose the smaller scale factor to fit the whole board ("contain")
      const containScale = Math.min(scaleX, scaleY);

      // Apply a margin factor (e.g., 90% scale for a 10% margin)
      const marginFactor = 0.9;
      const finalScale = containScale * marginFactor;

      // Ensure scale doesn't go below a minimum useful threshold maybe? (optional)
      // finalScale = Math.max(finalScale, 0.1);
      return finalScale;
    }
    return null; // Default if no container or data
  }, [data.modelData]); // Dependency: modelData

  useEffect(() => {
    // Initial calculation
    const updateScale = () => {
      const newScale = calculateScale();
      if (newScale !== null) {
        // Only set if calculation is valid
        // Optional: Debounce or check for significant change if ResizeObserver fires too rapidly
        setInitialBoardScale(newScale);
      }
    };

    updateScale(); // Initial call to set scale

    // Setup ResizeObserver
    let observer: ResizeObserver;
    const containerElement = containerRef.current;

    if (containerElement) {
      observer = new ResizeObserver(updateScale); // Call updateScale on resize
      observer.observe(containerElement);
    }

    // Cleanup
    return () => {
      if (observer && containerElement) {
        observer.unobserve(containerElement);
      }
    };
  }, [calculateScale]);

  const handlePinClick = (pinName: string, mode: string): void => {
    // Call parent handler
    onPinClick(pinName, mode);
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
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-hidden relative min-h-[30vh] max-h-[70vh]"
      >
        {data.modelData && data.boardUIData && initialBoardScale !== null && (
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
            initialBoardScale={initialBoardScale}
          />
        )}
        {/* Optional: Add a loading indicator while initialBoardScale is null */}
        {initialBoardScale === null && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Initializing board view...
          </div>
        )}
      </div>
    </div>
  );
};

export default TeensyBoard;
