import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

const ConfigurationRequirement = ({
  requirement,
  onDelete,
  onUpdate
}) => {
  const handlePeripheralChange = (e) => {
    onUpdate({
      ...requirement,
      peripheral: e.target.value
    });
  };

  const handlePinCountChange = (e) => {
    onUpdate({
      ...requirement,
      pinCount: parseInt(e.target.value, 10)
    });
  };

  return (
    <Card className="relative p-4 bg-card">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-foreground">{requirement.label} Requirement</h4>
        {/* ... */}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Number of Pins Required
          </label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={requirement.pinCount}
            onChange={handlePinCountChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default ConfigurationRequirement;