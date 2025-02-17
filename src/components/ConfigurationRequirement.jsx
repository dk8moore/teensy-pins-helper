import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { X, Plus, Minus, ArrowLeftRight } from 'lucide-react';

const ConfigurationRequirement = ({
  requirement,
  onDelete,
  onUpdate,
  boardUIData
}) => {

  const defaultRequirement = {
    ...requirement,
    gpioPort: requirement.gpioPort !== undefined ? requirement.gpioPort : 'A',
    boardSide: requirement.boardSide !== undefined ? requirement.boardSide : 'either'
  };

  const getMaxCount = () => {
    switch (defaultRequirement.peripheral) {
      case 'digital': return 32;
      case 'analog':
      case 'pwm': return 16;
      case 'spi':
      case 'i2c':
      case 'serial':
      case 'can': return 4;
      default: return 10;
    }
  };

  const countControl = (type) => (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-500 w-11">{type === 'port' ? 'Ports:' : 'Pins:'}</span>
      <div className="inline-flex items-center bg-white rounded-md border border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          onClick={() => {
            const currentCount = type === 'port' ? defaultRequirement.portCount || 1 : defaultRequirement.pinCount || 1;
            const newCount = Math.max(1, Math.min(currentCount - 1, getMaxCount()));
            onUpdate({
              ...defaultRequirement,
              [type === 'port' ? 'portCount' : 'pinCount']: newCount
            });
          }}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="w-6 h-6 flex items-center justify-center bg-gray-50">
          <span className="text-sm font-medium">{type === 'port' ? defaultRequirement.portCount || 1 : defaultRequirement.pinCount || 1}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          onClick={() => {
            const currentCount = type === 'port' ? defaultRequirement.portCount || 1 : defaultRequirement.pinCount || 1;
            const newCount = Math.max(1, Math.min(currentCount + 1, getMaxCount()));
            onUpdate({
              ...defaultRequirement,
              [type === 'port' ? 'portCount' : 'pinCount']: newCount
            });
          }}
        >
          <Plus className="h-4 w-4" />
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
          value={defaultRequirement.boardSide}
          onValueChange={(value) => {
            if (value) onUpdate({ ...defaultRequirement, boardSide: value })
          }}
          className="border rounded-md"
        >
          <ToggleGroupItem
            value="left"
            aria-label="Left side"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            L
          </ToggleGroupItem>
          <ToggleGroupItem
            value="either"
            aria-label="Either side"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            <ArrowLeftRight className="h-3 w-3" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="right"
            aria-label="Right side"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            R
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  };


  const separator = <div className="h-6 w-px bg-gray-200" />;

  const gpioGroupInput = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">GPIO:</span>
        <ToggleGroup
          type="single"
          value={defaultRequirement.gpioPort !== null ? defaultRequirement.gpioPort : 'A'}
          onValueChange={(value) => {
            onUpdate({
              ...defaultRequirement,
              gpioPort: value
            });
          }}
          className="border rounded-md"
        >
          <ToggleGroupItem
            value="A"
            aria-label="Auto"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            A
          </ToggleGroupItem>
          <ToggleGroupItem
            value="1"
            aria-label="GPIO 1"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            1
          </ToggleGroupItem>
          <ToggleGroupItem
            value="2"
            aria-label="GPIO 2"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            2
          </ToggleGroupItem>
          <ToggleGroupItem
            value="3"
            aria-label="GPIO 3"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            3
          </ToggleGroupItem>
          <ToggleGroupItem
            value="4"
            aria-label="GPIO 4"
            className="data-[state=on]:text-gray-900 data-[state=off]:text-gray-500 px-2 h-6 text-xs"
          >
            4
          </ToggleGroupItem>
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
          checked={defaultRequirement.includeOptionalPins || false}
          onChange={(e) => onUpdate({
            ...defaultRequirement,
            includeOptionalPins: e.target.checked
          })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    );
  };

  const renderInputLine = (type, gpio = false, optionalPins = false) => {
    return (
      <>
        {countControl(type)}
        {separator}
        {gpio ? gpioGroupInput() : null}
        {gpio ? separator : null}
        {optionalPins ? optionalPinsInput() : null}
        {optionalPins ? separator : null}
        {boardSideControl()}
      </>
    );
  };

  const errorRequirement = () => {
    return (
      <div className="p-2 bg-yellow-50 text-yellow-800 rounded-md">
        <p className="text-sm">
          This requirement is not supported: remove it and create a new one.
        </p>
      </div>
    );
  };

  const renderContent = () => {
    switch (defaultRequirement.peripheral) {
      case 'digital':
        return renderInputLine("pin", true);
      case 'spi':
        return renderInputLine("port", false, true);
      case 'i2c':
      case 'serial':
      case 'can':
        return renderInputLine("port");
      case 'analog':
      case 'pwm':
        return renderInputLine("pin");
      default:
        return errorRequirement();
    }
  };

  return (
    <Card className="p-3 bg-white border-gray-200">
      <div className="flex items-center gap-9">
        <Badge
          className={`border-0 min-w-[80px] justify-center`}
          style={{
            backgroundColor: boardUIData.capabilityDetails[defaultRequirement.peripheral].color.bg,
            color: boardUIData.capabilityDetails[defaultRequirement.peripheral].color.text,
          }}
        >
          {defaultRequirement.label || defaultRequirement.peripheral}
        </Badge>

        <div className="flex items-center gap-3 flex-1">
          {renderContent()}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete(defaultRequirement.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ConfigurationRequirement;