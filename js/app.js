// app.js
import { PinConfiguration } from './utils.js';
import teensyPins from './teensy4-1.js';

class TeensyConfigApp {
    constructor() {
        this.pinConfig = new PinConfiguration(teensyPins);
        this.requirements = {
            serial: 0,
            i2c: 0,
            spi: 0,
            can: 0,
            pwm: 0,
            analog: 0,
            groupedDigital: []  // Array of {count: number, description: string}
        };
        
        this.initializeUI();
    }

    initializeUI() {
        // Create requirement inputs
        this.createRequirementInputs();
        
        // Add board visualization
        this.createBoardVisualization();
        
        // Add calculate button
        const calculateBtn = document.getElementById('calculate-config');
        calculateBtn.addEventListener('click', () => this.calculateConfiguration());
        
        // Add export button
        const exportBtn = document.getElementById('export-config');
        exportBtn.addEventListener('click', () => this.exportConfiguration());
        
        // Add reset button
        const resetBtn = document.getElementById('reset-config');
        resetBtn.addEventListener('click', () => this.reset());
    }

    createRequirementInputs() {
        const requirementsForm = document.getElementById('requirements-form');
        
        // Create inputs for each interface type
        const interfaces = [
            { id: 'serial', label: 'Serial Interfaces' },
            { id: 'i2c', label: 'I2C Interfaces' },
            { id: 'spi', label: 'SPI Interfaces' },
            { id: 'can', label: 'CAN Interfaces' },
            { id: 'pwm', label: 'PWM Pins' },
            { id: 'analog', label: 'Analog Input Pins' }
        ];

        interfaces.forEach(({ id, label }) => {
            const div = document.createElement('div');
            div.className = 'form-group';
            
            const labelEl = document.createElement('label');
            labelEl.htmlFor = id;
            labelEl.textContent = label;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.id = id;
            input.min = '0';
            input.value = '0';
            input.addEventListener('change', (e) => {
                this.requirements[id] = parseInt(e.target.value) || 0;
            });
            
            div.appendChild(labelEl);
            div.appendChild(input);
            requirementsForm.appendChild(div);
        });

        // Add grouped digital pins section
        const groupedDiv = document.createElement('div');
        groupedDiv.className = 'grouped-digital';
        groupedDiv.innerHTML = `
            <h3>Grouped Digital Pins</h3>
            <button id="add-group">Add Group</button>
            <div id="digital-groups"></div>
        `;
        requirementsForm.appendChild(groupedDiv);

        document.getElementById('add-group').addEventListener('click', () => {
            this.addDigitalGroup();
        });
    }

    addDigitalGroup() {
        const groupsContainer = document.getElementById('digital-groups');
        const groupDiv = document.createElement('div');
        groupDiv.className = 'digital-group';
        
        const groupIndex = this.requirements.groupedDigital.length;
        
        groupDiv.innerHTML = `
            <input type="number" class="group-count" min="2" value="2" id="group-${groupIndex}-count">
            <input type="text" class="group-description" placeholder="Group description" id="group-${groupIndex}-desc">
            <button class="remove-group">Remove</button>
        `;

        groupDiv.querySelector('.remove-group').addEventListener('click', () => {
            groupsContainer.removeChild(groupDiv);
            this.requirements.groupedDigital = this.requirements.groupedDigital
                .filter((_, index) => index !== groupIndex);
        });

        const updateGroup = () => {
            const count = parseInt(groupDiv.querySelector('.group-count').value) || 2;
            const description = groupDiv.querySelector('.group-description').value;
            this.requirements.groupedDigital[groupIndex] = { count, description };
        };

        groupDiv.querySelector('.group-count').addEventListener('change', updateGroup);
        groupDiv.querySelector('.group-description').addEventListener('change', updateGroup);

        groupsContainer.appendChild(groupDiv);
        this.requirements.groupedDigital.push({ count: 2, description: '' });
    }

    createBoardVisualization() {
        const boardView = document.getElementById('board-view');
        
        // Create pin grid for each side
        ['L', 'R', 'D', 'U'].forEach(side => {
            const sideGrid = document.createElement('div');
            sideGrid.className = `pin-grid pin-grid-${side}`;
            
            // Find pins for this side
            const sidePins = Object.entries(teensyPins)
                .filter(([_, pin]) => pin.side === side)
                .sort((a, b) => a[1].pin - b[1].pin);
            
            // Create pin elements
            sidePins.forEach(([name, pin]) => {
                const pinEl = document.createElement('div');
                pinEl.className = 'pin';
                pinEl.dataset.pin = name;
                
                pinEl.innerHTML = `
                    <div class="pin-number">${pin.pin}</div>
                    <div class="pin-name">${name}</div>
                    <div class="pin-function"></div>
                `;
                
                sideGrid.appendChild(pinEl);
            });
            
            boardView.appendChild(sideGrid);
        });
    }

