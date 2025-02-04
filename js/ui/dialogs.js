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

    static closeDialog(dialog) {
        if (dialog) {
            dialog.close();
            // Remove from DOM after close animation
            setTimeout(() => {
                if (dialog && dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            }, 100);
        }
    }

    static showAddItemDialog(onSelect) {
        // First, remove any existing dialogs
        const existingDialogs = document.querySelectorAll('.add-item-dialog');
        existingDialogs.forEach(dialog => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        });

        // Create new dialog
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

        // Handle peripheral selection
        const buttons = dialog.querySelectorAll('.peripheral-option');
        buttons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                const type = btn.dataset.type;
                const template = PERIPHERAL_TEMPLATES[type];
                
                if (template) {
                    const itemId = `item-${Date.now()}`;
                    const defaultValues = {};
                    
                    Object.entries(template.options).forEach(([key, opt]) => {
                        defaultValues[key] = opt.default;
                    });

                    const newItem = {
                        id: itemId,
                        type: type,
                        options: defaultValues
                    };

                    if (typeof onSelect === 'function') {
                        onSelect(newItem);
                    }
                }
                
                DialogManager.closeDialog(dialog);
            });
        });

        // Handle cancel button
        const cancelButton = dialog.querySelector('.cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                DialogManager.closeDialog(dialog);
            });
        }

        // Handle backdrop click
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                DialogManager.closeDialog(dialog);
            }
        });

        dialog.showModal();
    }

    static addConfigItem(type, configItemsContainer) {
        const template = PERIPHERAL_TEMPLATES[type];
        if (!template) return;

        const itemEl = document.createElement('div');
        itemEl.className = 'config-item';
        itemEl.dataset.type = type;

        const itemId = `item-${Date.now()}`;
        itemEl.id = itemId;

        const options = template.options;
        const defaultValues = {};

        itemEl.innerHTML = `
            <div class="item-header">
                <h4>${template.name}</h4>
                <button class="remove-item">×</button>
            </div>
            <div class="item-options">
                ${Object.entries(options).map(([key, opt]) => {
                    defaultValues[key] = opt.default;
                    return DialogManager.createOptionInput(itemId, key, opt);
                }).join('')}
            </div>
        `;

        if (configItemsContainer) {
            configItemsContainer.appendChild(itemEl);
        }

        return {
            id: itemId,
            type,
            options: defaultValues
        };
    }

}