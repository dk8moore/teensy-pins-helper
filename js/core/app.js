// app.js
import { appState } from './state.js';
import { COMPLEXITY_ORDER } from './config.js';
import { notifications } from '../ui/notifications.js';
import { DialogManager } from '../ui/dialogs.js';
import { BoardVisualizer } from '../ui/board-svg.js';
import { CapabilitiesLegend } from '../ui/legend.js';
import { PinConfiguration } from '../pin/configuration.js';
import { PinAllocator } from '../pin/allocator.js';
// TODO: The whole allocation logic should be thought better
// this interface allocation is messy in this separate file
import { InterfaceAllocator } from '../pin/interfaces.js';

export class TeensyConfigApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // TODO: At first the loader should have a default model
            await this.loadTeensyData();
            this.initializeComponents();
            this.initializeUI();
        } catch (error) {
            notifications.showError('Failed to load Teensy pin data');
            console.error('Failed to load Teensy data:', error);
        }
    }

    // TODO: Enable parametrized loading, so that the user can choose between different models
    async loadTeensyData() {
        const basePath = window.location.pathname.includes('teensy-pins-helper') 
            ? '/teensy-pins-helper'
            : '';
        
            // Load all required configuration files
        const [teensyDataResponse, componentsResponse, pinTypesResponse] = await Promise.all([
            fetch(`${basePath}/devices/teensy41.json`),
            fetch(`${basePath}/devices/components.json`),
            fetch(`${basePath}/devices/pin-types.json`)
        ]);

        // Check if all responses are ok
        if (!teensyDataResponse.ok || !componentsResponse.ok || !pinTypesResponse.ok) {
            throw new Error('Failed to load one or more configuration files');
        }

        // Parse all JSON responses
        const [teensyData, components, pinTypes] = await Promise.all([
            teensyDataResponse.json(),
            componentsResponse.json(),
            pinTypesResponse.json()
        ]);

        // Add components and pin types to model config
        const modelConfig = appState.modelConfig || {};
        modelConfig.teensy41 = teensyData;
        modelConfig.components = components;
        // modelConfig.teensy41.pinTypes = pinTypes;

        // Set all data in app state
        appState.setTeensyData(teensyData);
        appState.setModelConfig(modelConfig);
        appState.setPinConfig(new PinConfiguration(teensyData.pins));
    }


    // TODO: refactor these functions such that they make more sense in the naming and logic
    initializeComponents() {
        this.pinAllocator = new PinAllocator(appState.pinConfig);
        this.interfaceAllocator = new InterfaceAllocator(appState.pinConfig);
        // Create board visualizer with expanded model config that includes components
        const modelConfigWithComponents = {
            ...appState.modelConfig.teensy41,
            components: appState.getComponents(),  // Get components from state
            pinTypes: appState.getPinTypes()      // Get pin types from state
        };
        
        this.boardVisualizer = new BoardVisualizer(
            appState.teensyData,
            modelConfigWithComponents
        );
        this.legend = new CapabilitiesLegend(this.boardVisualizer);
    }

    initializeUI() {
        this.configItemsContainer = document.getElementById('config-items');
        this.setupButtons();
        // Clear the board view container first
        const boardView = document.getElementById('board-view');
        const boardContainer = boardView.querySelector('.board-container');
        if (boardContainer) {
            boardContainer.innerHTML = '';
        }
        
        // Render the board with new SVG implementation
        this.boardVisualizer.renderBoard();
        
        document.getElementById('board-view').appendChild(this.legend.createLegend());
    }

    // TODO: This function should be part of the section for adding pin requirements
    setupButtons() {
        this.addItemBtn = document.getElementById('add-item');
        this.calculateBtn = document.getElementById('calculate-config');
        this.resetBtn = document.getElementById('reset-config');

        this.addItemBtn.addEventListener('click', () => DialogManager.showAddItemDialog(type => appState.addConfigItem(type)));
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