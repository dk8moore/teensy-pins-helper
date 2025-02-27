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
  
export interface PinInterface {
  [key: string]: {
    port?: string;
    portPin?: number;
    [key: string]: any;
  } | null;
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
  allocation: 'pin' | 'port' | 'hybrid';
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
  [key: string]: any;
}

export interface SinglePinRequirement extends BaseRequirement {
  type: 'single-pin';
  pin: string;
  number: number;
}

export interface MultiPinRequirement extends BaseRequirement {
  type: 'multi-pin' | 'peripheral';
  count: number;
}

export type Requirement = SinglePinRequirement | MultiPinRequirement;

export interface PinAssignment {
  type: 'peripheral' | 'single' | string;
  mode?: string;
  requirementId?: string;
}

export interface PinAssignments {
  [pinName: string]: {
    type: string;
    [key: string]: any;
  };
}

// Validation related types
export enum ValidationErrorType {
  SINGLE_PIN_CONFLICT = 'SINGLE_PIN_CONFLICT',
  SINGLE_PIN_MISSING_PERIPHERAL = 'SINGLE_PIN_MISSING_PERIPHERAL',
  PORT_LIMIT_EXCEEDED = 'PORT_LIMIT_EXCEEDED',
  PIN_LIMIT_EXCEEDED = 'PIN_LIMIT_EXCEEDED',
  INVALID_REQUIREMENT = 'INVALID_REQUIREMENT'
}

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  details: {
    requirementId?: string;
    pin?: string;
    conflictingRequirements?: string[];
    peripheral?: string;
    requested?: number;
    maximum?: number;
    [key: string]: any;
  };
}