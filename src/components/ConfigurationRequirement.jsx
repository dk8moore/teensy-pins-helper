import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ColoredToggleGroup, ColoredToggleGroupItem } from '@/components/ui/colored-toggle-group';
import { X, Plus, Minus, ArrowLeftRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const SINGLE_PIN_BG_COLOR = '#000';
const SINGLE_PIN_TEXT_COLOR = '#fff';

// Pin Info component for consistent rendering in both trigger and items
const PinInfo = ({ pin, badge = true }) => (
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

const ConfigurationRequirement = ({
  requirement,
  onDelete,
  onUpdate,
  boardUIData,
  modelData
}) => {
  // Get available pins with their capabilities
  const availablePins = React.useMemo(() => {
    if (!modelData?.pins || !modelData?.interfaces) return [];

    const supportedInterfaces = new Set(modelData.interfaces);
    const pinsArray = Array.isArray(modelData.pins) ? modelData.pins : Object.values(modelData.pins);

    return pinsArray
      .filter(pin => {
        if (!pin.interfaces) return false;
        return Object.keys(pin.interfaces).some(interface_ =>
          supportedInterfaces.has(interface_) && pin.interfaces[interface_] !== null
        );
      })
      .map(pin => {
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
  }, [modelData?.pins, modelData?.interfaces, boardUIData]);

  // Get capabilities for selected pin
  const pinCapabilities = React.useMemo(() => {
    if (!requirement.pin) return [];
    const pin = availablePins.find(p => p.id === requirement.pin);
    return pin?.capabilities || [];
  }, [requirement.pin, availablePins]);

  const selectedPinData = React.useMemo(() =>
    availablePins.find(p => p.id === requirement.pin),
    [requirement.pin, availablePins]
  );

  const selectedCapabilityData = React.useMemo(() =>
    pinCapabilities.find(c => c.id === requirement.peripheral),
    [requirement.peripheral, pinCapabilities]
  );

  const renderSinglePinRequirement = () => {
    return (
      <div className="flex items-center gap-3">
        <Select
          value={requirement.pin}
          onValueChange={(value) => {
            const selectedPin = availablePins.find(p => p.id === value);
            onUpdate({
              ...requirement,
              pin: value,                    // Pin ID
              number: selectedPin.number,    // Pin number
              peripheral: null               // Reset peripheral when pin changes
            });
          }}
        >
          <SelectTrigger className="w-[85px] min-w-[85px] max-w-[85px] h-7 text-xs">
            <SelectValue>
              {selectedPinData ? (
                <PinInfo 
                  pin={selectedPinData}
                  badge={false}
                />
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
                  <PinInfo pin={pin}/>
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
            onValueChange={(value) => {
              if (value) {
                onUpdate({
                  ...requirement,
                  peripheral: value
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
                    backgroundColor: isSelected ? capability.color?.bg : 'transparent',
                    color: isSelected ? capability.color?.text : capability.color?.bg
                  }}
                >
                  {capability.compactLabel || capability.label}
                </ColoredToggleGroupItem>
              );
            })}
          </ColoredToggleGroup>
        </div>
      </div>
    );
  };

  const countControl = (type) => (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-500 w-11">{type === 'port' ? 'Ports:' : 'Pins:'}</span>
      <div className="inline-flex items-center bg-white rounded-md border border-gray-200">
        <Button
          variant="ghost"
          className="h-7 w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          onClick={() => {
            const currentCount = requirement.count;
            const newCount = Math.max(1, Math.min(currentCount - 1, boardUIData.capabilityDetails[requirement.peripheral].max));
            onUpdate({
              ...requirement,
              count: newCount
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
            const newCount = Math.max(1, Math.min(currentCount + 1, boardUIData.capabilityDetails[requirement.peripheral].max));
            onUpdate({
              ...requirement,
              count: newCount
            });
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const boardSideControl = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Side:</span>
        <ToggleGroup
          type="single"
          value={requirement.boardSide || 'E'}
          onValueChange={(value) => {
            if (value) onUpdate({ ...requirement, boardSide: value })
          }}
          className="p-0.5 border rounded-md"
        >
          {['L', 'E', 'R'].map((value) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={`${value} side`}
              style={{
                backgroundColor: requirement.boardSide === value ? boardUIData.capabilityDetails[requirement.peripheral].color.bg : 'transparent',
                color: boardUIData.capabilityDetails[requirement.peripheral].color.text,
              }}
              className="px-2 h-6 text-xs transition-colors"
            >
              {value === 'E' ? <ArrowLeftRight className="h-3 w-3" /> : value}
            </ToggleGroupItem>))}
        </ToggleGroup>
      </div>
    );
  };

  const separator = <div className="h-9 w-px bg-gray-200" />;

  const gpioGroupInput = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">GPIO:</span>
        <ToggleGroup
          type="single"
          value={requirement.gpioPort || 'R'}
          onValueChange={(value) => {
            onUpdate({
              ...requirement,
              gpioPort: value
            });
          }}
          className="p-0.5 border rounded-md"
        >
          {['R', '1', '2', '3', '4', 'A'].map((value) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={`GPIO ${value}`}
              style={{
                backgroundColor: requirement.gpioPort === value ? boardUIData.capabilityDetails[requirement.peripheral].color.bg : 'transparent',
                color: boardUIData.capabilityDetails[requirement.peripheral].color.text,
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
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Optional pins:</span>
        <input
          type="checkbox"
          checked={requirement.includeOptionalPins || false}
          onChange={(e) => onUpdate({
            ...requirement,
            optional: e.target.checked
          })}
          className="h-4 w-4 rounded border-gray-300"
          style={{ accentColor: boardUIData.capabilityDetails[requirement.peripheral].color.bg }}
        />
      </div>
    );
  };

  const renderPeripheralInputLine = (type, gpio = false, optionalPins = false) => {
    return (
      <div className="flex items-center gap-3">
        {countControl(type)}
        {separator}
        {gpio ? gpioGroupInput() : null}
        {gpio ? separator : null}
        {optionalPins ? optionalPinsInput() : null}
        {optionalPins ? separator : null}
        {boardSideControl()}
      </div>
    );
  };

  const renderPeripheralRequirement = () => {
    switch (requirement.peripheral) {
      case 'digital':
        return renderPeripheralInputLine("pin", true);
      case 'spi':
        return renderPeripheralInputLine("port", false, true);
      case 'i2c':
      case 'serial':
      case 'can':
        return renderPeripheralInputLine("port");
      case 'analog':
      case 'pwm':
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
            backgroundColor: requirement.type === 'single-pin' ? SINGLE_PIN_BG_COLOR : boardUIData.capabilityDetails[requirement.peripheral].color.bg,
            color: requirement.type === 'single-pin' ? SINGLE_PIN_TEXT_COLOR : boardUIData.capabilityDetails[requirement.peripheral].color.text,
          }}
        >
          {requirement.type === 'single-pin' ? 'Single Pin' : requirement.label}
        </Badge>

        {requirement.type === 'single-pin' 
            ? renderSinglePinRequirement()
            : renderPeripheralRequirement()}
  
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-auto"
          onClick={() => onDelete(requirement.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
  
export default ConfigurationRequirement;