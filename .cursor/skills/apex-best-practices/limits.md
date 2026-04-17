# Apex Governor Limits Reference

Key per-transaction limits to keep in mind when writing Apex:

| Limit | Value |
|-------|-------|
| SOQL queries | 100 |
| SOQL query rows returned | 50,000 |
| DML statements | 150 |
| DML rows | 10,000 |
| Heap size | 6 MB (sync) / 12 MB (async) |
| CPU time | 10,000 ms (sync) / 60,000 ms (async) |
| Callouts per transaction | 100 |
| Future method calls | 50 |
| Queueable jobs enqueued | 50 |
| Batch Apex records per execute | up to 2,000 (default 200) |
| Email invocations | 10 |

## Common Patterns to Stay Within Limits

- **SOQL**: Collect Ids into a `Set<Id>`, query once with `WHERE Id IN :idSet`
- **DML**: Accumulate records into a `List<SObject>`, perform one DML at the end
- **Heap**: Nullify large collections after use; avoid storing full `SELECT *` result sets
- **CPU**: Move computation-heavy logic to async (Queueable/Batch); avoid nested loops over large collections
- **Callouts**: Batch callout targets; use Platform Events or CDC to push data instead of polling
