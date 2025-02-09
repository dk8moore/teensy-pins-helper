import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

const ConfigurationRequirement = ({
  requirement,
  onDelete,
  onUpdate,
  boardUIData
}) => {
  const handlePinCountChange = (e) => {
    onUpdate({
      ...requirement,
      pinCount: parseInt(e.target.value, 10)
    });
  };

  const renderContent = () => {
    if (requirement.type === 'single-pin') {
      const capabilityDetails = boardUIData?.capabilityDetails?.[requirement.capability];
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Single Pin {requirement.pin}</Badge>
            <Badge variant="secondary">{capabilityDetails?.label || requirement.capability}</Badge>
          </div>
          {capabilityDetails?.description && (
            <p className="text-sm text-muted-foreground">
              {capabilityDetails.description}
            </p>
          )}
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <Card className="relative p-4 bg-card">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-foreground">{requirement.label}</h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onDelete(requirement.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {renderContent()}
    </Card>
  );
};

export default ConfigurationRequirement;