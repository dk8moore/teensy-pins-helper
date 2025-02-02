// board-svg.js
export class BoardVisualizer {
    constructor(boardData, modelConfig) {
        this.boardData = boardData;
        this.modelConfig = modelConfig;
        this.boardView = document.getElementById('board-view');
        this.SCALE = 20; // 20 pixels per mm, can be adjusted
        this.currentAssignments = {};
    }

    renderBoard() {
        const { dimensions } = this.modelConfig;
        
        // Create SVG element
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', dimensions.width * this.SCALE);
        svg.setAttribute('height', dimensions.height * this.SCALE);
        svg.classList.add('board-svg');

        // Board outline
        const boardRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        boardRect.setAttribute('x', '0');
        boardRect.setAttribute('y', '0');
        boardRect.setAttribute('width', dimensions.width * this.SCALE);
        boardRect.setAttribute('height', dimensions.height * this.SCALE);
        boardRect.setAttribute('fill', '#1a9e1a');
        boardRect.setAttribute('stroke', 'black');
        svg.appendChild(boardRect);

        // Render components (USB, CPU, SD Card, etc.)
        this.renderComponents(svg);
        
        // Render pins
        this.renderPins(svg);

        // Clear and append to board view
        this.boardView.innerHTML = '';
        this.boardView.appendChild(svg);
    }

    renderComponents(svg) {
        const { components } = this.modelConfig;
        
        Object.entries(components).forEach(([key, component]) => {
            if (component.type === 'rectangle') {
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute('x', component.x * this.SCALE);
                rect.setAttribute('y', component.y * this.SCALE);
                rect.setAttribute('width', component.width * this.SCALE);
                rect.setAttribute('height', component.height * this.SCALE);
                rect.setAttribute('fill', component.color || '#silver');
                rect.setAttribute('stroke', 'black');
                svg.appendChild(rect);
            }
        });
    }

    renderPins(svg) {
        Object.entries(this.boardData.pins).forEach(([name, pin]) => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            
            circle.setAttribute('cx', pin.geometry.x * this.SCALE);
            circle.setAttribute('cy', pin.geometry.y * this.SCALE);
            circle.setAttribute('r', (pin.geometry.type === 'normal' ? 1.1 : 0.6) * this.SCALE);
            circle.setAttribute('fill', '#cccccc');
            circle.setAttribute('stroke', 'black');
            circle.setAttribute('stroke-width', '1');
            
            // Add data attributes for later manipulation
            circle.dataset.pin = name;
            circle.dataset.capabilities = Object.entries(pin.capabilities)
                .filter(([_, value]) => value !== null)
                .map(([type]) => type)
                .join(' ');

            // Add tooltip
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${name} - Pin ${pin.pin}`;
            circle.appendChild(title);

            svg.appendChild(circle);
        });
    }

    updatePinDisplay(assignments) {
        this.currentAssignments = assignments;
        
        // Reset all pins
        document.querySelectorAll('circle[data-pin]').forEach(pinEl => {
            pinEl.setAttribute('fill', '#cccccc');
        });

        // Update assigned pins
        Object.entries(assignments).forEach(([pinName, assignment]) => {
            const pinEl = document.querySelector(`circle[data-pin="${pinName}"]`);
            if (pinEl) {
                pinEl.setAttribute('fill', this.getPinColor(assignment.type));
            }
        });
    }

    getPinColor(type) {
        const colorMap = {
            'spi': '#ff0000',
            'i2c': '#00ff00',
            'serial': '#0000ff',
            'pwm': '#ffff00',
            'analog': '#ff00ff',
            'digital': '#00ffff',
            // Add more types as needed
        };
        return colorMap[type] || '#cccccc';
    }

    highlightCapability(capability) {
        document.querySelectorAll('circle[data-pin]').forEach(pin => {
            const hasCapability = pin.dataset.capabilities.includes(capability);
            pin.style.opacity = hasCapability ? '1' : '0.3';
            if (hasCapability) {
                pin.setAttribute('fill', this.getPinColor(capability));
            }
        });
    }

    resetHighlights() {
        document.querySelectorAll('circle[data-pin]').forEach(pin => {
            pin.style.opacity = '1';
            pin.setAttribute('fill', '#cccccc');
        });
        this.updatePinDisplay(this.currentAssignments); // Restore current assignments
    }
}