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

interface RenderBoardProps {
  modelData: TeensyModelData;
  boardUIData: BoardUIData;
  onPinClick: (pinName: string) => void; // Removed mode from signature
  assignments?: Record<string, { type: string }>;
  assignedPins?: string[];
  activeLegendItem?: string | null;
}

const RenderBoard: React.FC<RenderBoardProps> = ({
  modelData,
  boardUIData,
  onPinClick,
  assignments = {},
  assignedPins = [],
  activeLegendItem,
}) => {
  const SCALE = 15;
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [rotation, setRotation] = useState(0);

  const getPinColor = (pin: Pin): PinColorStyle => {
    const isPinAssignedByResult = assignedPins.includes(pin.id);

    // Case 1: "Assignments" legend item is active
    if (activeLegendItem === "assignments") {
      if (isPinAssignedByResult && assignments[pin.id]?.type) {
        const assignedType = assignments[pin.id].type;
        return {
          fill:
            boardUIData.capabilityDetails[assignedType]?.color.bg || "#cccccc",
          opacity: 1,
          strokeWidth: 0,
          stroke: "#000000", // Use black stroke for assigned pins highlight
        };
      } else {
        // If assignments are active, dim non-assigned pins
        return {
          fill: "#cccccc",
          opacity: 0.3,
          strokeWidth: 2,
          stroke: "#666666",
        };
      }
    }

    // Case 2: A capability legend item is active
    if (activeLegendItem) {
      const hasCapability =
        (pin.interfaces && pin.interfaces[activeLegendItem]) ||
        pin.designation === activeLegendItem;

      if (hasCapability) {
        return {
          fill:
            boardUIData.capabilityDetails[activeLegendItem]?.color.bg ||
            "#cccccc",
          opacity: 1,
          strokeWidth: 0,
          stroke: "#000000", // Use black stroke for capability highlight
        };
      } else {
        // If a capability is active, dim pins without it
        return {
          fill: "#cccccc",
          opacity: 0.3,
          strokeWidth: 2,
          stroke: "#666666",
        };
      }
    }

    // Case 3: No legend item is active (default view)
    // Pins assigned by the result should maybe keep their color?
    // Requirement: "otherwise will not be highlighted". Let's keep them default.
    // if (isPinAssignedByResult && assignments[pin.id]?.type) {
    //   const assignedType = assignments[pin.id].type;
    //   return {
    //     fill: boardUIData.capabilityDetails[assignedType]?.color.bg || '#cccccc',
    //     opacity: 1,
    //     strokeWidth: 2,
    //     stroke: "black",
    //   };
    // }

    // Default state for non-highlighted pins
    return {
      fill: "hsl(var(--card))", // Let's use card background
      opacity: 1,
      strokeWidth: 0,
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
      const isAssignedPin = assignedPins.includes(pin.id);

      // Constants for styling
      const GOLDEN_COLOR = "#9a916c";
      const PIN_RADIUS =
        boardUIData.pinShapes[pin.geometry.type]?.radius! * SCALE;
      const HOLE_RADIUS = PIN_RADIUS * 0.75;
      const Y_OFFSET = 0.9 * SCALE;
      const holeStyle = getPinColor(pin);

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
            onClick={() => onPinClick(pin.id)}
            className={cn(
              "transition-all duration-200",
              // Dimming is now handled by getPinColor, cursor logic remains
              isAssignedPin && activeLegendItem !== "assignments" // Make non-clickable only if assigned AND assignments view isn't active
                ? "cursor-not-allowed" // Keep non-clickable if assigned (unless assignments view is on?)
                : "cursor-pointer"
            )}
            style={{
              // Apply opacity directly if needed, though getPinColor handles it too
              opacity: holeStyle.opacity < 1 ? 0.5 : 1, // Dim the outer ring too if hole is dimmed
            }}
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
            fill="hsl(var(--card))" // Keep background color consistent
            stroke={holeStyle.stroke} // Apply stroke from style
            strokeWidth={holeStyle.strokeWidth} // Apply stroke width from style
            opacity={holeStyle.opacity} // Apply opacity from style
            pointerEvents="none"
          />

          {/* Pin highlight (now the colored part inside the hole) */}
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE + Y_OFFSET}
            r={HOLE_RADIUS * 0.8} // Slightly smaller inner circle for the color fill
            fill={holeStyle.fill} // Fill color comes from getPinColor
            opacity={holeStyle.opacity} // Opacity comes from getPinColor
            pointerEvents="none"
          />

          {/* Pin label */}
          <text
            x={pin.geometry.x * SCALE}
            y={pin.geometry.y * SCALE + Y_OFFSET + 0.08 * SCALE}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={holeStyle.opacity < 1 ? "#999" : "black"} // Dim text if pin is dimmed
            fontSize="13"
            fontWeight="bold"
            pointerEvents="none"
          >
            {/* ... (keep label logic) */}
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
