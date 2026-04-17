import { LightningElement, api, wire } from 'lwc';

export default class HotelRfpPortal extends LightningElement {
    @api recordId;

    connectedCallback() {
        console.log('Hotel RFP Portal Initialized');
    }
}
