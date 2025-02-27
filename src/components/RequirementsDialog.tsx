import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Pin,
  TeensyModelData,
  BoardUIData,
  CapabilityDetail,
  SinglePinRequirement,
  MultiPinRequirement,
  Requirement,
} from "@/types";

interface PinWithCapabilities extends Pin {
  capabilities: {
    id: string;
    label: string;
    compactLabel?: string;
    description?: string;
    color?: {
      bg: string;
      text: string;
    };
  }[];
}

interface PinInfoProps {
  pin: PinWithCapabilities;
}

interface CapabilityInfoProps {
  capability: {
    id: string;
    label: string;
    compactLabel?: string;
    description?: string;
    color?: {
      bg: string;
      text: string;
    };
  };
}

interface RequirementsDialogProps {
  onAddRequirement: (requirement: Requirement) => void;
  capabilities: {
    [key: string]: CapabilityDetail;
  };
  modelData: TeensyModelData | null;
  boardUIData: BoardUIData | null;
  assignedPins?: string[];
}

interface PeripheralSelection {
  id: string;
  label: string;
  description?: string;
  color?: {
    bg: string;
    text: string;
  };
  disabled?: boolean;
}

// Component to render pin info consistently
const PinInfo: React.FC<PinInfoProps> = ({ pin }) => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex items-center gap-3 min-w-[140px]">
      <span className="font-medium">Pin {pin.number}</span>
      <span className="text-xs text-muted-foreground">
        {pin.capabilities.length} capabilities
      </span>
    </div>
    <div className="flex flex-wrap gap-1">
      {pin.capabilities.map((cap) => (
        <Badge
          key={cap.id}
          className="px-1.5 py-0 h-5 text-[11px] leading-none border-0"
          style={{
            backgroundColor: cap.color?.bg,
            color: cap.color?.text,
          }}
        >
          {cap.compactLabel}
        </Badge>
      ))}
    </div>
  </div>
);

// Component to render capability info consistently
const CapabilityInfo: React.FC<CapabilityInfoProps> = ({ capability }) => (
  <div className="flex items-center gap-3 w-full py-1">
    <Badge
      className="min-w-[80px] justify-center border-0"
      style={{
        backgroundColor: capability.color?.bg,
        color: capability.color?.text,
      }}
    >
      {capability.label}
    </Badge>
    {capability.description && (
      <span className="text-sm text-muted-foreground flex-1">
        {capability.description}
      </span>
    )}
  </div>
);

