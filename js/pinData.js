const TEENSY_41_PINS = {
    pins: {
        0: {
            id: 0,
            label: "Pin 0",
            functions: ["Digital", "PWM", "Serial1_TX"],
            conflicts: [],
            defaultState: "Digital"
        },
        1: {
            id: 1,
            label: "Pin 1",
            functions: ["Digital", "PWM", "Serial1_RX"],
            conflicts: [],
            defaultState: "Digital"
        }
        // Add more pins following the same structure
    },
    peripherals: {
        "Serial1": {
            name: "Serial1",
            requiredPins: {
                "TX": 0,
                "RX": 1
            },
            description: "Hardware Serial Port 1"
        },
        "I2C": {
            name: "I2C",
            requiredPins: {
                "SCL": 19,
                "SDA": 18
            },
            description: "I2C Communication Bus"
        }
        // Add more peripherals
    }
};