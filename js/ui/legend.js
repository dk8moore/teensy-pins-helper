// legend.js
import { CAPABILITIES } from '../core/config.js';

export class CapabilitiesLegend {
    constructor(boardVisualizer) {
        this.boardVisualizer = boardVisualizer;
    }

    createLegend() {
        const legend = document.createElement('div');
        legend.className = 'capabilities-legend';
        
        legend.innerHTML = `
            <div class="capability-items">
                ${CAPABILITIES.map(cap => `
                    <div class="capability-item" data-capability="${cap.id}">
                        <div class="capability-color pin-${cap.id}"></div>
                        <span class="capability-label">${cap.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.addEventListeners(legend);
        
        return legend;
    }

    addEventListeners(legend) {
        legend.querySelectorAll('.capability-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const capability = item.dataset.capability;
                document.querySelectorAll('.pin').forEach(pin => {
                    if (pin.dataset.capabilities.includes(capability)) {
                        pin.classList.add(`pin-${capability}`);
                        pin.classList.remove('pin-faded');
                    } else {
                        pin.classList.add('pin-faded');
                    }
                });
            });
            
            item.addEventListener('mouseleave', () => {
                document.querySelectorAll('.pin').forEach(pin => {
                    pin.classList.remove('pin-faded');
                    pin.className = 'pin';
                    // Restore current pin assignments if any
                    if (pin.dataset.currentType) {
                        pin.classList.add(`pin-${pin.dataset.currentType}`);
                    }
                });
            });
        });
    }
}