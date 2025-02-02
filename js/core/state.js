// state.js
export class AppState {
    constructor() {
        this.configItems = [];
        this.modelConfig = null;
        this.teensyData = null;
        this.pinConfig = null;
    }

    addConfigItem(item) {
        this.configItems.push(item);
    }

    removeConfigItem(itemId) {
        this.configItems = this.configItems.filter(item => item.id !== itemId);
    }

    updateConfigItem(itemId, key, value) {
        const item = this.configItems.find(item => item.id === itemId);
        if (item) {
            item.options[key] = value;
        }
    }

    setModelConfig(config) {
        this.modelConfig = config;
        // Add new event if needed
        // this.emit('modelConfigChanged', config);
    }

    setTeensyData(data) {
        this.teensyData = data;
    }

    setPinConfig(config) {
        this.pinConfig = config;
    }

    reset() {
        this.configItems = [];
        if (this.pinConfig) {
            this.pinConfig.clearAssignments();
        }
    }

    exportConfiguration() {
        const config = this.pinConfig.exportConfiguration();
        config.requirements = this.configItems.map(item => ({
            type: item.type,
            options: item.options
        }));
        return config;
    }

    getComponents() {
        return this.modelConfig?.teensy41?.components || {};
    }

    getPinTypes() {
        return this.modelConfig?.teensy41?.pinTypes || {};
    }
}

export const appState = new AppState();