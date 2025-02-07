import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const RequirementsDialog = ({ onAddRequirement }) => {
  const peripherals = [
    {
      id: 'spi',
      name: 'SPI',
      description: 'Serial Peripheral Interface',
      defaultPins: 4
    },
    {
      id: 'i2c',
      name: 'I²C',
      description: 'Inter-Integrated Circuit',
      defaultPins: 2
    },
    {
      id: 'uart',
      name: 'UART',
      description: 'Universal Asynchronous Receiver/Transmitter',
      defaultPins: 2
    },
    {
      id: 'pwm',
      name: 'PWM',
      description: 'Pulse Width Modulation',
      defaultPins: 1
    },
    {
      id: 'analog',
      name: 'Analog Input',
      description: 'Analog to Digital Conversion',
      defaultPins: 1
    },
    {
      id: 'digital',
      name: 'Digital IO',
      description: 'Digital Input/Output',
      defaultPins: 1
    }
  ];

  const handleSinglePinSelect = () => {
    onAddRequirement({
      id: Math.random().toString(36).substr(2, 9),
      peripheral: null,
      label: 'Single Pin',
      pinCount: 1
    });
  };

  const handlePeripheralSelect = (peripheral) => {
    onAddRequirement({
      id: Math.random().toString(36).substr(2, 9),
      peripheral: peripheral.id,
      label: peripheral.name,
      pinCount: peripheral.defaultPins
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Requirement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader>
          <DialogTitle>Add Requirement</DialogTitle>
          <DialogDescription>
            Select Single Pin or a peripheral type to add the corrispective requirement to your configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <button
            className="flex flex-col items-start p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors w-full"
            onClick={() => handleSinglePinSelect()}
          >
            <span className="font-medium text-foreground">Single Pin</span>
            <span className="text-sm text-muted-foreground">Force a specific pin to have a capability.</span>
          </button>
          {/* Add horizontal separation line */}
          <hr className="border-border" />
          {peripherals.map((peripheral) => (
            <button
              key={peripheral.id}
              className="flex flex-col items-start p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors w-full"
              onClick={() => handlePeripheralSelect(peripheral)}
            >
              <span className="font-medium text-foreground">{peripheral.name}</span>
              <span className="text-sm text-muted-foreground">{peripheral.description}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequirementsDialog;