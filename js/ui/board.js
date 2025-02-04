// board-svg.js
export class BoardVisualizer {
    constructor(modelData, boardUIData) {
        this.modelData = modelData;
        this.boardUIData = boardUIData;
        this.boardView = document.getElementById('board-view');
        this.SCALE = 15;
        this.currentAssignments = {};
    }

    renderBoard(targetElement = document.getElementById('board-view')) {
        const { dimensions } = this.modelData;

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
        boardRect.setAttribute('fill', '#82cf8f');
        boardRect.setAttribute('stroke', 'black');
        boardRect.setAttribute('stroke-width', '4');
        svg.appendChild(boardRect);

        // Render components (USB, CPU, SD Card, etc.)
        // this.renderComponents(svg);

        // Render pins
        this.renderPins(svg);

        // Clear and append to board view
        targetElement.innerHTML = '';
        targetElement.appendChild(svg);
    }

    renderComponents(svg) {
        const { boardComponents } = this.boardUIData;

        console.log('Rendering components:', boardComponents);

        Object.entries(boardComponents).forEach(([key, component]) => {
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
        Object.entries(this.modelData.pins).forEach(([name, pin]) => {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

            circle.setAttribute('cx', pin.geometry.x * this.SCALE);
            circle.setAttribute('cy', pin.geometry.y * this.SCALE);
            circle.setAttribute('r', this.boardUIData.pinTypes[pin.geometry.type].radius * this.SCALE);
            circle.setAttribute('fill', '#cccccc');
            circle.setAttribute('stroke', 'black');
            circle.setAttribute('stroke-width', '2');

            // Add data attributes for later manipulation
            circle.dataset.pin = name;
            circle.dataset.capabilities = Object.entries(pin.capabilities)
                .filter(([_, value]) => value !== null)
                .map(([type]) => type)
                .join(' ');

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('x', pin.geometry.x * this.SCALE);
            text.setAttribute('y', pin.geometry.y * this.SCALE + 1);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', `${this.SCALE * 0.7}px`);
            text.setAttribute('fill', 'black');
            // Check pin.pin is null
            const labelText = (pin.pin || pin.pin == 0) ? pin.pin.toString() : pin.type;
            text.textContent = labelText;
            text.style.pointerEvents = 'none';  // Make text not interfere with hover

            // Add tooltip
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `Pin ${pin.pin || pin.type}`;

            group.appendChild(circle);
            group.appendChild(text);
            circle.appendChild(title);
            svg.appendChild(group);
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