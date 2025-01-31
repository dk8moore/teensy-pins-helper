// allocator.js
export class PinAllocator {
    constructor(pinConfig) {
        this.pinConfig = pinConfig;
    }

    allocateDigitalPins(count, options = {}) {
        const { preferredSide = null, grouping = false } = options;
        
        if (grouping) {
            return this.allocateGroupedDigitalPins(count, preferredSide);
        }
        return this.allocateUngroupedDigitalPins(count, preferredSide);
    }

    allocateGroupedDigitalPins(count, preferredSide) {
        const gpioGroups = new Set(
            Object.values(this.pinConfig.pins)
                .map(pin => pin.gpio.split('.')[0])
        );
        
        for (const group of gpioGroups) {
            const availablePins = this.pinConfig.findPinsInGPIOGroup(group, preferredSide);
            if (availablePins.length >= count) {
                const allocatedPins = availablePins.slice(0, count);
                allocatedPins.forEach(pin => {
                    this.pinConfig.usedPins.add(pin);
                    this.pinConfig.assignments.set(pin, { 
                        type: 'digital', 
                        role: 'gpio',
                        group
                    });
                });
                return allocatedPins;
            }
        }
        return null;
    }

    allocateUngroupedDigitalPins(count, preferredSide) {
        const availablePins = Object.entries(this.pinConfig.pins)
            .filter(([name, pin]) => {
                if (this.pinConfig.usedPins.has(name)) return false;
                if (preferredSide && pin.side !== preferredSide) return false;
                return true;
            })
            .map(([name]) => name);

        if (availablePins.length >= count) {
            const allocatedPins = availablePins.slice(0, count);
            allocatedPins.forEach(pin => {
                this.pinConfig.usedPins.add(pin);
                this.pinConfig.assignments.set(pin, { 
                    type: 'digital', 
                    role: 'gpio'
                });
            });
            return allocatedPins;
        }
        return null;
    }

    allocatePWMPins(count, options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.pinConfig.findAvailablePinsForCapability('pwm', { side: preferredSide });
        
        if (availablePins.length < count) return null;

        const allocatedPins = availablePins.slice(0, count).map(p => p.name);
        allocatedPins.forEach(pin => {
            this.pinConfig.usedPins.add(pin);
            this.pinConfig.assignments.set(pin, { type: 'pwm', role: 'pwm' });
        });

        return allocatedPins;
    }

    allocateAnalogPins(count, options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.pinConfig.findAvailablePinsForCapability('analog', { side: preferredSide });
        
        if (availablePins.length < count) return null;

        const allocatedPins = availablePins.slice(0, count).map(p => p.name);
        allocatedPins.forEach(pin => {
            this.pinConfig.usedPins.add(pin);
            this.pinConfig.assignments.set(pin, { type: 'analog', role: 'adc' });
        });

        return allocatedPins;
    }
}