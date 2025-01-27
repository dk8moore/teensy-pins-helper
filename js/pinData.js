// pinData.js

const TEENSY_41_PINS = {
    pins: {
        0: {
            id: 0,
            label: "Pin 0",
            functions: ["Digital", "PWM", "Serial1_TX", "CAN1_TX"],
            conflicts: [1],  // Conflicts with RX pair
            defaultState: "Digital",
            notes: "Serial1 TX / CAN1 TX"
        },
        1: {
            id: 1,
            label: "Pin 1",
            functions: ["Digital", "PWM", "Serial1_RX", "CAN1_RX"],
            conflicts: [0],  // Conflicts with TX pair
            defaultState: "Digital",
            notes: "Serial1 RX / CAN1 RX"
        },
        2: {
            id: 2,
            label: "Pin 2",
            functions: ["Digital", "PWM"],
            conflicts: [],
            defaultState: "Digital",
            notes: ""
        },
        3: {
            id: 3,
            label: "Pin 3",
            functions: ["Digital", "PWM"],
            conflicts: [],
            defaultState: "Digital",
            notes: ""
        },
        4: {
            id: 4,
            label: "Pin 4",
            functions: ["Digital", "PWM"],
            conflicts: [],
            defaultState: "Digital",
            notes: ""
        },
        5: {
            id: 5,
            label: "Pin 5",
            functions: ["Digital", "PWM"],
            conflicts: [],
            defaultState: "Digital",
            notes: ""
        },
        // Serial2
        7: {
            id: 7,
            label: "Pin 7",
            functions: ["Digital", "PWM", "Serial2_RX"],
            conflicts: [8],
            defaultState: "Digital",
            notes: "Serial2 RX"
        },
        8: {
            id: 8,
            label: "Pin 8",
            functions: ["Digital", "PWM", "Serial2_TX"],
            conflicts: [7],
            defaultState: "Digital",
            notes: "Serial2 TX"
        },
        // I2C pins
        18: {
            id: 18,
            label: "Pin 18",
            functions: ["Digital", "PWM", "I2C_SDA"],
            conflicts: [19],
            defaultState: "Digital",
            notes: "I2C SDA"
        },
        19: {
            id: 19,
            label: "Pin 19",
            functions: ["Digital", "PWM", "I2C_SCL"],
            conflicts: [18],
            defaultState: "Digital",
            notes: "I2C SCL"
        },
        // SPI pins
        10: {
            id: 10,
            label: "Pin 10",
            functions: ["Digital", "PWM", "SPI_CS"],
            conflicts: [11, 12, 13],
            defaultState: "Digital",
            notes: "SPI CS"
        },
        11: {
            id: 11,
            label: "Pin 11",
            functions: ["Digital", "PWM", "SPI_MOSI"],
            conflicts: [10, 12, 13],
            defaultState: "Digital",
            notes: "SPI MOSI"
        },
        12: {
            id: 12,
            label: "Pin 12",
            functions: ["Digital", "PWM", "SPI_MISO"],
            conflicts: [10, 11, 13],
            defaultState: "Digital",
            notes: "SPI MISO"
        },
        13: {
            id: 13,
            label: "Pin 13",
            functions: ["Digital", "PWM", "SPI_SCK", "LED"],
            conflicts: [10, 11, 12],
            defaultState: "Digital",
            notes: "SPI SCK / LED"
        }
        ,
        14: {
            id: 14,
            label: "Pin 14",
            functions: ["Digital", "PWM", "Serial3_TX"],
            conflicts: [15],
            defaultState: "Digital",
            notes: "Serial3 TX"
        },
        15: {
            id: 15,
            label: "Pin 15",
            functions: ["Digital", "PWM", "Serial3_RX"],
            conflicts: [14],
            defaultState: "Digital",
            notes: "Serial3 RX"
        },
        16: {
            id: 16,
            label: "Pin 16",
            functions: ["Digital", "PWM", "Serial4_TX"],
            conflicts: [17],
            defaultState: "Digital",
            notes: "Serial4 TX"
        },
        17: {
            id: 17,
            label: "Pin 17",
            functions: ["Digital", "PWM", "Serial4_RX"],
            conflicts: [16],
            defaultState: "Digital",
            notes: "Serial4 RX"
        },
        20: {
            id: 20,
            label: "Pin 20",
            functions: ["Digital", "PWM", "Serial5_TX"],
            conflicts: [21],
            defaultState: "Digital",
            notes: "Serial5 TX"
        },
        21: {
            id: 21,
            label: "Pin 21",
            functions: ["Digital", "PWM", "Serial5_RX"],
            conflicts: [20],
            defaultState: "Digital",
            notes: "Serial5 RX"
        },
        22: {
            id: 22,
            label: "Pin 22",
            functions: ["Digital", "PWM", "Serial6_TX"],
            conflicts: [23],
            defaultState: "Digital",
            notes: "Serial6 TX"
        },
        23: {
            id: 23,
            label: "Pin 23",
            functions: ["Digital", "PWM", "Serial6_RX"],
            conflicts: [22],
            defaultState: "Digital",
            notes: "Serial6 RX"
        },
        24: {
            id: 24,
            label: "Pin 24",
            functions: ["Digital", "PWM", "Serial7_TX"],
            conflicts: [25],
            defaultState: "Digital",
            notes: "Serial7 TX / Audio MCLK"
        },
        25: {
            id: 25,
            label: "Pin 25",
            functions: ["Digital", "PWM", "Serial7_RX"],
            conflicts: [24],
            defaultState: "Digital",
            notes: "Serial7 RX / Audio BCLK"
        },
        26: {
            id: 26,
            label: "Pin 26",
            functions: ["Digital", "PWM", "Serial8_TX"],
            conflicts: [27],
            defaultState: "Digital",
            notes: "Serial8 TX / Audio IN"
        },
        27: {
            id: 27,
            label: "Pin 27",
            functions: ["Digital", "PWM", "Serial8_RX"],
            conflicts: [26],
            defaultState: "Digital",
            notes: "Serial8 RX / Audio OUT"
        },
        28: {
            id: 28,
            label: "Pin 28",
            functions: ["Digital", "PWM", "I2C3_SCL"],
            conflicts: [29],
            defaultState: "Digital",
            notes: "I2C3 SCL"
        },
        29: {
            id: 29,
            label: "Pin 29",
            functions: ["Digital", "PWM", "I2C3_SDA"],
            conflicts: [28],
            defaultState: "Digital",
            notes: "I2C3 SDA"
        },
        30: {
            id: 30,
            label: "Pin 30",
            functions: ["Digital", "PWM", "CAN2_TX"],
            conflicts: [31],
            defaultState: "Digital",
            notes: "CAN2 TX"
        },
        31: {
            id: 31,
            label: "Pin 31",
            functions: ["Digital", "PWM", "CAN2_RX"],
            conflicts: [30],
            defaultState: "Digital",
            notes: "CAN2 RX"
        },
        32: {
            id: 32,
            label: "Pin 32",
            functions: ["Digital", "PWM", "Serial4_RX2"],
            conflicts: [],
            defaultState: "Digital",
            notes: "Touch / Serial4 Alt RX"
        },
        33: {
            id: 33,
            label: "Pin 33",
            functions: ["Digital", "PWM", "Serial4_TX2"],
            conflicts: [],
            defaultState: "Digital",
            notes: "Touch / Serial4 Alt TX"
        },
        34: {
            id: 34,
            label: "Pin 34",
            functions: ["Digital", "PWM", "I2C1_SCL"],
            conflicts: [35],
            defaultState: "Digital",
            notes: "I2C1 SCL"
        },
        35: {
            id: 35,
            label: "Pin 35",
            functions: ["Digital", "PWM", "I2C1_SDA"],
            conflicts: [34],
            defaultState: "Digital",
            notes: "I2C1 SDA"
        },
        36: {
            id: 36,
            label: "Pin 36",
            functions: ["Digital", "PWM", "Serial8_TX2"],
            conflicts: [37],
            defaultState: "Digital",
            notes: "Serial8 Alt TX"
        },
        37: {
            id: 37,
            label: "Pin 37",
            functions: ["Digital", "PWM", "Serial8_RX2"],
            conflicts: [36],
            defaultState: "Digital",
            notes: "Serial8 Alt RX"
        },
        38: {
            id: 38,
            label: "Pin 38",
            functions: ["Digital", "PWM", "I2C2_SCL"],
            conflicts: [39],
            defaultState: "Digital",
            notes: "I2C2 SCL"
        },
        39: {
            id: 39,
            label: "Pin 39",
            functions: ["Digital", "PWM", "I2C2_SDA"],
            conflicts: [38],
            defaultState: "Digital",
            notes: "I2C2 SDA"
        },
        40: {
            id: 40,
            label: "Pin 40",
            functions: ["Digital", "PWM", "Serial6_TX2"],
            conflicts: [41],
            defaultState: "Digital",
            notes: "Serial6 Alt TX"
        },
        41: {
            id: 41,
            label: "Pin 41",
            functions: ["Digital", "PWM", "Serial6_RX2"],
            conflicts: [40],
            defaultState: "Digital",
            notes: "Serial6 Alt RX"
        }
        // End of pin definitions
    },
    
    peripherals: {
        "Serial1": {
            name: "Serial1",
            requiredPins: {
                "TX": 0,
                "RX": 1
            },
            description: "Hardware Serial Port 1",
            maxSpeed: "1.5 Mbps"
        },
        "Serial2": {
            name: "Serial2",
            requiredPins: {
                "TX": 8,
                "RX": 7
            },
            description: "Hardware Serial Port 2",
            maxSpeed: "1.5 Mbps"
        },
        "I2C": {
            name: "I2C",
            requiredPins: {
                "SCL": 19,
                "SDA": 18
            },
            description: "I2C Communication Bus",
            maxSpeed: "400 kHz (Fast mode)"
        },
        "SPI": {
            name: "SPI",
            requiredPins: {
                "MOSI": 11,
                "MISO": 12,
                "SCK": 13,
                "CS": 10
            },
            description: "SPI Communication Bus",
            maxSpeed: "25 MHz"
        },
        "CAN1": {
            name: "CAN1",
            requiredPins: {
                "TX": 0,
                "RX": 1
            },
            description: "CAN Bus Interface",
            maxSpeed: "1 Mbps"
        },
        "Serial3": {
            name: "Serial3",
            requiredPins: {
                "TX": 14,
                "RX": 15
            },
            description: "Hardware Serial Port 3",
            maxSpeed: "1.5 Mbps"
        },
        "Serial4": {
            name: "Serial4",
            requiredPins: {
                "TX": 16,
                "RX": 17,
                "TX2": 33,
                "RX2": 32
            },
            description: "Hardware Serial Port 4 (with alternate pins)",
            maxSpeed: "1.5 Mbps"
        },
        "Serial5": {
            name: "Serial5",
            requiredPins: {
                "TX": 20,
                "RX": 21
            },
            description: "Hardware Serial Port 5",
            maxSpeed: "1.5 Mbps"
        },
        "Serial6": {
            name: "Serial6",
            requiredPins: {
                "TX": 22,
                "RX": 23,
                "TX2": 40,
                "RX2": 41
            },
            description: "Hardware Serial Port 6 (with alternate pins)",
            maxSpeed: "1.5 Mbps"
        },
        "Serial7": {
            name: "Serial7",
            requiredPins: {
                "TX": 24,
                "RX": 25
            },
            description: "Hardware Serial Port 7 / Audio interface",
            maxSpeed: "1.5 Mbps"
        },
        "Serial8": {
            name: "Serial8",
            requiredPins: {
                "TX": 26,
                "RX": 27,
                "TX2": 36,
                "RX2": 37
            },
            description: "Hardware Serial Port 8 (with alternate pins)",
            maxSpeed: "1.5 Mbps"
        },
        "I2C1": {
            name: "I2C1",
            requiredPins: {
                "SCL": 34,
                "SDA": 35
            },
            description: "I2C Bus 1",
            maxSpeed: "400 kHz (Fast mode)"
        },
        "I2C2": {
            name: "I2C2",
            requiredPins: {
                "SCL": 38,
                "SDA": 39
            },
            description: "I2C Bus 2",
            maxSpeed: "400 kHz (Fast mode)"
        },
        "I2C3": {
            name: "I2C3",
            requiredPins: {
                "SCL": 28,
                "SDA": 29
            },
            description: "I2C Bus 3",
            maxSpeed: "400 kHz (Fast mode)"
        },
        "CAN2": {
            name: "CAN2",
            requiredPins: {
                "TX": 30,
                "RX": 31
            },
            description: "CAN Bus 2 Interface",
            maxSpeed: "1 Mbps"
        },
        "Audio": {
            name: "Audio",
            requiredPins: {
                "MCLK": 24,
                "BCLK": 25,
                "IN": 26,
                "OUT": 27
            },
            description: "Audio Interface",
            maxSpeed: "44.1/48 kHz sample rate"
        }
    }
};