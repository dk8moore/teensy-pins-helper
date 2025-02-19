import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const ColoredToggleGroupItem = React.forwardRef(({ 
  value,
  activeColor,
  textColor,
  className,
  ...props 
}, ref) => (
  <ToggleGroupItem
    ref={ref}
    value={value}
    className={cn(
      "px-2 h-6 text-xs transition-colors",
      "data-[state=on]:text-white data-[state=off]:opacity-100",
      "hover:opacity-100",
      className
    )}
    style={{
      backgroundColor: props['data-state'] === 'on' ? activeColor : 'transparent',
      color: props['data-state'] === 'on' ? textColor : activeColor,
    }}
    {...props}
  />
));
ColoredToggleGroupItem.displayName = "ColoredToggleGroupItem";

const ColoredToggleGroup = React.forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <ToggleGroup
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white p-1",
      className
    )}
    {...props}
  />
));
ColoredToggleGroup.displayName = "ColoredToggleGroup";

export { ColoredToggleGroup, ColoredToggleGroupItem };