// utils.js

class PinConfiguration {
    constructor(pins) {
        this.pins = pins;
        this.assignments = new Map();
        this.usedPins = new Set();
    }

    /**
     * Find available pins for a specific capability
     * @param {string} capability - The capability to search for (e.g., 'serial', 'i2c')
     * @param {Object} options - Additional options for filtering pins
     * @returns {Array} Array of available pins with the capability
     */
    findAvailablePinsForCapability(capability, options = {}) {
        const { excludePins = new Set(), requireGPIO = null, side = null } = options;
        
        return Object.entries(this.pins)
            .filter(([name, pin]) => {
                if (excludePins.has(name)) return false;
                if (this.usedPins.has(name)) return false;
                if (side && pin.side !== side) return false;
                if (requireGPIO && !pin.gpio.startsWith(requireGPIO)) return false;
                
                return pin.capabilities[capability] !== null;
            })
            .map(([name, pin]) => ({
                name,
                pin,
                capability: pin.capabilities[capability]
            }));
    }

    /**
     * Find pins that share the same GPIO group
     * @param {string} gpioGroup - The GPIO group (e.g., "1", "2")
     * @returns {Array} Array of pin names in the same GPIO group
     */
    findPinsInGPIOGroup(gpioGroup) {
        return Object.entries(this.pins)
            .filter(([_, pin]) => pin.gpio.startsWith(gpioGroup + '.'))
            .map(([name]) => name);
    }

    /**
     * Attempt to allocate a set of pins for a serial interface
     * @param {string} type - Type of serial interface (e.g., 'serial', 'i2c', 'spi')
     * @returns {Object|null} Allocated pins or null if allocation failed
     */
    allocateSerialInterface(type) {
        const availablePins = this.findAvailablePinsForCapability(type);
        let txPin = null;
        let rxPin = null;

        // Group pins by their interface number
        const interfaces = new Map();
        availablePins.forEach(({ name, pin, capability }) => {
            const interfaceNum = capability.match(/\\d+/)?.[0] || '1';
            if (!interfaces.has(interfaceNum)) {
                interfaces.set(interfaceNum, new Set());
            }
            interfaces.get(interfaceNum).add({ name, pin, capability });
        });

        // Find a complete interface (TX/RX pair)
        for (const [_, pins] of interfaces) {
            const tx = Array.from(pins).find(p => p.capability.includes('TX'));
            const rx = Array.from(pins).find(p => p.capability.includes('RX'));
            
            if (tx && rx) {
                txPin = tx;
                rxPin = rx;
                break;
            }
        }

        if (!txPin || !rxPin) return null;

        // Mark pins as used
        this.usedPins.add(txPin.name);
        this.usedPins.add(rxPin.name);
        this.assignments.set(txPin.name, { type, role: 'TX' });
        this.assignments.set(rxPin.name, { type, role: 'RX' });

        return {
            tx: txPin.name,
            rx: rxPin.name
        };
    }

    /**
     * Attempt to allocate digital pins from the same GPIO group
     * @param {number} count - Number of pins needed
     * @returns {Array|null} Array of allocated pin names or null if allocation failed
     */
    allocateGroupedDigitalPins(count) {
        // Find all GPIO groups
        const gpioGroups = new Set(
            Object.values(this.pins)
                .map(pin => pin.gpio.split('.')[0])
        );

        // Try each GPIO group
        for (const group of gpioGroups) {
            const availablePins = Object.entries(this.pins)
                .filter(([name, pin]) => {
                    return pin.gpio.startsWith(group + '.') && 
                           !this.usedPins.has(name);
                })
                .map(([name]) => name);

            if (availablePins.length >= count) {
                // Allocate the required number of pins
                const allocatedPins = availablePins.slice(0, count);
                allocatedPins.forEach(pin => {
                    this.usedPins.add(pin);
                    this.assignments.set(pin, { type: 'digital', role: 'gpio' });
                });
                return allocatedPins;
            }
        }

        return null;
    }

    /**
     * Attempt to allocate pins for PWM
     * @param {number} count - Number of PWM pins needed
     * @returns {Array|null} Array of allocated pin names or null if allocation failed
     */
    allocatePWMPins(count) {
        const availablePins = this.findAvailablePinsForCapability('pwm');
        
        if (availablePins.length < count) return null;

        const allocatedPins = availablePins.slice(0, count).map(p => p.name);
        allocatedPins.forEach(pin => {
            this.usedPins.add(pin);
            this.assignments.set(pin, { type: 'pwm', role: 'pwm' });
        });

        return allocatedPins;
    }

    /**
     * Attempt to allocate pins for analog input
     * @param {number} count - Number of analog pins needed
     * @returns {Array|null} Array of allocated pin names or null if allocation failed
     */
    allocateAnalogPins(count) {
        const availablePins = this.findAvailablePinsForCapability('analog');
        
        if (availablePins.length < count) return null;

        const allocatedPins = availablePins.slice(0, count).map(p => p.name);
        allocatedPins.forEach(pin => {
            this.usedPins.add(pin);
            this.assignments.set(pin, { type: 'analog', role: 'adc' });
        });

        return allocatedPins;
    }

    /**
     * Get current pin assignments
     * @returns {Object} Current pin assignments
     */
    getAssignments() {
        return Object.fromEntries(this.assignments);
    }

    /**
     * Clear all pin assignments
     */
    clearAssignments() {
        this.assignments.clear();
        this.usedPins.clear();
    }

    /**
     * Export configuration in a user-friendly format
     * @returns {Object} Configuration object
     */
    exportConfiguration() {
        const config = {
            pins: {},
            groups: {}
        };

        // Group pins by function type
        for (const [pinName, assignment] of this.assignments) {
            const pin = this.pins[pinName];
            const type = assignment.type;
            
            if (!config.groups[type]) {
                config.groups[type] = [];
            }

            config.groups[type].push({
                pin: pin.pin,
                name: pinName,
                gpio: pin.gpio,
                role: assignment.role
            });

            config.pins[pin.pin] = {
                name: pinName,
                type: assignment.type,
                role: assignment.role,
                gpio: pin.gpio
            };
        }

        return config;
    }
}

export { PinConfiguration };