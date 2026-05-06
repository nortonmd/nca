import { LightningElement, api, track } from 'lwc';

const ACCEPTED_FORMATS = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.txt'];

export default class SafetyWizardStepDescription extends LightningElement {
    @api formData = {};

    /**
     * lightning-file-upload requires a record-id to attach files to.
     * We use a well-known placeholder until the Case is created, then
     * re-link the documents in Apex after Case creation.
     *
     * In production orgs, use the authenticated user's Contact or Account Id.
     * For guest users, a workaround object (e.g. a temporary record) is needed.
     */
    @api uploadRecordId;

    @track contentDocumentIds = [];

    get acceptedFormats() { return ACCEPTED_FORMATS; }

    get hasAttachments() { return this.contentDocumentIds.length > 0; }

    get attachmentCount() { return this.contentDocumentIds.length; }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        const newIds = uploadedFiles.map(f => f.documentId);
        this.contentDocumentIds = [...this.contentDocumentIds, ...newIds];
    }

    handleNext() {
        if (!this.validateFields()) return;

        const values = this.collectInputValues();
        values.contentDocumentIds = this.contentDocumentIds;

        this.dispatchEvent(new CustomEvent('stepnext', { detail: values }));
    }

    handlePrev() {
        this.dispatchEvent(new CustomEvent('stepprev'));
    }

    validateFields() {
        return [...this.template.querySelectorAll('lightning-textarea')]
            .reduce((valid, field) => {
                field.reportValidity();
                return valid && field.checkValidity();
            }, true);
    }

    collectInputValues() {
        const values = {};
        this.template.querySelectorAll('lightning-textarea').forEach(ta => {
            values[ta.name] = ta.value;
        });
        return values;
    }
}
