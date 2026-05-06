import { createElement } from 'lwc';
import SafetyWizardStepReview from 'c/safetyWizardStepReview';

const SAMPLE_FORM_DATA = {
    flightNumber:       'AA123',
    incidentDateTime:   '2026-04-20T14:30',
    incidentLocation:   'Runway',
    incidentType:       'Near Miss',
    severity:           'High',
    reporterName:       'Jane Pilot',
    employeeId:         'EMP-001',
    personnelRole:      'Pilot',
    reporterEmail:      'jane@airline.com',
    description:        'Near collision during approach.',
    witnesses:          'John Smith',
    contentDocumentIds: ['docId001']
};

describe('c-safety-wizard-step-review', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('renders all form data values', () => {
        const el = createElement('c-safety-wizard-step-review', { is: SafetyWizardStepReview });
        el.formData = SAMPLE_FORM_DATA;
        document.body.appendChild(el);

        const text = el.shadowRoot.textContent;
        expect(text).toContain('AA123');
        expect(text).toContain('Runway');
        expect(text).toContain('Near Miss');
        expect(text).toContain('Jane Pilot');
        expect(text).toContain('Near collision during approach.');
    });

    it('shows "—" when flight number is blank', () => {
        const el = createElement('c-safety-wizard-step-review', { is: SafetyWizardStepReview });
        el.formData = { ...SAMPLE_FORM_DATA, flightNumber: '' };
        document.body.appendChild(el);
        expect(el.shadowRoot.textContent).toContain('—');
    });

    it('shows attachment count when files are attached', () => {
        const el = createElement('c-safety-wizard-step-review', { is: SafetyWizardStepReview });
        el.formData = SAMPLE_FORM_DATA;
        document.body.appendChild(el);
        expect(el.shadowRoot.textContent).toContain('1 file');
    });

    it('dispatches submit event with contentDocumentIds on Submit click', async () => {
        const el = createElement('c-safety-wizard-step-review', { is: SafetyWizardStepReview });
        el.formData = SAMPLE_FORM_DATA;
        document.body.appendChild(el);

        const handler = jest.fn();
        el.addEventListener('submit', handler);
        el.shadowRoot.querySelector('lightning-button[label="Submit Report"]').click();
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.contentDocumentIds).toEqual(['docId001']);
    });

    it('dispatches stepprev on Back click', async () => {
        const el = createElement('c-safety-wizard-step-review', { is: SafetyWizardStepReview });
        el.formData = SAMPLE_FORM_DATA;
        document.body.appendChild(el);

        const handler = jest.fn();
        el.addEventListener('stepprev', handler);
        el.shadowRoot.querySelector('lightning-button[label="Back"]').click();
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('shows "Submitting…" label and disables buttons when isSubmitting is true', () => {
        const el = createElement('c-safety-wizard-step-review', { is: SafetyWizardStepReview });
        el.formData = SAMPLE_FORM_DATA;
        el.isSubmitting = true;
        document.body.appendChild(el);

        const submitBtn = el.shadowRoot.querySelector('lightning-button[label="Submitting…"]');
        expect(submitBtn).not.toBeNull();
        expect(submitBtn.disabled).toBe(true);
    });
});
