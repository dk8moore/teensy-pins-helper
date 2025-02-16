import React, { useState } from 'react';
import RenderBoard from './RenderBoard';

const TeensyBoard = ({
  data,
  onPinClick,
  selectedPinMode,
  onPinModeSelect,
  assignedPins = []
}) => {
  const [assignments, setAssignments] = useState({});
  const [highlightedCapability, setHighlightedCapability] = useState(null);

  // Add this constant at the top level of the component:
  const getAllPinModes = (modelData) => {
    // Get unique designations from pins
    const designations = new Set(
      modelData.pins
        .filter(pin => pin.designation)
        .map(pin => pin.designation)
    );
    
    // Combine with functions (formerly capabilities)
    return [...modelData.interfaces, ...Array.from(designations)];
  };


  const genericCapabilities = ['GND', '3V3', '+5V', 'VIN'];

  const handlePinClick = (pinName, capabilities) => {
    // Don't handle clicks on assigned pins
    if (assignedPins.includes(pinName)) return;

    if (!selectedPinMode) return;

    // Update assignments
    setAssignments(prev => ({
      ...prev,
      [pinName]: { type: selectedPinMode }
    }));

    // Call parent handler
    onPinClick(pinName, selectedPinMode);
  };

  const handleModeHover = (modeId) => {
    setHighlightedCapability(modeId === 'none' ? null : modeId);
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
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-6">
      {/* Pin Mode Legend - Left Side */}
      <div className="flex flex-col justify-center gap-1.5 py-2 min-w-[90px] mr-4">
        {getAllPinModes(data.modelData).map((mode) => (
          <button
            key={mode}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors w-full
              ${selectedPinMode === mode
                ? 'ring-1 ring-primary bg-accent/50'
                : 'hover:bg-accent/30'}`}
            onMouseEnter={() => handleModeHover(mode)}
            onMouseLeave={() => handleModeHover(null)}
            onClick={() => onPinModeSelect(mode)}
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: data.boardUIData.capabilityDetails[mode].color.bg }} 
            />
            <span className="text-sm text-foreground">
              {data.boardUIData.capabilityDetails[mode].label}
            </span>
          </button>
        ))}
      </div>

      {/* Board Visualization - Centered */}
      <div className="flex-shrink-0">
        <RenderBoard
          modelData={data.modelData}
          boardUIData={data.boardUIData}
          onPinClick={handlePinClick}
          selectedPinMode={selectedPinMode}
          assignments={assignments}
          highlightedCapability={highlightedCapability}
          assignedPins={assignedPins} // Pass through to SVG
        />
      </div>
    </div>
  );
};

export default TeensyBoard;