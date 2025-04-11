import React, { useState, useRef, useEffect, useCallback } from "react";
import RenderBoard from "./RenderBoard";
import { TeensyDataResult } from "@/types";
import { SCALE } from "@/lib/utils";

// Define type for hovered pins state passed down
interface HoveredPinsState {
  pinIds: string[];
  color: string | null;
}

// Define type for the initial transform state
interface InitialTransform {
  scale: number;
  positionX: number;
  positionY: number;
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

  const [initialTransform, setInitialTransform] =
    useState<InitialTransform | null>(null);

  const calculateInitialTransform = useCallback((): InitialTransform | null => {
    if (containerRef.current && data.modelData) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      if (containerWidth <= 0 || containerHeight <= 0) {
        console.warn(
          "Container has zero dimensions, skipping transform calculation."
        );
        return null; // Avoid division by zero or weird states
      }

      // Get intrinsic SVG dimensions (based on viewBox/SCALE)
      // Use the same height calculation as in RenderBoard
      const svgWidth = data.modelData.dimensions.width * SCALE;
      const svgHeight = (data.modelData.dimensions.height + 0.9) * SCALE;

      if (svgWidth <= 0 || svgHeight <= 0) {
        console.warn(
          "SVG has zero dimensions, skipping transform calculation."
        );
        return null;
      }

      // Calculate scale factors to fit width and height
      const scaleX = containerWidth / svgWidth;
      const scaleY = containerHeight / svgHeight;

      // Choose the smaller scale factor to fit the whole board ("contain")
      const containScale = Math.min(scaleX, scaleY);

      // Apply a margin factor (e.g., 90% scale for a 10% margin)
      const marginFactor = 0.9; // Adjust this for more/less padding
      const finalScale = Math.max(containScale * marginFactor, 0.1); // Ensure scale is positive, min 0.1

      // Calculate the dimensions of the board at the final scale
      const scaledBoardWidth = svgWidth * finalScale;
      const scaledBoardHeight = svgHeight * finalScale;

      // Calculate the top-left position to center the scaled board
      const positionX = (containerWidth - scaledBoardWidth) / 2;
      const positionY = (containerHeight - scaledBoardHeight) / 2;

      return {
        scale: finalScale,
        positionX: positionX,
        positionY: positionY,
      };
    }
    return null; // Default if no container or data
  }, [data.modelData]); // Dependency: modelData dimensions

  useEffect(() => {
    // Debounce function
    const debounce = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };

    const updateTransform = () => {
      const newTransform = calculateInitialTransform();
      // Only update if the calculation was successful
      if (newTransform) {
        // Optional: Check if transform actually changed significantly
        setInitialTransform(newTransform);
      }
    };

    // Debounce the update function to avoid rapid refires during resize
    const debouncedUpdateTransform = debounce(updateTransform, 100); // 100ms delay

    // Initial calculation
    updateTransform();

    // Setup ResizeObserver
    let observer: ResizeObserver;
    const containerElement = containerRef.current;

    if (containerElement) {
      // Use the debounced version in the observer
      observer = new ResizeObserver(debouncedUpdateTransform);
      observer.observe(containerElement);
    }

    // Cleanup
    return () => {
      if (observer && containerElement) {
        observer.unobserve(containerElement);
      }
    };
    // Add calculateInitialTransform to dependency array as it now depends on data.modelData
  }, [calculateInitialTransform]);

  const handlePinClick = (pinName: string, mode: string): void => {
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
      <div
        ref={containerRef}
        // Ensure container has a defined height for calculation
        className="flex-1 w-full overflow-hidden relative min-h-[300px] bg-gray-100 dark:bg-gray-800" // Added min-height and background
      >
        {/* Conditionally render RenderBoard only when initialTransform is ready */}
        {data.modelData && data.boardUIData && initialTransform ? (
          <RenderBoard
            modelData={data.modelData}
            boardUIData={data.boardUIData}
            onPinClick={handlePinClick}
            selectedPinMode={selectedPinMode}
            highlightedCapability={highlightedCapability}
            assignedPins={assignedPins}
            showAssignments={showAssignments}
            assignments={assignments}
            hoveredPins={hoveredPins}
            // Pass scale and position
            initialScale={initialTransform.scale}
            initialPositionX={initialTransform.positionX}
            initialPositionY={initialTransform.positionY}
          />
        ) : (
          // Show a loading/initializing state otherwise
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {data.modelData
              ? "Initializing board view..."
              : "Waiting for board data..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeensyBoard;
