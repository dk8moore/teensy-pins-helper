// Pin and Board related types
export interface PinGeometry {
  type: string;
  x: number;
  y: number;
  [key: string]: any;
}

export interface PinShape {
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  radius?: number;
  rotation?: number;
  labelPosition?: {
    x: number;
    y: number;
  };
}

export interface PeripheralInterface {
  port: number;
  name: string;
  required?: boolean;
}

export interface GpioInterface {
  port: number;
  bit: number;
}

export interface FlexioItem {
  port: string;
  bit: string;
}

export interface DigitalInterface {
  gpio: GpioInterface;
  flexio?: FlexioItem[];
}

export interface PinInterface {
  [key: string]: DigitalInterface | PeripheralInterface | string;
}

export interface Pin {
  id: string;
  name: string;
  number: number;
  x?: number;
  y?: number;
  shape?: string;
  geometry: PinGeometry;
  interfaces?: PinInterface;
  designation?: string;
  [key: string]: any;
}

export interface TeensyModelData {
  id: string;
  name: string;
  width?: number;
  height?: number;
  dimensions: {
    width: number;
    height: number;
  };
  pins: Pin[];
  interfaces: string[];
  additionalSpecs?: {
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CapabilityDetail {
  label: string;
  shortlabel?: string;
  description?: string;
  color: {
    bg: string;
    text: string;
  };
  allocation: "pin" | "port" | "hybrid";
  max?: number;
  portCount?: {
    [key: string]: number;
  };
  disabled?: boolean;
  [key: string]: any;
}

export interface BoardUIData {
  pinShapes: {
    [key: string]: PinShape;
  };
  capabilityDetails: {
    [key: string]: CapabilityDetail;
  };
  componentsImgPath: string;
}

export interface TeensyDataResult {
  loading: boolean;
  error: string | null;
  boardUIData: BoardUIData | null;
  modelData: TeensyModelData | null;
}

export interface ModelOption {
  id: string;
  name: string;
  available: boolean;
}

// Requirement related types
export interface BaseRequirement {
  id: string;
  capability: string;
  peripheral?: string;
  boardSide?: string;
  gpioPort?: string;
  includeOptionalPins?: boolean;
  label?: string;
  assignedBlocks: AssignableBlock[];
  [key: string]: any;
}

export interface SinglePinRequirement extends BaseRequirement {
  type: "single-pin";
  pin: string;
  number: number;
}

export interface MultiPinRequirement extends BaseRequirement {
  type: "peripheral";
  allocation: "pin" | "port"; // Hybrid allocation will be boiled down to one of these two at requirement creation
  count: number;
  metrics?: MultiPinRequirementMetrics;
  assignableBlocks?: AssignableBlock[];
}

export interface MultiPinRequirementMetrics {
  availabilityRatio: number;
  [key: string]: any;
}

export type Requirement = SinglePinRequirement | MultiPinRequirement;

// Validation related types
export enum ValidationErrorType {
  SINGLE_PIN_CONFLICT = "SINGLE_PIN_CONFLICT",
  SINGLE_PIN_MISSING_PERIPHERAL = "SINGLE_PIN_MISSING_PERIPHERAL",
  PORT_LIMIT_EXCEEDED = "PORT_LIMIT_EXCEEDED",
  PIN_LIMIT_EXCEEDED = "PIN_LIMIT_EXCEEDED",
  GPIO_PIN_LIMIT_EXCEEDED = "GPIO_PIN_LIMIT_EXCEEDED",
  INVALID_REQUIREMENT = "INVALID_REQUIREMENT",
}

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  details: {
    requirementId?: string;
    pin?: string;
    conflictingRequirements?: string[];
    peripheral?: string;
    gpioPort?: string;
    requested?: number;
    maximum?: number;
    [key: string]: any;
  };
}

// Optimization related types
export enum AssignmentErrorTypes {
  NOT_ENOUGH_PORTS = "NOT_ENOUGH_PORTS",
  NOT_ENOUGH_PINS = "NOT_ENOUGH_PINS",
}

// TODO: this may need further check
export interface OptimizationError {
  type: AssignmentErrorTypes;
  message: string;
  details: {
    requirementId?: string;
    pin?: string;
    conflictingRequirements?: string[];
    peripheral?: string;
    gpioPort?: string;
    requested?: number;
    maximum?: number;
    [key: string]: any;
  };
}

export interface AssignableBlock {
  // Each assignableBlock will be referred to a specific requirement, hence a specific peripheral (or combo, e.g. digital + GPIO port)
  // id: string; // Unique ID of the block
  blockInPeripheralId: number; // ID of the block in the peripheral: could be the port number or the pin number (for atomic pin blocks or for digital pins GPIO/FlexIO)
  pinIds: string[]; // Collection of pin IDs part of the previous port/pin ID (the optional pins will be part of this array if requested, so they'll be inserted upon creating the block)
  grouping: false | number; // For pin assignments within a group of pins (like the auto option for GPIO port), it will be part of the assignment logic
  requiredPeripheralCount: number; // [metric-1] Collected count of peripherals in the remaining requirements that the pins in the block support
  totalPeripheralCount: number; // [metric-2] Total count of peripherals that the pins in the block support, optimizing on this means more flexibility for the future
}

export interface Assignment {
  requirementId: string;
  block: AssignableBlock;
}

export interface OptimizationResult {
  success: boolean;
  assignedRequirements: Requirement[];
  unassignedRequirements: Requirement[];
}
