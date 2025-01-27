// utils.js

const utils = {
    // Check if a pin assignment would create conflicts
    checkPinConflicts: (selectedPin, newFunction) => {
        const pin = TEENSY_41_PINS.pins[selectedPin];
        if (!pin) return false;
        
        // Check if the function is available for this pin
        if (!pin.functions.includes(newFunction)) {
            return {
                hasConflict: true,
                reason: `Function ${newFunction} is not available for pin ${pin.label}`
            };
        }
        
        // Check conflicts with other pins
        for (const conflictPinId of pin.conflicts) {
            const conflictPin = TEENSY_41_PINS.pins[conflictPinId];
            if (conflictPin && conflictPin.currentFunction) {
                // Check if the conflicting pin is part of the same peripheral
                if (isPinInSamePeripheral(selectedPin, conflictPinId, newFunction)) {
                    return {
                        hasConflict: false
                    };
                }
                return {
                    hasConflict: true,
                    reason: `Conflicts with ${conflictPin.label} (${conflictPin.currentFunction})`
                };
            }
        }
        
        return { hasConflict: false };
    },

    // Check if two pins are part of the same peripheral
    isPinInSamePeripheral: (pin1, pin2, function1) => {
        for (const peripheral of Object.values(TEENSY_41_PINS.peripherals)) {
            const peripheralPins = Object.values(peripheral.requiredPins);
            if (peripheralPins.includes(pin1) && peripheralPins.includes(pin2)) {
                return true;
            }
        }
        return false;
    },

    // Update pin function and handle related pins
    updatePinFunction: (pinId, newFunction) => {
        const pin = TEENSY_41_PINS.pins[pinId];
        if (!pin) return false;

        const conflict = utils.checkPinConflicts(pinId, newFunction);
        if (conflict.hasConflict) {
            return {
                success: false,
                message: conflict.reason
            };
        }

        // Update the pin's function
        pin.currentFunction = newFunction;
        
        // If this is part of a peripheral, update related pins
        for (const peripheral of Object.values(TEENSY_41_PINS.peripherals)) {
            const pinRole = Object.entries(peripheral.requiredPins)
                .find(([role, id]) => id === pinId)?.[0];
                
            if (pinRole) {
                // Update all pins in this peripheral
                Object.entries(peripheral.requiredPins).forEach(([role, id]) => {
                    if (id !== pinId) {
                        TEENSY_41_PINS.pins[id].currentFunction = `${peripheral.name}_${role}`;
                    }
                });
                break;
            }
        }

        return {
            success: true,
            message: `Updated ${pin.label} to ${newFunction}`
        };
    },

    // Export the current configuration
    exportConfiguration: () => {
        const config = {
            pins: {},
            peripherals: new Set()
        };
        
        // Collect pin configurations
        Object.values(TEENSY_41_PINS.pins).forEach(pin => {
            if (pin.currentFunction) {
                config.pins[pin.id] = {
                    function: pin.currentFunction,
                    notes: pin.notes
                };
                
                // If pin is part of a peripheral, add it to peripherals set
                if (pin.currentFunction.includes('_')) {
                    const [peripheral] = pin.currentFunction.split('_');
                    config.peripherals.add(peripheral);
                }
            }
        });
        
        // Convert peripherals set to array
        config.peripherals = Array.from(config.peripherals);
        
        return config;
    },

    // Clear all pin assignments
    clearConfiguration: () => {
        Object.values(TEENSY_41_PINS.pins).forEach(pin => {
            pin.currentFunction = pin.defaultState;
        });
    }
};