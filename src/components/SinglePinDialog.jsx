import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Component to render pin info consistently
const PinInfo = ({ pin, preview = false }) => (
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
const CapabilityInfo = ({ capability }) => (
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

const SinglePinDialog = ({ 
  isOpen, 
  onClose, 
  modelData, 
  boardUIData,
  onRequirementCreate,
  assignedPins = []
}) => {
  const [selectedPin, setSelectedPin] = useState('');
  const [selectedCapability, setSelectedCapability] = useState('');

  // Get available pins with their capabilities (memoized)
  const availablePins = useMemo(() => {
    if (!modelData?.pins || !modelData?.interfaces) return [];
    
    const supportedInterfaces = new Set(modelData.interfaces);
    const pinsArray = Array.isArray(modelData.pins) ? modelData.pins : Object.values(modelData.pins);
    
    return pinsArray
      .filter(pin => {
        if (assignedPins.includes(pin.id)) return false;
        if (!pin.interfaces) return false;
        return Object.keys(pin.interfaces).some(interface_ => 
          supportedInterfaces.has(interface_) && pin.interfaces[interface_] !== null
        );
      })
      .map(pin => {
        // Add processed capabilities to each pin
        const capabilities = Object.entries(pin.interfaces || {})
          .filter(([type, value]) => 
            value !== null && supportedInterfaces.has(type)
          )
          .map(([type]) => ({
            id: type,
            label: boardUIData?.capabilityDetails?.[type]?.label || type,
            compactLabel: boardUIData?.capabilityDetails?.[type]?.shortlabel,
            description: boardUIData?.capabilityDetails?.[type]?.description,
            color: boardUIData?.capabilityDetails?.[type]?.color
          }));
        return { ...pin, capabilities };
      })
      .sort((a, b) => a.number - b.number);
  }, [modelData?.pins, modelData?.interfaces, assignedPins, boardUIData]);

  // Get capabilities for selected pin (memoized)
  const pinCapabilities = useMemo(() => {
    if (!selectedPin) return [];
    const pin = availablePins.find(p => p.id === selectedPin);
    return pin?.capabilities || [];
  }, [selectedPin, availablePins]);

  const selectedPinData = useMemo(() => 
    availablePins.find(p => p.id === selectedPin),
    [selectedPin, availablePins]
  );

  const selectedCapabilityData = useMemo(() => 
    pinCapabilities.find(c => c.id === selectedCapability),
    [selectedCapability, pinCapabilities]
  );

  const handleSubmit = () => {
    if (!selectedPin || !selectedCapability) return;
    
    const pin = availablePins.find(p => p.id === selectedPin);
    const capability = pinCapabilities.find(c => c.id === selectedCapability);
    
    onRequirementCreate({
      id: Math.random().toString(36).substr(2, 9),
      type: 'single-pin',
      pin: pin.id,
      capability: capability.id,
      label: `Pin ${pin.number} - ${capability.label}`
    });
    
    onClose();
  };

  const handleClose = () => {
    setSelectedPin('');
    setSelectedCapability('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Single Pin</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a pin and choose its capability
          </DialogDescription>
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
                setSelectedCapability('');
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedPinData ? (
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Pin {selectedPinData.number}</span>
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
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedPin || !selectedCapability}
            className="px-4"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SinglePinDialog;