    updatePinDisplay() {
        // Clear all pin highlights
        document.querySelectorAll('.pin').forEach(pinEl => {
            pinEl.className = 'pin';
            pinEl.querySelector('.pin-function').textContent = '';
        });
        
        // Update assigned pins
        const assignments = this.pinConfig.getAssignments();
        for (const [pinName, assignment] of Object.entries(assignments)) {
            const pinEl = document.querySelector(`[data-pin="${pinName}"]`);
            if (pinEl) {
                pinEl.className = `pin pin-${assignment.type}`;
                pinEl.querySelector('.pin-function').textContent = 
                    `${assignment.type.toUpperCase()}: ${assignment.role}`;
            }
        }
    }

    async calculateConfiguration() {
        // Clear previous configuration
        this.pinConfig.clearAssignments();
        
        try {
            // Allocate serial interfaces
            for (let i = 0; i < this.requirements.serial; i++) {
                const result = this.pinConfig.allocateSerialInterface('serial');
                if (!result) throw new Error(`Could not allocate Serial interface ${i + 1}`);
            }
            
            // Allocate I2C interfaces
            for (let i = 0; i < this.requirements.i2c; i++) {
                const result = this.pinConfig.allocateSerialInterface('i2c');
                if (!result) throw new Error(`Could not allocate I2C interface ${i + 1}`);
            }
            
            // Allocate SPI interfaces
            for (let i = 0; i < this.requirements.spi; i++) {
                const result = this.pinConfig.allocateSerialInterface('spi');
                if (!result) throw new Error(`Could not allocate SPI interface ${i + 1}`);
            }
            
            // Allocate CAN interfaces
            for (let i = 0; i < this.requirements.can; i++) {
                const result = this.pinConfig.allocateSerialInterface('can');
                if (!result) throw new Error(`Could not allocate CAN interface ${i + 1}`);
            }
            
            // Allocate PWM pins
            const pwmPins = this.pinConfig.allocatePWMPins(this.requirements.pwm);
            if (!pwmPins && this.requirements.pwm > 0) {
                throw new Error('Could not allocate requested PWM pins');
            }
            
            // Allocate Analog pins
            const analogPins = this.pinConfig.allocateAnalogPins(this.requirements.analog);
            if (!analogPins && this.requirements.analog > 0) {
                throw new Error('Could not allocate requested Analog pins');
            }
            
            // Allocate grouped digital pins
            for (const group of this.requirements.groupedDigital) {
                const groupedPins = this.pinConfig.allocateGroupedDigitalPins(group.count);
                if (!groupedPins) {
                    throw new Error(`Could not allocate ${group.count} grouped digital pins for: ${group.description}`);
                }
            }
            
            // Update display
            this.updatePinDisplay();
            this.showSuccess('Configuration calculated successfully!');
            
        } catch (error) {
            this.showError(error.message);
            this.pinConfig.clearAssignments();
            this.updatePinDisplay();
        }
    }

    exportConfiguration() {
        const config = this.pinConfig.exportConfiguration();
        const configStr = JSON.stringify(config, null, 2);
        
        // Create downloadable file
        const blob = new Blob([configStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teensy-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    reset() {
        // Clear pin configuration
        this.pinConfig.clearAssignments();
        this.updatePinDisplay();
        
        // Reset form inputs
        document.querySelectorAll('#requirements-form input[type="number"]').forEach(input => {
            input.value = '0';
        });
        
        // Clear digital groups
        const groupsContainer = document.getElementById('digital-groups');
        groupsContainer.innerHTML = '';
        this.requirements.groupedDigital = [];
        
        this.showSuccess('Configuration reset');
    }

    showError(message) {
        const alertBox = document.getElementById('alert-box');
        alertBox.className = 'alert alert-error';
        alertBox.textContent = message;
        alertBox.style.display = 'block';
        setTimeout(() => alertBox.style.display = 'none', 5000);
    }

    showSuccess(message) {
        const alertBox = document.getElementById('alert-box');
        alertBox.className = 'alert alert-success';
        alertBox.textContent = message;
        alertBox.style.display = 'block';
        setTimeout(() => alertBox.style.display = 'none', 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeensyConfigApp();
});