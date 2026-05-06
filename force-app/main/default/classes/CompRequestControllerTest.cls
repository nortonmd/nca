@isTest
private class CompRequestControllerTest {

    @TestSetup
    static void setup() {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];

        User manager = new User(
            FirstName          = 'Test',
            LastName           = 'Manager',
            Email              = 'test.manager@example.com',
            Username           = 'test.manager.' + UserInfo.getOrganizationId() + '@example.com',
            Alias              = 'tmgr',
            TimeZoneSidKey     = 'America/Los_Angeles',
            LocaleSidKey       = 'en_US',
            EmailEncodingKey   = 'UTF-8',
            LanguageLocaleKey  = 'en_US',
            ProfileId          = p.Id
        );
        insert manager;

        User submitter = new User(
            FirstName          = 'Test',
            LastName           = 'Submitter',
            Email              = 'test.submitter@example.com',
            Username           = 'test.submitter.' + UserInfo.getOrganizationId() + '@example.com',
            Alias              = 'tsub',
            TimeZoneSidKey     = 'America/Los_Angeles',
            LocaleSidKey       = 'en_US',
            EmailEncodingKey   = 'UTF-8',
            LanguageLocaleKey  = 'en_US',
            ProfileId          = p.Id,
            ManagerId          = manager.Id
        );
        insert submitter;

        Contact guest = new Contact(
            FirstName = 'VIP',
            LastName  = 'Guest'
        );
        insert guest;
    }

    @isTest
    static void testSubmitBelowThreshold() {
        User submitter = [SELECT Id FROM User WHERE LastName = 'Submitter' LIMIT 1];
        Contact guest  = [SELECT Id, Name FROM Contact WHERE LastName = 'Guest' LIMIT 1];

        Map<String, Object> formData = new Map<String, Object>{
            'contactId'       => guest.Id,
            'contactName'     => guest.Name,
            'compType'        => 'Room',
            'requestedAmount' => 100.00,
            'reason'          => 'High-value player retention',
            'notes'           => 'Returning VIP guest'
        };

        Id compRequestId;
        Test.startTest();
        System.runAs(submitter) {
            compRequestId = CompRequestController.submitCompRequest(formData);
        }
        Test.stopTest();

        Comp_Request__c result = [
            SELECT Status__c, Flagged_For_Review__c, Submitted_By__c
            FROM Comp_Request__c
            WHERE Id = :compRequestId
        ];
        System.assertEquals('Submitted', result.Status__c, 'Status should be Submitted');
        System.assertEquals(false, result.Flagged_For_Review__c, 'Should not be flagged');
        System.assertEquals(submitter.Id, result.Submitted_By__c, 'Submitted by should match');

        Integer taskCount = [SELECT COUNT() FROM Task WHERE WhatId = :compRequestId];
        System.assertEquals(0, taskCount, 'No task should be created below threshold');
    }

    @isTest
    static void testSubmitAboveThreshold_flagsAndCreatesTask() {
        User submitter = [SELECT Id FROM User WHERE LastName = 'Submitter' LIMIT 1];
        User manager   = [SELECT Id FROM User WHERE LastName = 'Manager' LIMIT 1];
        Contact guest  = [SELECT Id, Name FROM Contact WHERE LastName = 'Guest' LIMIT 1];

        Map<String, Object> formData = new Map<String, Object>{
            'contactId'       => guest.Id,
            'contactName'     => guest.Name,
            'compType'        => 'Show Tickets',
            'requestedAmount' => 1500.00,
            'reason'          => 'Whale player — annual visit',
            'notes'           => 'Requesting full suite comps'
        };

        Id compRequestId;
        Test.startTest();
        System.runAs(submitter) {
            compRequestId = CompRequestController.submitCompRequest(formData);
        }
        Test.stopTest();

        Comp_Request__c result = [
            SELECT Status__c, Flagged_For_Review__c, Requested_Amount__c
            FROM Comp_Request__c
            WHERE Id = :compRequestId
        ];
        System.assertEquals('Pending Manager Review', result.Status__c, 'Status should be Pending Manager Review');
        System.assertEquals(true, result.Flagged_For_Review__c, 'Should be flagged');
        System.assertEquals(1500.00, result.Requested_Amount__c, 'Amount should be stored correctly');

        List<Task> tasks = [
            SELECT Subject, OwnerId, Priority, Status
            FROM Task
            WHERE WhatId = :compRequestId
        ];
        System.assertEquals(1, tasks.size(), 'One manager review task should be created');
        System.assertEquals(manager.Id, tasks[0].OwnerId, 'Task should be assigned to manager');
        System.assertEquals('High', tasks[0].Priority, 'Task priority should be High');
        System.assert(tasks[0].Subject.contains(guest.Name), 'Task subject should reference the guest name');
    }

    @isTest
    static void testSubmitBulk() {
        User submitter = [SELECT Id FROM User WHERE LastName = 'Submitter' LIMIT 1];
        Contact guest  = [SELECT Id, Name FROM Contact WHERE LastName = 'Guest' LIMIT 1];

        Test.startTest();
        System.runAs(submitter) {
            for (Integer i = 0; i < 10; i++) {
                Map<String, Object> formData = new Map<String, Object>{
                    'contactId'       => guest.Id,
                    'contactName'     => guest.Name,
                    'compType'        => 'Food & Beverage',
                    'requestedAmount' => 50.00 * (i + 1),
                    'reason'          => 'Bulk test reason ' + i,
                    'notes'           => ''
                };
                CompRequestController.submitCompRequest(formData);
            }
        }
        Test.stopTest();

        System.assertEquals(10, [SELECT COUNT() FROM Comp_Request__c], 'All 10 records should be created');
    }

    @isTest
    static void testGetReviewThreshold() {
        Test.startTest();
        Decimal threshold = CompRequestController.getReviewThreshold();
        Test.stopTest();
        System.assertNotEquals(null, threshold, 'Threshold should not be null');
        System.assert(threshold > 0, 'Threshold should be positive');
    }
}