const RequirementsDialog: React.FC<RequirementsDialogProps> = ({
  onAddRequirement,
  capabilities,
  modelData,
  boardUIData,
  assignedPins = [],
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [view, setView] = useState<"main" | "single-pin">("main");
  const [selectedPin, setSelectedPin] = useState<string>("");
  const [selectedCapability, setSelectedCapability] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen]);

  // Get available pins with their capabilities
  const availablePins = useMemo<PinWithCapabilities[]>(() => {
    if (!modelData?.pins || !modelData?.interfaces) return [];

    const supportedInterfaces = new Set(modelData.interfaces);
    let pinsArray: Pin[] = [];

    pinsArray = Array.isArray(modelData.pins)
      ? modelData.pins
      : Object.values(modelData.pins);

    return pinsArray
      .filter((pin: Pin) => {
        if (assignedPins.includes(pin.id)) return false;
        if (!pin.interfaces) return false;
        return Object.keys(pin.interfaces).some(
          (interface_) =>
            supportedInterfaces.has(interface_) &&
            pin.interfaces &&
            pin.interfaces[interface_] !== null
        );
      })
      .map((pin: Pin) => {
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
        return { ...pin, capabilities } as PinWithCapabilities;
      })
      .sort((a, b) => a.number - b.number);
  }, [modelData?.pins, modelData?.interfaces, assignedPins, boardUIData]);

  // Get capabilities for selected pin
  const pinCapabilities = useMemo<PinWithCapabilities["capabilities"]>(() => {
    if (!selectedPin) return [];
    const pin = availablePins.find((p) => p.id === selectedPin);
    return pin?.capabilities || [];
  }, [selectedPin, availablePins]);

  const selectedPinData = useMemo<PinWithCapabilities | undefined>(
    () => availablePins.find((p) => p.id === selectedPin),
    [selectedPin, availablePins]
  );

  const selectedCapabilityData = useMemo<
    PinWithCapabilities["capabilities"][0] | undefined
  >(
    () => pinCapabilities.find((c) => c.id === selectedCapability),
    [selectedCapability, pinCapabilities]
  );

  const handleClose = (): void => {
    setIsOpen(false);
    setView("main");
    setSelectedPin("");
    setSelectedCapability("");
  };

  const handlePeripheralSelect = (peripheral: PeripheralSelection): void => {
    const requirement: MultiPinRequirement = {
      id: Math.random().toString(36).substr(2, 9),
      type: "peripheral",
      peripheral: peripheral.id,
      capability: peripheral.id,
      label: peripheral.label,
      count: 1,
      boardSide: "E",
    };

    if (peripheral.id === "digital") {
      requirement.gpioPort = "R";
    }

    if (peripheral.id === "spi") {
      requirement.optional = false;
    }

    onAddRequirement(requirement);
    handleClose();
  };

  const handleSinglePinSubmit = (): void => {
    if (!selectedPin || !selectedCapability) return;

    const pin = availablePins.find((p) => p.id === selectedPin);
    const capability = pinCapabilities.find((c) => c.id === selectedCapability);

    if (!pin || !capability) return;

    const requirement: SinglePinRequirement = {
      id: Math.random().toString(36).substr(2, 9),
      type: "single-pin",
      pin: pin.id,
      number: pin.number,
      capability: capability.id,
      peripheral: capability.id,
    };

    onAddRequirement(requirement);
    handleClose();
  };

  const renderMainView = (): JSX.Element => (
    <>
      <DialogHeader>
        <DialogTitle>Add Requirement</DialogTitle>
        <DialogDescription>
          Select Single Pin or a peripheral type to add the corresponding
          requirement to your configuration.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <button
          className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors w-full group"
          onClick={() => setView("single-pin")}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium text-foreground">Single Pin</span>
            <span className="text-sm text-muted-foreground">
              Force a specific pin to have a capability.
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <hr className="border-border" />
        {Object.keys(capabilities).map((capability) => (
          <button
            key={capability}
            className={`flex items-center justify-between p-4 rounded-lg border border-border bg-card transition-colors w-full ${
              !capabilities[capability].disabled
                ? "hover:bg-accent"
                : "bg-gray-200 "
            }`}
            onClick={() =>
              handlePeripheralSelect({
                ...capabilities[capability],
                id: capability,
              })
            }
            disabled={capabilities[capability].disabled}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground">
                {capabilities[capability].label}
              </span>
              <span className="text-sm text-muted-foreground">
                {capabilities[capability].description}
              </span>
            </div>
            {capabilities[capability].disabled && (
              <Badge
                className="px-2 py-0 h-5 text-[11px] leading-none border-0"
                style={{
                  backgroundColor: capabilities[capability].color?.bg,
                  color: capabilities[capability].color?.text,
                }}
              >
                Coming Soon
              </Badge>
            )}
          </button>
        ))}
      </div>
    </>
  );

  const renderSinglePinView = (): JSX.Element => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              setView("main");
              setSelectedPin("");
              setSelectedCapability("");
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <DialogTitle>Configure Single Pin</DialogTitle>
            <DialogDescription>
              Select a pin and choose its capability
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Pin Number
          </label>
          <Select
            value={selectedPin}
            onValueChange={(value) => {
              setSelectedPin(value);
              setSelectedCapability("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedPinData ? (
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      Pin {selectedPinData.number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedPinData.capabilities.length} capabilities
                    </span>
                  </div>
                ) : (
                  "Select a pin"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[280px] w-full p-1">
                {availablePins.map((pin) => (
                  <SelectItem
                    key={pin.id}
                    value={pin.id}
                    className="rounded-sm hover:bg-accent"
                  >
                    <PinInfo pin={pin} />
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {selectedPin && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Capability
            </label>
            <Select
              value={selectedCapability}
              onValueChange={setSelectedCapability}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedCapabilityData ? (
                    <CapabilityInfo capability={selectedCapabilityData} />
                  ) : (
                    "Select a capability"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[280px] w-full p-1">
                  {pinCapabilities.map((capability) => (
                    <SelectItem
                      key={capability.id}
                      value={capability.id}
                      className="rounded-sm hover:bg-accent"
                    >
                      <CapabilityInfo capability={capability} />
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSinglePinSubmit}
            disabled={!selectedPin || !selectedCapability}
            className="px-4"
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Requirement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px] bg-background border-border">
        {view === "main" ? renderMainView() : renderSinglePinView()}
      </DialogContent>
    </Dialog>
  );
};

export default RequirementsDialog;
