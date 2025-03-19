import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ColoredToggleGroup,
  ColoredToggleGroupItem,
} from "@/components/ui/colored-toggle-group";
import { X, Plus, Minus /*, ArrowLeftRight*/ } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Requirement,
  // SinglePinRequirement,
  TeensyModelData,
  BoardUIData,
  // CapabilityDetail,
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
  <div className="flex items-center gap-3">
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
        if (assignedPins.includes(pin.id)) {
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

  // const selectedCapabilityData = React.useMemo<
  //   PinCapability | undefined
  // >(() => {
  //   if (requirement.type !== "single-pin") return undefined;
  //   return pinCapabilities.find((c) => c.id === requirement.peripheral);
  // }, [requirement, pinCapabilities]);

  const renderSinglePinRequirement = () => {
    if (requirement.type !== "single-pin") return null;

    return (
      <div className="flex items-center gap-3">
        <Select
          value={requirement.pin}
          onValueChange={(value) => {
            const selectedPin = availablePins.find((p) => p.id === value);
            if (!selectedPin) return;

            onUpdate({
              ...requirement,
              pin: value,
              number: selectedPin.number,
              peripheral: undefined,
            });
          }}
        >
          <SelectTrigger className="w-[85px] min-w-[85px] max-w-[85px] h-7 text-xs">
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

        {separator}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Capability:</span>
          <ColoredToggleGroup
            type="single"
            value={requirement.peripheral}
            onValueChange={(value: string | undefined) => {
              if (value) {
                onUpdate({
                  ...requirement,
                  peripheral: value,
                });
              }
            }}
            disabled={!requirement.pin}
            className="h-7.5 p-0.5"
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
          <span
            className="flex items-center justify-center text-[11px] font-bold px-0.5 h-6 w-[65px] transition-colors"
            style={{
              backgroundColor: "#f9fafb", // light background
              color:
                boardUIData.capabilityDetails[requirement.peripheral!]?.color
                  .text,
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
                const peripheralInterface = iface as PeripheralInterface;
                return peripheralInterface.name;
              }
            })()}
          </span>
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
                ?.gpioPinCount[requirement.gpioPort!] || 1
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
            className="h-7 w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => {
              const currentCount = requirement.count;
              const newCount = Math.max(1, currentCount - 1);
              onUpdate({
                ...requirement,
                count: newCount,
              });
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="w-5 h-6 flex items-center justify-center bg-gray-50">
            <span className="text-xs font-medium">{requirement.count}</span>
          </div>
          <Button
            variant="ghost"
            className="h-7 w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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

  /*
  const boardSideControl = () => {
    if (!requirement.peripheral) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Side:</span>
        <ToggleGroup
          type="single"
          value={requirement.boardSide || "E"}
          onValueChange={(value) => {
            if (value)
              onUpdate({
                ...requirement,
                boardSide: value,
              });
          }}
          className="p-0.5 border rounded-md"
        >
          {["L", "E", "R"].map((value) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={`${value} side`}
              style={{
                backgroundColor:
                  requirement.boardSide === value
                    ? boardUIData.capabilityDetails[requirement.peripheral!]
                        ?.color.bg
                    : "transparent",
                color:
                  boardUIData.capabilityDetails[requirement.peripheral!]?.color
                    .text,
              }}
              className="px-2 h-6 text-xs transition-colors"
            >
              {value === "E" ? <ArrowLeftRight className="h-3 w-3" /> : value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    );
  };
  */

  const separator = <div className="h-9 w-px bg-gray-200" />;

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
              ?.gpioPinCount[port] || 1
          );
      }
    };

    return (
      <div className="flex items-center gap-2">
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
              count: requirement.count > max ? max : requirement.count,
              allocation: "pin",
            });
          }}
          className="p-0.5 border rounded-md"
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
              className="px-2 h-6 text-xs transition-colors"
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
          className="h-4 w-4 rounded border-gray-300"
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
      <div className="flex items-center gap-3">
        {countControl(type)}
        {gpio ? separator : null}
        {gpio ? gpioGroupInput() : null}
        {optionalPins ? separator : null}
        {optionalPins ? optionalPinsInput() : null}
        {/* {separator}
        {boardSideControl()} */}
      </div>
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

  return (
    <Card className="p-3 bg-white border-gray-200">
      <div className="flex items-center gap-4">
        <Badge
          className="min-w-[80px] justify-center border-0"
          style={{
            backgroundColor:
              requirement.type === "single-pin"
                ? SINGLE_PIN_BG_COLOR
                : boardUIData.capabilityDetails[requirement.peripheral!]?.color
                    .bg,
            color:
              requirement.type === "single-pin"
                ? SINGLE_PIN_TEXT_COLOR
                : boardUIData.capabilityDetails[requirement.peripheral!]?.color
                    .text,
          }}
        >
          {requirement.type === "single-pin" ? "Single Pin" : requirement.label}
        </Badge>

        {requirement.type === "single-pin"
          ? renderSinglePinRequirement()
          : renderPeripheralRequirement()}

        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-auto"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ConfigurationRequirement;
