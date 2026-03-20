import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getPodMembers from '@salesforce/apex/PodMemberController.getPodMembers';

export default class PodStructure extends LightningElement {
    wiredMembersResult;

    @wire(getPodMembers)
    wiredMembers(value) {
        this.wiredMembersResult = value;
        const { data, error } = value;
        if (data) {
            this._error = undefined;
        } else if (error) {
            this._error = error;
        }
    }

    _error;

    get error() {
        return this._error;
    }

    get isLoading() {
        const v = this.wiredMembersResult;
        return !v || (!v.data && !v.error);
    }

    get hasPodData() {
        return this.wiredMembersResult?.data != null;
    }

    get isEmpty() {
        const rows = this.wiredMembersResult?.data;
        return Array.isArray(rows) && rows.length === 0;
    }

    get showRows() {
        return this.hasPodData && !this.isEmpty;
    }

    get rowSections() {
        return [
            {
                key: 'primary',
                rowClass: 'pod-row pod-row_primary slds-grid slds-grid_align-center slds-wrap slds-gutters_small',
                articleClass: 'pod-card pod-card_primary',
                figureClass: 'pod-card__figure pod-card__figure_primary',
                cards: this._decorateRow('Primary')
            },
            {
                key: 'secondary',
                rowClass: 'pod-row pod-row_secondary slds-grid slds-grid_align-center slds-wrap slds-gutters_small slds-m-top_large',
                articleClass: 'pod-card pod-card_secondary',
                figureClass: 'pod-card__figure pod-card__figure_secondary',
                cards: this._decorateRow('Secondary')
            }
        ];
    }

    _decorateRow(rowType) {
        const data = this.wiredMembersResult?.data;
        if (!data) {
            return [];
        }
        return data
            .filter((r) => r.Row_Type__c === rowType)
            .sort((a, b) => (a.Sort_Order__c ?? 0) - (b.Sort_Order__c ?? 0))
            .map((r) => ({
                cardKey: r.Id,
                title: r.Name,
                imageUrl: r.Image_URL__c,
                useImage: Boolean(r.Image_URL__c),
                isFemale: (r.Icon_Style__c || 'Male') === 'Female'
            }));
    }

    handleRefresh() {
        return refreshApex(this.wiredMembersResult);
    }
}
