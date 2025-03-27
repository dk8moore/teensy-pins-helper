import React from "react";
import { cn } from "@/lib/utils";
import { TeensyModelData, BoardUIData, Pin } from "@/types";

interface PinColorStyle {
  fill: string;
  opacity: number;
  strokeWidth: number;
  stroke: string;
}

interface RenderBoardProps {
  modelData: TeensyModelData;
  boardUIData: BoardUIData;
  onPinClick: (pinName: string, mode: string) => void;
  selectedPinMode: string | null;
  assignments?: Record<string, { type: string }>;
  highlightedCapability?: string | null;
  assignedPins?: string[];
}

const RenderBoard: React.FC<RenderBoardProps> = ({
  modelData,
  boardUIData,
  onPinClick,
  selectedPinMode,
  assignments = {},
  highlightedCapability,
  assignedPins = [],
}) => {
  const SCALE = 15;

  const getPinColor = (pin: Pin, type?: string): PinColorStyle => {
    // If pin is in assignedPins list, use a specific style
    if (assignedPins.includes(pin.id)) {
      return {
        fill:
          boardUIData.capabilityDetails[assignments[pin.id]?.type]?.color.bg ||
          "#cccccc",
        opacity: 0.7,
        strokeWidth: 3,
        stroke: "#666666",
      };
    }

    // If there's a highlighted capability and this pin has it, highlight the pin
    if (
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

    // If there's a highlighted capability but this pin doesn't have it, dim the pin
    if (highlightedCapability) {
      return {
        fill: "#cccccc",
        opacity: 0.3,
        strokeWidth: 2,
        stroke: "#666666",
      };
    }

    // If assigned, use the assigned type's color
    if (type) {
      return {
        fill: boardUIData.capabilityDetails[type]?.color.bg || "#cccccc",
        opacity: 1,
        strokeWidth: 2,
        stroke: "black",
      };
    }

    // Default state
    return {
      fill: "hsl(var(--card))",
      opacity: 1,
      strokeWidth: 2,
      stroke: "black",
    };
  };

  const calculateBoardPixels = (
    dimensions: { width: number; height: number },
    scale: number
  ) => {
    const pixelDimensions = {
      width: Math.round(dimensions.width * scale),
      height: Math.round(dimensions.height * scale),
    };

    return pixelDimensions;
  };

  const renderComponents = () => {
    const modelName = modelData.name.toLowerCase().replace(/[\s.]+/g, "");
    const imagePath = `/teensy-pins-helper/img/${modelName}-2x.png`;

    // Calculate board dimensions in pixels
    const pixelDimensions = calculateBoardPixels(modelData.dimensions, SCALE);

    // Get the actual image dimensions when loaded
    const image = new Image();
    image.src = imagePath;
    // image.onload = () => {
    //   // Calculate scale factors
    //   const scaleFactorWidth = pixelDimensions.width / image.width;
    //   const scaleFactorHeight = pixelDimensions.height / image.height;
    // };

    return (
      <image
        href={imagePath}
        x="0"
        // Position the image at the bottom of the board
        y="0" // This ensures bottom alignment
        width={pixelDimensions.width}
        height="100%"
        opacity={0.9}
        // preserveAspectRatio="xMidYMax meet" means:
        // xMid: center horizontally
        // YMax: align to bottom
        // meet: scale to fit while preserving aspect ratio
        preserveAspectRatio="xMidYMax meet"
      />
    );
  };

  const renderPins = () => {
    let pinsArray: Pin[] = [];

    pinsArray = Array.isArray(modelData.pins)
      ? modelData.pins
      : Object.values(modelData.pins);

    return pinsArray.map((pin) => {
      const isAssigned = assignments[pin.id];
      const isAssignedPin = assignedPins.includes(pin.id);

      // Constants for styling
      const GOLDEN_COLOR = "#9a916c";
      // const STROKE_WIDTH = SCALE * 0.1;
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

      return (
        <g key={`pin-${pin.id}`}>
          {/* Main pin circle */}
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE + Y_OFFSET}
            r={PIN_RADIUS}
            fill={GOLDEN_COLOR}
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
              isAssignedPin ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )}
          >
            <title>{`Pin ${pin.id}${
              isAssignedPin ? " (Assigned)" : ""
            }`}</title>
          </circle>

          {/* Pin hole */}
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE + Y_OFFSET}
            r={HOLE_RADIUS}
            fill="hsl(var(--card))"
            pointerEvents="none"
          />

          {/* Pin highlight */}
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
            fill="black"
            fontSize="13"
            fontWeight="bold"
            pointerEvents="none"
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

  if (!modelData || !boardUIData) {
    return <div>Loading board data...</div>;
  }

  const { dimensions } = modelData;

  return (
    <svg
      width={dimensions.width * SCALE}
      height={(dimensions.height + 0.9) * SCALE}
      className="board-svg"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* Board outline */}
      <rect
        x="0"
        y={0.9 * SCALE}
        width={dimensions.width * SCALE}
        height={dimensions.height * SCALE}
        // fill="#123e00"
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
  );
};

export default RenderBoard;
