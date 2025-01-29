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
     * @param {string} preferredSide - Preferred side for pin allocation
     * @returns {Array} Array of pin names in the same GPIO group
     */
    findPinsInGPIOGroup(gpioGroup, preferredSide = null) {
        let pins = Object.entries(this.pins)
            .filter(([name, pin]) => {
                if (this.usedPins.has(name)) return false;
                if (preferredSide && pin.side !== preferredSide) return false;
                return pin.gpio.startsWith(gpioGroup + '.');
            })
            .map(([name]) => name);

        // If no pins found on preferred side, try all sides
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

    /**
     * Allocate pins for I2C interface
     * @param {Object} options - Configuration options
     * @returns {Object|null} Allocated pins or null if allocation failed
     */
    allocateI2CInterface(options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.findAvailablePinsForCapability('i2c', { side: preferredSide });

        // Group pins by I2C interface number
        const interfaces = new Map();
        availablePins.forEach(({ name, pin, capability }) => {
            const isScl = capability.toLowerCase().includes('scl');
            const interfaceNum = capability.match(/\\d+/)?.[0] || '0';
            
            if (!interfaces.has(interfaceNum)) {
                interfaces.set(interfaceNum, { scl: null, sda: null });
            }
            
            const iface = interfaces.get(interfaceNum);
            if (isScl && !iface.scl) {
                iface.scl = { name, pin };
            } else if (!isScl && !iface.sda) {
                iface.sda = { name, pin };
            }
        });

        // Find a complete interface
        for (const [_, iface] of interfaces) {
            if (iface.scl && iface.sda) {
                this.usedPins.add(iface.scl.name);
                this.usedPins.add(iface.sda.name);
                this.assignments.set(iface.scl.name, { type: 'i2c', role: 'SCL' });
                this.assignments.set(iface.sda.name, { type: 'i2c', role: 'SDA' });
                
                return {
                    scl: iface.scl.name,
                    sda: iface.sda.name
                };
            }
        }

        return null;
    }

    /**
     * Allocate pins for SPI interface
     * @param {Object} options - Configuration options
     * @returns {Object|null} Allocated pins or null if allocation failed
     */
    allocateSPIInterface(options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.findAvailablePinsForCapability('spi', { side: preferredSide });

        // Group pins by SPI interface number
        const interfaces = new Map();
        availablePins.forEach(({ name, pin, capability }) => {
            const interfaceNum = capability.match(/\\d+/)?.[0] || '0';
            if (!interfaces.has(interfaceNum)) {
                interfaces.set(interfaceNum, {
                    miso: null,
                    mosi: null,
                    sck: null,
                    cs: null
                });
            }
            
            const iface = interfaces.get(interfaceNum);
            if (capability.includes('MISO')) iface.miso = { name, pin };
            else if (capability.includes('MOSI')) iface.mosi = { name, pin };
            else if (capability.includes('SCK')) iface.sck = { name, pin };
            else if (capability.includes('CS')) iface.cs = { name, pin };
        });

        // Find a complete interface
        for (const [_, iface] of interfaces) {
            if (iface.miso && iface.mosi && iface.sck && iface.cs) {
                const pins = [iface.miso, iface.mosi, iface.sck, iface.cs];
                pins.forEach(({ name }) => {
                    this.usedPins.add(name);
                });
                
                this.assignments.set(iface.miso.name, { type: 'spi', role: 'MISO' });
                this.assignments.set(iface.mosi.name, { type: 'spi', role: 'MOSI' });
                this.assignments.set(iface.sck.name, { type: 'spi', role: 'SCK' });
                this.assignments.set(iface.cs.name, { type: 'spi', role: 'CS' });
                
                return {
                    miso: iface.miso.name,
                    mosi: iface.mosi.name,
                    sck: iface.sck.name,
                    cs: iface.cs.name
                };
            }
        }

        return null;
    }

    /**
     * Allocate pins for audio interface
     * @param {Object} options - Configuration options
     * @returns {Object|null} Allocated pins or null if allocation failed
     */
    allocateAudioInterface(options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.findAvailablePinsForCapability('audio', { side: preferredSide });

        // Group pins by audio interface number
        const interfaces = new Map();
        availablePins.forEach(({ name, pin, capability }) => {
            const interfaceNum = capability.match(/\\d+/)?.[0] || '1';
            if (!interfaces.has(interfaceNum)) {
                interfaces.set(interfaceNum, {
                    out: null,
                    in: null,
                    bclk: null,
                    mclk: null
                });
            }
            
            const iface = interfaces.get(interfaceNum);
            const cap = capability.toUpperCase();
            if (cap.includes('OUT') || cap.includes('O')) iface.out = { name, pin };
            else if (cap.includes('IN')) iface.in = { name, pin };
            else if (cap.includes('BCL')) iface.bclk = { name, pin };
            else if (cap.includes('MCL')) iface.mclk = { name, pin };
        });

        // Find a complete interface
        for (const [_, iface] of interfaces) {
            if (iface.out && iface.in && iface.bclk && iface.mclk) {
                const pins = [iface.out, iface.in, iface.bclk, iface.mclk];
                pins.forEach(({ name }) => {
                    this.usedPins.add(name);
                });
                
                this.assignments.set(iface.out.name, { type: 'audio', role: 'OUT' });
                this.assignments.set(iface.in.name, { type: 'audio', role: 'IN' });
                this.assignments.set(iface.bclk.name, { type: 'audio', role: 'BCLK' });
                this.assignments.set(iface.mclk.name, { type: 'audio', role: 'MCLK' });
                
                return {
                    out: iface.out.name,
                    in: iface.in.name,
                    bclk: iface.bclk.name,
                    mclk: iface.mclk.name
                };
            }
        }

        return null;
    }

    /**
     * Allocate pins for serial interface
     * @param {Object} options - Configuration options
     * @returns {Object|null} Allocated pins or null if allocation failed
     */
    allocateSerialInterface(options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.findAvailablePinsForCapability('serial', { side: preferredSide });

        // Group pins by serial interface number
        const interfaces = new Map();
        availablePins.forEach(({ name, pin, capability }) => {
            const interfaceNum = capability.match(/\\d+/)?.[0] || '1';
            if (!interfaces.has(interfaceNum)) {
                interfaces.set(interfaceNum, { tx: null, rx: null });
            }
            
            const iface = interfaces.get(interfaceNum);
            if (capability.includes('TX')) iface.tx = { name, pin };
            else if (capability.includes('RX')) iface.rx = { name, pin };
        });

        // Find a complete interface
        for (const [_, iface] of interfaces) {
            if (iface.tx && iface.rx) {
                this.usedPins.add(iface.tx.name);
                this.usedPins.add(iface.rx.name);
                this.assignments.set(iface.tx.name, { type: 'serial', role: 'TX' });
                this.assignments.set(iface.rx.name, { type: 'serial', role: 'RX' });
                
                return {
                    tx: iface.tx.name,
                    rx: iface.rx.name
                };
            }
        }

        return null;
    }

    /**
     * Allocate digital pins
     * @param {number} count - Number of pins needed
     * @param {Object} options - Configuration options
     * @returns {Array|null} Array of allocated pin names or null if allocation failed
     */
    allocateDigitalPins(count, options = {}) {
        const { preferredSide = null, grouping = false } = options;
        
        if (grouping) {
            // Find GPIO groups with enough available pins
            const gpioGroups = new Set(
                Object.values(this.pins)
                    .map(pin => pin.gpio.split('.')[0])
            );
            
            for (const group of gpioGroups) {
                const availablePins = this.findPinsInGPIOGroup(group, preferredSide);
                if (availablePins.length >= count) {
                    const allocatedPins = availablePins.slice(0, count);
                    allocatedPins.forEach(pin => {
                        this.usedPins.add(pin);
                        this.assignments.set(pin, { 
                            type: 'digital', 
                            role: 'gpio',
                            group
                        });
                    });
                    return allocatedPins;
                }
            }
            return null;
        } else {
            // Allocate any available pins
            const availablePins = Object.entries(this.pins)
                .filter(([name, pin]) => {
                    if (this.usedPins.has(name)) return false;
                    if (preferredSide && pin.side !== preferredSide) return false;
                    return true;
                })
                .map(([name]) => name);

            if (availablePins.length >= count) {
                const allocatedPins = availablePins.slice(0, count);
                allocatedPins.forEach(pin => {
                    this.usedPins.add(pin);
                    this.assignments.set(pin, { 
                        type: 'digital', 
                        role: 'gpio'
                    });
                });
                return allocatedPins;
            }
            return null;
        }
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