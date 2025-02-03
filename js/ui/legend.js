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
                this.boardVisualizer.highlightCapability(capability);
            });
            
            item.addEventListener('mouseleave', () => {
                this.boardVisualizer.resetHighlights();
            });
        });
    }
}