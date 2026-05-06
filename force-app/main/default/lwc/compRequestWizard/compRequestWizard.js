import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getReviewThreshold from '@salesforce/apex/CompRequestController.getReviewThreshold';
import submitCompRequest from '@salesforce/apex/CompRequestController.submitCompRequest';

const STEPS = ['details', 'evaluate'];

export default class CompRequestWizard extends NavigationMixin(LightningElement) {
    @track formData = {};
    @track currentStep = 0;
    @track threshold = 500;
    @track isSubmitting = false;
    @track isSubmitted = false;
    @track submittedRecordId = null;
    @track isFlaggedForReview = false;

    connectedCallback() {
        getReviewThreshold()
            .then(result => {
                this.threshold = result;
            })
            .catch(error => {
                this.showError(error);
            });
    }

    get currentStepLabel() {
        return STEPS[this.currentStep];
    }

    get isStepDetails() {
        return this.currentStep === 0;
    }

    get isStepEvaluate() {
        return this.currentStep === 1;
    }

    handleStepNext(event) {
        this.formData = { ...this.formData, ...event.detail };
        this.currentStep += 1;
    }

    handleStepPrev() {
        if (this.currentStep > 0) {
            this.currentStep -= 1;
        }
    }

    async handleSubmit() {
        this.isSubmitting = true;
        try {
            const recordId = await submitCompRequest({ formData: this.formData });
            this.submittedRecordId = recordId;
            this.isFlaggedForReview = parseFloat(this.formData.requestedAmount) > this.threshold;
            this.isSubmitted = true;
        } catch (error) {
            this.showError(error);
        } finally {
            this.isSubmitting = false;
        }
    }

    handleViewRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.submittedRecordId,
                actionName: 'view'
            }
        });
    }

    handleReset() {
        this.formData = {};
        this.currentStep = 0;
        this.isSubmitted = false;
        this.submittedRecordId = null;
        this.isFlaggedForReview = false;
    }

    showError(error) {
        const message = Array.isArray(error?.body)
            ? error.body.map(e => e.message).join(', ')
            : error?.body?.message ?? error?.message ?? 'An unexpected error occurred.';
        this.dispatchEvent(new ShowToastEvent({ title: 'Error', message, variant: 'error' }));
    }
}
