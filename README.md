# Teensy Pin Configuration Assistant

A lightweight, browser-based tool that helps developers quickly visualize and configure pins for Teensy microcontroller projects. This tool simplifies the process of pin selection and peripheral assignment while automatically detecting potential conflicts.

## 🌟 Features

- Interactive pin visualization and selection
- Automatic conflict detection
- Support for various peripherals (SPI, I2C, USB host, etc.)
- Pin grouping visualization
- Configuration export
- Browser-based with no backend requirements

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

### Architecture

The application follows a modular architecture with clear separation of concerns:

- **Core Module**: Handles application initialization, state management, and configuration
- **UI Module**: Manages all user interface components and interactions
- **Pin Module**: Handles pin allocation, configuration, and interface management

#### Key Components

1. **TeensyConfigApp** (core/app.js)
   - Main application coordinator
   - Initializes components
   - Manages high-level application flow

2. **BoardVisualizer** (ui/board.js)
   - Renders the visual board representation
   - Manages pin highlighting and state display

3. **PinConfiguration** (pin/configuration.js)
   - Handles pin state and assignments
   - Manages pin capabilities and conflicts


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