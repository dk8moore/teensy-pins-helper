import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ColoredToggleGroupItemProps {
  activeColor: string;
  textColor?: string;
  value: string;
  className?: string;
  children?: React.ReactNode;
  "data-state"?: string;
  [key: string]: any; // To handle any additional props
}

const ColoredToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ColoredToggleGroupItemProps
>(({ value, activeColor, textColor = "white", className, ...props }, ref) => {
  const dataState = props["data-state"];

  return (
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
        backgroundColor: dataState === "on" ? activeColor : "transparent",
        color: dataState === "on" ? textColor : activeColor,
      }}
      {...props}
    />
  );
});
ColoredToggleGroupItem.displayName = "ColoredToggleGroupItem";

interface ColoredToggleGroupProps {
  className?: string;
  type: "single" | "multiple";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  [key: string]: any; // For any other props
}

const ColoredToggleGroup = React.forwardRef<
  HTMLDivElement,
  ColoredToggleGroupProps
>(({ className, type, ...props }, ref) => (
  <ToggleGroup
    ref={ref}
    type={type}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white p-1",
      className
    )}
    {...props}
  />
));
ColoredToggleGroup.displayName = "ColoredToggleGroup";

export { ColoredToggleGroup, ColoredToggleGroupItem };
