# Teensy Pin Configuration Assistant

A modern, React-based web application that helps developers visualize and configure pins for Teensy microcontroller projects. Built with performance and usability in mind, this tool simplifies pin selection and peripheral assignment with an intuitive user interface.

## ✨ Features

- **Interactive Pin Visualization**: Modern, responsive interface for pin selection and management
- **Peripheral Management**: Support for various peripherals (SPI, I2C, Serial, CAN, PWM, Analog)
- **Pin Mode Selection**: Easy switching between different pin modes and capabilities
- **Board Visualization**: Interactive SVG-based board rendering with visual feedback
- **Modern UI Components**: Built with Radix UI for accessible, composable components
- **Mobile-Friendly**: Responsive design that works on all devices

## 🚀 Quick Start

Visit [https://dk8moore.github.io/teensy-pins-helper](https://dk8moore.github.io/teensy-pins-helper) to use the tool directly in your browser.

1. Select your Teensy board model from the dropdown
2. Add configuration requirements through the interface
3. Select pin modes and configure pins for calculating the optimal pin/ports assignment
4. Compute the configuration, review it and adjust it as needed

## 🛠️ Technology Stack

This project is built with modern web technologies:

- **React 18**: For building a responsive and interactive user interface
- **Tailwind CSS**: For utility-first styling with dark mode support (not yet implemented)
- **Vite**: For fast development and optimized builds
- **Radix UI**: For accessible, composable UI components
- **Lucide React**: For consistent and scalable icons
- **GitHub Pages**: For seamless deployment and hosting

## 💻 Development Setup

```bash
# Clone the repository
git clone https://github.com/dk8moore/teensy-pins-helper.git

# Navigate to project directory
cd teensy-pins-helper

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🏗️ Project Structure

```
teensy-pins-helper/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── ...          # Other React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── public/
│   ├── config/          # Board configuration files
│   └── img/            # Board images and assets
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Install dependencies (`npm install`)
4. Make your changes
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/YourFeature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing component structure
- Use Tailwind's utility classes for styling
- Ensure components are accessible
- Test on multiple browsers and devices
- Follow the established theming system

## 📝 License

This project is licensed under the BSD 2-Clause License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issue Reporting

Found a bug or have a feature request? Please open an issue on GitHub with:

- Detailed description of the issue/feature
- Steps to reproduce (for bugs)
- Screenshots if applicable
- Your browser and device information

## 🙏 Acknowledgments

- [PJRC](https://www.pjrc.com/) for the Teensy platform
- The React community
- All contributors and users of this tool

---

Made with ❤️ for the Teensy community