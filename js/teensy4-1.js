const teensyPins = {
    // Left side
    "AD_B0_03": {
        pin: 0,
        side: "L",
        name: "AD_B0_03",
        gpio: "1.3",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: "RX2",
            spi: "CS1",
            serial: "RX1",
            analog: null,
            pwm: "1X1"
        }
    },
    "AD_B0_02": {
        pin: 1,
        side: "L",
        name: "AD_B0_02",
        gpio: "1.2",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: "TX2",
            spi: "MISO1",
            serial: "TX1",
            analog: null,
            pwm: "1X0"
        }
    },
    "EMC_04": {
        pin: 2,
        side: "L",
        name: "EMC_04",
        gpio: "4.4",
        flexio: "1:4",
        capabilities: {
            audio: "O2",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "4A2"
        }
    },
    "EMC_05": {
        pin: 3,
        side: "L",
        name: "EMC_05",
        gpio: "4.5",
        flexio: "1:5",
        capabilities: {
            audio: "LR2",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "4B2"
        }
    },
    "EMC_06": {
        pin: 4,
        side: "L",
        name: "EMC_06",
        gpio: "4.6",
        flexio: "1:6",
        capabilities: {
            audio: "BCL2",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "2A0"
        }
    },
    "EMC_08": {
        pin: 5,
        side: "L",
        name: "EMC_08",
        gpio: "4.8",
        flexio: "1:8",
        capabilities: {
            audio: "IN2",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "2A1"
        }
    },
    "B0_10": {
        pin: 6,
        side: "L",
        name: "B0_10",
        gpio: "2.10",
        flexio: "2:10",
        capabilities: {
            audio: "O1D",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "2A2,Q41"
        }
    },
    "B1_01": {
        pin: 7,
        side: "L",
        name: "B1_01",
        gpio: "2.17",
        flexio: "2:17,3:17",
        capabilities: {
            audio: "O1A",
            i2c: null,
            can: "RX2",
            spi: null,
            serial: null,
            analog: null,
            pwm: "1B3"
        }
    },
    "B1_00": {
        pin: 8,
        side: "L",
        name: "B1_00",
        gpio: "2.16",
        flexio: "2:16,3:16",
        capabilities: {
            audio: "IN1",
            i2c: "sda0",
            can: "TX2",
            spi: null,
            serial: null,
            analog: null,
            pwm: "1A3"
        }
    },
    "B0_11": {
        pin: 9,
        side: "L",
        name: "B0_11",
        gpio: "2.11",
        flexio: "2:11",
        capabilities: {
            audio: "O1C",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "2B2,Q42"
        }
    },
    "B0_00": {
        pin: 10,
        side: "L",
        name: "B0_00",
        gpio: "2.0",
        flexio: "2:0",
        capabilities: {
            audio: "MQR",
            i2c: null,
            can: null,
            spi: "CS0",
            serial: null,
            analog: null,
            pwm: "Q10"
        }
    },
    "B0_02": {
        pin: 11,
        side: "L",
        name: "B0_02",
        gpio: "2.2",
        flexio: "2:2",
        capabilities: {
            audio: null,
            i2c: null,
            can: "TX1",
            spi: "MOSI0",
            serial: null,
            analog: null,
            pwm: "Q12"
        }
    },
    "B0_01": {
        pin: 12,
        side: "L",
        name: "B0_01",
        gpio: "2.1",
        flexio: "2:1",
        capabilities: {
            audio: "MQL",
            i2c: null,
            can: null,
            spi: "MISO0",
            serial: null,
            analog: null,
            pwm: "Q11"
        }
    },
    "AD_B0_12": {
        pin: 24,
        side: "L",
        name: "AD_B0_12",
        gpio: "1.12",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: "SCL2",
            can: null,
            spi: null,
            serial: "TX6",
            analog: "A10-1",
            pwm: "1X2"
        }
    },
    "AD_B0_13": {
        pin: 25,
        side: "L",
        name: "AD_B0_13",
        gpio: "1.13",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: "SDA2",
            can: null,
            spi: null,
            serial: "RX6",
            analog: "A11-1",
            pwm: "1X3"
        }
    },
    "AD_B1_14": {
        pin: 26,
        side: "L",
        name: "AD_B1_14",
        gpio: "1.30",
        flexio: "3:14",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "MOSI1",
            serial: null,
            analog: "A12-2",
            pwm: null
        }
    },
    "AD_B1_15": {
        pin: 27,
        side: "L",
        name: "AD_B1_15",
        gpio: "1.31",
        flexio: "3:15",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "SCK1",
            serial: null,
            analog: "A13-2",
            pwm: null
        }
    },
    "EMC_32": {
        pin: 28,
        side: "L",
        name: "EMC_32",
        gpio: "3.18",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "RX7",
            analog: null,
            pwm: "3B1"
        }
    },
    
    "EMC_31": {
        pin: 29,
        side: "L",
        name: "EMC_31",
        gpio: "4.31",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "TX7",
            analog: null,
            pwm: "3A1"
        }
    },
    "EMC_37": {
        pin: 30,
        side: "L",
        name: "EMC_37",
        gpio: "3.23",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: "RX3",
            spi: null,
            serial: null,
            analog: null,
            pwm: "G13"
        }
    },
    "EMC_36": {
        pin: 31,
        side: "L",
        name: "EMC_36",
        gpio: "3.22",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: "TX3",
            spi: null,
            serial: null,
            analog: null,
            pwm: "G12"
        }
    },
    "B0_12": {
        pin: 32,
        side: "L",
        name: "B0_12",
        gpio: "2.12",
        flexio: "2:12",
        capabilities: {
            audio: "O1B",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: null
        }
    },

    // Right side
    "AD_B1_09": {
        pin: 23,
        side: "R",
        name: "AD_B1_09",
        gpio: "1.25",
        flexio: "3:9",
        capabilities: {
            audio: "MCL1",
            i2c: null,
            can: "RX1",
            spi: null,
            serial: null,
            analog: "A9",
            pwm: "4A1"
        }
    },
    "AD_B1_08": {
        pin: 22,
        side: "R",
        name: "AD_B1_08",
        gpio: "1.24",
        flexio: "3:08",
        capabilities: {
            audio: null,
            i2c: null,
            can: "TX1",
            spi: null,
            serial: null,
            analog: "A8",
            pwm: "4A0"
        }
    },
    "AD_B1_11": {
        pin: 21,
        side: "R",
        name: "AD_B1_11",
        gpio: "1.27",
        flexio: "3:11",
        capabilities: {
            audio: "BCL1",
            i2c: null,
            can: null,
            spi: null,
            serial: "RX5",
            analog: "A7",
            pwm: null
        }
    },
    "AD_B1_10": {
        pin: 20,
        side: "R",
        name: "AD_B1_10",
        gpio: "1.26",
        flexio: "3:10",
        capabilities: {
            audio: "LRC1",
            i2c: null,
            can: null,
            spi: null,
            serial: "TX5",
            analog: "A6",
            pwm: null
        }
    },
    "AD_B1_00": {
        pin: 19,
        side: "R",
        name: "AD_B1_00",
        gpio: "1.16",
        flexio: "3:00",
        capabilities: {
            audio: null,
            i2c: "SCL0",
            can: "CTS3",
            spi: null,
            serial: null,
            analog: "A5",
            pwm: "Q30"
        }
    },
    "AD_B1_01": {
        pin: 18,
        side: "R",
        name: "AD_B1_01",
        gpio: "1.17",
        flexio: "3:01",
        capabilities: {
            audio: null,
            i2c: "SDA0",
            can: null,
            spi: null,
            serial: null,
            analog: "A4",
            pwm: "Q31"
        }
    },
    "AD_B1_06": {
        pin: 17,
        side: "R",
        name: "AD_B1_06",
        gpio: "1.22",
        flexio: "3:06",
        capabilities: {
            audio: null,
            i2c: "SDA1",
            can: null,
            spi: null,
            serial: "TX4",
            analog: "A3",
            pwm: null
        }
    },
    "AD_B1_07": {
        pin: 16,
        side: "R",
        name: "AD_B1_07",
        gpio: "1.23",
        flexio: "3:07",
        capabilities: {
            audio: null,
            i2c: "SCL1",
            can: null,
            spi: null,
            serial: "RX4",
            analog: "A2",
            pwm: null
        }
    },
    "AD_B1_03": {
        pin: 15,
        side: "R",
        name: "AD_B1_03",
        gpio: "1.19",
        flexio: "3:03",
        capabilities: {
            audio: "SPDI",
            i2c: null,
            can: null,
            spi: null,
            serial: "RX3",
            analog: "A1",
            pwm: "Q33"
        }
    },
    "AD_B1_02": {
        pin: 14,
        side: "R",
        name: "AD_B1_02",
        gpio: "1.18",
        flexio: "3:02",
        capabilities: {
            audio: "SPDO",
            i2c: null,
            can: null,
            spi: null,
            serial: "TX3",
            analog: "A0",
            pwm: "Q32"
        }
    },
    "B0_03": {
        pin: 13,
        side: "R",
        name: "B0_03",
        gpio: "2.3",
        flexio: "2:03",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "SCK0",
            serial: "RX1",
            analog: "LED",
            pwm: "Q20"
        }
    },
    "AD_B1_05": {
        pin: 41,
        side: "R",
        name: "AD_B1_05",
        gpio: "1.21",
        flexio: "3:5",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: "A17",
            pwm: "GPT2-1"
        }
    },
    "AD_B1_04": {
        pin: 40,
        side: "R",
        name: "AD_B1_04",
        gpio: "1.20",
        flexio: "3:4",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: "A16",
            pwm: "GPT2-2"
        }
    },
    "AD_B1_13": {
        pin: 39,
        side: "R",
        name: "AD_B1_13",
        gpio: "1.29",
        flexio: "3:13",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "MISO1",
            serial: null,
            analog: "A15-2",
            pwm: null
        }
    },
    "AD_B1_12": {
        pin: 38,
        side: "R",
        name: "AD_B1_12",
        gpio: "1.28",
        flexio: "3:12",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "CS1-0",
            serial: null,
            analog: "A14-2",
            pwm: null
        }
    },
    "B1_03": {
        pin: 37,
        side: "R",
        name: "B1_03",
        gpio: "2.19",
        flexio: "2:19,3:19",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "CS0-1",
            serial: null,
            analog: null,
            pwm: "2B3"
        }
    },
    "B1_02": {
        pin: 36,
        side: "R",
        name: "B1_02",
        gpio: "2.18",
        flexio: "2:18,3:18",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "CS0-2",
            serial: null,
            analog: null,
            pwm: "2A3"
        }
    },
    "B1_12": {
        pin: 35,
        side: "R",
        name: "B1_12",
        gpio: "2.28",
        flexio: "2:28,3:28",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "TX8",
            analog: null,
            pwm: null
        }
    },
    "B1_13": {
        pin: 34,
        side: "R",
        name: "B1_13",
        gpio: "2.29",
        flexio: "2:29,3:29",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "RX8",
            analog: null,
            pwm: null
        }
    },
    "EMC_07": {
        pin: 33,
        side: "R",
        name: "EMC_07",
        gpio: "4.7",
        flexio: "1:7",
        capabilities: {
            audio: "MCL2",
            i2c: null,
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "2B0"
        }
    },
    
    // Down side (under SD card)
    "SD_B0_03": {
        pin: 42,
        side: "D",
        name: "SD_B0_03",
        gpio: "3.15",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "MISO2",
            serial: null,
            analog: null,
            pwm: "1B1"
        }
    },
    "SD_B0_02": {
        pin: 43,
        side: "D",
        name: "SD_B0_02",
        gpio: "3.14",
        flexio: "DATA0",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "MOSI2",
            serial: "CTS5",
            analog: null,
            pwm: "1A1"
        }
    },
    "SD_B0_01": {
        pin: 44,
        side: "D",
        name: "SD_B0_01",
        gpio: "3.13",
        flexio: "CLK",
        capabilities: {
            audio: null,
            i2c: "SDA1",
            can: null,
            spi: "CS2",
            serial: null,
            analog: null,
            pwm: "1B0"
        }
    },
    "SD_B0_04": {
        pin: 47,
        side: "D",
        name: "SD_B0_04",
        gpio: "3.16",
        flexio: "DATA2",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "TX5",
            analog: null,
            pwm: "1A2"
        }
    },
    "SD_B0_05": {
        pin: 46,
        side: "D",
        name: "SD_B0_05",
        gpio: "3.17",
        flexio: "DATA3",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "RX5",
            analog: null,
            pwm: "1B2"
        }
    },
    "SD_B0_00": {
        pin: 45,
        side: "D",
        name: "SD_B0_00",
        gpio: "3.12",
        flexio: "CMD",
        capabilities: {
            audio: null,
            i2c: "SCL1",
            can: null,
            spi: "SCK2",
            serial: null,
            analog: null,
            pwm: "1A0"
        }
    },

    // Under the board
    "EMC_26": {
        pin: 52,
        side: "U",
        name: "EMC_26",
        gpio: "4.26",
        flexio: "1:12",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "RX1",
            analog: null,
            pwm: "1B1"
        }
    },
    "EMC_25": {
        pin: 53,
        side: "U",
        name: "EMC_25",
        gpio: "4.25",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "TX1",
            analog: null,
            pwm: "1A1"
        }
    },
    "EMC_29": {
        pin: 54,
        side: "U",
        name: "EMC_29",
        gpio: "4.29",
        flexio: "1:15",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "MISO2",
            serial: null,
            analog: null,
            pwm: "3A0"
        }
    },
    "EMC_28": {
        pin: 50,
        side: "U",
        name: "EMC_28",
        gpio: "4.28",
        flexio: "1:14",
        capabilities: {
            audio: null,
            i2c: null,
            can: "CTS8",
            spi: "MOSI2",
            serial: null,
            analog: null,
            pwm: "1B2"
        }
    },
    "EMC_27": {
        pin: 49,
        side: "U",
        name: "EMC_27",
        gpio: "4.27",
        flexio: "1:13",
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: "SCK2",
            serial: null,
            analog: null,
            pwm: "1A2"
        }
    },
    "EMC_22": {
        pin: 51,
        side: "U",
        name: "EMC_22",
        gpio: "4.22",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: "SCL1",
            can: null,
            spi: null,
            serial: null,
            analog: null,
            pwm: "3B3,Q23"
        }
    },
    "EMC_24": {
        pin: 48,
        side: "U",
        name: "EMC_24",
        gpio: "4.24",
        flexio: null,
        capabilities: {
            audio: null,
            i2c: null,
            can: null,
            spi: null,
            serial: "RX8",
            analog: null,
            pwm: "1B0"
        }
    }
};
  
export default teensyPins;