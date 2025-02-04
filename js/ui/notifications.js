// notifications.js
export class NotificationManager {
    constructor() {
        this.alertBox = document.getElementById('alert-box');
    }

    showError(message) {
        this.show(message, 'error', 5000);
    }

    showSuccess(message) {
        this.show(message, 'success', 3000);
    }

    show(message, type, duration) {
        this.alertBox.className = `alert alert-${type}`;
        this.alertBox.textContent = message;
        this.alertBox.style.display = 'block';

        setTimeout(() => {
            this.alertBox.style.display = 'none';
        }, duration);
    }
}

export const notifications = new NotificationManager();