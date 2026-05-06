import { createElement } from 'lwc';
import SafetyWizardStepIncident from 'c/safetyWizardStepIncident';

describe('c-safety-wizard-step-incident', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('renders all required fields', () => {
        const el = createElement('c-safety-wizard-step-incident', { is: SafetyWizardStepIncident });
        el.formData = {};
        document.body.appendChild(el);

        expect(el.shadowRoot.querySelector('lightning-input[name="flightNumber"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-input[name="incidentDateTime"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-combobox[name="incidentLocation"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-combobox[name="incidentType"]')).not.toBeNull();
        expect(el.shadowRoot.querySelector('lightning-combobox[name="severity"]')).not.toBeNull();
    });

    it('populates location, incident type, and severity options', () => {
        const el = createElement('c-safety-wizard-step-incident', { is: SafetyWizardStepIncident });
        el.formData = {};
        document.body.appendChild(el);

        const locationCombo = el.shadowRoot.querySelector('lightning-combobox[name="incidentLocation"]');
        expect(locationCombo.options.length).toBeGreaterThan(0);

        const typeCombo = el.shadowRoot.querySelector('lightning-combobox[name="incidentType"]');
        expect(typeCombo.options.length).toBeGreaterThan(0);

        const severityCombo = el.shadowRoot.querySelector('lightning-combobox[name="severity"]');
        expect(severityCombo.options.map(o => o.value)).toEqual(['Low', 'Medium', 'High', 'Critical']);
    });

    it('dispatches stepnext with field values when Next is clicked and fields are valid', async () => {
        const el = createElement('c-safety-wizard-step-incident', { is: SafetyWizardStepIncident });
        el.formData = {};
        document.body.appendChild(el);

        // Simulate all fields returning valid
        [...el.shadowRoot.querySelectorAll('lightning-input'),
         ...el.shadowRoot.querySelectorAll('lightning-combobox')].forEach(field => {
            field.checkValidity = () => true;
            field.reportValidity = () => true;
            field.value = 'TestValue';
            field.name = field.getAttribute('name');
        });

        const handler = jest.fn();
        el.addEventListener('stepnext', handler);
        el.shadowRoot.querySelector('lightning-button[label="Next"]').click();
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
