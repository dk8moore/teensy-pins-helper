import React from 'react';

const TeensyBoard = ({ onPinClick, selectedPin, pinModes }) => {
  return (
    <div className="relative">
      {/* The board SVG will be rendered here */}
      <div className="aspect-[9/16] bg-gray-100 rounded-lg">
        {/* We'll integrate the board.js SVG here */}
        <div id="board-container" className="w-full h-full" />
      </div>
      
      {/* Pin mode legend */}
      <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-6 bg-white p-4 rounded-lg shadow-md">
        <div className="space-y-2">
          {pinModes.map((mode) => (
            <div
              key={mode.id}
              className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50"
              onClick={() => onPinClick(mode.id)}
            >
              <div className={`w-3 h-3 rounded-full ${mode.color}`} />
              <span className="text-sm text-gray-700">{mode.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeensyBoard;