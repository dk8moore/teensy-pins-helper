import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from 'lucide-react';
import TeensyBoard from './TeensyBoard';

const TeensyConfigurator = () => {
  const [selectedPin, setSelectedPin] = useState(null);
  const [requirements, setRequirements] = useState([]);
  
  const pinModes = [
    { id: 'digital', label: 'Digital', color: 'bg-blue-500' },
    { id: 'analog', label: 'Analog', color: 'bg-purple-500' },
    { id: 'pwm', label: 'PWM', color: 'bg-orange-500' },
    { id: 'serial', label: 'Serial', color: 'bg-green-500' },
    { id: 'i2c', label: 'I²C', color: 'bg-pink-500' },
    { id: 'spi', label: 'SPI', color: 'bg-yellow-500' },
    { id: 'none', label: 'None', color: 'bg-gray-400' },
  ];

  const handleAddRequirement = () => {
    // To be implemented
  };

  const handleReset = () => {
    setSelectedPin(null);
    setRequirements([]);
  };

  const handleCalculate = () => {
    // To be implemented
  };

  return (
    <div>
      <header className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Teensy Pin Configuration Assistant</h1>
          <p className="text-gray-600 text-sm">Interactive pin configuration tool for Teensy 4.1</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Side - Board */}
          <div className="w-1/3">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Board Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <TeensyBoard 
                  onPinClick={setSelectedPin}
                  selectedPin={selectedPin}
                  pinModes={pinModes}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Configuration */}
          <div className="flex-1 space-y-6">
            {/* Configuration Requirements */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Configuration Requirements</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddRequirement}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Requirement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {requirements.length === 0 ? (
                  <div className="text-center p-6 text-gray-500">
                    No requirements configured
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Requirements will be listed here */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={handleCalculate}
              >
                Calculate Configuration
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-gray-500">
                  Configure pins to see the results
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeensyConfigurator;