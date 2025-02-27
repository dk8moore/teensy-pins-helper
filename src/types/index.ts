// Pin and Board related types
export interface PinShape {
    type: string;
    width: number;
    height: number;
    x: number;
    y: number;
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
    };
  }
  
  export interface Pin {
    id: string;
    name: string;
    number: number;
    x: number;
    y: number;
    shape: string;
    interfaces?: PinInterface;
    designation?: string;
  }
  
  export interface TeensyModelData {
    id: string;
    name: string;
    width: number;
    height: number;
    pins: Pin[];
    interfaces: string[];
    additionalSpecs?: {
      [key: string]: any;
    };
  }
  
  export interface CapabilityDetail {
    label: string;
    description: string;
    color: string;
    allocation: 'pin' | 'port' | 'hybrid';
    max?: number;
    portCount?: {
      [key: string]: number;
    };
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
  export interface SinglePinRequirement {
    id: string;
    type: 'single-pin';
    pin: string;
    number: number;
    capability: string;
    peripheral?: string;
  }
  
  export interface MultiPinRequirement {
    id: string;
    type: 'multi-pin' | 'peripheral';
    capability: string;
    count: number;
    peripheral?: string;
  }
  
  export type Requirement = SinglePinRequirement | MultiPinRequirement;
  
  export interface PinAssignment {
    type: 'peripheral' | 'single';
    mode?: string;
    requirementId?: string;
  }
  
  export interface PinAssignments {
    [pinName: string]: {
      type: string;
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