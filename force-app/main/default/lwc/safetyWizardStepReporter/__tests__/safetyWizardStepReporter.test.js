import { createElement } from 'lwc';
import SafetyWizardStepReporter from 'c/safetyWizardStepReporter';

describe('c-safety-wizard-step-reporter', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('renders all reporter fields', () => {
        const el = createElement('c-safety-wizard-step-reporter', { is: SafetyWizardStepReporter });
        el.formData = {};
        document.body.appendChild(el);

        expect(el.shadowRoot.querySelector('lightning-input[name="reporterName"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-input[name="employeeId"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-combobox[name="personnelRole"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-input[name="reporterEmail"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-input[name="reporterPhone"]')).not.toBeNull();
    });

    it('dispatches stepprev when Back is clicked', async () => {
        const el = createElement('c-safety-wizard-step-reporter', { is: SafetyWizardStepReporter });
        el.formData = {};
        document.body.appendChild(el);

        const handler = jest.fn();
        el.addEventListener('stepprev', handler);
        el.shadowRoot.querySelector('lightning-button[label="Back"]').click();
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
