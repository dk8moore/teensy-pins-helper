import React, { useState } from 'react';
import TeensyBoardSVG from './TeensyBoardSVG';
import { useTeensyData } from '../hooks/useTeensyData';

const TeensyBoard = ({
  selectedModel,
  onPinClick,
  selectedPinMode,
  pinModes,
  onPinModeSelect
}) => {
  const [assignments, setAssignments] = useState({});
  const [highlightedCapability, setHighlightedCapability] = useState(null);
  const { loading, error, boardUIData, modelData } = useTeensyData(selectedModel);

  const handlePinClick = (pinName, capabilities) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-background rounded-lg">
        <div className="text-muted-foreground">Loading board...</div>
      </div>
    );
  }
  
  if (error) {
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
        {pinModes.map((mode) => (
          <button
            key={mode.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors w-full
              ${selectedPinMode === mode.id
                ? 'ring-1 ring-primary bg-accent/50'
                : 'hover:bg-accent/30'}`}
            onClick={() => onPinModeSelect?.(mode.id)}
            onMouseEnter={() => handleModeHover(mode.id)}
            onMouseLeave={() => handleModeHover(null)}
          >
            <div className={`w-2 h-2 rounded-full ${mode.color}`} />
            <span className="text-sm text-foreground">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Board Visualization - Centered */}
      <div className="flex-shrink-0">
        <TeensyBoardSVG
          modelData={modelData}
          boardUIData={boardUIData}
          onPinClick={handlePinClick}
          selectedPinMode={selectedPinMode}
          assignments={assignments}
          highlightedCapability={highlightedCapability}
        />
      </div>
    </div>
  );
};

export default TeensyBoard;