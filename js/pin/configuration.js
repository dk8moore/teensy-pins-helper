// configuration.js
export class PinConfiguration {
    constructor(pins) {
        this.pins = pins;
        this.assignments = new Map();
        this.usedPins = new Set();
    }

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

    findPinsInGPIOGroup(gpioGroup, preferredSide = null) {
        let pins = Object.entries(this.pins)
            .filter(([name, pin]) => {
                if (this.usedPins.has(name)) return false;
                if (preferredSide && pin.side !== preferredSide) return false;
                return pin.gpio.startsWith(gpioGroup + '.');
            })
            .map(([name]) => name);

        if (pins.length === 0 && preferredSide) {
            pins = Object.entries(this.pins)
                .filter(([name, pin]) => {
                    if (this.usedPins.has(name)) return false;
                    return pin.gpio.startsWith(gpioGroup + '.');
                })
                .map(([name]) => name);
        }

        return pins;
    }

    getAssignments() {
        return Object.fromEntries(this.assignments);
    }

    clearAssignments() {
        this.assignments.clear();
        this.usedPins.clear();
    }

    exportConfiguration() {
        const config = {
            pins: {},
            groups: {}
        };

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