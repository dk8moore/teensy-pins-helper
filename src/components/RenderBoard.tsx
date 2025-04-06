import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TeensyModelData, BoardUIData, Pin } from "@/types";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCALE, calculateBoardPixels } from "@/lib/utils";

interface PinColorStyle {
  fill: string;
  opacity: number;
  strokeWidth: number;
  stroke: string;
}

// Define type for hovered pins state passed down
interface HoveredPinsState {
  pinIds: string[];
  color: string | null;
}

interface RenderBoardProps {
  modelData: TeensyModelData;
  boardUIData: BoardUIData;
  onPinClick: (pinName: string, mode: string) => void;
  selectedPinMode: string | null;
  assignments?: Record<string, { type: string }>;
  highlightedCapability?: string | null;
  assignedPins?: string[];
  showAssignments?: boolean;
  hoveredPins?: HoveredPinsState;
  initialBoardScale?: number;
}

const RenderBoard: React.FC<RenderBoardProps> = ({
  modelData,
  boardUIData,
  onPinClick,
  selectedPinMode,
  assignments = {},
  highlightedCapability,
  assignedPins = [],
  showAssignments = false,
  hoveredPins = { pinIds: [], color: null }, // Default value
  initialBoardScale = 1,
}) => {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [rotation, setRotation] = useState(0);

  const getPinColor = (pin: Pin, type?: string): PinColorStyle => {
    // Check if this pin is hovered
    const isHovered = hoveredPins.pinIds.includes(pin.id);

    // Check if any pins are being hovered
    const anyPinsHovered = hoveredPins.pinIds.length > 0;

    // If pin is hovered, always show it highlighted regardless of other conditions
    if (isHovered) {
      return {
        fill:
          boardUIData.capabilityDetails[assignments[pin.id]?.type]?.color.bg ||
          "#e6e6e6",
        opacity: 1,
        strokeWidth: 3,
        stroke: hoveredPins.color || "#FFD700",
      };
    }
    // If any pins are hovered, but this one isn't, dim it
    else if (anyPinsHovered) {
      return {
        fill: "#cccccc",
        opacity: 0.3,
        strokeWidth: 1,
        stroke: "#666666",
      };
    }
    // If showing calculated assignments and pin is assigned
    else if (showAssignments && assignedPins.includes(pin.id)) {
      return {
        fill:
          boardUIData.capabilityDetails[assignments[pin.id]?.type]?.color.bg ||
          "#cccccc",
        opacity: 1,
        strokeWidth: 3,
        stroke: "#000000",
      };
    }
    // If showing assignments but this pin is not assigned
    else if (showAssignments) {
      return {
        fill: "#cccccc",
        opacity: 0.3,
        strokeWidth: 1,
        stroke: "#666666",
      };
    }
    // If there's a highlighted capability and this pin has it
    else if (
      highlightedCapability &&
      ((pin.interfaces && pin.interfaces[highlightedCapability]) ||
        pin.designation === highlightedCapability)
    ) {
      return {
        fill: boardUIData.capabilityDetails[highlightedCapability].color.bg,
        opacity: 1,
        strokeWidth: 3,
        stroke: "#000000",
      };
    }
    // If there's a highlighted capability but this pin doesn't have it
    else if (highlightedCapability) {
      return {
        fill: "#cccccc",
        opacity: 0.3, // Already dimmed properly
        strokeWidth: 2,
        stroke: "#666666",
      };
    }
    // If assigned (but not showing assignments view)
    else if (type) {
      return {
        fill: boardUIData.capabilityDetails[type]?.color.bg || "#cccccc",
        opacity: 1,
        strokeWidth: 2,
        stroke: "black",
      };
    }
    // Default case - this is what we need to change to dim non-highlighted/non-assigned pins
    else {
      return {
        fill: "hsl(var(--card))",
        opacity: 0.4, // Reduced opacity for non-highlighted pins
        strokeWidth: 1,
        stroke: "#888888", // Lighter stroke
      };
    }
  };

  const renderComponents = () => {
    const modelName = modelData.name.toLowerCase().replace(/[\s.]+/g, "");
    const imagePath = `/teensy-pins-helper/img/${modelName}-2x.png`;

    // Calculate board dimensions in pixels
    const pixelDimensions = calculateBoardPixels(modelData.dimensions, SCALE);

    return (
      <image
        href={imagePath}
        x="0"
        y="0"
        width={pixelDimensions.width}
        height="100%"
        opacity={0.9}
        preserveAspectRatio="xMidYMax meet"
      />
    );
  };

  const renderPins = () => {
    let pinsArray: Pin[] = [];

    pinsArray = Array.isArray(modelData.pins)
      ? modelData.pins
      : Object.values(modelData.pins);

    // Helper function to determine contrasting text color based on background color
    const contrastTextColor = (bgColor: string): string => {
      // Simple algorithm: for light colors use black text, for dark colors use white text
      if (bgColor.startsWith("#")) {
        // Convert hex to RGB
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);

        // Calculate perceived brightness (simple formula)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Return black for light backgrounds, white for dark
        return brightness > 125 ? "black" : "white";
      }

      // Default if not hex color
      return "black";
    };

    // Helper function to determine text color based on pin state
    const getTextColor = (pin: Pin, isHovered: boolean): string => {
      // If pin is hovered, use the hover color's text property or a default
      if (isHovered) {
        if (assignments[pin.id]?.type) {
          return (
            boardUIData.capabilityDetails[assignments[pin.id].type]?.color
              .text || "white"
          );
        } else if (hoveredPins.color) {
          // Derive a contrasting text color based on the hover color
          return contrastTextColor(hoveredPins.color);
        }
        return "white"; // Default high contrast for hover
      }

      // If showing assignments and pin is assigned
      if (showAssignments && assignedPins.includes(pin.id)) {
        return (
          boardUIData.capabilityDetails[assignments[pin.id]?.type]?.color
            .text || "black"
        );
      }

      // If there's a highlighted capability and this pin has it
      if (
        highlightedCapability &&
        ((pin.interfaces && pin.interfaces[highlightedCapability]) ||
          pin.designation === highlightedCapability)
      ) {
        return (
          boardUIData.capabilityDetails[highlightedCapability].color.text ||
          "black"
        );
      }

      // Default case
      return "black";
    };

    return pinsArray.map((pin) => {
      const isAssigned = assignments[pin.id];
      const isAssignedPin = assignedPins.includes(pin.id);
      const isHovered = hoveredPins.pinIds.includes(pin.id);

      // Check if any pins are currently being hovered
      const anyPinsHovered = hoveredPins.pinIds.length > 0;

      // Determine if pin should be dimmed - add condition for non-hovered pins when any pin is hovered
      const shouldDim =
        (anyPinsHovered && !isHovered) ||
        (highlightedCapability &&
          !(
            (pin.interfaces && pin.interfaces[highlightedCapability]) ||
            pin.designation === highlightedCapability
          )) ||
        (showAssignments && !assignedPins.includes(pin.id));

      // Constants for styling
      const GOLDEN_COLOR = "#9a916c";
      const PIN_RADIUS =
        boardUIData.pinShapes &&
        boardUIData.pinShapes[pin.geometry.type] &&
        boardUIData.pinShapes[pin.geometry.type].radius! * SCALE;
      const HOLE_RADIUS = PIN_RADIUS * 0.75;
      const Y_OFFSET = 0.9 * SCALE;
      const holeStyle = getPinColor(
        pin,
        isAssigned ? assignments[pin.id].type : undefined
      );

      // Determine if pin is highlighted for text size adjustment
      const isHighlighted =
        isHovered ||
        (highlightedCapability &&
          ((pin.interfaces && pin.interfaces[highlightedCapability]) ||
            pin.designation === highlightedCapability)) ||
        (showAssignments && assignedPins.includes(pin.id));

      return (
        <g key={`pin-${pin.id}`}>
          {/* Main pin circle */}
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE + Y_OFFSET}
            r={PIN_RADIUS}
            fill={GOLDEN_COLOR}
            opacity={shouldDim ? 0.4 : 1}
            data-pin={pin.id}
            data-interfaces={
              pin.interfaces == null
                ? null
                : Object.entries(pin.interfaces)
                    .filter(([_, value]) => value !== null)
                    .map(([type]) => type)
                    .join(" ")
            }
            onClick={() => onPinClick(pin.id, selectedPinMode || "")}
            className={cn(
              "transition-all duration-200",
              isAssignedPin && !isHovered
                ? "cursor-not-allowed opacity-50"
                : shouldDim
                ? "cursor-pointer opacity-40"
                : "cursor-pointer"
            )}
            style={{
              stroke: isHovered ? hoveredPins.color || "#FFD700" : "none",
              strokeWidth: isHovered ? 3 : 0,
              opacity: anyPinsHovered && !isHovered ? 0.4 : shouldDim ? 0.4 : 1,
              transition:
                "stroke 0.1s ease-in-out, stroke-width 0.1s ease-in-out, opacity 0.2s ease-in-out",
            }}
          >
            <title>{`Pin ${pin.number} (${pin.id})${
              isAssignedPin ? " (Assigned)" : ""
            }`}</title>
          </circle>

          {/* Pin hole */}
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE + Y_OFFSET}
            r={HOLE_RADIUS}
            fill="hsl(var(--card))"
            opacity={shouldDim ? 0.6 : 1}
            pointerEvents="none"
          />

          {/* Pin highlight (inner color) */}
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE + Y_OFFSET}
            r={HOLE_RADIUS * 0.8}
            fill={holeStyle.fill}
            opacity={holeStyle.opacity}
            pointerEvents="none"
          />

          {/* Pin label */}
          <text
            x={pin.geometry.x * SCALE}
            y={pin.geometry.y * SCALE + Y_OFFSET + 0.08 * SCALE}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={getTextColor(pin, isHovered)}
            fontSize={isHighlighted ? "15" : "13"} // Larger text size for highlighted pins
            fontWeight="bold"
            opacity={shouldDim ? 0.5 : 1}
            pointerEvents="none"
            style={{
              transition: "font-size 0.2s ease-in-out, fill 0.2s ease-in-out",
            }}
          >
            {pin.designation
              ? pin.designation === "GND" ||
                pin.designation === "VIN" ||
                pin.designation === "3V3"
                ? boardUIData.capabilityDetails[pin.designation!]?.shortlabel
                : ""
              : pin.number}
          </text>
        </g>
      );
    });
  };

  const handleRotate = (clockwise: boolean) => {
    const newRotation = clockwise
      ? (rotation + 90) % 360
      : (rotation - 90 + 360) % 360;
    setRotation(newRotation);
  };

  const handleReset = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
      setRotation(0);
    }
  };

  if (!modelData || !boardUIData) {
    return <div>Loading board data...</div>;
  }

  const { dimensions } = modelData;
  const svgWidth = dimensions.width * SCALE;
  const svgHeight = (dimensions.height + 0.9) * SCALE;

  return (
    <div className="w-full h-full relative bg-gray-50">
      <div className="absolute top-2 right-2 z-10 flex space-x-1 bg-white/80 p-1 rounded-md shadow-sm">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => transformComponentRef.current?.zoomIn()}
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => transformComponentRef.current?.zoomOut()}
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleRotate(true)}
        >
          <RotateCw size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleRotate(false)}
        >
          <RotateCcw size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleReset}
        >
          <Maximize size={16} />
        </Button>
      </div>

      <TransformWrapper
        initialScale={initialBoardScale}
        minScale={0.5}
        maxScale={5}
        ref={transformComponentRef}
        // centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.05 }}
      >
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
          contentStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="board-svg"
            style={{
              maxWidth: "100%",
              height: "auto",
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.3s ease",
            }}
          >
            {/* Board outline */}
            <rect
              x="0"
              y={0.9 * SCALE}
              width={dimensions.width * SCALE}
              height={dimensions.height * SCALE}
              fill="#123e00"
              strokeWidth="4"
              opacity={0.65}
              className="dark:fill-[#3b5f42]"
            />

            {/* Components */}
            {renderComponents()}

            {/* Pins */}
            {renderPins()}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default RenderBoard;
