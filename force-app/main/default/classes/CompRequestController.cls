public with sharing class CompRequestController {

    private static final String STATUS_SUBMITTED = 'Submitted';
    private static final String STATUS_PENDING_REVIEW = 'Pending Manager Review';
    private static final String TASK_SUBJECT_PREFIX = 'Review Comp Request: ';

    @AuraEnabled(cacheable=true)
    public static Decimal getReviewThreshold() {
        List<Comp_Request_Settings__mdt> settings = [
            SELECT Review_Threshold__c
            FROM Comp_Request_Settings__mdt
            WHERE DeveloperName = 'Default'
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];
        if (settings.isEmpty()) {
            return 500.00;
        }
        return settings[0].Review_Threshold__c;
    }

    @AuraEnabled
    public static Id submitCompRequest(Map<String, Object> formData) {
        try {
            Decimal threshold = getReviewThreshold();
            Decimal requestedAmount = parseDecimal(formData.get('requestedAmount'));
            Boolean isEgregious = requestedAmount > threshold;

            Comp_Request__c compRequest = new Comp_Request__c(
                Contact__c          = (Id) formData.get('contactId'),
                Comp_Type__c        = (String) formData.get('compType'),
                Requested_Amount__c = requestedAmount,
                Reason__c           = (String) formData.get('reason'),
                Notes__c            = (String) formData.get('notes'),
                Status__c           = isEgregious ? STATUS_PENDING_REVIEW : STATUS_SUBMITTED,
                Flagged_For_Review__c = isEgregious,
                Submitted_By__c     = UserInfo.getUserId()
            );

            SObjectAccessDecision insertDecision = Security.stripInaccessible(
                AccessType.CREATABLE,
                new List<SObject>{ compRequest }
            );
            insert insertDecision.getRecords();

            Id compRequestId = insertDecision.getRecords()[0].Id;

            if (isEgregious) {
                createManagerReviewTask(compRequestId, formData);
            }

            return compRequestId;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static void createManagerReviewTask(Id compRequestId, Map<String, Object> formData) {
        List<User> submitters = [
            SELECT ManagerId
            FROM User
            WHERE Id = :UserInfo.getUserId()
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];

        if (submitters.isEmpty() || submitters[0].ManagerId == null) {
            return;
        }

        String contactName = (String) formData.get('contactName');
        String taskSubject = TASK_SUBJECT_PREFIX + (String.isBlank(contactName) ? compRequestId : contactName);

        Task reviewTask = new Task(
            Subject          = taskSubject,
            OwnerId          = submitters[0].ManagerId,
            WhatId           = compRequestId,
            Status           = 'Not Started',
            Priority         = 'High',
            ActivityDate     = Date.today().addDays(2),
            Description      = 'A comp request has been flagged for review because the requested amount exceeds the review threshold. Please review and take appropriate action.'
        );

        SObjectAccessDecision taskDecision = Security.stripInaccessible(
            AccessType.CREATABLE,
            new List<SObject>{ reviewTask }
        );
        insert taskDecision.getRecords();
    }

    private static Decimal parseDecimal(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Decimal) {
            return (Decimal) value;
        }
        try {
            return Decimal.valueOf(String.valueOf(value));
        } catch (Exception e) {
            return 0;
        }
    }
}
