import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getPodMembers from '@salesforce/apex/PodMemberController.getPodMembers';
import { updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';

const COLUMNS = [
    {
        label: 'Title',
        fieldName: 'Name',
        type: 'text',
        editable: true
    },
    {
        label: 'Row Type',
        fieldName: 'Row_Type__c',
        type: 'picklist',
        editable: true,
        typeAttributes: {
            placeholder: 'Choose row',
            options: [
                { label: 'Primary', value: 'Primary' },
                { label: 'Secondary', value: 'Secondary' }
            ]
        }
    },
    {
        label: 'Sort Order',
        fieldName: 'Sort_Order__c',
        type: 'number',
        editable: true,
        cellAttributes: { alignment: 'left' }
    },
    {
        label: 'Icon Style',
        fieldName: 'Icon_Style__c',
        type: 'picklist',
        editable: true,
        typeAttributes: {
            placeholder: 'Choose icon',
            options: [
                { label: '(none)', value: '' },
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' }
            ]
        }
    },
    {
        label: 'Image URL',
        fieldName: 'Image_URL__c',
        type: 'text',
        editable: true
    },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [{ label: 'Delete', name: 'delete' }]
        }
    }
];

function reduceErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }
    return (
        errors
            .filter((error) => !!error)
            .map((error) => {
                if (Array.isArray(error.body)) {
                    return error.body.map((e) => e.message);
                }
                if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                }
                if (typeof error.message === 'string') {
                    return error.message;
                }
                return error.statusText || String(error);
            })
            .flat()
            .filter((message) => !!message)
    );
}

export default class PodMemberListEditor extends LightningElement {
    columns = COLUMNS;
    draftValues = [];
    wiredPodMembersResult;
    isNewModalOpen = false;
    savePending = false;

    @wire(getPodMembers)
    wiredPodMembers(value) {
        this.wiredPodMembersResult = value;
    }

    get records() {
        return this.wiredPodMembersResult?.data ?? [];
    }

    get isLoading() {
        const v = this.wiredPodMembersResult;
        return !v || (!v.data && !v.error);
    }

    get loadError() {
        return this.wiredPodMembersResult?.error;
    }

    handleRefresh() {
        return refreshApex(this.wiredPodMembersResult);
    }

    openNewModal() {
        this.isNewModalOpen = true;
    }

    closeNewModal() {
        this.isNewModalOpen = false;
    }

    handleCreateSuccess() {
        this.closeNewModal();
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Pod Member created',
                variant: 'success'
            })
        );
        return refreshApex(this.wiredPodMembersResult);
    }

    async handleSave(event) {
        const drafts = event.detail.draftValues;
        if (!drafts?.length) {
            return;
        }
        this.savePending = true;
        try {
            const updates = drafts.map((draft) => {
                const fields = { Id: draft.Id };
                Object.keys(draft).forEach((key) => {
                    if (key === 'Id') {
                        return;
                    }
                    let value = draft[key];
                    if (key === 'Sort_Order__c' && value !== undefined && value !== null && value !== '') {
                        value = Number(value);
                    }
                    if (key === 'Icon_Style__c' && value === '') {
                        value = null;
                    }
                    fields[key] = value;
                });
                return updateRecord({ fields });
            });
            await Promise.all(updates);
            this.draftValues = [];
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Saved',
                    message: `${drafts.length} row(s) updated.`,
                    variant: 'success'
                })
            );
            await refreshApex(this.wiredPodMembersResult);
        } catch (e) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Could not save',
                    message: reduceErrors(e).join(', '),
                    variant: 'error',
                    mode: 'sticky'
                })
            );
        } finally {
            this.savePending = false;
        }
    }

    async handleRowAction(event) {
        const { action, row } = event.detail;
        if (action.name !== 'delete') {
            return;
        }
        const ok = await LightningConfirm.open({
            message: `Delete "${row.Name}"? This cannot be undone.`,
            variant: 'header',
            label: 'Delete Pod Member',
            theme: 'error'
        });
        if (!ok) {
            return;
        }
        try {
            await deleteRecord(row.Id);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Deleted',
                    variant: 'success'
                })
            );
            await refreshApex(this.wiredPodMembersResult);
        } catch (e) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Could not delete',
                    message: reduceErrors(e).join(', '),
                    variant: 'error'
                })
            );
        }
    }
}
