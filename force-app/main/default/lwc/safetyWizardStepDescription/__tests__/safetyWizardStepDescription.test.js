import { createElement } from 'lwc';
import SafetyWizardStepDescription from 'c/safetyWizardStepDescription';

describe('c-safety-wizard-step-description', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('renders description textarea and file upload', () => {
        const el = createElement('c-safety-wizard-step-description', { is: SafetyWizardStepDescription });
        el.formData = {};
        document.body.appendChild(el);

        expect(el.shadowRoot.querySelector('lightning-textarea[name="description"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-file-upload')).not.toBeNull();
    });

    it('tracks uploaded file IDs on uploadfinished', async () => {
        const el = createElement('c-safety-wizard-step-description', { is: SafetyWizardStepDescription });
        el.formData = {};
        document.body.appendChild(el);

        const fileUpload = el.shadowRoot.querySelector('lightning-file-upload');
        fileUpload.dispatchEvent(new CustomEvent('uploadfinished', {
            detail: { files: [{ documentId: 'docId001' }, { documentId: 'docId002' }] }
        }));
        await Promise.resolve();

        // Attachment count indicator should appear
        const countEl = el.shadowRoot.querySelector('.slds-text-color_success');
        expect(countEl).not.toBeNull();
        expect(countEl.textContent).toContain('2');
    });

    it('dispatches stepprev when Back is clicked', async () => {
        const el = createElement('c-safety-wizard-step-description', { is: SafetyWizardStepDescription });
        el.formData = {};
        document.body.appendChild(el);

        const handler = jest.fn();
        el.addEventListener('stepprev', handler);
        el.shadowRoot.querySelector('lightning-button[label="Back"]').click();
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
