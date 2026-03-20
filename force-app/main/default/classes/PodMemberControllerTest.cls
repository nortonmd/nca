@IsTest
private class PodMemberControllerTest {
    @IsTest
    static void getPodMembers_returnsOrderedRows() {
        insert new List<Pod_Member__c>{
            new Pod_Member__c(
                Name = 'Secondary A',
                Row_Type__c = 'Secondary',
                Sort_Order__c = 2,
                Icon_Style__c = 'Female'
            ),
            new Pod_Member__c(
                Name = 'Primary B',
                Row_Type__c = 'Primary',
                Sort_Order__c = 2,
                Icon_Style__c = 'Male'
            ),
            new Pod_Member__c(
                Name = 'Primary A',
                Row_Type__c = 'Primary',
                Sort_Order__c = 1,
                Icon_Style__c = 'Female',
                Image_URL__c = 'https://example.com/photo.png'
            )
        };

        Test.startTest();
        List<Pod_Member__c> rows = PodMemberController.getPodMembers();
        Test.stopTest();

        System.assertEquals(3, rows.size());
        System.assertEquals('Primary A', rows[0].Name);
        System.assertEquals('Primary B', rows[1].Name);
        System.assertEquals('Secondary A', rows[2].Name);
    }
}
