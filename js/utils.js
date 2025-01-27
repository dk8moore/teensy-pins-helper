// Utility functions for pin management
const utils = {
    checkPinConflicts: (selectedPin, currentFunction) => {
        const pin = TEENSY_41_PINS.pins[selectedPin];
        if (!pin) return false;
        
        return pin.conflicts.some(conflict => {
            const conflictPin = TEENSY_41_PINS.pins[conflict];
            return conflictPin && conflictPin.currentFunction === currentFunction;
        });
    },

    exportConfiguration: () => {
        const config = {
            pins: {},
            peripherals: {}
        };
        
        // Add configuration export logic
        
        return config;
    }
};
