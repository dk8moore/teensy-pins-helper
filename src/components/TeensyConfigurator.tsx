import React, { useState, useMemo } from "react";
import _ from "lodash";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { RotateCcw, Info } from "lucide-react";
import { useTeensyData } from "@/hooks/useTeensyData";
import ErrorState from "@/components/ErrorState";
import TeensyBoard from "@/components/TeensyBoard";
import ConfigurationRequirement from "@/components/ConfigurationRequirement";
import RequirementsDialog from "@/components/RequirementsDialog";
import ModelSelector from "@/components/ModelSelector";
import { validateAllRequirements } from "@/lib/pin-assignment/validator";
import ValidationErrors from "@/components/ValidationErrors";
// import PinAssignmentResults from "@/components/PinAssignmentResults";
import PinAssignmentTable from "@/components/PinAssignmentTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ModelOption,
  Requirement,
  ValidationError,
  OptimizationResult,
  // TeensyDataResult,
  // BoardUIData,
} from "@/types";
import { optimizePinAssignment } from "@/lib/pin-assignment/optimizer";

const TeensyConfigurator: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>("teensy41");
  const [selectedPinMode, setSelectedPinMode] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [calculatedRequirements, setCalculatedRequirements] = useState<
    Requirement[]
  >([]);

  const loadedData = useTeensyData(selectedModel);

  const [availableModels] = useState<ModelOption[]>([
    { id: "teensy41", name: "Teensy 4.1", available: true },
    { id: "teensy40", name: "Teensy 4.0", available: true },
    { id: "teensy36", name: "Teensy 3.6", available: false },
    { id: "teensy32", name: "Teensy 3.2", available: false },
    { id: "teensy35", name: "Teensy 3.5", available: false },
    { id: "teensyLC", name: "Teensy LC", available: false },
    { id: "teensy31", name: "Teensy 3.1", available: false },
    { id: "teensy30", name: "Teensy 3.0", available: false },
  ]);

  // Get assigned pins from single pin requirements
  const pinsInSinglePinRequirements = useMemo<string[]>(() => {
    return requirements
      .filter((req) => req.type === "single-pin")
      .map((req) => req.pin);
  }, [requirements]);

  const handleRetry = (): void => {
    setSelectedModel((prev) => prev);
  };

  const handleModelSelect = (modelId: string): void => {
    setSelectedModel(modelId);
    // Reset current configuration when changing models
    handleReset();
  };

  const handlePinModeSelect = (modeId: string): void => {
    setSelectedPinMode((prev) => (prev === modeId ? null : modeId));
  };

  const handleAddRequirement = (requirement: Requirement): void => {
    setRequirements((prev) => [...prev, requirement]);
  };

  const handleUpdateRequirement = (
    id: string,
    updatedRequirement: Requirement
  ): void => {
    setRequirements((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        return updatedRequirement;
      })
    );
  };

  const handleDeleteRequirement = (id: string): void => {
    setRequirements((prev) => prev.filter((req) => req.id !== id));
  };

  const handlePinClick = (pinName: string): void => {
    // Don't allow clicking on pins that are assigned through single pin requirements
    if (pinsInSinglePinRequirements.includes(pinName)) return;
  };

  const handleReset = (): void => {
    setSelectedPinMode(null);
    setRequirements([]);
    setValidationErrors([]);
    setOptimizationResult(null);
    setCalculatedRequirements([]);
  };

  const handleCalculate = (): void => {
    // Reset previous results
    setValidationErrors([]);
    setOptimizationResult(null);

    if (!loadedData.boardUIData?.capabilityDetails) {
      return;
    }

    // Validate requirements
    const errors = validateAllRequirements(
      requirements,
      loadedData.boardUIData.capabilityDetails
    );
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Create a snapshot of the current state of the requirements for calculation
    setCalculatedRequirements(JSON.parse(JSON.stringify(requirements)));

    // Perform optimization
    const result = optimizePinAssignment(
      requirements,
      loadedData.modelData!,
      loadedData.boardUIData.capabilityDetails
    );
    setOptimizationResult(result);
    setCalculatedRequirements(result.assignedRequirements);
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
                        <p>
                          Select your Teensy board model to view its specific
                          pinout
                        </p>
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
                    <div className="text-lg text-muted-foreground">
                      Loading board data...
                    </div>
                  </div>
                ) : loadedData.error ? (
                  <ErrorState error={loadedData.error} onRetry={handleRetry} />
                ) : (
                  <TeensyBoard
                    data={loadedData}
                    onPinClick={handlePinClick}
                    selectedPinMode={selectedPinMode}
                    onPinModeSelect={handlePinModeSelect}
                    assignedPins={pinsInSinglePinRequirements} // Pass assigned pins to disable them
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
                  {!loadedData.error &&
                    !loadedData.loading &&
                    loadedData.boardUIData &&
                    loadedData.modelData && (
                      <RequirementsDialog
                        capabilities={_.pick(
                          loadedData.boardUIData.capabilityDetails,
                          loadedData.modelData.interfaces
                        )}
                        onAddRequirement={handleAddRequirement}
                        modelData={loadedData.modelData}
                        boardUIData={loadedData.boardUIData}
                        assignedPins={pinsInSinglePinRequirements} // Pass assigned pins to disable them in selection
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
                        No requirements configured. Click "Add Requirement" to
                        start.
                      </div>
                    ) : (
                      requirements.map((requirement) => {
                        // Calculate pins assigned to other requirements
                        const otherAssignedPins = requirements
                          .filter(
                            (req) =>
                              // Include only single-pin requirements that aren't this one
                              req.type === "single-pin" &&
                              req.id !== requirement.id
                          )
                          .map((req) => req.pin);

                        return (
                          <ConfigurationRequirement
                            key={requirement.id}
                            requirement={requirement}
                            onDelete={() =>
                              handleDeleteRequirement(requirement.id)
                            }
                            onUpdate={(updated) =>
                              handleUpdateRequirement(requirement.id, updated)
                            }
                            boardUIData={loadedData.boardUIData!}
                            modelData={loadedData.modelData!}
                            assignedPins={otherAssignedPins}
                          />
                        );
                      })
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
                disabled={
                  requirements.length === 0 ||
                  loadedData.loading ||
                  !!loadedData.error
                }
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
            {validationErrors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ValidationErrors errors={validationErrors} />
                  </div>
                </CardContent>
              </Card>
            )}
            {optimizationResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Pin Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* <PinAssignmentResults
                    success={optimizationResult.success}
                    assignments={optimizationResult.assignments}
                    requirements={requirements}
                    modelData={loadedData.modelData!}
                    capabilityDetails={
                      loadedData.boardUIData!.capabilityDetails
                    }
                    conflicts={optimizationResult.conflicts}
                  /> */}
                  <PinAssignmentTable
                    success={optimizationResult.success}
                    requirements={calculatedRequirements}
                    modelData={loadedData.modelData!}
                    capabilityDetails={
                      loadedData.boardUIData!.capabilityDetails
                    }
                    unassignedRequirements={
                      optimizationResult.unassignedRequirements
                    }
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeensyConfigurator;
