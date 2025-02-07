import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const ModelSelector = ({ selectedModel, onModelSelect, availableModels }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <CardTitle>Board</CardTitle>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 mr-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Select your Teensy board model to view its specific pinout</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
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