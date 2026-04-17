# MuleSoft Integration Architecture for Hilton RFP Engine

## 1. Inbound Integration: RFP Ingestion
**Purpose**: Capture RFP submissions from external sources (Emails, Cvent, Lanyon) and create/update RFP records in Salesforce.

### Architecture Flow:
1.  **System API (External)**: Connects to external systems (e.g., Cvent API, Lanyon API, Email Parsers).
2.  **Process API (RFP Orchestration)**: Receives the raw RFP data, performs data transformation, maps external fields to Salesforce `RFP__c` and `RFP_Question__c` fields, and enriches the data with internal Hilton account information.
3.  **System API (Salesforce)**: Uses the Salesforce Connector to perform upsert operations on `RFP__c` and related objects.

### Endpoints:
*   `POST /api/v1/rfp/ingest`: Accepts JSON payload containing RFP details, account info, and GBTA questions.

## 2. Outbound Integration: Rate Loading
**Purpose**: Push contracted rates to Hilton's Global Distribution System (GDS) and Revenue Management Systems (RMS) once an RFP is "Closed Won".

### Architecture Flow:
1.  **System API (Salesforce)**: Listens for Platform Events or uses Change Data Capture (CDC) when an `RFP__c` status changes to "Closed Won".
2.  **Process API (Rate Distribution)**: Retrieves the final `Rate_Offer__c` details associated with the winning `Property_Response__c`. Formats the rate data according to GDS/RMS standards.
3.  **System API (GDS/RMS)**: Connects to Hilton's internal systems to load the rates, making them instantly bookable.

### Endpoints:
*   `POST /api/v1/rates/load`: Sends the finalized rate and amenity data to the target systems.
