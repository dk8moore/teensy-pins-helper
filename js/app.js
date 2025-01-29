// app.js
import { PinConfiguration } from './utils.js';
import teensy41 from '../devices/teensy41.js';

class TeensyConfigApp {
    constructor() {
        this.pinConfig = new PinConfiguration(teensy41);
        this.configItems = [];
        this.initializeUI();
    }

    initializeUI() {
        this.configItemsContainer = document.getElementById('config-items');
        this.addItemBtn = document.getElementById('add-item');
        this.calculateBtn = document.getElementById('calculate-config');
        this.resetBtn = document.getElementById('reset-config');
        this.exportBtn = document.getElementById('export-config');

        // Initialize event listeners
        this.addItemBtn.addEventListener('click', () => this.showAddItemDialog());
        this.calculateBtn.addEventListener('click', () => this.calculateConfiguration());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.exportBtn.addEventListener('click', () => this.exportConfiguration());

        // Initialize board visualization
        this.createBoardVisualization();
    }

    // Configuration item templates for different peripheral types
    static PERIPHERAL_TEMPLATES = {
        digital: {
            name: 'Digital Pins',
            options: {
                count: { type: 'number', label: 'Number of pins', min: 1, default: 1 },
                grouping: { 
                    type: 'select', 
                    label: 'Grouping',
                    options: [
                        { value: 'none', label: 'No grouping' },
                        { value: 'gpio', label: 'Group by GPIO (for parallel access)' }
                    ],
                    default: 'none'
                },
                sides: { 
                    type: 'multiselect', 
                    label: 'Preferred sides',
                    options: [
                        { value: 'L', label: 'Left' },
                        { value: 'R', label: 'Right' },
                        { value: 'D', label: 'Bottom (SMT)', advanced: true },
                        { value: 'U', label: 'Top (SMT)', advanced: true }
                    ],
                    default: ['L', 'R']
                }
            }
        },
        analog: {
            name: 'Analog Input Pins',
            options: {
                count: { type: 'number', label: 'Number of pins', min: 1, default: 1 },
                sides: { 
                    type: 'multiselect', 
                    label: 'Preferred sides',
                    options: [
                        { value: 'L', label: 'Left' },
                        { value: 'R', label: 'Right' },
                        { value: 'D', label: 'Bottom (SMT)', advanced: true },
                        { value: 'U', label: 'Top (SMT)', advanced: true }
                    ],
                    default: ['L', 'R']
                }
            }
        },
        pwm: {
            name: 'PWM Pins',
            options: {
                count: { type: 'number', label: 'Number of pins', min: 1, default: 1 },
                sides: { 
                    type: 'multiselect', 
                    label: 'Preferred sides',
                    options: [
                        { value: 'L', label: 'Left' },
                        { value: 'R', label: 'Right' },
                        { value: 'D', label: 'Bottom (SMT)', advanced: true },
                        { value: 'U', label: 'Top (SMT)', advanced: true }
                    ],
                    default: ['L', 'R']
                }
            }
        },
        serial: {
            name: 'Serial Interface',
            options: {
                count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
                sides: { 
                    type: 'multiselect', 
                    label: 'Preferred sides',
                    options: [
                        { value: 'L', label: 'Left' },
                        { value: 'R', label: 'Right' },
                        { value: 'D', label: 'Bottom (SMT)', advanced: true },
                        { value: 'U', label: 'Top (SMT)', advanced: true }
                    ],
                    default: ['L', 'R']
                }
            }
        },
        i2c: {
            name: 'I2C Interface',
            options: {
                count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
                sides: { 
                    type: 'multiselect', 
                    label: 'Preferred sides',
                    options: [
                        { value: 'L', label: 'Left' },
                        { value: 'R', label: 'Right' },
                        { value: 'D', label: 'Bottom (SMT)', advanced: true },
                        { value: 'U', label: 'Top (SMT)', advanced: true }
                    ],
                    default: ['L', 'R']
                }
            }
        },
        spi: {
            name: 'SPI Interface',
            options: {
                count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
                sides: { 
                    type: 'multiselect', 
                    label: 'Preferred sides',
                    options: [
                        { value: 'L', label: 'Left' },
                        { value: 'R', label: 'Right' },
                        { value: 'D', label: 'Bottom (SMT)', advanced: true },
                        { value: 'U', label: 'Top (SMT)', advanced: true }
                    ],
                    default: ['L', 'R']
                }
            }
        },
        audio: {
            name: 'Audio Interface',
            options: {
                count: { type: 'number', label: 'Number of interfaces', min: 1, default: 1 },
                sides: { 
                    type: 'multiselect', 
                    label: 'Preferred sides',
                    options: [
                        { value: 'L', label: 'Left' },
                        { value: 'R', label: 'Right' },
                        { value: 'D', label: 'Bottom (SMT)', advanced: true },
                        { value: 'U', label: 'Top (SMT)', advanced: true }
                    ],
                    default: ['L', 'R']
                }
            }
        }
    };

