// board.js
export class BoardVisualizer {
    constructor(boardData, modelConfig) {
        this.boardData = boardData;
        this.modelConfig = modelConfig;
        this.boardView = document.getElementById('board-view');
    }

    createBoardVisualization() {
        this.boardView.innerHTML = '';
        const boardContainer = document.createElement('div');
        boardContainer.className = 'board-container';

        const boardOutline = document.createElement('div');
        boardOutline.className = 'board-outline';
        boardOutline.style.aspectRatio = `${this.modelConfig.dimensions.ratio} / 1`;
        boardOutline.innerHTML = `<div class="board-label">${this.modelConfig.name}</div>`;
        
        const grids = {
            L: document.createElement('div'),
            R: document.createElement('div'),
            U: document.createElement('div'),
            D: document.createElement('div')
        };
        
        Object.entries(grids).forEach(([side, grid]) => {
            grid.className = `pin-grid pin-grid-${side}`;
        });
        
        Object.entries(this.boardData).forEach(([name, pin]) => {
            const pinEl = document.createElement('div');
            pinEl.className = 'pin';
            pinEl.dataset.pin = name;
            pinEl.dataset.capabilities = Object.entries(pin.capabilities)
                .filter(([_, value]) => value !== null)
                .map(([type]) => type)
                .join(' ');
            
            pinEl.innerHTML = `
                <span class="pin-number">${pin.pin}</span>
                <span class="pin-function"></span>
            `;
            
            grids[pin.side].appendChild(pinEl);
        });
        
        boardContainer.appendChild(grids.L);
        boardContainer.appendChild(boardOutline);
        boardContainer.appendChild(grids.R);
        boardContainer.appendChild(grids.U);
        boardContainer.appendChild(grids.D);
        
        this.boardView.appendChild(boardContainer);
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