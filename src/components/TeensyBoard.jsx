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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Visualization */}
      <div className="bg-white rounded-lg p-4 flex justify-center">
        <TeensyBoardSVG
          modelData={modelData}
          boardUIData={boardUIData}
          onPinClick={handlePinClick}
          selectedPinMode={selectedPinMode}
          assignments={assignments}
        />
      </div>

      {/* Pin Mode Legend - Horizontal Layout */}
      <div className="flex flex-wrap gap-2 py-2">
        {pinModes.map((mode) => (
          <button
            key={mode.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
              ${selectedPinMode === mode.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'}`}
            onClick={() => onPinModeSelect?.(mode.id)}
          >
            <div className={`w-2 h-2 rounded-full ${mode.color}`} />
            <span className="text-xs font-medium text-gray-700">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeensyBoard;