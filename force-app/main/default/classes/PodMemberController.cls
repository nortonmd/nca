public with sharing class PodMemberController {
    @AuraEnabled(cacheable=true)
    public static List<Pod_Member__c> getPodMembers() {
        return [
            SELECT Id, Name, Row_Type__c, Sort_Order__c, Icon_Style__c, Image_URL__c
            FROM Pod_Member__c
            ORDER BY Row_Type__c ASC, Sort_Order__c ASC
        ];
    }
}
