import React from "react";
import { ModelOption } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  availableModels: ModelOption[];
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
  availableModels,
  className,
}) => {
  return (
    <Select value={selectedModel} onValueChange={onModelSelect}>
      <SelectTrigger className={`w-auto max-w-[180px] ${className}`}>
        <SelectValue placeholder="Select a board model" />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {availableModels.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            disabled={!model.available}
          >
            {model.name} {!model.available && "(Coming Soon)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModelSelector;
