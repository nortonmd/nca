// Run anonymously after deploy (Setup → Developer Console → Execute Anonymous) or via: sf apex run -f scripts/apex/seedPodMembers.apex
// Adjust or delete existing Pod Member rows first if you re-run.

List<Pod_Member__c> seed = new List<Pod_Member__c>{
    new Pod_Member__c(Name = 'Core SE', Row_Type__c = 'Primary', Sort_Order__c = 1, Icon_Style__c = 'Male'),
    new Pod_Member__c(
        Name = 'Specialist SE & Leaders',
        Row_Type__c = 'Primary',
        Sort_Order__c = 2,
        Icon_Style__c = 'Female'
    ),
    new Pod_Member__c(Name = 'POC Team', Row_Type__c = 'Primary', Sort_Order__c = 3, Icon_Style__c = 'Female'),
    new Pod_Member__c(Name = 'AF SE', Row_Type__c = 'Primary', Sort_Order__c = 4, Icon_Style__c = 'Male'),
    new Pod_Member__c(Name = 'Dist TA', Row_Type__c = 'Primary', Sort_Order__c = 5, Icon_Style__c = 'Female'),
    new Pod_Member__c(Name = 'Data/AI Arch', Row_Type__c = 'Secondary', Sort_Order__c = 1, Icon_Style__c = 'Female'),
    new Pod_Member__c(Name = 'CSM/ CSAL', Row_Type__c = 'Secondary', Sort_Order__c = 2, Icon_Style__c = 'Female')
};
insert seed;
System.debug('Inserted ' + seed.size() + ' Pod Member rows');
