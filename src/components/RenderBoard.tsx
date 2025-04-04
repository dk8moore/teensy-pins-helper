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
  hoveredPins?: HoveredPinsState; // Add hoveredPins prop
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
}) => {
  const SCALE = 15;
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [rotation, setRotation] = useState(0);

  const getPinColor = (pin: Pin, type?: string): PinColorStyle => {
    // Base style determination (similar to before)
    let baseStyle: PinColorStyle = {
      fill: "hsl(var(--card))",
      opacity: 1,
      strokeWidth: 2,
      stroke: "black",
    };

    // If showing calculated assignments and pin is assigned
    if (showAssignments && assignedPins.includes(pin.id)) {
      baseStyle = {
        fill:
          boardUIData.capabilityDetails[assignments[pin.id]?.type]?.color.bg ||
          "#cccccc",
        opacity: 1,
        strokeWidth: 3,
        stroke: "#000000",
      };
    }
    // If there's a highlighted capability and this pin has it
    else if (
      highlightedCapability &&
      ((pin.interfaces && pin.interfaces[highlightedCapability]) ||
        pin.designation === highlightedCapability)
    ) {
      baseStyle = {
        fill: boardUIData.capabilityDetails[highlightedCapability].color.bg,
        opacity: 1,
        strokeWidth: 3,
        stroke: "#000000",
      };
    }
    // If there's a highlighted capability but this pin doesn't have it
    else if (highlightedCapability) {
      baseStyle = {
        fill: "#cccccc",
        opacity: 0.3,
        strokeWidth: 2,
        stroke: "#666666",
      };
    }
    // If assigned (but not showing assignments view, maybe used elsewhere)
    else if (type) {
      baseStyle = {
        fill: boardUIData.capabilityDetails[type]?.color.bg || "#cccccc",
        opacity: 1,
        strokeWidth: 2,
        stroke: "black",
      };
    }

    return baseStyle;
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

    return pinsArray.map((pin) => {
      const isAssigned = assignments[pin.id];
      const isAssignedPin = assignedPins.includes(pin.id);
      const isHovered = hoveredPins.pinIds.includes(pin.id); // Check if pin is hovered

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
              isAssignedPin && !isHovered
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer" // Adjust cursor/opacity based on hover too
            )}
            style={{
              stroke: isHovered ? hoveredPins.color || "#FFD700" : "none", // Add stroke on hover
              strokeWidth: isHovered ? 3 : 0, // Add stroke width on hover
              transition:
                "stroke 0.1s ease-in-out, stroke-width 0.1s ease-in-out", // Smooth transition for hover stroke
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
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        ref={transformComponentRef}
        centerOnInit={true}
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
            width={svgWidth}
            height={svgHeight}
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
