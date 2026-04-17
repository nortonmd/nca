import { LightningElement, api, track } from 'lwc';
import getCountdownMessages from '@salesforce/apex/CountdownMessageController.getCountdownMessages';

const MESSAGE_ROTATION_INTERVAL = 15000; // 15 seconds

export default class CountdownTimer extends LightningElement {
    @api minutes = 6; // Default countdown minutes
    @track formattedTime = '00:00';
    @track progressPercentage = 100;
    @track currentMessage = 'Loading messages...';
    @track messages = [];
    @track messageIndex = 0;
    @track hasRendered = false; // Flag to ensure the DOM is ready

    countdownInterval;
    messageInterval;

    initialTimeInSeconds;
    remainingTimeInSeconds;

    connectedCallback() {
        this.initialTimeInSeconds = this.minutes * 60;
        this.remainingTimeInSeconds = this.initialTimeInSeconds;
        this.hasRendered = true;
        this.fetchMessages();
    }

    renderedCallback() {
        if (this.hasRendered && !this.countdownInterval) {
            this.startCountdown();
        }
    }

    disconnectedCallback() {
        clearInterval(this.countdownInterval);
        clearInterval(this.messageInterval);
    }

    async fetchMessages() {
        try {
            const data = await getCountdownMessages();
            if (data && data.length > 0) {
                this.messages = data.map(msg => msg.Message__c);
                this.currentMessage = this.messages[this.messageIndex];
                this.startMessageRotation();
            } else {
                this.currentMessage = 'No messages found.';
            }
        } catch (error) {
            console.error('Error fetching countdown messages:', error);
            this.currentMessage = 'Error loading messages.';
        }
    }

    startMessageRotation() {
        this.messageInterval = setInterval(() => {
            this.messageIndex = (this.messageIndex + 1) % this.messages.length;
            this.currentMessage = this.messages[this.messageIndex];
        }, MESSAGE_ROTATION_INTERVAL);
    }

    startCountdown() {
        this.countdownInterval = setInterval(() => {
            if (this.remainingTimeInSeconds > 0) {
                this.remainingTimeInSeconds--;
                this.updateDisplay();
            } else {
                this.currentMessage = 'Thank you for choosing Marriott. We look forward to welcoming you.';
                this.resetCountdown(2);
            }
        }, 1000);
    }

    resetCountdown(resetMinutes) {
        this.initialTimeInSeconds = resetMinutes * 60;
        this.remainingTimeInSeconds = this.initialTimeInSeconds;
        this.progressPercentage = 100;
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.remainingTimeInSeconds / 60);
        const seconds = this.remainingTimeInSeconds % 60;
        let formattedMinutes = this.padZero(minutes);
        let formattedSeconds = this.padZero(seconds);
        this.formattedTime = formattedMinutes + ':' + formattedSeconds;
        this.progressPercentage = (this.remainingTimeInSeconds / this.initialTimeInSeconds) * 100;
    }

    padZero(num) {
        return num < 10 ? '0' + num : num;
    }

    handleAstroError(event) {
        event.target.style.display = 'none';
    }

    get progressBarStyle() {
        // Marriott gold (#C5A95D) when full → Marriott burgundy (#A4343A) when low
        const r = Math.round(197 - (197 - 164) * (1 - this.progressPercentage / 100));
        const g = Math.round(169 - (169 - 52)  * (1 - this.progressPercentage / 100));
        const b = Math.round(93  - (93  - 58)  * (1 - this.progressPercentage / 100));
        return `width: ${this.progressPercentage}%; background-color: rgb(${r},${g},${b});`;
    }

    get textColorStyle() {
        return this.progressPercentage < 20 ? 'color: #C5A95D;' : '';
    }
}
