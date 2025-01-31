// app.js
import { appState } from './state.js';
import { COMPLEXITY_ORDER, PERIPHERAL_TEMPLATES } from './config.js';
import { notifications } from '../ui/notifications.js';
import { DialogManager } from '../ui/dialogs.js';
import { BoardVisualizer } from '../ui/board.js';
import { CapabilitiesLegend } from '../ui/legend.js';
import { PinConfiguration } from '../pin/configuration.js';
import { PinAllocator } from '../pin/allocator.js';
import { InterfaceAllocator } from '../pin/interfaces.js';

export class TeensyConfigApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.loadTeensyData();
            this.initializeComponents();
            this.initializeUI();
        } catch (error) {
            notifications.showError('Failed to load Teensy pin data');
            console.error('Failed to load Teensy data:', error);
        }
    }

    async loadTeensyData() {
        const basePath = window.location.pathname.includes('teensy-pins-helper') 
            ? '/teensy-pins-helper'
            : '';
        
        // Load pin configuration
        const pinDataResponse = await fetch(`${basePath}/devices/teensy41.json`);
        if (!pinDataResponse.ok) throw new Error(`HTTP error! status: ${pinDataResponse.status}`);
        const teensyData = await pinDataResponse.json();
        
        // Load model configuration
        const modelDataResponse = await fetch(`${basePath}/devices/teensy-models.json`);
        if (!modelDataResponse.ok) throw new Error(`HTTP error! status: ${modelDataResponse.status}`);
        const modelConfig = await modelDataResponse.json();

        appState.setTeensyData(teensyData);
        appState.setModelConfig(modelConfig);
        appState.setPinConfig(new PinConfiguration(teensyData));
    }

    initializeComponents() {
        this.pinAllocator = new PinAllocator(appState.pinConfig);
        this.interfaceAllocator = new InterfaceAllocator(appState.pinConfig);
        this.boardVisualizer = new BoardVisualizer(appState.teensyData, appState.modelConfig.teensy41);
        this.legend = new CapabilitiesLegend(this.boardVisualizer);
    }

    initializeUI() {
        this.configItemsContainer = document.getElementById('config-items');
        this.setupButtons();
        this.boardVisualizer.createBoardVisualization();
        document.getElementById('board-view').appendChild(this.legend.createLegend());
    }

    setupButtons() {
        document.getElementById('add-item').addEventListener('click', () => {
            DialogManager.showAddItemDialog(type => this.addConfigItem(type));
        });
        
        document.getElementById('calculate-config').addEventListener('click', () => 
            this.calculateConfiguration());
        
        document.getElementById('reset-config').addEventListener('click', () => 
            this.reset());
        
        document.getElementById('export-config').addEventListener('click', () => 
            this.exportConfiguration());
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

    exportConfiguration() {
        const config = appState.exportConfiguration();
        const configStr = JSON.stringify(config, null, 2);
        
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
        appState.reset();
        this.configItemsContainer.innerHTML = '';
        this.boardVisualizer.updatePinDisplay({});
        notifications.showSuccess('Configuration reset');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeensyConfigApp();
});