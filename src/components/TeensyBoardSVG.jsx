import React from 'react';
import { cn } from '@/lib/utils';

const TeensyBoardSVG = ({
  modelData,
  boardUIData,
  onPinClick,
  selectedPinMode,
  assignments = {},
  highlightedCapability,
  assignedPins = []
}) => {
  const SCALE = 15;

  const getComponentSpec = (component) => {
    if (!component || !component.type) {
      console.error('Invalid component:', component);
      return null;
    }

    try {
      if (component.type === 'cpu' && component.model) {
        return boardUIData.boardComponents?.cpu?.[component.model] || null;
      }
      return boardUIData.boardComponents?.[component.type] || null;
    } catch (error) {
      console.error('Error getting component specification:', error);
      return null;
    }
  };

  const getPinColor = (pin, type) => {
    const colorMap = {
      'GND': '#312f2f',
      '3V3': '#dc4b4f',
      'can': '#fad0df',
      'spi': '#c0e7b1',
      'i2c': '#c6b7db',
      'serial': '#dde3f2',
      'pwm': '#f9acae',
      'analog': '#fbd4a3',
      'digital': '#cfd2d2',
      'ethernet': '#f9e2d2',
    };

    // If pin is in assignedPins list, use a specific style
    if (assignedPins.includes(pin.id)) {
      return {
        fill: colorMap[assignments[pin.id]?.type] || '#cccccc',
        opacity: 0.7,
        strokeWidth: 3,
        stroke: '#666666'
      };
    }

    // Handle special pin types (GND, 3V3, etc.)
    if (pin.type === 'GND' || pin.type === '3V3' || !pin.capabilities) {
      return {
        fill: colorMap[pin.type] || '#cccccc',
        opacity: 1,
        strokeWidth: 2,
        stroke: 'black'
      };
    }

    // If there's a highlighted capability and this pin has it, use a highlighted color
    if (highlightedCapability && pin.capabilities[highlightedCapability]) {
      return {
        fill: colorMap[highlightedCapability] || '#cccccc',
        opacity: 1,
        strokeWidth: 3,
        stroke: 'black'
      };
    }

    // If assigned, use the assigned type's color
    if (type) {
      return {
        fill: colorMap[type] || '#cccccc',
        opacity: 1,
        strokeWidth: 2,
        stroke: 'black'
      };
    }

    // Default state
    return {
      fill: '#cccccc',
      opacity: highlightedCapability ? 0.3 : 1,
      strokeWidth: 2,
      stroke: 'black'
    };
  };

  const renderComponents = () => {
    if (!modelData?.components || !Array.isArray(modelData.components)) {
      return null;
    }

    return modelData.components.map((component, index) => {
      const spec = getComponentSpec(component);
      if (!spec) return null;

      const props = {
        x: component.xposition * SCALE,
        y: component.yposition * SCALE,
        width: spec.width * SCALE,
        height: spec.height * SCALE,
        fill: spec.color || 'silver',
        stroke: 'black',
        strokeWidth: '0.5',
        'data-component-type': component.type,
        'data-component-model': component.model
      };

      if (spec.shape === 'rounded-rectangle') {
        return (
          <rect
            key={`${component.type}-${index}`}
            {...props}
            rx={spec.cornerRadius * SCALE}
            ry={spec.cornerRadius * SCALE}
          />
        );
      }

      return <rect key={`${component.type}-${index}`} {...props} />;
    });
  };

  const renderPins = () => {
    const pinsArray = Array.isArray(modelData.pins) ? modelData.pins : Object.values(modelData.pins);

    return pinsArray.map((pin) => {
      const isAssigned = assignments[pin.id];
      const pinStyle = getPinColor(pin, isAssigned?.type);
      const isAssignedPin = assignedPins.includes(pin.id);

      return (
        <g key={`pin-${pin.id}`}>
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE}
            r={boardUIData.pinShapes[pin.geometry.type].radius * SCALE}
            fill={pinStyle.fill}
            stroke={pinStyle.stroke}
            strokeWidth={pinStyle.strokeWidth}
            opacity={pinStyle.opacity}
            data-pin={pin.id}
            data-capabilities={pin.capabilities == null ? null : Object.entries(pin.capabilities)
              .filter(([_, value]) => value !== null)
              .map(([type]) => type)
              .join(' ')}
            onClick={() => onPinClick(pin.id, pin.capabilities)}
            className={cn(
              "transition-all duration-200".concat(isAssignedPin ? " cursor-not-allowed" : " cursor-pointer"),
            )}
          >
            <title>{`Pin ${pin.number?.toString() || pin.type}${isAssignedPin ? ' (Assigned)' : ''}`}</title>
          </circle>
          <text
            x={pin.geometry.x * SCALE}
            y={pin.geometry.y * SCALE + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={`${SCALE * 0.7}px`}
            fill="black"
            opacity={pinStyle.opacity}
            pointerEvents="none"
          >
            {pin.number?.toString() || pin.type}
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
      height={dimensions.height * SCALE}
      className="board-svg"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Board outline */}
      <rect
        x="0"
        y="0"
        width={dimensions.width * SCALE}
        height={dimensions.height * SCALE}
        fill="#82cf8f"
        stroke="currentColor"
        strokeWidth="4"
        className="dark:fill-[#3b5f42]"
      />

      {/* Components */}
      {renderComponents()}

      {/* Pins */}
      {renderPins()}
    </svg>
  );
};

export default TeensyBoardSVG;