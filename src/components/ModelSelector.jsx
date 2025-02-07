import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ModelSelector = ({ selectedModel, onModelSelect, availableModels }) => {
    return (
        <div className="flex items-center">
            <Select value={selectedModel} onValueChange={onModelSelect}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                    {availableModels.map(model => (
                        <SelectItem
                            key={model.id}
                            value={model.id}
                            disabled={!model.available}
                            className="flex items-center justify-between"
                        >
                            <span>{model.name}</span>
                            {!model.available && (
                                <span className="text-xs text-gray-400 ml-2">(Coming Soon)</span>
                            )}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ModelSelector;