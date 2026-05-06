public with sharing class SafetyConcernController {

    /**
     * Creates a Safety Concern Case record and links any pre-uploaded files to it.
     *
     * Files are uploaded via lightning-file-upload before the Case exists, so they
     * are initially linked to a temporary ContentDocument. After Case creation we
     * re-link each ContentDocument to the new Case via ContentDocumentLink.
     *
     * @param formData            All wizard field values keyed by API field name.
     * @param contentDocumentIds  IDs of ContentDocuments uploaded during the wizard.
     * @return Id of the newly created Case.
     */
    @AuraEnabled
    public static Id createSafetyConcern(
        Map<String, Object> formData,
        List<Id> contentDocumentIds
    ) {
        Id recordTypeId = getRecordTypeId();

        Case newCase = new Case(
            RecordTypeId       = recordTypeId,
            Subject            = buildSubject(formData),
            Description        = (String) formData.get('description'),
            Origin             = 'Web',
            Status             = 'New',
            Airline_Flight_Number__c = (String)  formData.get('flightNumber'),
            Incident_Date_Time__c    = parseDateTime(formData.get('incidentDateTime')),
            Incident_Location__c     = (String)  formData.get('incidentLocation'),
            Incident_Type__c         = (String)  formData.get('incidentType'),
            Severity__c              = (String)  formData.get('severity'),
            Personnel_Role__c        = (String)  formData.get('personnelRole'),
            Witnesses__c             = (String)  formData.get('witnesses')
        );

        SObjectAccessDecision insertDecision = Security.stripInaccessible(
            AccessType.CREATABLE,
            new List<SObject>{ newCase }
        );
        insert insertDecision.getRecords();

        Id caseId = insertDecision.getRecords()[0].Id;

        if (contentDocumentIds != null && !contentDocumentIds.isEmpty()) {
            linkDocumentsToCase(caseId, contentDocumentIds);
        }

        return caseId;
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private static Id getRecordTypeId() {
        return [
            SELECT Id
            FROM RecordType
            WHERE SObjectType = 'Case'
              AND DeveloperName = 'SafetyConcern'
            WITH SECURITY_ENFORCED
            LIMIT 1
        ].Id;
    }

    private static String buildSubject(Map<String, Object> formData) {
        String type = (String) formData.get('incidentType');
        String location = (String) formData.get('incidentLocation');
        String flight = (String) formData.get('flightNumber');
        String subject = 'Safety Concern';
        if (String.isNotBlank(type)) subject += ' — ' + type;
        if (String.isNotBlank(location)) subject += ' at ' + location;
        if (String.isNotBlank(flight)) subject += ' (Flight ' + flight + ')';
        return subject;
    }

    private static Datetime parseDateTime(Object rawValue) {
        if (rawValue == null) return null;
        String strValue = String.valueOf(rawValue);
        if (String.isBlank(strValue)) return null;
        try {
            return (Datetime) JSON.deserialize('"' + strValue + '"', Datetime.class);
        } catch (Exception e) {
            return null;
        }
    }

    private static void linkDocumentsToCase(Id caseId, List<Id> contentDocumentIds) {
        List<ContentDocumentLink> links = new List<ContentDocumentLink>();
        for (Id docId : contentDocumentIds) {
            links.add(new ContentDocumentLink(
                ContentDocumentId = docId,
                LinkedEntityId    = caseId,
                ShareType         = 'V',
                Visibility        = 'AllUsers'
            ));
        }
        SObjectAccessDecision linkDecision = Security.stripInaccessible(
            AccessType.CREATABLE,
            links
        );
        insert linkDecision.getRecords();
    }
}
