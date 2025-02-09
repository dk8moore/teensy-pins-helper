import React, { useState } from 'react';
import _ from 'lodash';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ThemeToggle from './ThemeToggle';
import { Button } from "@/components/ui/button";
import { RotateCcw } from 'lucide-react';
import { useTeensyData } from '@/hooks/useTeensyData';
import ErrorState from './ErrorState';
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
  
  const loadedData = useTeensyData(selectedModel);

  const [availableModels] = useState([
    { id: 'teensy41', name: 'Teensy 4.1', available: true },
    { id: 'teensy40', name: 'Teensy 4.0', available: false },
    { id: 'teensy36', name: 'Teensy 3.6', available: false },
    { id: 'teensy32', name: 'Teensy 3.2', available: false },
    { id: 'teensy35', name: 'Teensy 3.5', available: false },
    { id: 'teensyLC', name: 'Teensy LC', available: false },
    { id: 'teensy31', name: 'Teensy 3.1', available: false },
    { id: 'teensy30', name: 'Teensy 3.0', available: false },
    // { id: 'teensy++20', name: 'Teensy++ 2.0', available: false },
    // { id: 'teensy20', name: 'Teensy 2.0', available: false }
  ]);

  const handleRetry = () => {
    setSelectedModel(prev => prev);
  };

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
      <header className="bg-background border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Teensy Pin Configuration Assistant
            </h1>
            <p className="text-muted-foreground text-sm">
              Interactive pin configuration tool for Teensy boards
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Side - Board */}
          <div className="col-span-5">
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
                {loadedData.loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-muted-foreground">Loading board data...</div>
                  </div>
                ) : loadedData.error ? (
                  <ErrorState 
                    error={loadedData.error} 
                    onRetry={() => setSelectedModel(prev => prev)}
                  />
                ) : (
                  <TeensyBoard
                    data={loadedData}
                    onPinClick={handlePinClick}
                    selectedPinMode={selectedPinMode}
                    onPinModeSelect={handlePinModeSelect}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Configuration */}
          <div className="col-span-7 space-y-6">
            {/* Configuration Requirements */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Configuration Requirements</CardTitle>
                  {!loadedData.error && !loadedData.loading && (
                    <RequirementsDialog 
                      capabilities={_.pick(loadedData.boardUIData.capabilityDetails, loadedData.modelData.capabilities)} 
                      onAddRequirement={handleAddRequirement} 
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadedData.loading ? (
                  <div className="text-center p-6 text-muted-foreground">
                    Loading capabilities...
                  </div>
                ) : loadedData.error ? (
                  <div className="text-center p-6 text-muted-foreground">
                    Unable to load capabilities due to data loading error
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requirements.length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">
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
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleCalculate}
                disabled={requirements.length === 0 || loadedData.loading || loadedData.error}
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