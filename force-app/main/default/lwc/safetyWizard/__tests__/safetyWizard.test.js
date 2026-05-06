import { createElement } from 'lwc';
import SafetyWizard from 'c/safetyWizard';
import createSafetyConcern from '@salesforce/apex/SafetyConcernController.createSafetyConcern';

jest.mock(
    '@salesforce/apex/SafetyConcernController.createSafetyConcern',
    () => ({ default: jest.fn() }),
    { virtual: true }
);

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('c-safety-wizard', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
        jest.clearAllMocks();
    });

    it('renders the incident step first', () => {
        const el = createElement('c-safety-wizard', { is: SafetyWizard });
        document.body.appendChild(el);
        const stepIncident = el.shadowRoot.querySelector('c-safety-wizard-step-incident');
        expect(stepIncident).not.toBeNull();
    });

    it('advances to reporter step on stepnext from incident', async () => {
        const el = createElement('c-safety-wizard', { is: SafetyWizard });
        document.body.appendChild(el);

        const stepIncident = el.shadowRoot.querySelector('c-safety-wizard-step-incident');
        stepIncident.dispatchEvent(new CustomEvent('stepnext', {
            detail: { incidentType: 'Near Miss', severity: 'High' }
        }));
        await Promise.resolve();

        const stepReporter = el.shadowRoot.querySelector('c-safety-wizard-step-reporter');
        expect(stepReporter).not.toBeNull();
        expect(el.shadowRoot.querySelector('c-safety-wizard-step-incident')).toBeNull();
    });

    it('merges formData from each step', async () => {
        const el = createElement('c-safety-wizard', { is: SafetyWizard });
        document.body.appendChild(el);

        el.shadowRoot.querySelector('c-safety-wizard-step-incident')
            .dispatchEvent(new CustomEvent('stepnext', { detail: { severity: 'Critical' } }));
        await Promise.resolve();

        el.shadowRoot.querySelector('c-safety-wizard-step-reporter')
            .dispatchEvent(new CustomEvent('stepnext', { detail: { reporterName: 'Jane Pilot' } }));
        await Promise.resolve();

        el.shadowRoot.querySelector('c-safety-wizard-step-description')
            .dispatchEvent(new CustomEvent('stepnext', { detail: { description: 'test desc' } }));
        await Promise.resolve();

        const reviewStep = el.shadowRoot.querySelector('c-safety-wizard-step-review');
        expect(reviewStep).not.toBeNull();
        expect(reviewStep.formData.severity).toBe('Critical');
        expect(reviewStep.formData.reporterName).toBe('Jane Pilot');
        expect(reviewStep.formData.description).toBe('test desc');
    });

    it('goes back to incident step on stepprev from reporter', async () => {
        const el = createElement('c-safety-wizard', { is: SafetyWizard });
        document.body.appendChild(el);

        el.shadowRoot.querySelector('c-safety-wizard-step-incident')
            .dispatchEvent(new CustomEvent('stepnext', { detail: {} }));
        await Promise.resolve();

        el.shadowRoot.querySelector('c-safety-wizard-step-reporter')
            .dispatchEvent(new CustomEvent('stepprev'));
        await Promise.resolve();

        expect(el.shadowRoot.querySelector('c-safety-wizard-step-incident')).not.toBeNull();
    });

    it('shows success state after successful submission', async () => {
        createSafetyConcern.mockResolvedValue('5001000000TestId');

        const el = createElement('c-safety-wizard', { is: SafetyWizard });
        document.body.appendChild(el);

        // Navigate to review step
        el.shadowRoot.querySelector('c-safety-wizard-step-incident')
            .dispatchEvent(new CustomEvent('stepnext', { detail: {} }));
        await Promise.resolve();
        el.shadowRoot.querySelector('c-safety-wizard-step-reporter')
            .dispatchEvent(new CustomEvent('stepnext', { detail: {} }));
        await Promise.resolve();
        el.shadowRoot.querySelector('c-safety-wizard-step-description')
            .dispatchEvent(new CustomEvent('stepnext', { detail: {} }));
        await Promise.resolve();

        el.shadowRoot.querySelector('c-safety-wizard-step-review')
            .dispatchEvent(new CustomEvent('submit', { detail: { contentDocumentIds: [] } }));
        await flushPromises();

        expect(el.shadowRoot.querySelector('.slds-illustration')).not.toBeNull();
        expect(el.shadowRoot.querySelector('c-safety-wizard-step-review')).toBeNull();
    });

    it('resets to step 1 when "Submit Another Report" is clicked', async () => {
        createSafetyConcern.mockResolvedValue('5001000000TestId');
        const el = createElement('c-safety-wizard', { is: SafetyWizard });
        document.body.appendChild(el);

        for (let i = 0; i < 3; i++) {
            const events = ['c-safety-wizard-step-incident', 'c-safety-wizard-step-reporter', 'c-safety-wizard-step-description'];
            el.shadowRoot.querySelector(events[i])
                .dispatchEvent(new CustomEvent('stepnext', { detail: {} }));
            await Promise.resolve();
        }
        el.shadowRoot.querySelector('c-safety-wizard-step-review')
            .dispatchEvent(new CustomEvent('submit', { detail: { contentDocumentIds: [] } }));
        await flushPromises();

        el.shadowRoot.querySelector('lightning-button[label="Submit Another Report"]').click();
        await Promise.resolve();

        expect(el.shadowRoot.querySelector('c-safety-wizard-step-incident')).not.toBeNull();
    });
});
