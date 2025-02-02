// board.js
export class BoardVisualizer {
    constructor(boardData, modelConfig) {
        this.boardData = boardData;
        this.modelConfig = modelConfig;
        this.boardView = document.getElementById('board-view');
        this.boardBaseHeight = 650;
    }

    renderBoard() {
        this.boardView.innerHTML = '';
        const boardContainer = document.createElement('div');
        boardContainer.className = 'board-container';

        const { boardWidth, boardHeight } = this.calculateBoardDimensions();

        const boardOutline = document.createElement('div');
        boardOutline.className = 'board-outline';
        boardOutline.style.width = `${boardWidth}px`;
        boardOutline.style.height = `${boardHeight}px`;
        
        const usbConnector = document.createElement('div');
        usbConnector.className = 'usb-connector';
        
        const boardLabel = document.createElement('div');
        boardLabel.className = 'board-label';
        boardLabel.textContent = this.modelConfig.name;

        // Update container grid template based on board dimensions
        boardContainer.style.gridTemplateColumns = `100px ${boardWidth}px 100px`;
        boardContainer.style.gridTemplateRows = `100px ${boardHeight}px 100px`;

        const pinGrids = {
            L: this.createPinGrid('L'),
            R: this.createPinGrid('R'),
            U: this.createPinGrid('U'),
            D: this.createPinGrid('D')
        };

        boardContainer.appendChild(boardOutline);
        boardOutline.appendChild(usbConnector);
        boardOutline.appendChild(boardLabel);
        
        boardContainer.appendChild(pinGrids.L);
        boardContainer.appendChild(pinGrids.R);
        boardContainer.appendChild(pinGrids.U);
        boardContainer.appendChild(pinGrids.D);
        
        this.boardView.appendChild(boardContainer);

        this.createPins(boardContainer);
    }

    calculateBoardDimensions() {
        const boardHeight = this.boardBaseHeight;
        const boardWidth = boardHeight * this.modelConfig.dimensions.ratio;
        return { boardWidth, boardHeight };
    }

    createPinGrid(side) {
        const grid = document.createElement('div');
        grid.className = `pin-grid pin-grid-${side}`;
        return grid;
    }

    createPins(boardContainer) {
        Object.entries(this.boardData).forEach(([name, pin]) => {
            const pinEl = this.createPinElement(name, pin);
            const grid = boardContainer.querySelector(`.pin-grid-${pin.side}`);
            if (grid) {
                grid.appendChild(pinEl);
            } else {
                console.error(`Could not find grid for side ${pin.side}`);
            }
        });
    }

    createPinElement(name, pin) {
        const pinEl = document.createElement('div');
        pinEl.className = 'pin';
        pinEl.dataset.pin = name;
        pinEl.dataset.capabilities = Object.entries(pin.capabilities)
            .filter(([_, value]) => value !== null)
            .map(([type]) => type)
            .join(' ');
        
        const pinContent = `
            <span class="pin-number">${pin.pin}</span>
            <span class="pin-function"></span>
        `;
        
        pinEl.innerHTML = pinContent;
        return pinEl;
    }

    updatePinDisplay(assignments) {
        document.querySelectorAll('.pin').forEach(pinEl => {
            pinEl.className = 'pin';
            if (pinEl.classList.contains('pin-smt')) {
                pinEl.className = 'pin pin-smt';
            }
            const functionEl = pinEl.querySelector('.pin-function');
            if (functionEl) {
                functionEl.textContent = '';
            }
        });
        
        for (const [pinName, assignment] of Object.entries(assignments)) {
            const pinEl = document.querySelector(`[data-pin="${pinName}"]`);
            if (pinEl) {
                const baseClass = pinEl.classList.contains('pin-smt') ? 'pin pin-smt' : 'pin';
                pinEl.className = `${baseClass} pin-${assignment.type}`;
                const functionEl = pinEl.querySelector('.pin-function');
                if (functionEl) {
                    functionEl.textContent = `${assignment.type.toUpperCase()}: ${assignment.role}`;
                }
            }
        }
    }

    highlightCapability(capability) {
        document.querySelectorAll('.pin').forEach(pin => {
            const hasCapability = pin.dataset.capabilities.includes(capability);
            pin.style.opacity = hasCapability ? '1' : '0.3';
            if (hasCapability) {
                pin.classList.add(`pin-${capability}`);
            }
        });
    }

    resetHighlights() {
        document.querySelectorAll('.pin').forEach(pin => {
            pin.style.opacity = '1';
            pin.className = 'pin';
            if (pin.classList.contains('pin-smt')) {
                pin.classList.add('pin-smt');
            }
        });
    }
}