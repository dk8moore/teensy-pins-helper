import React, { useState } from 'react';

const TeensyBoard = () => {
  // Scale factor to convert mm to pixels (adjust as needed for visualization)
  const SCALE = 20;  // 20 pixels per mm
  
  // Board specifications
  const boardData = {
    "name": "Teensy 4.1",
    "dimensions": {
      "width": 18,
      "height": 61
    }
  };

  const componentsData = {
    "microusb": {
      "xposition": 5.25,
      "yposition": 0,
      "width": 7.5,
      "height": 5.0
    },
    "sdcard": {
      "xposition": 2.83,
      "yposition": 48.5,
      "width": 12.36,
      "height": 12.36
    },
    "cpu": {
      "dvj6a": {
        "xposition": 2.83,
        "yposition": 22.86,
        "width": 12.36,
        "height": 12.36
      }
    },
    "button": {
      "xposition": 7.9,
      "yposition": 40.64,
      "width": 2.2,
      "height": 3.0
    }
  };

  // Pin geometry types
  const pinGeometryTypes = {
    "normal": {
      "shape": "circle",
      "radius": 1.1
    },
    "small": {
      "shape": "circle",
      "radius": 0.6
    }
  };

  // Example pins data (truncated for brevity)
  const pinsData = [
    {
      "id": "GND_0",
      "pin": null,
      "geometry": {
        "x": 1.27,
        "y": 1.27,
        "type": "normal"
      },
      "capabilities": {
        "audio": null,
        "i2c": null,
        "can": null,
        "spi": null,
        "serial": null,
        "analog": null,
        "pwm": null
      },
      "type": "GND"
    },
    {
      "id": "AD_B0_03",
      "pin": 0,
      "geometry": {
        "x": 1.27,
        "y": 3.81,
        "type": "normal"
      },
      "capabilities": {
        "audio": null,
        "i2c": null,
        "can": "RX2",
        "spi": "CS1",
        "serial": "RX1",
        "analog": null,
        "pwm": "1X1"
      },
      "type": "GP"
    }
  ];

  // State for selected capability
  const [selectedCapability, setSelectedCapability] = useState(null);

  // Function to check if a pin has a selected capability
  const hasCapability = (pin) => {
    if (!selectedCapability) return false;
    return pin.capabilities[selectedCapability] !== null;
  };

  // Available capabilities
  const capabilities = [
    "digital", "analog", "pwm", "serial", "i2c", "spi", "can", "audio"
  ];

  return (
    <div className="p-4">
      {/* Capability selector buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {capabilities.map(capability => (
          <button
            key={capability}
            onClick={() => setSelectedCapability(
              selectedCapability === capability ? null : capability
            )}
            className={`px-3 py-1 border rounded ${
              selectedCapability === capability 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-blue-100'
            }`}
          >
            {capability.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Board SVG */}
      <svg 
        width={boardData.dimensions.width * SCALE} 
        height={boardData.dimensions.height * SCALE}
        className="border border-gray-300"
      >
        {/* Board outline */}
        <rect
          x="0"
          y="0"
          width={boardData.dimensions.width * SCALE}
          height={boardData.dimensions.height * SCALE}
          fill="#1a9e1a"
          stroke="black"
        />

        {/* Components */}
        {/* USB */}
        <rect
          x={componentsData.microusb.xposition * SCALE}
          y={componentsData.microusb.yposition * SCALE}
          width={componentsData.microusb.width * SCALE}
          height={componentsData.microusb.height * SCALE}
          fill="#silver"
          stroke="black"
        />

        {/* CPU */}
        <rect
          x={componentsData.cpu.dvj6a.xposition * SCALE}
          y={componentsData.cpu.dvj6a.yposition * SCALE}
          width={componentsData.cpu.dvj6a.width * SCALE}
          height={componentsData.cpu.dvj6a.height * SCALE}
          fill="#black"
          stroke="gray"
        />

        {/* SD Card */}
        <rect
          x={componentsData.sdcard.xposition * SCALE}
          y={componentsData.sdcard.yposition * SCALE}
          width={componentsData.sdcard.width * SCALE}
          height={componentsData.sdcard.height * SCALE}
          fill="#silver"
          stroke="black"
        />

        {/* Button */}
        <rect
          x={componentsData.button.xposition * SCALE}
          y={componentsData.button.yposition * SCALE}
          width={componentsData.button.width * SCALE}
          height={componentsData.button.height * SCALE}
          fill="gray"
          stroke="black"
        />

        {/* Pins */}
        {pinsData.map(pin => {
          const geometry = pinGeometryTypes[pin.geometry.type];
          return (
            <circle
              key={pin.id}
              cx={pin.geometry.x * SCALE}
              cy={pin.geometry.y * SCALE}
              r={geometry.radius * SCALE}
              fill={hasCapability(pin) ? '#ff0000' : '#cccccc'}
              stroke="black"
              strokeWidth="1"
            >
              <title>{pin.id} - Pin {pin.pin}</title>
            </circle>
          );
        })}
      </svg>

      {/* Selected capability display */}
      <div className="mt-4">
        Selected: {selectedCapability ? selectedCapability.toUpperCase() : 'None'}
      </div>
    </div>
  );
};

export default TeensyBoard;