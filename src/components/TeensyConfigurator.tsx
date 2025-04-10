import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import PinAssignmentTable from "@/components/PinAssignmentTable";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
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
} from "@/types";
import { optimizePinAssignment } from "@/lib/pin-assignment/optimizer";

// Define state type for hovered pins
interface HoveredPinsState {
  pinIds: string[];
  color: string | null;
}

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

  const [assignmentMap, setAssignmentMap] = useState<
    Record<string, { type: string }>
  >({});

  // State for hovered pins in the assignment table
  const [hoveredPinsState, setHoveredPinsState] = useState<HoveredPinsState>({
    pinIds: [],
    color: null,
  });

  const [highlightedCapability, setHighlightedCapability] = useState<
    string | null
  >(null);

  const [showAssignments, setShowAssignments] = useState<boolean>(false);

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
    // Trigger data reload by setting the same model again (useEffect dependency)
    setSelectedModel((prev) => {
      // Force re-render even if modelId is the same
      // This isn't ideal, ideally useTeensyData would expose a refetch function
      // For now, we briefly change it and change it back, or just set it again
      // which might be enough if the effect checks the value change strictly.
      // Let's try just setting it again. If it doesn't work, a small state flicker might be needed.
      return prev;
    });
    // Reset errors
    setValidationErrors([]);
    setOptimizationResult(null);
    setCalculatedRequirements([]);
  };

  const handleModelSelect = (modelId: string): void => {
    setSelectedModel(modelId);
    // Reset current configuration when changing models
    handleReset();
  };

  useEffect(() => {
    if (optimizationResult && optimizationResult.success) {
      const newAssignmentMap: Record<string, { type: string }> = {};

      calculatedRequirements.forEach((req) => {
        if (req.assignedBlocks) {
          req.assignedBlocks.forEach((block) => {
            block.pinIds.forEach((pinId) => {
              newAssignmentMap[pinId] = { type: req.capability };
            });
          });
        }
      });

      setAssignmentMap(newAssignmentMap);
    } else {
      setAssignmentMap({});
    }
  }, [optimizationResult, calculatedRequirements]);

  const handlePinModeSelect = (modeId: string): void => {
    setSelectedPinMode((prev) => (prev === modeId ? null : modeId));
  };

  const handleAddRequirement = (requirement: Requirement): void => {
    setRequirements((prev) => [...prev, requirement]);
    // Clear results when requirements change
    setValidationErrors([]);
    setOptimizationResult(null);
    setCalculatedRequirements([]);
  };

  const handleUpdateRequirement = (
    id: string,
    updatedRequirement: Requirement
  ): void => {
    setRequirements((prev) => {
      const newRequirements = prev.map((req) => {
        if (req.id !== id) return req;
        return updatedRequirement;
      });
      // Clear results when requirements change
      setValidationErrors([]);
      setOptimizationResult(null);
      setCalculatedRequirements([]);
      return newRequirements;
    });
  };

  const handleDeleteRequirement = (id: string): void => {
    setRequirements((prev) => {
      const newRequirements = prev.filter((req) => req.id !== id);
      // Clear results when requirements change
      setValidationErrors([]);
      setOptimizationResult(null);
      setCalculatedRequirements([]);
      return newRequirements;
    });
  };

  const handlePinClick = (pinName: string): void => {
    // Don't allow clicking on pins that are assigned through single pin requirements
    if (pinsInSinglePinRequirements.includes(pinName)) return;
    console.log(`Pin clicked: ${pinName}`);
    // Potential future use: Select pin for single-pin requirement modification
  };

  const handleReset = (): void => {
    setSelectedPinMode(null);
    setRequirements([]);
    setValidationErrors([]);
    setOptimizationResult(null);
    setCalculatedRequirements([]);
    setHoveredPinsState({ pinIds: [], color: null }); // Reset hover state
  };

  // Callback function to update hovered pins state
  const handleHoverPins = (pinIds: string[], color: string | null): void => {
    setHoveredPinsState({ pinIds, color });
  };

  const handleCalculate = (): void => {
    // Reset previous results
    setValidationErrors([]);
    setOptimizationResult(null);
    setCalculatedRequirements([]); // Clear previous calculated reqs too
    setHoveredPinsState({ pinIds: [], color: null }); // Clear hover state

    if (!loadedData.boardUIData?.capabilityDetails || !loadedData.modelData) {
      // Add an error or notification?
      console.error("Board data not loaded, cannot calculate.");
      setValidationErrors([
        {
          type: "INVALID_REQUIREMENT" as any, // Use a generic type or create one
          message:
            "Board data is not loaded. Please select a board or wait for loading.",
          details: {},
        },
      ]);
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

    // Create a deep copy to avoid modifying state directly during optimization
    const reqCopy = JSON.parse(JSON.stringify(requirements)) as Requirement[];

    // Perform optimization with the current requirements
    const result = optimizePinAssignment(
      reqCopy,
      loadedData.modelData!,
      loadedData.boardUIData.capabilityDetails
    );

    setOptimizationResult(result); // Store the raw result
    // Update the state with the requirements list returned by the optimizer
    // This list might have added 'assignedBlocks' details
    setCalculatedRequirements(result.assignedRequirements);
  };

  const getAssignmentsMap = () => {
    const assignmentsMap: Record<string, { type: string }> = {};

    if (calculatedRequirements) {
      calculatedRequirements.forEach((req) => {
        if (req.assignedBlocks && req.assignedBlocks.length > 0) {
          req.assignedBlocks.forEach((block) => {
            if (block.pinIds) {
              block.pinIds.forEach((pinId) => {
                assignmentsMap[pinId] = { type: req.capability };
              });
            }
          });
        }
      });
    }

    return assignmentsMap;
  };

  const handleModeSelect = (modeId: string): void => {
    // Toggle highlight - if same mode clicked again, turn off highlight
    setHighlightedCapability((prevMode) =>
      prevMode === modeId ? null : modeId
    );
  };

  // Get all pin modes (interfaces) from the model data
  const getAllPinModes = (modelData: any): string[] => {
    // Get unique designations from pins
    const designations = new Set(
      modelData.pins
        .filter((pin: any) => pin.designation)
        .map((pin: any) => pin.designation as string)
    );

    // Combine with interfaces (formerly capabilities)
    return [...modelData.interfaces]; //, ...Array.from(designations)];
  };

  return (
    <div>
      <header className="bg-background border-b p-4">
        <div className="max-w-3xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-center">
              Teensy Pin Mapper
            </h1>
            <p className="text-muted-foreground text-sm text-center">
              Generate pin assignments for Teensy boards
            </p>
          </div>
          {/* Optional: Add ThemeToggle or other header controls here */}
        </div>
      </header>
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Configuration & Results */}
          {/* Added container with height constraint and flex layout */}
          <div className="flex flex-col col-span-1 lg:col-span-7 gap-6">
            {/* Configuration Requirements Card */}
            {/* Added flex flex-col overflow-hidden */}
            <Card className="flex flex-col overflow-hidden">
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
                          loadedData.modelData.interfaces.filter(
                            (iface) => true
                          )
                        )}
                        onAddRequirement={handleAddRequirement}
                        modelData={loadedData.modelData}
                        boardUIData={loadedData.boardUIData}
                        assignedPins={pinsInSinglePinRequirements}
                      />
                    )}
                </div>
              </CardHeader>
              {/* Added flex-1 overflow-hidden p-0 to CardContent */}
              <CardContent className="flex-1 overflow-hidden p-0">
                {/* Added ScrollArea with h-full and padding */}
                <ScrollArea className="h-full p-6 pt-0">
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
                          // Calculate pins assigned to *other* single-pin requirements
                          const otherAssignedPins = requirements
                            .filter(
                              (req) =>
                                req.type === "single-pin" &&
                                req.id !== requirement.id // Exclude the current requirement itself
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
                              assignedPins={otherAssignedPins} // Pass only pins assigned by *other* requirements
                            />
                          );
                        })
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 px-6">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                  disabled={
                    requirements.length === 0 &&
                    !optimizationResult &&
                    validationErrors.length === 0
                  } // Disable if nothing to reset
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  className="flex-1 ml-4"
                  onClick={handleCalculate}
                  disabled={
                    requirements.length === 0 ||
                    loadedData.loading ||
                    !!loadedData.error
                  }
                >
                  Calculate Configuration
                </Button>
              </CardFooter>
            </Card>

            {/* Validation Errors Card (conditional) */}
            {/* This card usually has less content, so scrolling might not be necessary */}
            {validationErrors.length > 0 && (
              <Card className="flex flex-col overflow-hidden">
                <CardHeader>
                  <CardTitle>Configuration Results</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full p-6 pt-0 flex flex-col">
                    <ValidationErrors errors={validationErrors} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Optimization Results Card (conditional) */}
            {optimizationResult &&
              validationErrors.length === 0 && ( // Only show if no validation errors
                <Card className="flex flex-col overflow-hidden">
                  <CardHeader>
                    <CardTitle>Pin Assignments</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <div className="h-full p-6 pt-0 flex flex-col">
                      <PinAssignmentTable
                        success={optimizationResult.success}
                        requirements={calculatedRequirements} // Use the state updated after calculation
                        modelData={loadedData.modelData!}
                        capabilityDetails={
                          loadedData.boardUIData!.capabilityDetails
                        }
                        unassignedRequirements={
                          optimizationResult.unassignedRequirements
                        }
                        onHoverPins={handleHoverPins} // Pass hover handler
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>{" "}
          {/* End Left Side Column */}
          {/* Right Side - Board */}
          <div className="col-span-1 lg:col-span-5">
            {/* <Card className="sticky top-5 flex flex-col h-full"> */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Board</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select your Teensy board model.</p>
                        <p>Click a capability below to highlight pins.</p>
                        <p>
                          Hover over Assignment Table rows to highlight pins.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelSelect={handleModelSelect}
                  availableModels={availableModels}
                  className="ml-auto h-8"
                />
              </CardHeader>

              {/* Separator line */}
              <div className="border-t w-full"></div>

              {/* Main content area with board renderer */}
              <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
                {loadedData.loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-lg text-muted-foreground animate-pulse">
                      Loading board data...
                    </div>
                  </div>
                ) : loadedData.error ? (
                  <ErrorState error={loadedData.error} onRetry={handleRetry} />
                ) : (
                  loadedData.modelData &&
                  loadedData.boardUIData && ( // Ensure data exists before rendering board
                    <TeensyBoard
                      data={loadedData}
                      onPinClick={handlePinClick}
                      selectedPinMode={selectedPinMode}
                      assignedPins={pinsInSinglePinRequirements} // Pass only pins assigned by single-pin reqs
                      assignments={
                        optimizationResult?.success ? getAssignmentsMap() : {}
                      }
                      hoveredPins={hoveredPinsState} // Pass hovered pins state
                      highlightedCapability={highlightedCapability}
                      showAssignments={showAssignments}
                    />
                  )
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t flex flex-wrap gap-2 flex-shrink-0">
                {loadedData.modelData &&
                  getAllPinModes(loadedData.modelData).map((mode) => (
                    <button
                      key={mode}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
                        ${
                          selectedPinMode === mode
                            ? "ring-1 ring-primary bg-accent/50"
                            : "hover:bg-accent/30"
                        }`}
                      onClick={() => {
                        handleModeSelect(mode);
                        handlePinModeSelect(mode);
                        setShowAssignments(false);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            loadedData.boardUIData?.capabilityDetails[mode]
                              ?.color.bg || "#ccc",
                        }}
                      />
                      <span className="text-sm text-foreground">
                        {loadedData.boardUIData?.capabilityDetails[mode]
                          ?.label || mode}
                      </span>
                    </button>
                  ))}

                {pinsInSinglePinRequirements &&
                  pinsInSinglePinRequirements.length > 0 && (
                    <button
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
                        ${
                          showAssignments
                            ? "ring-1 ring-primary bg-accent/50"
                            : "hover:bg-accent/30"
                        }`}
                      onClick={() => {
                        setShowAssignments(!showAssignments);
                        setHighlightedCapability(null); // Clear highlighted capability when toggling assignments
                        handlePinModeSelect(""); // Clear mode selection when toggling assignments
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-sm text-foreground">
                        Assignments
                      </span>
                    </button>
                  )}
              </CardFooter>
            </Card>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default TeensyConfigurator;
