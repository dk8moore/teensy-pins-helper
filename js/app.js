// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    const pinGrid = document.getElementById('pin-grid');
    const peripheralsList = document.getElementById('peripherals-list');
    const configDisplay = document.getElementById('config-display');
    
    // Initialize pin grid
    function initializePinGrid() {
        Object.values(TEENSY_41_PINS.pins).forEach(pin => {
            const pinElement = document.createElement('div');
            pinElement.className = 'pin';
            pinElement.id = `pin-${pin.id}`;
            pinElement.textContent = pin.label;
            pinGrid.appendChild(pinElement);
        });
    }
    
    // Initialize peripheral selection
    function initializePeripherals() {
        Object.values(TEENSY_41_PINS.peripherals).forEach(peripheral => {
            const peripheralElement = document.createElement('div');
            peripheralElement.className = 'peripheral';
            peripheralElement.textContent = peripheral.name;
            peripheralsList.appendChild(peripheralElement);
        });
    }
    
    // Initialize the application
    initializePinGrid();
    initializePeripherals();
});