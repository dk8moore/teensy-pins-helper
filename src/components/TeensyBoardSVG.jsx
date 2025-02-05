import React, { useEffect, useRef } from 'react';

const TeensyBoardSVG = ({ 
  modelData, 
  boardUIData, 
  onPinClick,
  selectedPinMode,
  assignments = {} 
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

  const getPinColor = (type) => {
    const colorMap = {
      'gnd': '#312f2f',
      '3v3': '#dc4b4f',
      'can': '#fad0df',
      'spi': '#c0e7b1',
      'i2c': '#c6b7db',
      'serial': '#dde3f2',
      'pwm': '#f9acae',
      'analog': '#fbd4a3',
      'digital': '#cfd2d2',
    };
    return colorMap[type] || '#cccccc';
  };

  const renderComponents = () => {
    if (!modelData?.components || !Array.isArray(modelData.components)) {
      return null;
    }

    return modelData.components.map((component, index) => {
      const spec = getComponentSpec(component);
      if (!spec) return null;

      const commonProps = {
        key: `${component.type}-${index}`,
        x: component.xposition * SCALE,
        y: component.yposition * SCALE,
        width: spec.width * SCALE,
        height: spec.height * SCALE,
        fill: spec.color || 'silver',
        stroke: 'black',
        strokeWidth: '0.5',
        'data-component-type': component.type,
        'data-component-model': component.model || undefined
      };

      if (spec.shape === 'rounded-rectangle') {
        return (
          <rect
            {...commonProps}
            rx={spec.cornerRadius * SCALE}
            ry={spec.cornerRadius * SCALE}
          />
        );
      }

      return <rect {...commonProps} />;
    });
  };

  const renderPins = () => {
    return Object.entries(modelData.pins).map(([name, pin]) => {
      const capabilities = Object.entries(pin.capabilities)
        .filter(([_, value]) => value !== null)
        .map(([type]) => type);

      const isAssigned = assignments[name];
      const fillColor = isAssigned ? getPinColor(isAssigned.type) : '#cccccc';

      return (
        <g key={name}>
          <circle
            cx={pin.geometry.x * SCALE}
            cy={pin.geometry.y * SCALE}
            r={boardUIData.pinTypes[pin.geometry.type].radius * SCALE}
            fill={fillColor}
            stroke="black"
            strokeWidth="2"
            data-pin={name}
            data-capabilities={capabilities.join(' ')}
            onClick={() => onPinClick(name, capabilities)}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.2)';
              e.target.style.zIndex = '10';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.zIndex = '1';
            }}
          >
            <title>{`Pin ${pin.pin || pin.type}`}</title>
          </circle>
          <text
            x={pin.geometry.x * SCALE}
            y={pin.geometry.y * SCALE + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={`${SCALE * 0.7}px`}
            fill="black"
            pointerEvents="none"
          >
            {pin.pin?.toString() || pin.type}
          </text>
        </g>
      );
    });
  };

  const { dimensions } = modelData;

  return (
    <svg
      width={dimensions.width * SCALE}
      height={dimensions.height * SCALE}
      className="board-svg"
    >
      {/* Board outline */}
      <rect
        x="0"
        y="0"
        width={dimensions.width * SCALE}
        height={dimensions.height * SCALE}
        fill="#82cf8f"
        stroke="black"
        strokeWidth="4"
      />
      
      {/* Components */}
      {renderComponents()}
      
      {/* Pins */}
      {renderPins()}
    </svg>
  );
};

export default TeensyBoardSVG;