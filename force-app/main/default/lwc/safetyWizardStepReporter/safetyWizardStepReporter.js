import { LightningElement, api } from 'lwc';

const ROLE_OPTIONS = [
    { label: 'Pilot',                 value: 'Pilot' },
    { label: 'First Officer',         value: 'First Officer' },
    { label: 'Cabin Crew',            value: 'Cabin Crew' },
    { label: 'Ground Crew',           value: 'Ground Crew' },
    { label: 'Maintenance Technician',value: 'Maintenance Technician' },
    { label: 'Air Traffic Control',   value: 'Air Traffic Control' },
    { label: 'Gate Agent',            value: 'Gate Agent' },
    { label: 'Security Personnel',    value: 'Security Personnel' },
    { label: 'Other',                 value: 'Other' }
];

export default class SafetyWizardStepReporter extends LightningElement {
    @api formData = {};

    get roleOptions() { return ROLE_OPTIONS; }

    handleNext() {
        if (!this.validateFields()) return;
        this.dispatchEvent(new CustomEvent('stepnext', { detail: this.collectInputValues() }));
    }

    handlePrev() {
        this.dispatchEvent(new CustomEvent('stepprev'));
    }

    validateFields() {
        return [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ].reduce((valid, field) => {
            field.reportValidity();
            return valid && field.checkValidity();
        }, true);
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
