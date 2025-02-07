import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from 'lucide-react';
import TeensyBoard from './TeensyBoard';
import ConfigurationRequirement from './ConfigurationRequirement';
import RequirementsDialog from './RequirementsDialog';
import ModelSelector from './ModelSelector';
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TeensyConfigurator = () => {
  const [selectedModel, setSelectedModel] = useState('teensy41');
  const [selectedPinMode, setSelectedPinMode] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [pinAssignments, setPinAssignments] = useState({});
  const [calculatedConfig, setCalculatedConfig] = useState(null);

  const [availableModels] = useState([
    { id: 'teensy41', name: 'Teensy 4.1', available: true },
    { id: 'teensy40', name: 'Teensy 4.0', available: false },
    { id: 'teensy32', name: 'Teensy 3.2', available: false }
  ]);

  // Pin modes with their visual representation
  const pinModes = [
    { id: 'digital', label: 'Digital', color: 'bg-blue-500' },
    { id: 'analog', label: 'Analog', color: 'bg-purple-500' },
    { id: 'pwm', label: 'PWM', color: 'bg-orange-500' },
    { id: 'serial', label: 'Serial', color: 'bg-green-500' },
    { id: 'i2c', label: 'I²C', color: 'bg-pink-500' },
    { id: 'spi', label: 'SPI', color: 'bg-yellow-500' },
    { id: 'none', label: 'None', color: 'bg-gray-400' },
  ];

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    // Reset current configuration when changing models
    handleReset();
  };

  const handlePinModeSelect = (modeId) => {
    setSelectedPinMode(prev => prev === modeId ? null : modeId);
  };

  const handleAddRequirement = (requirement) => {
    setRequirements(prev => [...prev, requirement]);
  };

  const handleUpdateRequirement = (id, updatedRequirement) => {
    setRequirements(prev =>
      prev.map(req => req.id === id ? updatedRequirement : req)
    );
  };

  const handleDeleteRequirement = (id) => {
    setRequirements(prev => prev.filter(req => req.id !== id));
  };

  const handlePinClick = (pinName, mode) => {
    setPinAssignments(prev => ({
      ...prev,
      [pinName]: { type: mode }
    }));
  };

  const handleReset = () => {
    setSelectedPinMode(null);
    setRequirements([]);
    setPinAssignments({});
    setCalculatedConfig(null);
  };

  const handleCalculate = () => {
    const config = {
      model: selectedModel,
      requirements: requirements,
      assignments: pinAssignments,
      timestamp: new Date().toISOString()
    };

    setCalculatedConfig(config);
  };

  return (
    <div>
      <header className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            Teensy Pin Configuration Assistant
          </h1>
          <p className="text-gray-600 text-sm">
            Interactive pin configuration tool for Teensy boards
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Side - Board */}
          <div className="col-span-4">
            <Card className="sticky top-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Board</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select your Teensy board model to view its specific pinout</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelSelect={handleModelSelect}
                  availableModels={availableModels}
                  className="ml-auto"
                />
              </CardHeader>
              <CardContent>
                <TeensyBoard
                  selectedModel={selectedModel}
                  onPinClick={handlePinClick}
                  selectedPinMode={selectedPinMode}
                  pinModes={pinModes}
                  onPinModeSelect={handlePinModeSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Configuration */}
          <div className="col-span-8 space-y-6">
            {/* Configuration Requirements */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Configuration Requirements</CardTitle>
                  <RequirementsDialog onAddRequirement={handleAddRequirement} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.length === 0 ? (
                    <div className="text-center p-6 text-gray-500">
                      No requirements configured. Click "Add Requirement" to start.
                    </div>
                  ) : (
                    requirements.map(requirement => (
                      <ConfigurationRequirement
                        key={requirement.id}
                        requirement={requirement}
                        onDelete={() => handleDeleteRequirement(requirement.id)}
                        onUpdate={(updated) => handleUpdateRequirement(requirement.id, updated)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleCalculate}
                disabled={requirements.length === 0}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeensyConfigurator;