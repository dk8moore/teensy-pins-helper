# Teensy Pin Configuration Assistant

A lightweight, browser-based tool that helps developers quickly visualize and configure pins for Teensy microcontroller projects. This tool simplifies the process of pin selection and peripheral assignment while automatically detecting potential conflicts.

## 🌟 Features

- Interactive pin visualization and selection
- Real-time conflict detection
- Peripheral requirements checker (SPI, I2C, USB host)
- Configuration export functionality
- Works completely offline
- No installation required
- Mobile-friendly interface

## 🚀 Quick Start

Visit [https://dk8moore.github.io/teensy-pins-helper](https://dk8moore.github.io/teensy-pins-helper) to use the tool directly in your browser.

1. Select your Teensy board model
2. Choose required peripherals
3. Select pins for your project
4. Export your configuration

## 💡 Usage Example

1. Click on pins to toggle their state
2. Select peripherals from the dropdown menu
3. View automatic conflict detection
4. Export configuration when finished

## 🛠️ Technical Details

This project is built with:

- HTML5
- CSS3
- Vanilla JavaScript
- No external dependencies
- GitHub Pages for hosting

## 🔧 Local Development

To run this project locally:

```bash
# Clone the repository
git clone https://github.com/dk8moore/teensy-pins-helper.git

# Navigate to the project directory
cd teensy-pins-helper

# Open index.html in your browser
# No build process required!
```

## 📁 Project Structure

```
teensy-pins-helper/
├── index.html          # Main application page
├── css/               # Styling
│   └── styles.css     # Main stylesheet
├── js/                # JavaScript files
│   ├── app.js         # Core application logic
│   ├── pinData.js     # Pin configuration data
│   └── utils.js       # Utility functions
└── devices/           # Device-specific data
    └── teensy41.json  # Teensy 4.1 pin definitions
```

## 🤝 Contributing

This project is open to contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PJRC](https://www.pjrc.com/) for the amazing Teensy platform
- The Teensy community for their continuous support

## 📞 Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

---

Made with ❤️ for the Teensy community