// app.js
import { appState } from './state.js';
import { COMPLEXITY_ORDER, PERIPHERAL_TEMPLATES } from './config.js';
import { notifications } from '../ui/notifications.js';
import { DialogManager } from '../ui/dialogs.js';
import { BoardVisualizer } from '../ui/board.js';
import { CapabilitiesLegend } from '../ui/legend.js';
import { PinConfiguration } from '../pin/configuration.js';
import { PinAllocator } from '../pin/allocator.js';
// TODO: The whole allocation logic should be thought better
// this interface allocation is messy in this separate file
import { InterfaceAllocator } from '../pin/interfaces.js';

export class TeensyConfigApp {
    constructor() {
        this.basePath = window.location.pathname.includes('teensy-pins-helper') ? '/teensy-pins-helper' : '';
        this.boardUIData = {};
        this.selectedModel = {};
        this.init();
    }

    async init() {
        try {
            // TODO: At first the loader should have a default model
            await this.loadBoardUIData();
            await this.loadTeensyData();
            this.initializeComponents();
            this.initializeUI();
        } catch (error) {
            notifications.showError('Failed to load Teensy pin data');
            console.error('Failed to load Teensy data:', error);
        }
    }

    async loadBoardUIData() {
        const [boardComponentsResponse, pinTypesResponse] = await Promise.all([
            fetch(`${this.basePath}/devices/board-components.json`),
            fetch(`${this.basePath}/devices/pin-types.json`)
        ]);
        if (!boardComponentsResponse.ok || !pinTypesResponse.ok) {
            throw new Error('Failed to load one or more configuration files');
        }

        const [boardComponents, pinTypes] = await Promise.all([
            boardComponentsResponse.json(),
            pinTypesResponse.json()
        ]);

        this.boardUIData = {
            boardComponents,
            pinTypes
        };
    }

    // TODO: Enable parametrized loading, so that the user can choose between different models
    async loadTeensyData() {
        const modelDataResponse = await fetch(`${this.basePath}/devices/teensy41.json`);
        if (!modelDataResponse.ok) {
            throw new Error('Failed to load Teensy data');
        }

        const teensyData = await modelDataResponse.json();
        this.selectedModel = teensyData;

        // Set all data in app state
        appState.setTeensyData(teensyData);
        appState.setPinConfig(new PinConfiguration(teensyData.pins));
    }


    // TODO: refactor these functions such that they make more sense in the naming and logic
    initializeComponents() {
        this.pinAllocator = new PinAllocator(appState.pinConfig);
        this.interfaceAllocator = new InterfaceAllocator(appState.pinConfig);

        this.boardVisualizer = new BoardVisualizer(
            appState.teensyData,
            this.boardUIData,
        );
        this.legend = new CapabilitiesLegend(this.boardVisualizer);
    }

    initializeUI() {
        this.configItemsContainer = document.getElementById('config-items');
        this.setupButtons();
        // Clear the board view container first
        const boardView = document.getElementById('board-view');
        const boardContainer = boardView.querySelector('.board-container');
        if (!boardContainer) {
            boardContainer = document.createElement('div');
            boardContainer.className = 'board-container';
            boardView.appendChild(boardContainer);
        }
        boardContainer.innerHTML = '';

        const boardFigure = document.createElement('figure');
        boardFigure.className = 'board-figure';
        boardContainer.appendChild(boardFigure);

        this.boardVisualizer.renderBoard(boardFigure);
        boardContainer.appendChild(this.legend.createLegend());
    }

    // TODO: This function should be part of the section for adding pin requirements
    setupButtons() {
        this.addItemBtn = document.getElementById('add-item');
        this.calculateBtn = document.getElementById('calculate-config');
        this.resetBtn = document.getElementById('reset-config');

        this.addItemBtn.addEventListener('click', () => {
            DialogManager.showAddItemDialog(item => {
                if (item) {
                    // Add to app state
                    appState.addConfigItem(item);
                    
                    // Create UI element
                    const configItem = DialogManager.addConfigItem(item.type, this.configItemsContainer);
                    
                    // Add change listeners to the new item's inputs
                    if (configItem) {
                        const itemEl = document.getElementById(configItem.id);
                        if (itemEl) {
                            const options = PERIPHERAL_TEMPLATES[item.type].options;
                            Object.keys(options).forEach(key => {
                                const input = itemEl.querySelector(`[name="${configItem.id}-${key}"]`);
                                if (input) {
                                    input.addEventListener('change', (e) => {
                                        const value = input.type === 'checkbox' ? 
                                            Array.from(itemEl.querySelectorAll(`[name="${configItem.id}-${key}"]:checked`))
                                                .map(cb => cb.value) :
                                            input.value;
                                        appState.updateConfigItem(configItem.id, key, value);
                                    });
                                }
                            });
        
                            // Add remove handler - UPDATED CODE
                            itemEl.querySelector('.remove-item').addEventListener('click', () => {
                                // Remove from state
                                appState.removeConfigItem(configItem.id);
                                // Remove from UI
                                itemEl.remove();
                            });
                        }
                    }
                }
            });
        });

        this.calculateBtn.addEventListener('click', () => this.calculateConfiguration());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    calculateConfiguration() {
        appState.pinConfig.clearAssignments();
        const errors = [];

        try {
            const sortedItems = [...appState.configItems].sort((a, b) =>
                (COMPLEXITY_ORDER[a.type] || 99) - (COMPLEXITY_ORDER[b.type] || 99));

            for (const item of sortedItems) {
                this.allocateItem(item, errors);
            }

            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }

            this.boardVisualizer.updatePinDisplay(appState.pinConfig.getAssignments());
            notifications.showSuccess('Configuration calculated successfully!');

        } catch (error) {
            notifications.showError(error.message);
            appState.pinConfig.clearAssignments();
            this.boardVisualizer.updatePinDisplay({});
        }
    }

    reset() {
        appState.reset();
        this.configItemsContainer.innerHTML = '';
        this.boardVisualizer.updatePinDisplay({});
        this.boardVisualizer.resetHighlights();
        notifications.showSuccess('Configuration reset');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeensyConfigApp();
});