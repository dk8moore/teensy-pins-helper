import React, { useState, useEffect } from 'react';
import TeensyBoardSVG from './TeensyBoardSVG';

const TeensyBoard = ({ onPinClick, selectedPinMode, pinModes }) => {
  const [modelData, setModelData] = useState(null);
  const [boardUIData, setBoardUIData] = useState(null);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    // Load model data
    const loadModelData = async () => {
      const response = await fetch('devices/teensy41/model.json');
      const data = await response.json();
      setModelData(data);
    };

    // Load board UI data
    const loadBoardUIData = async () => {
      const response = await fetch('devices/teensy41/board-ui.json');
      const data = await response.json();
      setBoardUIData(data);
    };

    loadModelData();
    loadBoardUIData();
  }, []);

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

  if (!modelData || !boardUIData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center">
        <TeensyBoardSVG
          modelData={modelData}
          boardUIData={boardUIData}
          onPinClick={handlePinClick}
          selectedPinMode={selectedPinMode}
          assignments={assignments}
        />
      </div>
      
      {/* Legend - Now condensed to a horizontal layout */}
      <div className="mt-4 flex flex-wrap gap-3">
        {pinModes.map((mode) => (
          <div
            key={mode.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer 
              ${selectedPinMode === mode.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
            onClick={() => onPinClick(mode.id)}
          >
            <div className={`w-2 h-2 rounded-full ${mode.color}`} />
            <span className="text-xs font-medium text-gray-700">{mode.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeensyBoard;