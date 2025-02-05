# Teensy Pin Configuration Assistant

A modern, React-based web application that helps developers visualize and configure pins for Teensy microcontroller projects. Built with performance and usability in mind, this tool simplifies pin selection and peripheral assignment while providing real-time conflict detection.

## ✨ Features

- **Interactive Pin Visualization**: Modern, responsive interface for pin selection and management
- **Real-time Conflict Detection**: Immediate feedback on pin configuration conflicts
- **Peripheral Management**: Comprehensive support for various peripherals (SPI, I2C, USB host, etc.)
- **Smart Pin Grouping**: Intelligent visualization of related pin groups
- **Export & Import**: Save and load your pin configurations
- **Modern UI Components**: Built with Radix UI for accessible, composable components
- **Mobile-Friendly**: Responsive design that works on all devices

## 🚀 Quick Start

Visit [https://dk8moore.github.io/teensy-pins-helper](https://dk8moore.github.io/teensy-pins-helper) to use the tool directly in your browser.

1. Select your Teensy board model from the dropdown
2. Choose your required peripherals
3. Configure pins through the interactive interface
4. Export your configuration for use in your project

## 🛠️ Technology Stack

This project is built with modern web technologies:

- **React 18**: For building a responsive and interactive user interface
- **TypeScript**: For type-safe code and better developer experience
- **Tailwind CSS**: For efficient, utility-first styling
- **Vite**: For fast development and optimized builds
- **Radix UI**: For accessible, composable UI components
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
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and constants
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── public/             # Static assets
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Project dependencies and scripts
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

- Use TypeScript for new components and features
- Follow the existing component structure
- Add appropriate types for all props and state
- Ensure components are accessible
- Test on multiple browsers and devices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PJRC](https://www.pjrc.com/) for the Teensy platform
- The React and TypeScript communities
- All contributors and users of this tool

## 🐛 Issue Reporting

Found a bug or have a feature request? Please open an issue on GitHub with:

- Detailed description of the issue/feature
- Steps to reproduce (for bugs)
- Screenshots if applicable
- Your browser and device information

---

Made with ❤️ for the Teensy community