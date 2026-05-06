import { LightningElement, api } from 'lwc';

export default class SafetyWizardStepReview extends LightningElement {
    @api formData = {};
    @api isSubmitting = false;

    get submitLabel() {
        return this.isSubmitting ? 'Submitting…' : 'Submit Report';
    }

    get displayFlightNumber() {
        return this.formData.flightNumber || '—';
    }

    get hasAttachments() {
        return Array.isArray(this.formData.contentDocumentIds) &&
               this.formData.contentDocumentIds.length > 0;
    }

    get attachmentCount() {
        return this.formData.contentDocumentIds?.length ?? 0;
    }

    get severityBadgeClass() {
        const map = {
            Critical: 'badge-critical',
            High:     'badge-high',
            Medium:   'badge-medium',
            Low:      'badge-low'
        };
        return map[this.formData.severity] ?? '';
    }

    handleSubmit() {
        this.dispatchEvent(new CustomEvent('submit', {
            detail: { contentDocumentIds: this.formData.contentDocumentIds ?? [] }
        }));
    }

    handlePrev() {
        this.dispatchEvent(new CustomEvent('stepprev'));
    }
}
