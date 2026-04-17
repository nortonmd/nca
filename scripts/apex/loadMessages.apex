List<FAQ_Countdown_Message__c> messagesToInsert = new List<FAQ_Countdown_Message__c>();

messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Experience luxury redefined at The Ritz-Carlton. Unforgettable stays await!'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Welcome to Marriott Hotels! Your journey starts here, with comfort and convenience.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Discover vibrant energy and style at W Hotels. Where design meets destination.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Embark on an adventure with Sheraton Hotels & Resorts. Connecting people and places.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Find your perfect balance at Westin Hotels & Resorts. Wellness inspired stays.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Enjoy spacious suites and thoughtful amenities at Residence Inn by Marriott.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Explore the world with Courtyard by Marriott. Designed for today\'s traveler.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Indulge in sophisticated charm at Renaissance Hotels. Unscripted discoveries.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Relax and recharge at Fairfield by Marriott. Simple. Reliable. Friendly.'));
messagesToInsert.add(new FAQ_Countdown_Message__c(Message__c='Live like a local with Element by Westin. Extended stays, redefined.'));

insert messagesToInsert;
System.debug('Inserted ' + messagesToInsert.size() + ' FAQ Countdown Messages.');
