import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ColoredToggleGroup,
  ColoredToggleGroupItem,
} from "@/components/ui/colored-toggle-group";
import { X, Plus, Minus, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Requirement,
  TeensyModelData,
  BoardUIData,
  Pin,
  PeripheralInterface,
  DigitalInterface,
} from "@/types";

const SINGLE_PIN_BG_COLOR = "#000";
const SINGLE_PIN_TEXT_COLOR = "#fff";

interface PinCapability {
  id: string;
  label: string;
  compactLabel?: string;
  description?: string;
  color?: {
    bg: string;
    text: string;
  };
}

interface PinWithCapabilities extends Pin {
  capabilities: PinCapability[];
}

interface PinInfoProps {
  pin: PinWithCapabilities;
  badge?: boolean;
}

// Pin Info component for consistent rendering in both trigger and items
const PinInfo: React.FC<PinInfoProps> = ({ pin, badge = true }) => (
  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
    <span className="font-medium">Pin {pin.number}</span>
    {badge && (
      <div className="flex flex-wrap gap-1">
        {pin.capabilities.map((cap) => (
          <Badge
            key={cap.id}
            className="px-1.5 py-1 h-4 text-[9px] leading-none border-0"
            style={{
              backgroundColor: cap.color?.bg,
              color: cap.color?.text,
            }}
          >
            {cap.compactLabel}
          </Badge>
        ))}
      </div>
    )}
  </div>
);

interface ConfigurationRequirementProps {
  requirement: Requirement;
  onDelete: () => void;
  onUpdate: (updatedRequirement: Requirement) => void;
  boardUIData: BoardUIData;
  modelData: TeensyModelData;
  assignedPins?: string[];
}

