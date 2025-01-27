// app.js

document.addEventListener('DOMContentLoaded', () => {
    const pinGrid = document.getElementById('pin-grid');
    const peripheralsList = document.getElementById('peripherals-list');
    const configDisplay = document.getElementById('config-display');
    const exportButton = document.getElementById('export-config');
    
    let selectedPin = null;
    
    // Initialize pin grid with interactive elements
    function initializePinGrid() {
        Object.values(TEENSY_41_PINS.pins).forEach(pin => {
            const pinElement = document.createElement('div');
            pinElement.className = 'pin';
            pinElement.id = `pin-${pin.id}`;
            
            const pinLabel = document.createElement('div');
            pinLabel.className = 'pin-label';
            pinLabel.textContent = pin.label;
            
            const pinFunction = document.createElement('div');
            pinFunction.className = 'pin-function';
            pinFunction.textContent = pin.defaultState;
            
            pinElement.appendChild(pinLabel);
            pinElement.appendChild(pinFunction);
            
            // Add click handler
            pinElement.addEventListener('click', () => selectPin(pin.id));
            
            pinGrid.appendChild(pinElement);
        });
    }
    
    // Initialize peripheral selection interface
    function initializePeripherals() {
        Object.values(TEENSY_41_PINS.peripherals).forEach(peripheral => {
            const peripheralElement = document.createElement('div');
            peripheralElement.className = 'peripheral';
            
            const header = document.createElement('div');
            header.className = 'peripheral-header';
            header.textContent = peripheral.name;
            
            const description = document.createElement('div');
            description.className = 'peripheral-description';
            description.textContent = peripheral.description;
            
            const speed = document.createElement('div');
            speed.className = 'peripheral-speed';
            speed.textContent = `Max Speed: ${peripheral.maxSpeed}`;
            
            peripheralElement.appendChild(header);
            peripheralElement.appendChild(description);
            peripheralElement.appendChild(speed);
            
            // Add click handler for peripheral selection
            peripheralElement.addEventListener('click', () => selectPeripheral(peripheral.name));
            
            peripheralsList.appendChild(peripheralElement);
        });
    }
    
    // Handle pin selection
    function selectPin(pinId) {
        // Clear previous selection
        if (selectedPin !== null) {
            document.getElementById(`pin-${selectedPin}`)
                .classList.remove('selected');
        }
        
        selectedPin = pinId;
        const pinElement = document.getElementById(`pin-${pinId}`);
        pinElement.classList.add('selected');
        
        // Show available functions for this pin
        showPinFunctions(pinId);
    }
    
    // Show available functions for selected pin
    function showPinFunctions(pinId) {
        const pin = TEENSY_41_PINS.pins[pinId];
        const functionsContainer = document.createElement('div');
        functionsContainer.className = 'functions-menu';
        
        pin.functions.forEach(func => {
            const funcElement = document.createElement('div');
            funcElement.className = 'function-option';
            funcElement.textContent = func;
            
            // Add click handler for function selection
            funcElement.addEventListener('click', () => {
                const result = utils.updatePinFunction(pinId, func);
                if (result.success) {
                    updatePinDisplay(pinId);
                } else {
                    alert(result.message);
                }
            });
            
            functionsContainer.appendChild(funcElement);
        });
        
        // Remove any existing functions menu
        const existingMenu = document.querySelector('.functions-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        document.getElementById(`pin-${pinId}`).appendChild(functionsContainer);
    }
    
    // Update pin display after function change
    function updatePinDisplay(pinId) {
        const pin = TEENSY_41_PINS.pins[pinId];
        const pinElement = document.getElementById(`pin-${pinId}`);
        const functionDisplay = pinElement.querySelector('.pin-function');
        functionDisplay.textContent = pin.currentFunction || pin.defaultState;
        
        // Update conflicts
        Object.values(TEENSY_41_PINS.pins).forEach(otherPin => {
            const otherPinElement = document.getElementById(`pin-${otherPin.id}`);
            otherPinElement.classList.remove('conflict');
            
            if (pin.conflicts.includes(otherPin.id)) {
                const conflict = utils.checkPinConflicts(otherPin.id, otherPin.currentFunction);
                if (conflict.hasConflict) {
                    otherPinElement.classList.add('conflict');
                }
            }
        });
        
        // Update configuration display
        updateConfigDisplay();
    }
    
    // Handle peripheral selection
    function selectPeripheral(peripheralName) {
        const peripheral = TEENSY_41_PINS.peripherals[peripheralName];
        if (!peripheral) return;
        
        // Try to assign all required pins
        let success = true;
        let failedPin = null;
        
        Object.entries(peripheral.requiredPins).forEach(([role, pinId]) => {
            const result = utils.updatePinFunction(pinId, `${peripheralName}_${role}`);
            if (!result.success) {
                success = false;
                failedPin = pinId;
                return;
            }
        });
        
        if (!success) {
            alert(`Could not assign all pins for ${peripheralName}. Failed at pin ${failedPin}`);
            utils.clearConfiguration();
        }
        
        // Update all pin displays
        Object.values(TEENSY_41_PINS.pins).forEach(pin => {
            updatePinDisplay(pin.id);
        });
    }
    
    // Update configuration display
    function updateConfigDisplay() {
        const config = utils.exportConfiguration();
        
        // Clear previous display
        configDisplay.innerHTML = '';
        
        // Add active peripherals
        if (config.peripherals.length > 0) {
            const peripheralsSection = document.createElement('div');
            peripheralsSection.className = 'config-section';
            peripheralsSection.innerHTML = `
                <h3>Active Peripherals</h3>
                <ul>
                    ${config.peripherals.map(p => `<li>${p}</li>`).join('')}
                </ul>
            `;
            configDisplay.appendChild(peripheralsSection);
        }
        
        // Add pin assignments
        const pinsSection = document.createElement('div');
        pinsSection.className = 'config-section';
        pinsSection.innerHTML = `
            <h3>Pin Assignments</h3>
            <ul>
                ${Object.entries(config.pins)
                    .map(([id, info]) => `
                        <li>Pin ${id}: ${info.function}${info.notes ? ` (${info.notes})` : ''}</li>
                    `).join('')}
            </ul>
        `;
        configDisplay.appendChild(pinsSection);
    }
    
    // Handle configuration export
    exportButton.addEventListener('click', () => {
        const config = utils.exportConfiguration();
        const configJson = JSON.stringify(config, null, 2);
        
        // Create downloadable file
        const blob = new Blob([configJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teensy-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Initialize the application
    initializePinGrid();
    initializePeripherals();
});