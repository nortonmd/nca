import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createSafetyConcern from '@salesforce/apex/SafetyConcernController.createSafetyConcern';

const STEPS = ['incident', 'reporter', 'description', 'review'];

export default class SafetyWizard extends LightningElement {
    @track formData = {};
    @track currentStep = 0;
    @track isSubmitting = false;
    @track isSubmitted = false;
    @track submittedCaseId = null;

    // ─── Step Visibility Getters ──────────────────────────────────────────────

    get currentStepLabel() {
        return STEPS[this.currentStep];
    }

    get isStepIncident() {
        return this.currentStep === 0 && !this.isSubmitted;
    }

    get isStepReporter() {
        return this.currentStep === 1 && !this.isSubmitted;
    }

    get isStepDescription() {
        return this.currentStep === 2 && !this.isSubmitted;
    }

    get isStepReview() {
        return this.currentStep === 3 && !this.isSubmitted;
    }

    // ─── Navigation Handlers ──────────────────────────────────────────────────

    handleStepNext(event) {
        this.formData = { ...this.formData, ...event.detail };
        if (this.currentStep < STEPS.length - 1) {
            this.currentStep += 1;
        }
    }

    handleStepPrev() {
        if (this.currentStep > 0) {
            this.currentStep -= 1;
        }
    }

    // ─── Submit ───────────────────────────────────────────────────────────────

    async handleSubmit(event) {
        const { contentDocumentIds } = event.detail;
        this.isSubmitting = true;
        try {
            const caseId = await createSafetyConcern({
                formData: this.formData,
                contentDocumentIds: contentDocumentIds ?? []
            });
            this.submittedCaseId = caseId;
            this.isSubmitted = true;
        } catch (error) {
            this.showError(error);
        } finally {
            this.isSubmitting = false;
        }
    }

    handleReset() {
        this.formData = {};
        this.currentStep = 0;
        this.isSubmitted = false;
        this.submittedCaseId = null;
    }

    // ─── Error Utility ────────────────────────────────────────────────────────

    showError(error) {
        const message = Array.isArray(error?.body)
            ? error.body.map(e => e.message).join(', ')
            : error?.body?.message ?? error?.message ?? 'Unknown error';
        this.dispatchEvent(new ShowToastEvent({
            title: 'Submission Failed',
            message,
            variant: 'error',
            mode: 'sticky'
        }));
    }
}