    showAddItemDialog() {
        const dialog = document.createElement('dialog');
        dialog.className = 'add-item-dialog';
        
        const content = document.createElement('div');
        content.innerHTML = `
            <h3>Add Configuration Item</h3>
            <div class="peripheral-list">
                ${Object.entries(TeensyConfigApp.PERIPHERAL_TEMPLATES).map(([key, template]) => `
                    <button class="peripheral-option" data-type="${key}">
                        ${template.name}
                    </button>
                `).join('')}
            </div>
            <div class="dialog-controls">
                <button class="cancel">Cancel</button>
            </div>
        `;
        
        dialog.appendChild(content);
        document.body.appendChild(dialog);
        
        // Add event listeners
        const buttons = dialog.querySelectorAll('.peripheral-option');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.addConfigItem(btn.dataset.type);
                dialog.close();
            });
        });
        
        dialog.querySelector('.cancel').addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => document.body.removeChild(dialog));
        
        dialog.showModal();
    }

    addConfigItem(type) {
        const template = TeensyConfigApp.PERIPHERAL_TEMPLATES[type];
        if (!template) return;

        const itemEl = document.createElement('div');
        itemEl.className = 'config-item';
        itemEl.dataset.type = type;

        const itemId = `item-${Date.now()}`;
        itemEl.id = itemId;

        const options = template.options;
        const defaultValues = {};
        
        // Create the item's HTML
        itemEl.innerHTML = `
            <div class="item-header">
                <h4>${template.name}</h4>
                <button class="remove-item">×</button>
            </div>
            <div class="item-options">
                ${Object.entries(options).map(([key, opt]) => {
                    defaultValues[key] = opt.default;
                    return this.createOptionInput(itemId, key, opt);
                }).join('')}
            </div>
        `;

        // Add to configItems array
        this.configItems.push({
            id: itemId,
            type,
            options: defaultValues
        });

        // Add event listeners
        itemEl.querySelector('.remove-item').addEventListener('click', () => {
            this.removeConfigItem(itemId);
        });

        // Add option change listeners
        Object.keys(options).forEach(key => {
            const input = itemEl.querySelector(`[name="${itemId}-${key}"]`);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.updateConfigItemOption(itemId, key, this.getInputValue(input));
                });
            }
        });

        this.configItemsContainer.appendChild(itemEl);
    }

    createOptionInput(itemId, key, option) {
        switch (option.type) {
            case 'number':
                return `
                    <div class="option-group">
                        <label for="${itemId}-${key}">${option.label}</label>
                        <input type="number" 
                               name="${itemId}-${key}"
                               min="${option.min || 1}"
                               value="${option.default}"
                               required>
                    </div>
                `;
            
            case 'select':
                return `
                    <div class="option-group">
                        <label for="${itemId}-${key}">${option.label}</label>
                        <select name="${itemId}-${key}">
                            ${option.options.map(opt => `
                                <option value="${opt.value}" ${opt.value === option.default ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                `;
            
            case 'multiselect':
                return `
                    <div class="option-group">
                        <label>${option.label}</label>
                        <div class="multiselect-options">
                            ${option.options.map(opt => `
                                <label class="checkbox-label ${opt.advanced ? 'advanced' : ''}">
                                    <input type="checkbox" 
                                           name="${itemId}-${key}" 
                                           value="${opt.value}"
                                           ${option.default.includes(opt.value) ? 'checked' : ''}>
                                    ${opt.label}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            
            default:
                return '';
        }
    }

    getInputValue(input) {
        if (input.type === 'checkbox') {
            const checkboxes = input.closest('.multiselect-options').querySelectorAll('input[type="checkbox"]');
            return Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
        }
        return input.type === 'number' ? parseInt(input.value) : input.value;
    }

    removeConfigItem(itemId) {
        const item = document.getElementById(itemId);
        if (item) {
            item.remove();
            this.configItems = this.configItems.filter(item => item.id !== itemId);
        }
    }

    updateConfigItemOption(itemId, key, value) {
        const item = this.configItems.find(item => item.id === itemId);
        if (item) {
            item.options[key] = value;
        }
    }

    async calculateConfiguration() {
        this.pinConfig.clearAssignments();
        const errors = [];

        try {
            // Sort items by complexity (more complex allocations first)
            const sortedItems = [...this.configItems].sort((a, b) => {
                const complexityOrder = {
                    'audio': 1,
                    'spi': 2,
                    'i2c': 3,
                    'serial': 4,
                    'pwm': 5,
                    'analog': 6,
                    'digital': 7
                };
                return (complexityOrder[a.type] || 99) - (complexityOrder[b.type] || 99);
            });

            // Process each item
            for (const item of sortedItems) {
                const { type, options } = item;
                const count = options.count || 1;
                const preferredSides = options.sides || ['L', 'R'];

                for (let i = 0; i < count; i++) {
                    let allocated = false;

                    // Try each preferred side until successful
                    for (const side of preferredSides) {
                        let result = null;

                        switch (type) {
                            case 'serial':
                                result = this.pinConfig.allocateSerialInterface({ preferredSide: side });
                                break;
                            case 'i2c':
                                result = this.pinConfig.allocateI2CInterface({ preferredSide: side });
                                break;
                            case 'spi':
                                result = this.pinConfig.allocateSPIInterface({ preferredSide: side });
                                break;
                            case 'audio':
                                result = this.pinConfig.allocateAudioInterface({ preferredSide: side });
                                break;
                            case 'pwm':
                                result = this.pinConfig.allocatePWMPins(1, { preferredSide: side });
                                break;
                            case 'analog':
                                result = this.pinConfig.allocateAnalogPins(1, { preferredSide: side });
                                break;
                            case 'digital':
                                result = this.pinConfig.allocateDigitalPins(
                                    1, 
                                    { 
                                        preferredSide: side,
                                        grouping: options.grouping === 'gpio'
                                    }
                                );
                                break;
                        }

                        if (result) {
                            allocated = true;
                            break;
                        }
                    }

                    if (!allocated) {
                        errors.push(`Could not allocate ${type} interface/pin ${i + 1}`);
                    }
                }
            }

            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
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

    createBoardVisualization() {
        const boardView = document.getElementById('board-view');
        const boardContainer = document.createElement('div');
        boardContainer.className = 'board-container';
        
        // Create pin grids for each side
        ['L', 'R', 'D', 'U'].forEach(side => {
            const sideGrid = document.createElement('div');
            sideGrid.className = `pin-grid pin-grid-${side}`;
            
            // Find pins for this side
            const sidePins = Object.entries(teensy41)
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
            
            boardContainer.appendChild(sideGrid);
        });
        
        boardView.appendChild(boardContainer);
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

    exportConfiguration() {
        const config = this.pinConfig.exportConfiguration();
        
        // Add the configuration requirements
        config.requirements = this.configItems.map(item => ({
            type: item.type,
            options: item.options
        }));
        
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
        
        // Clear config items
        this.configItems = [];
        this.configItemsContainer.innerHTML = '';
        
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