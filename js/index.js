// index.js
import { TeensyConfigApp } from './core/app.js';

// This file serves as the main entry point for the application
// The TeensyConfigApp class is instantiated when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeensyConfigApp();
});