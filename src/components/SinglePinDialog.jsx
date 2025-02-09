import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from 'lucide-react';

const SinglePinDialog = ({ 
  isOpen, 
  onClose, 
  modelData, 
  boardUIData,
  onRequirementCreate,
  assignedPins = []
}) => {
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedCapability, setSelectedCapability] = useState(null);
  
  const getGPPins = () => {
    if (!modelData?.pins) return [];
    const pinsArray = Array.isArray(modelData.pins) ? modelData.pins : Object.values(modelData.pins);
    return pinsArray.filter(pin => pin.type === 'GP');
  };

  const getPinCapabilities = (pin) => {
    if (!pin?.capabilities) return [];
    return Object.entries(pin.capabilities)
      .filter(([_, value]) => value !== null)
      .map(([type]) => ({
        id: type,
        label: boardUIData?.capabilityDetails?.[type]?.label || type,
        description: boardUIData?.capabilityDetails?.[type]?.description
      }));
  };

  const isPinAssigned = (pin) => {
    return assignedPins.includes(pin.id);
  };

  const handlePinSelect = (pin) => {
    if (isPinAssigned(pin)) return; // Prevent selecting already assigned pins
    setSelectedPin(pin);
    setSelectedCapability(null);
  };

  const handleCapabilitySelect = (capability) => {
    setSelectedCapability(capability);
  };

  const handleSubmit = () => {
    if (!selectedPin || !selectedCapability) return;
    
    onRequirementCreate({
      id: Math.random().toString(36).substr(2, 9),
      type: 'single-pin',
      pin: selectedPin.id,
      capability: selectedCapability.id,
      label: `Pin ${selectedPin.number} - ${selectedCapability.label}`
    });
    
    onClose();
  };

  const handleBack = () => {
    setSelectedPin(null);
    setSelectedCapability(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedPin && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {selectedPin ? `Select Capability for Pin ${selectedPin.number}` : 'Select Pin'}
          </DialogTitle>
          <DialogDescription>
            {selectedPin 
              ? 'Choose a capability to assign to this pin'
              : 'Select a general purpose pin to configure'}
          </DialogDescription>
        </DialogHeader>

        {!selectedPin ? (
          // Pin Selection View
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-2">
              {getGPPins().map(pin => {
                const isAssigned = isPinAssigned(pin);
                return (
                  <Button
                    key={pin.id}
                    variant="outline"
                    className={`h-16 relative hover:border-primary ${
                      isAssigned ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handlePinSelect(pin)}
                    disabled={isAssigned}
                  >
                    <div className="absolute top-1 left-2">
                      <Badge variant="outline" className="text-xs">
                        Pin {pin.number}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-4">
                      {isAssigned ? (
                        'Already assigned'
                      ) : (
                        `${getPinCapabilities(pin).length} capabilities`
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          // Capability Selection View
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {getPinCapabilities(selectedPin).map(capability => (
                <Button
                  key={capability.id}
                  variant={selectedCapability?.id === capability.id ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => handleCapabilitySelect(capability)}
                >
                  <div>
                    <div className="font-medium">{capability.label}</div>
                    {capability.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {capability.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}

        {selectedPin && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCapability}
            >
              Confirm Selection
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SinglePinDialog;