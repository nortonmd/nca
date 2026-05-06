@isTest
private class SafetyConcernControllerTest {

    @TestSetup
    static void setup() {
        // Ensure the Safety Concern record type exists in the test org.
        // If it doesn't, the tests will fail gracefully with a meaningful error
        // rather than a generic null pointer, making misconfiguration obvious.
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static Map<String, Object> buildFormData(String severity) {
        Map<String, Object> data = new Map<String, Object>();
        data.put('flightNumber',     'AA123');
        data.put('incidentDateTime', '2026-04-20T14:30:00.000Z');
        data.put('incidentLocation', 'Runway');
        data.put('incidentType',     'Near Miss');
        data.put('severity',         severity);
        data.put('personnelRole',    'Pilot');
        data.put('witnesses',        'John Smith, Jane Doe');
        data.put('description',      'Aircraft came within 500 feet of another during approach.');
        return data;
    }

    private static Id getRecordTypeId() {
        List<RecordType> rts = [
            SELECT Id FROM RecordType
            WHERE SObjectType = 'Case' AND DeveloperName = 'SafetyConcern'
            LIMIT 1
        ];
        return rts.isEmpty() ? null : rts[0].Id;
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    @isTest
    static void testCreateSafetyConcern_singleRecord() {
        Id rtId = getRecordTypeId();
        if (rtId == null) {
            System.assert(false, 'SafetyConcern record type must exist for this test to run.');
        }

        Map<String, Object> formData = buildFormData('High');

        Test.startTest();
        Id caseId = SafetyConcernController.createSafetyConcern(formData, new List<Id>());
        Test.stopTest();

        System.assertNotEquals(null, caseId, 'Expected a non-null Case Id to be returned.');

        Case result = [
            SELECT Subject, Status, Origin, RecordTypeId,
                   Airline_Flight_Number__c, Incident_Type__c,
                   Incident_Location__c, Severity__c, Personnel_Role__c,
                   Witnesses__c, Description
            FROM Case WHERE Id = :caseId
        ];

        System.assertEquals('New',      result.Status,  'Status should default to New.');
        System.assertEquals('Web',      result.Origin,  'Origin should be Web.');
        System.assertEquals(rtId,       result.RecordTypeId, 'Record type should be SafetyConcern.');
        System.assertEquals('AA123',    result.Airline_Flight_Number__c);
        System.assertEquals('Near Miss',result.Incident_Type__c);
        System.assertEquals('Runway',   result.Incident_Location__c);
        System.assertEquals('High',     result.Severity__c);
        System.assertEquals('Pilot',    result.Personnel_Role__c);
        System.assert(result.Subject.contains('Near Miss'),   'Subject should mention incident type.');
        System.assert(result.Subject.contains('Runway'),      'Subject should mention location.');
        System.assert(result.Subject.contains('AA123'),       'Subject should mention flight number.');
    }

    @isTest
    static void testCreateSafetyConcern_subjectBuiltCorrectly_noFlightNumber() {
        Id rtId = getRecordTypeId();
        if (rtId == null) {
            System.assert(false, 'SafetyConcern record type must exist for this test to run.');
        }

        Map<String, Object> formData = buildFormData('Low');
        formData.put('flightNumber', '');

        Test.startTest();
        Id caseId = SafetyConcernController.createSafetyConcern(formData, new List<Id>());
        Test.stopTest();

        Case result = [SELECT Subject FROM Case WHERE Id = :caseId];
        System.assert(!result.Subject.contains('Flight '), 'Subject should not mention flight when number is blank.');
    }

    @isTest
    static void testCreateSafetyConcern_withFileAttachments() {
        Id rtId = getRecordTypeId();
        if (rtId == null) {
            System.assert(false, 'SafetyConcern record type must exist for this test to run.');
        }

        // Create a ContentVersion so we have a ContentDocumentId to link.
        ContentVersion cv = new ContentVersion(
            Title           = 'TestIncidentPhoto',
            PathOnClient    = 'TestIncidentPhoto.jpg',
            VersionData     = Blob.valueOf('fake image data'),
            IsMajorVersion  = true
        );
        insert cv;
        Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;

        Map<String, Object> formData = buildFormData('Critical');

        Test.startTest();
        Id caseId = SafetyConcernController.createSafetyConcern(formData, new List<Id>{ contentDocId });
        Test.stopTest();

        List<ContentDocumentLink> links = [
            SELECT Id FROM ContentDocumentLink
            WHERE LinkedEntityId = :caseId AND ContentDocumentId = :contentDocId
        ];
        System.assertEquals(1, links.size(), 'The ContentDocument should be linked to the new Case.');
    }

    @isTest
    static void testCreateSafetyConcern_nullDateTimeHandled() {
        Id rtId = getRecordTypeId();
        if (rtId == null) {
            System.assert(false, 'SafetyConcern record type must exist for this test to run.');
        }

        Map<String, Object> formData = buildFormData('Medium');
        formData.put('incidentDateTime', null);

        Test.startTest();
        Id caseId = SafetyConcernController.createSafetyConcern(formData, new List<Id>());
        Test.stopTest();

        Case result = [SELECT Incident_Date_Time__c FROM Case WHERE Id = :caseId];
        System.assertEquals(null, result.Incident_Date_Time__c, 'Null dateTime should be handled gracefully.');
    }

    @isTest
    static void testCreateSafetyConcern_bulk200() {
        Id rtId = getRecordTypeId();
        if (rtId == null) {
            System.assert(false, 'SafetyConcern record type must exist for this test to run.');
        }

        Test.startTest();
        for (Integer i = 0; i < 200; i++) {
            Map<String, Object> formData = buildFormData('Low');
            formData.put('flightNumber', 'BULK' + i);
            SafetyConcernController.createSafetyConcern(formData, new List<Id>());
        }
        Test.stopTest();

        Integer count = [SELECT COUNT() FROM Case WHERE RecordType.DeveloperName = 'SafetyConcern'];
        System.assertEquals(200, count, 'All 200 Cases should have been created.');
    }
}
