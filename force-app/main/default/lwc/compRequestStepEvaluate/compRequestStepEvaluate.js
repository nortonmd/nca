import { LightningElement, api } from 'lwc';

export default class CompRequestStepEvaluate extends LightningElement {
    @api formData = {};
    @api threshold = 500;
    @api isSubmitting = false;

    get requestedAmount() {
        return parseFloat(this.formData?.requestedAmount) || 0;
    }

    get isEgregious() {
        return this.requestedAmount > this.threshold;
    }

    get hasNotes() {
        return !!this.formData?.notes?.trim();
    }

    get formattedAmount() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.requestedAmount);
    }

    get formattedThreshold() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.threshold);
    }

    get bannerClass() {
        return this.isEgregious
            ? 'eval-banner eval-banner--warning'
            : 'eval-banner eval-banner--ok';
    }

    get bannerIcon() {
        return this.isEgregious ? '⚠️' : '✓';
    }

    get bannerTitle() {
        return this.isEgregious
            ? 'Manager Review Required'
            : 'Amount Within Guidelines';
    }

    get bannerMessage() {
        return this.isEgregious
            ? `The requested amount of ${this.formattedAmount} exceeds the ${this.formattedThreshold} review threshold. Submitting will flag this request and notify your manager for approval.`
            : `The requested amount of ${this.formattedAmount} is within the ${this.formattedThreshold} comp guidelines.`;
    }

    handleSubmit() {
        this.dispatchEvent(new CustomEvent('submitrequest'));
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('stepprev'));
    }
}
