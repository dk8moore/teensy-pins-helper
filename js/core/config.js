// config.js

export const PERIPHERAL_TEMPLATES = {
    digital: {
        name: 'Digital Pins',
        options: {
            count: { type: 'number', label: 'Number of pins', min: 1, default: 1 },
            grouping: {
                type: 'select',
                label: 'Grouping',
                options: [
                    { value: 'none', label: 'No grouping' },
                    { value: 'gpio', label: 'Group by GPIO (for parallel access)' }
                ],
                default: 'none'
            },
            sides: {
                type: 'multiselect',
                label: 'Preferred sides',
                options: [
                    { value: 'L', label: 'Left' },
                    { value: 'R', label: 'Right' },
                    { value: 'D', label: 'Bottom (SMT)', advanced: true },
                    { value: 'U', label: 'Top (SMT)', advanced: true }
                ],
                default: ['L', 'R']
            }
        }
    },
    analog: {
        name: 'Analog Input Pins',
        options: {
            count: { type: 'number', label: 'Number of pins', min: 1, default: 1 },
            sides: {
                type: 'multiselect',
                label: 'Preferred sides',
                options: [
                    { value: 'L', label: 'Left' },
                    { value: 'R', label: 'Right' },
                    { value: 'D', label: 'Bottom (SMT)', advanced: true },
                    { value: 'U', label: 'Top (SMT)', advanced: true }
                ],
                default: ['L', 'R']
            }
        }
    },
    pwm: {
        name: 'PWM Pins',
        options: {
            count: { type: 'number', label: 'Number of pins', min: 1, default: 1 },
            sides: {
                type: 'multiselect',
                label: 'Preferred sides',
                options: [
                    { value: 'L', label: 'Left' },
                    { value: 'R', label: 'Right' },
                    { value: 'D', label: 'Bottom (SMT)', advanced: true },
                    { value: 'U', label: 'Top (SMT)', advanced: true }
                ],
                default: ['L', 'R']
            }
        }
    },
    serial: {
        name: 'Serial Interface',
        options: {
            count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
            sides: {
                type: 'multiselect',
                label: 'Preferred sides',
                options: [
                    { value: 'L', label: 'Left' },
                    { value: 'R', label: 'Right' },
                    { value: 'D', label: 'Bottom (SMT)', advanced: true },
                    { value: 'U', label: 'Top (SMT)', advanced: true }
                ],
                default: ['L', 'R']
            }
        }
    },
    i2c: {
        name: 'I2C Interface',
        options: {
            count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
            sides: {
                type: 'multiselect',
                label: 'Preferred sides',
                options: [
                    { value: 'L', label: 'Left' },
                    { value: 'R', label: 'Right' },
                    { value: 'D', label: 'Bottom (SMT)', advanced: true },
                    { value: 'U', label: 'Top (SMT)', advanced: true }
                ],
                default: ['L', 'R']
            }
        }
    },
    spi: {
        name: 'SPI Interface',
        options: {
            count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
            sides: {
                type: 'multiselect',
                label: 'Preferred sides',
                options: [
                    { value: 'L', label: 'Left' },
                    { value: 'R', label: 'Right' },
                    { value: 'D', label: 'Bottom (SMT)', advanced: true },
                    { value: 'U', label: 'Top (SMT)', advanced: true }
                ],
                default: ['L', 'R']
            }
        }
    },
    audio: {
        name: 'Audio Interface',
        options: {
            count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
            sides: {
                type: 'multiselect',
                label: 'Preferred sides',
                options: [
                    { value: 'L', label: 'Left' },
                    { value: 'R', label: 'Right' },
                    { value: 'D', label: 'Bottom (SMT)', advanced: true },
                    { value: 'U', label: 'Top (SMT)', advanced: true }
                ],
                default: ['L', 'R']
            }
        }
    }
};

export const CAPABILITIES = [
    { id: 'digital', label: 'Digital' },
    { id: 'analog', label: 'Analog' },
    { id: 'pwm', label: 'PWM' },
    { id: 'serial', label: 'Serial' },
    { id: 'i2c', label: 'I2C' },
    { id: 'spi', label: 'SPI' },
    { id: 'none', label: 'None' }
];

export const COMPLEXITY_ORDER = {
    'audio': 1,
    'spi': 2,
    'i2c': 3,
    'serial': 4,
    'pwm': 5,
    'analog': 6,
    'digital': 7
};