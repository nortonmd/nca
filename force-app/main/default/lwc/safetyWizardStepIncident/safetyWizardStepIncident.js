import { LightningElement, api } from 'lwc';

const LOCATION_OPTIONS = [
    { label: 'Gate',         value: 'Gate' },
    { label: 'Runway',       value: 'Runway' },
    { label: 'Taxiway',      value: 'Taxiway' },
    { label: 'Ramp',         value: 'Ramp' },
    { label: 'Cabin',        value: 'Cabin' },
    { label: 'Cockpit',      value: 'Cockpit' },
    { label: 'Baggage Area', value: 'Baggage Area' },
    { label: 'Hangar',       value: 'Hangar' },
    { label: 'Terminal',     value: 'Terminal' },
    { label: 'Other',        value: 'Other' }
];

const INCIDENT_TYPE_OPTIONS = [
    { label: 'Mechanical Failure',  value: 'Mechanical Failure' },
    { label: 'Hazardous Material',  value: 'Hazardous Material' },
    { label: 'Near Miss',           value: 'Near Miss' },
    { label: 'Wildlife Strike',     value: 'Wildlife Strike' },
    { label: 'Ground Collision',    value: 'Ground Collision' },
    { label: 'Fuel Spill',          value: 'Fuel Spill' },
    { label: 'Passenger Injury',    value: 'Passenger Injury' },
    { label: 'Crew Injury',         value: 'Crew Injury' },
    { label: 'Security Breach',     value: 'Security Breach' },
    { label: 'Weather Event',       value: 'Weather Event' },
    { label: 'Other',               value: 'Other' }
];

const SEVERITY_OPTIONS = [
    { label: 'Low',      value: 'Low' },
    { label: 'Medium',   value: 'Medium' },
    { label: 'High',     value: 'High' },
    { label: 'Critical', value: 'Critical' }
];

export default class SafetyWizardStepIncident extends LightningElement {
    @api formData = {};

    get locationOptions()     { return LOCATION_OPTIONS; }
    get incidentTypeOptions() { return INCIDENT_TYPE_OPTIONS; }
    get severityOptions()     { return SEVERITY_OPTIONS; }

    handleNext() {
        if (!this.validateFields()) return;

        const inputs = this.collectInputValues();
        this.dispatchEvent(new CustomEvent('stepnext', { detail: inputs }));
    }

    validateFields() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ].reduce((valid, field) => {
            field.reportValidity();
            return valid && field.checkValidity();
        }, true);
        return allValid;
    }

    collectInputValues() {
        const values = {};
        this.template.querySelectorAll('lightning-input').forEach(input => {
            values[input.name] = input.value;
        });
        this.template.querySelectorAll('lightning-combobox').forEach(combo => {
            values[combo.name] = combo.value;
        });
        return values;
    }
}
