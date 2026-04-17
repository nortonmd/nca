public with sharing class CountdownMessageController {
    @AuraEnabled(cacheable=true)
    public static List<FAQ_Countdown_Message__c> getCountdownMessages() {
        return [SELECT Id, Message__c FROM FAQ_Countdown_Message__c ORDER BY CreatedDate ASC];
    }
}