const ConfigurationRequirement: React.FC<ConfigurationRequirementProps> = ({
  requirement,
  onDelete,
  onUpdate,
  boardUIData,
  modelData,
  assignedPins = [],
}) => {
  const [isAlertTooltipOpen, setAlertTooltipOpen] = React.useState(false);
  // Get available pins with their capabilities
  const availablePins = React.useMemo<PinWithCapabilities[]>(() => {
    if (!modelData?.pins || !modelData?.interfaces) return [];

    const supportedInterfaces = new Set(modelData.interfaces);
    let pinsArray: Pin[] = [];
    pinsArray = Array.isArray(modelData.pins)
      ? modelData.pins
      : Object.values(modelData.pins);

    return pinsArray
      .filter((pin) => {
        // Skip pins that are already assigned to other requirements
        // but allow the current requirement's pin
        if (
          assignedPins.includes(pin.id) &&
          !(requirement.type === "single-pin" && requirement.pin === pin.id)
        ) {
          return false;
        }

        if (!pin.interfaces) return false;
        return Object.keys(pin.interfaces).some(
          (interface_) =>
            supportedInterfaces.has(interface_) &&
            pin.interfaces &&
            pin.interfaces[interface_] !== null
        );
      })
      .map((pin) => {
        const capabilities = Object.entries(pin.interfaces || {})
          .filter(
            ([type, value]) => value !== null && supportedInterfaces.has(type)
          )
          .map(([type]) => ({
            id: type,
            label: boardUIData?.capabilityDetails?.[type]?.label || type,
            compactLabel: boardUIData?.capabilityDetails?.[type]?.shortlabel,
            description: boardUIData?.capabilityDetails?.[type]?.description,
            color: boardUIData?.capabilityDetails?.[type]?.color,
          }));
        return { ...pin, capabilities };
      })
      .sort((a, b) => a.number - b.number);
  }, [
    modelData?.pins,
    modelData?.interfaces,
    boardUIData,
    assignedPins,
    requirement,
  ]);

  // Get capabilities for selected pin
  const pinCapabilities = React.useMemo<PinCapability[]>(() => {
    if (!requirement.type || requirement.type !== "single-pin") return [];
    if (!requirement.pin) return [];
    const pin = availablePins.find((p) => p.id === requirement.pin);
    return pin?.capabilities || [];
  }, [requirement, availablePins]);

  const selectedPinData = React.useMemo<PinWithCapabilities | undefined>(() => {
    if (requirement.type !== "single-pin") return undefined;
    return availablePins.find((p) => p.id === requirement.pin);
  }, [requirement, availablePins]);

  const renderSinglePinRequirement = () => {
    if (requirement.type !== "single-pin") return null;

    return (
      <div className="flex flex-col md:flex-row w-full gap-2">
        {/* Pin selection - full width on mobile, inline on desktop */}
        <div className="flex flex-col w-auto md:flex-row md:items-center md:mr-1">
          <Select
            value={requirement.pin}
            onValueChange={(value) => {
              const selectedPin = availablePins.find((p) => p.id === value);
              if (!selectedPin) return;

              // Use the existing peripheral if possible, otherwise use the first capability
              let peripheral = requirement.peripheral;
              if (
                !selectedPin.capabilities.some((cap) => cap.id === peripheral)
              ) {
                peripheral = selectedPin.capabilities[0]?.id;
              }

              const updatedReq = {
                ...requirement,
                pin: value,
                number: selectedPin.number,
                peripheral: peripheral,
                capability: peripheral!,
              };
              onUpdate(updatedReq);
            }}
          >
            <SelectTrigger className="w-full md:w-[85px] md:min-w-[85px] md:max-w-[85px] h-9 md:h-7 text-sm md:text-xs">
              <SelectValue>
                {selectedPinData ? (
                  <PinInfo pin={selectedPinData} badge={false} />
                ) : (
                  "Select a pin"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px] w-auto p-1">
                {availablePins.map((pin) => (
                  <SelectItem
                    key={pin.id}
                    value={pin.id}
                    className="flex items-center gap-2 py-2"
                  >
                    <PinInfo pin={pin} />
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Function selection - Mobile optimized */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          <div className="md:hidden flex items-center gap-2 mb-0 mt-3">
            <span className="text-sm text-gray-500">Function:</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
            <div className="hidden md:block">{separator}</div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-1 w-full">
              <span className="hidden md:inline text-sm text-gray-500">
                Function:
              </span>
              <div className="flex flex-wrap md:flex-nowrap gap-1 w-full md:w-auto">
                {/* On mobile: grid of buttons, On desktop: original design */}
                <div className="w-full md:w-auto grid grid-cols-3 gap-1 md:hidden">
                  {pinCapabilities.map((capability) => {
                    const isSelected = requirement.peripheral === capability.id;
                    return (
                      <button
                        key={capability.id}
                        className="text-[11px] px-2 py-1.5 rounded-md transition-colors"
                        style={{
                          backgroundColor: isSelected
                            ? capability.color?.bg
                            : "#f9fafb", // Light background for unselected
                          color: isSelected
                            ? capability.color?.text
                            : capability.color?.bg,
                          border: isSelected
                            ? "none"
                            : `1px solid ${capability.color?.bg || "#e5e7eb"}`,
                        }}
                        onClick={() => {
                          const updatedRequirement = {
                            ...requirement,
                            peripheral: capability.id,
                            capability: capability.id,
                          };
                          onUpdate(updatedRequirement);
                        }}
                      >
                        {capability.compactLabel || capability.label}
                      </button>
                    );
                  })}
                </div>
                <ColoredToggleGroup
                  type="single"
                  value={requirement.peripheral}
                  onValueChange={(value: string | undefined) => {
                    if (value) {
                      const updatedRequirement = {
                        ...requirement,
                        peripheral: value,
                        capability: value,
                      };
                      onUpdate(updatedRequirement);
                    }
                  }}
                  disabled={!requirement.pin}
                  className="hidden md:flex h-7.5 p-0.5"
                >
                  {pinCapabilities.map((capability) => {
                    const isSelected = requirement.peripheral === capability.id;
                    return (
                      <ColoredToggleGroupItem
                        key={capability.id}
                        value={capability.id}
                        className="text-[11px] px-2 h-6 transition-colors"
                        style={{
                          backgroundColor: isSelected
                            ? capability.color?.bg
                            : "transparent",
                          color: isSelected
                            ? capability.color?.text
                            : capability.color?.bg,
                        }}
                      >
                        {capability.compactLabel || capability.label}
                      </ColoredToggleGroupItem>
                    );
                  })}
                </ColoredToggleGroup>
                {/* Port display */}
                {requirement.peripheral && (
                  <div className="flex w-full items-center">
                    <span
                      className="flex items-center justify-center text-[11px] font-bold px-0.5 h-8 md:h-6 w-full md:w-[65px] transition-colors rounded-md md:rounded-none"
                      style={{
                        backgroundColor: "#f9fafb", // light background
                        color:
                          boardUIData.capabilityDetails[requirement.peripheral!]
                            ?.color.text,
                      }}
                    >
                      {(() => {
                        if (
                          !requirement.pin ||
                          !selectedPinData ||
                          !requirement.peripheral
                        )
                          return null;
                        const iface = selectedPinData.interfaces
                          ? selectedPinData.interfaces[requirement.peripheral]
                          : null;
                        if (!iface) return null;
                        if (requirement.peripheral === "digital") {
                          const digitalInterface = iface as DigitalInterface;
                          return `GPIO ${digitalInterface.gpio.port}.${digitalInterface.gpio.bit}`;
                        } else {
                          if (typeof iface === "string") return iface;
                          const peripheralInterface =
                            iface as PeripheralInterface;
                          return (
                            peripheralInterface.name + peripheralInterface.port
                          );
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const countControl = (type: "port" | "pin") => {
    if (!requirement.peripheral) return null;

    const calculateMaxCount = () => {
      if (requirement.capability === "digital" && requirement.gpioPort) {
        switch (requirement.gpioPort) {
          case "R":
            return (
              boardUIData.capabilityDetails[requirement.peripheral!]?.max! || 1
            );
          case "A":
            return Math.max(
              ...(Object.values(
                boardUIData.capabilityDetails[requirement.peripheral!]
                  .gpioPinCount!
              ) as number[])
            );
          default:
            return (
              boardUIData.capabilityDetails[requirement.peripheral!]
                ?.gpioPinCount[requirement.gpioPort!] || 0
            );
        }
      } else {
        return boardUIData.capabilityDetails[requirement.peripheral!]?.max || 1;
      }
    };

    const maxCount = calculateMaxCount();

    return (
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500 w-11">
          {type === "port" ? "Ports:" : "Pins:"}
        </span>
        <div className="inline-flex items-center bg-white rounded-md border border-gray-200">
          <Button
            variant="ghost"
            className="h-9 md:h-7 w-9 md:w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => {
              const currentCount = requirement.count;
              const newCount =
                currentCount <= 0 ? 0 : Math.max(1, currentCount - 1);
              onUpdate({
                ...requirement,
                count: newCount,
              });
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="w-9 md:w-5 h-9 md:h-6 flex items-center justify-center bg-gray-50">
            <span className="text-xs font-medium">{requirement.count}</span>
          </div>
          <Button
            variant="ghost"
            className="h-9 md:h-7 w-9 md:w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => {
              const currentCount = requirement.count;
              const newCount = Math.min(currentCount + 1, maxCount);

              onUpdate({
                ...requirement,
                count: newCount,
              });
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const separator = (
    <div className="hidden md:block md:h-9 md:w-px h-px w-full md:my-0 my-2 bg-gray-200" />
  );

  const gpioGroupInput = () => {
    if (!requirement.peripheral) return null;

    const getMaxCountForPort = (port: string) => {
      switch (port) {
        case "R":
          return (
            boardUIData.capabilityDetails[requirement.peripheral!]?.max! || 1
          );
        case "A":
          return Math.max(
            ...(Object.values(
              boardUIData.capabilityDetails[requirement.peripheral!]
                .gpioPinCount!
            ) as number[])
          );
        default:
          return (
            boardUIData.capabilityDetails[requirement.peripheral!]
              ?.gpioPinCount[port] || 0
          );
      }
    };

    return (
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
        <span className="text-sm text-gray-500">GPIO:</span>
        <ToggleGroup
          type="single"
          value={requirement.gpioPort || "R"}
          onValueChange={(value) => {
            if (!value) return; // Prevent deselection
            const max = getMaxCountForPort(value);
            onUpdate({
              ...requirement,
              gpioPort: value,
              count:
                max <= 0
                  ? 0
                  : requirement.count === 0
                  ? 1
                  : requirement.count > max
                  ? max
                  : requirement.count,
              allocation: "pin",
            });
          }}
          className="p-0.5 border rounded-md w-full md:w-auto grid grid-cols-6 md:flex"
        >
          {["R", "1", "2", "3", "4", "A"].map((value) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={`GPIO ${value}`}
              style={{
                backgroundColor:
                  requirement.gpioPort === value
                    ? boardUIData.capabilityDetails[requirement.peripheral!]
                        ?.color.bg
                    : "transparent",
                color:
                  boardUIData.capabilityDetails[requirement.peripheral!]?.color
                    .text,
              }}
              className="px-2 h-9 md:h-6 text-xs transition-colors"
            >
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    );
  };

  const optionalPinsInput = () => {
    if (!requirement.peripheral) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Optional pins:</span>
        <input
          type="checkbox"
          checked={requirement.includeOptionalPins || false}
          onChange={(e) =>
            onUpdate({
              ...requirement,
              includeOptionalPins: e.target.checked,
            })
          }
          className="h-5 w-5 md:h-4 md:w-4 rounded border-gray-300"
          style={{
            accentColor:
              boardUIData.capabilityDetails[requirement.peripheral!]?.color.bg,
          }}
        />
      </div>
    );
  };

  const renderPeripheralInputLine = (
    type: "port" | "pin",
    gpio = false,
    optionalPins = false
  ) => {
    return (
      <div className="flex flex-col md:flex-row gap-3 w-full">
        {/* Count control - Always first */}
        <div className="flex items-center gap-2">{countControl(type)}</div>

        {gpio && (
          <>
            {separator}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              {gpioGroupInput()}
            </div>
          </>
        )}

        {optionalPins && (
          <>
            {separator}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              {optionalPinsInput()}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderDeleteButton = (
    additionalClassNames: string,
    onClick: () => void
  ) => {
    const className = `p-0 ${additionalClassNames}`;
    return (
      <Button variant="ghost" size="sm" className={className} onClick={onClick}>
        <X className="h-4 w-4" />
      </Button>
    );
  };

  const renderPeripheralRequirement = () => {
    if (!requirement.peripheral) return null;

    switch (requirement.peripheral) {
      case "digital":
        return renderPeripheralInputLine("pin", true);
      case "spi":
        return renderPeripheralInputLine("port", false, true);
      case "i2c":
      case "serial":
      case "can":
        return renderPeripheralInputLine("port");
      case "analog":
      case "pwm":
        return renderPeripheralInputLine("pin");
      default:
        return (
          <div className="p-2 bg-yellow-50 text-yellow-800 rounded-md">
            <p className="text-sm">
              This requirement is not supported: remove it and create a new one.
            </p>
          </div>
        );
    }
  };

  const renderAlertIcon = (additionalClassNames: string) => {
    const showAlert =
      requirement.peripheral &&
      boardUIData.capabilityDetails[requirement.peripheral]?.allocation ===
        "port";
    const className = `md:flex justify-start md:items-center mt-1 md:mt-0 ${additionalClassNames}`;
    return (
      showAlert && (
        <div className={className}>
          <TooltipProvider>
            <Tooltip
              open={isAlertTooltipOpen}
              onOpenChange={setAlertTooltipOpen}
            >
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setAlertTooltipOpen(!isAlertTooltipOpen)}
                >
                  <AlertTriangle className="h-7 w-7 stroke-black stroke-[2.5] fill-yellow-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  This is a port peripheral: you should assign also other
                  required pins of the same port peripheral.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    );
  };

  return (
    <Card className="p-3 bg-white border-gray-200">
      <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center">
        {/* Header section - Always visible at top on mobile */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="flex items-center gap-1">
            <Badge
              className="min-w-[60px] text-sm md:text-xs justify-center border-0"
              style={{
                backgroundColor:
                  requirement.type === "single-pin"
                    ? SINGLE_PIN_BG_COLOR
                    : boardUIData.capabilityDetails[requirement.peripheral!]
                        ?.color.bg,
                color:
                  requirement.type === "single-pin"
                    ? SINGLE_PIN_TEXT_COLOR
                    : boardUIData.capabilityDetails[requirement.peripheral!]
                        ?.color.text,
              }}
            >
              {requirement.type === "single-pin" ? "Single" : requirement.label}
            </Badge>

            {/* Alert icon - shown in mobile */}
            {requirement.type === "single-pin"
              ? renderAlertIcon("md:hidden flex items-center mb-1")
              : null}
          </div>

          {/* Delete button - moved to top right on mobile */}
          {renderDeleteButton(
            "md:hidden h-8 w-8 text-red-600 bg-red-50",
            onDelete
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-4">
          {requirement.type === "single-pin"
            ? renderSinglePinRequirement()
            : renderPeripheralRequirement()}
        </div>

        {/* Alert icon - shown on desktop */}
        {requirement.type === "single-pin"
          ? renderAlertIcon("hidden md:flex items-center mt-0")
          : null}

        {/* Delete button - hidden on mobile, shown on desktop */}
        {renderDeleteButton(
          "hidden md:flex h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-auto",
          onDelete
        )}
      </div>
    </Card>
  );
};

export default ConfigurationRequirement;
