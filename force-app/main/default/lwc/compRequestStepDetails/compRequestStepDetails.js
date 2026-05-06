import { LightningElement, api, track } from 'lwc';

const COMP_TYPE_OPTIONS = [
    { label: 'Room',              value: 'Room' },
    { label: 'Food & Beverage',   value: 'Food & Beverage' },
    { label: 'Show Tickets',      value: 'Show Tickets' },
    { label: 'Spa',               value: 'Spa' },
    { label: 'Transportation',    value: 'Transportation' },
    { label: 'Other',             value: 'Other' }
];

export default class CompRequestStepDetails extends LightningElement {
    @api formData = {};

    @track contactId       = '';
    @track contactName     = '';
    @track compType        = '';
    @track requestedAmount = null;
    @track reason          = '';
    @track notes           = '';

    @track showContactError  = false;
    @track showCompTypeError = false;
    @track showAmountError   = false;
    @track showReasonError   = false;

    get compTypeOptions() {
        return COMP_TYPE_OPTIONS;
    }

    connectedCallback() {
        if (this.formData) {
            this.contactId       = this.formData.contactId       || '';
            this.contactName     = this.formData.contactName     || '';
            this.compType        = this.formData.compType        || '';
            this.requestedAmount = this.formData.requestedAmount ?? null;
            this.reason          = this.formData.reason          || '';
            this.notes           = this.formData.notes           || '';
        }
    }

    handleContactChange(event) {
        this.contactId   = event.detail.recordId || '';
        this.contactName = event.detail.record?.fields?.Name?.value || '';
        this.showContactError = !this.contactId;
    }

    handleCompTypeChange(event) {
        this.compType = event.detail.value;
        this.showCompTypeError = !this.compType;
    }

    handleAmountChange(event) {
        this.requestedAmount = parseFloat(event.detail.value);
        this.showAmountError = !this.requestedAmount || this.requestedAmount <= 0;
    }

    handleReasonChange(event) {
        this.reason = event.detail.value;
        this.showReasonError = !this.reason?.trim();
    }

    handleNotesChange(event) {
        this.notes = event.detail.value;
    }

    handleNext() {
        if (!this.validate()) {
            return;
        }
        this.dispatchEvent(new CustomEvent('stepnext', {
            detail: {
                contactId:       this.contactId,
                contactName:     this.contactName,
                compType:        this.compType,
                requestedAmount: this.requestedAmount,
                reason:          this.reason,
                notes:           this.notes
            }
        }));
    }

    validate() {
        this.showContactError  = !this.contactId;
        this.showCompTypeError = !this.compType;
        this.showAmountError   = !this.requestedAmount || this.requestedAmount <= 0;
        this.showReasonError   = !this.reason?.trim();
        return !this.showContactError &&
               !this.showCompTypeError &&
               !this.showAmountError &&
               !this.showReasonError;
    }
}
