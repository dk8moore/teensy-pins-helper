// interfaces.js
export class InterfaceAllocator {
    constructor(pinConfig) {
        this.pinConfig = pinConfig;
    }

    allocateI2CInterface(options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.pinConfig.findAvailablePinsForCapability('i2c', { side: preferredSide });

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

        for (const [_, iface] of interfaces) {
            if (iface.scl && iface.sda) {
                this.pinConfig.usedPins.add(iface.scl.name);
                this.pinConfig.usedPins.add(iface.sda.name);
                this.pinConfig.assignments.set(iface.scl.name, { type: 'i2c', role: 'SCL' });
                this.pinConfig.assignments.set(iface.sda.name, { type: 'i2c', role: 'SDA' });
                
                return {
                    scl: iface.scl.name,
                    sda: iface.sda.name
                };
            }
        }

        return null;
    }

    allocateSPIInterface(options = {}) {
        const { preferredSide = null } = options;
        const availablePins = this.pinConfig.findAvailablePinsForCapability('spi', { side: preferredSide });

        const interfaces = new Map();
        availablePins.forEach(({ name, pin, capability }) => {
            const interfaceNum = capability.match(/\\d+/)?.[0] || '0';
            if (!interfaces.has(interfaceNum)) {
                interfaces.set(interfaceNum, { miso: null, mosi: null, sck: null, cs: null });
            }
            
            const iface = interfaces.get(interfaceNum);
            if (capability.includes('MISO')) iface.miso = { name, pin };
            else if (capability.includes('MOSI')) iface.mosi = { name, pin };
            else if (capability.includes('SCK')) iface.sck = { name, pin };
            else if (capability.includes('CS')) iface.cs = { name, pin };
        });

        for (const [_, iface] of interfaces) {
            if (iface.miso && iface.mosi && iface.sck && iface.cs) {
                const pins = [iface.miso, iface.mosi, iface.sck, iface.cs];
                pins.forEach(({ name }) => this.pinConfig.usedPins.add(name));
                
                this.pinConfig.assignments.set(iface.miso.name, { type: 'spi', role: 'MISO' });
                this.pinConfig.assignments.set(iface.mosi.name, { type: 'spi', role: 'MOSI' });
                this.pinConfig.assignments.set(iface.sck.name, { type: 'spi', role: 'SCK' });
                this.pinConfig.assignments.set(iface.cs.name, { type: 'spi', role: 'CS' });
                
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
}