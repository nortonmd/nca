---
name: apex-best-practices
description: Enforce Salesforce Apex coding best practices including bulkification, governor limit awareness, trigger handler patterns, test class standards, security (sharing/CRUD/FLS), and naming conventions. Use when writing, reviewing, or refactoring Apex classes, triggers, batch jobs, or test classes.
---

# Apex Best Practices

## Governor Limits & Bulkification

**Never place SOQL queries or DML statements inside loops.**

```apex
// ❌ Bad
for (Account a : accounts) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :a.Id];
}

// ✅ Good
Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
for (Contact c : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
    if (!contactsByAccount.containsKey(c.AccountId)) contactsByAccount.put(c.AccountId, new List<Contact>());
    contactsByAccount.get(c.AccountId).add(c);
}
```

- Collect all Ids first, then query once with `IN :idSet`
- Use `Database.insert(records, false)` for partial success with error logging
- Always operate on `List<SObject>` or `Map<Id, SObject>`, not single records

## Trigger Pattern

**One trigger per object. All logic lives in a handler class.**

```apex
// AccountTrigger.trigger
trigger AccountTrigger on Account (before insert, before update, after insert, after update) {
    AccountTriggerHandler handler = new AccountTriggerHandler();
    if (Trigger.isBefore) {
        if (Trigger.isInsert) handler.beforeInsert(Trigger.new);
        if (Trigger.isUpdate) handler.beforeUpdate(Trigger.new, Trigger.oldMap);
    }
    if (Trigger.isAfter) {
        if (Trigger.isInsert) handler.afterInsert(Trigger.new);
        if (Trigger.isUpdate) handler.afterUpdate(Trigger.new, Trigger.oldMap);
    }
}
```

- Handler class is `virtual` or `with sharing` as appropriate
- Use a trigger bypass/switch mechanism (e.g., custom metadata or static boolean) for disabling triggers during data loads

## Sharing & Security

- Default to `with sharing` on all classes unless there is an explicit documented reason not to
- Use `without sharing` only in specific service classes that require elevated access, and document why
- Enforce CRUD/FLS using `Schema.sObjectType` checks or `Security.stripInaccessible()` before DML

```apex
// Check FLS before insert
SObjectAccessDecision decision = Security.stripInaccessible(AccessType.INSERTABLE, recordsToInsert);
insert decision.getRecords();
```

## SOQL Best Practices

- Always filter on indexed fields (`Id`, `Name`, external IDs, lookup fields) to keep queries selective
- Never use `SELECT *`; only query fields you need
- Use `LIMIT` on queries that may return large result sets
- Use `FOR UPDATE` only when necessary (can cause lock contention)
- Avoid SOQL inside `for` loops (see Bulkification above)

## Error Handling

- Prefer `Database.insert/update/delete` with `allOrNone = false` and iterate `SaveResult[]` to log partial failures
- Wrap callouts and async operations in `try/catch`; log errors to a custom log object or platform event rather than swallowing them
- Surface user-friendly error messages via `SObject.addError()` in triggers

```apex
List<Database.SaveResult> results = Database.insert(records, false);
for (Database.SaveResult sr : results) {
    if (!sr.isSuccess()) {
        for (Database.Error err : sr.getErrors()) {
            // log err.getMessage(), err.getFields()
        }
    }
}
```

## Test Class Standards

- Annotate with `@isTest`; never use `SeeAllData=true` except for rare read-only legacy data dependencies (document why)
- Use `Test.startTest()` / `Test.stopTest()` to isolate governor limit counts and force async job completion
- Assert meaningful outcomes — not just that no exception was thrown
- Test bulk scenarios (200+ records) in addition to single-record cases
- Use `@TestSetup` to share setup data across test methods in the same class

```apex
@isTest
private class AccountServiceTest {
    @TestSetup
    static void setup() {
        insert new Account(Name = 'Test Account');
    }

    @isTest
    static void testBulkInsert() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) accounts.add(new Account(Name = 'Bulk ' + i));
        Test.startTest();
        insert accounts;
        Test.stopTest();
        System.assertEquals(200, [SELECT COUNT() FROM Account WHERE Name LIKE 'Bulk%']);
    }
}
```

## Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| Trigger | `<Object>Trigger` | `AccountTrigger` |
| Handler | `<Object>TriggerHandler` | `AccountTriggerHandler` |
| Service | `<Domain>Service` | `RFPService` |
| Selector/Query | `<Object>Selector` | `ContactSelector` |
| Batch | `<Task>Batch` | `SyncPropertyResponseBatch` |
| Scheduler | `<Task>Scheduler` | `SyncPropertyResponseScheduler` |
| Test | `<ClassName>Test` | `AccountTriggerHandlerTest` |
| Constants | `ALL_CAPS_SNAKE` | `MAX_RETRY_COUNT` |
| Variables | `camelCase` | `accountIdSet` |

## Async Patterns

- Use `@future(callout=true)` only for simple one-off callouts; prefer `Queueable` for chaining or passing state
- Use `Batchable` for processing large data volumes (> 10k records)
- `Schedulable` should delegate to `Batchable` or `Queueable`; keep scheduling classes thin

## Additional References

- For detailed governor limit reference, see [limits.md](limits.md)
- For project-specific file location conventions, see `.cursor/rules/salesforce-scripts.mdc`
