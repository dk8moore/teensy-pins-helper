// dialogs.js
import { PERIPHERAL_TEMPLATES } from '../core/config.js';

export class DialogManager {
    static createOptionInput(itemId, key, option) {
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

    static showAddItemDialog(onSelect) {
        const dialog = document.createElement('dialog');
        dialog.className = 'add-item-dialog';
        
        const content = document.createElement('div');
        content.innerHTML = `
            <h3>Add Configuration Item</h3>
            <div class="peripheral-list">
                ${Object.entries(PERIPHERAL_TEMPLATES).map(([key, template]) => `
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
                DialogManager.addConfigItem(btn.dataset.type);
                dialog.close();
            });
        });
        
        dialog.querySelector('.cancel').addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => document.body.removeChild(dialog));
        
        dialog.showModal();
    }

    static addConfigItem(type) {
        const template = PERIPHERAL_TEMPLATES[type];
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
}