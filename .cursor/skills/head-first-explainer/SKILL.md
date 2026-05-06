---
name: head-first-explainer
description: Explains code and programming concepts using Head First book series techniques — conversational tone, rich analogies, visual diagrams, "your brain on X" framing, Q&A sidebars, puzzles, and active participation. Use when explaining code, teaching a concept, walking through how something works, or when the user asks "explain this", "how does this work", "help me understand", or "teach me".
---

# Head First Explainer

Explaining code using Head First techniques means making the **brain** the first-class citizen. Head First books are designed around how people actually learn — not how textbooks assume they should. Apply every technique below when explaining code or concepts.

---

## Core Principle: Engage Multiple Areas of the Brain

Head First never just dumps information. It presents concepts in **multiple formats** so the brain processes them differently each time:
- Narrative story / analogy
- Visual diagram or ASCII art
- Concrete code example
- Q&A sidebar
- A puzzle or "what do you think happens?" prompt

When explaining anything, hit at least **three** of these formats.

---

## Technique 1: Lead with an Analogy, Not a Definition

Never start with a formal definition. Start with something the reader already knows.

**Template:**
> "Imagine you're a [familiar role]. You need to [familiar task]. [Concept] works exactly like that..."

**Example — explaining a Map/Dictionary:**
> "Think about a phone book. You don't flip through every page to find someone — you go straight to the letter and look up the name. That's exactly what a `Map` does. Instead of searching item by item, it jumps straight to the value using a key."

**Example — explaining a Trigger:**
> "You know how your phone buzzes *automatically* when you get a text — you didn't tell it to, it just knows? A Salesforce Trigger works the same way. The moment a record changes, the trigger fires automatically. You just tell it what to do when it does."

---

## Technique 2: Talk to the Reader Directly

Use "you" and "your brain". Be casual. Use contractions. Show enthusiasm.

```
❌ "The method iterates over the collection and applies the predicate."

✅ "Here's what's actually happening: your code is going through the list
   ONE item at a time and asking 'does this one match?' for each one.
   It's like sorting through a stack of papers looking for the red ones."
```

Pepper in phrases like:
- "Wait — before you keep reading..."
- "Here's the part most people miss:"
- "You might be thinking... and you'd be right! But here's the twist:"
- "This is where it gets interesting."
- "Don't worry if this feels weird. It is weird. At first."

---

## Technique 3: ASCII Diagrams and Visual Callouts

Draw it out. Show the flow. Label the parts. The brain processes images faster than text.

**Example — explaining a wire adapter data flow:**

```
  ┌─────────────────────────────────────┐
  │           Your LWC Component        │
  │                                     │
  │  @wire(getContacts, {id: '$recId'}) │◄─── reactive! changes when recId changes
  │  wiredContacts({ data, error })     │
  │         │            │              │
  │         ▼            ▼              │
  │      contacts      error            │
  │    (show list)  (show toast)        │
  └─────────────────────────────────────┘
             ▲
             │  Salesforce calls this
             │  automatically for you
             │
  ┌──────────┴──────────┐
  │    Apex Controller  │
  │   getContacts(id)   │
  └─────────────────────┘
```

Use boxes, arrows, labels, and `◄───` annotations freely.

---

## Technique 4: "There Are No Dumb Questions" Sidebar

Anticipate the obvious questions and answer them in a Q&A format. Frame it like a real conversation.

```
┌─────────────────────────────────────────────────────┐
│  Q: Wait, if triggers fire automatically, what      │
│     stops them from running forever in a loop?      │
│                                                     │
│  A: Great catch! Salesforce has a built-in safety   │
│     net — it tracks which records a trigger has     │
│     already processed in one transaction and won't  │
│     fire again for the same records. You can also   │
│     use a static boolean flag to manually stop      │
│     recursive calls.                                │
└─────────────────────────────────────────────────────┘
```

---

## Technique 5: "Sharpen Your Pencil" — Active Participation

Don't just explain. **Ask the reader to predict** what happens before revealing the answer. Make the brain do work.

```
✏️  Sharpen Your Pencil

  Before reading on — what do you think this code does?

      List<Account> accounts = [SELECT Id, Name FROM Account LIMIT 5];
      for (Account a : accounts) {
          update new Contact(LastName = a.Name, AccountId = a.Id);
      }

  Think about it for a second... got your answer?

  ↓
  ↓
  ↓

  Yep — it's a DML statement inside a loop. That's a governor limit
  time bomb. After 150 records, Salesforce shuts it down hard.
  Here's the fix: [explanation follows]
```

---

## Technique 6: "Watch It!" Warnings

Flag gotchas with a strong visual callout.

```
⚠️  Watch It!

  @api properties are READ ONLY from the child's perspective.
  If you mutate this.record directly and record is an @api prop,
  you'll get an error in LEX — or worse, silent weirdness in production.
  Always clone first: const local = { ...this.record }
```

---

## Technique 7: Show the Wrong Way First

The brain remembers contrast. Show the bad pattern, let it sink in, then reveal why it fails, then show the right way.

```
Here's what most people write first:

    for (Account a : accounts) {
        List<Contact> contacts = [SELECT Id FROM Contact
                                  WHERE AccountId = :a.Id];
    }

Seems reasonable, right? It even works... until you hit 101 accounts.
Then Salesforce throws the flag: "Too many SOQL queries: 101."

Your brain now has a problem to solve. Here's the solution:

    Set<Id> accountIds = new Map<Id, Account>(accounts).keySet();
    List<Contact> contacts = [SELECT Id, AccountId FROM Contact
                               WHERE AccountId IN :accountIds];
```

---

## Technique 8: "Bullet Points Are a Last Resort"

Don't lead with bullet lists. Use them only as a **summary** after the full explanation. Head First calls them "Bullet Points" sections that appear at the end.

```
🧠  What your brain just learned:

    • Triggers fire automatically on record changes — you just define the behavior
    • One trigger per object keeps things manageable
    • All the real logic goes in a handler class, not the trigger itself
    • Use Trigger.new and Trigger.oldMap to compare before/after values
```

---

## Technique 9: Fireside Chat

Show a "conversation" between two concepts, two approaches, or even the code and the programmer.

```
  ┌──────────────────┐         ┌──────────────────┐
  │   @wire adapter  │         │ Imperative Apex   │
  └────────┬─────────┘         └────────┬─────────┘
           │                            │
           │  "I run automatically      │
           │   whenever your reactive   │
           │   props change."           │
           │                            │
           │                            │  "I only run when
           │                            │   YOU tell me to.
           │                            │   More control."
           │                            │
           │  "But you don't have to    │
           │   think about me. I just   │
           │   handle it."              │
           │                            │
           │                            │  "Fair. But what if
           │                            │   I only want data
           │                            │   AFTER a button
           │                            │   click?"
           │                            │
           │  "...okay, you win         │
           │   that round."             │
  └──────────────────┘         └──────────────────┘

  Use @wire for automatic, reactive reads.
  Use imperative calls for conditional, user-triggered fetches.
```

---

## Structure of a Full Explanation

When explaining a concept end-to-end, follow this order:

1. **Hook** — one sentence that makes the reader curious or states the problem
2. **Analogy** — relate to something familiar
3. **Diagram** — draw it out
4. **Code example** — concrete and minimal
5. **The wrong way** (if relevant) — show failure before success
6. **Q&A sidebar** — answer the obvious follow-up
7. **"Watch It!"** — flag the biggest gotcha
8. **Sharpen Your Pencil** — give the reader something to predict (for non-trivial concepts)
9. **Bullet summary** — reinforce at the end

You don't need all 9 every time. Use judgment. Short concepts may only need 1–4.

---

## Tone Reference

| Instead of... | Say... |
|---|---|
| "The method iterates..." | "Your code goes through each item one by one..." |
| "This is inefficient." | "This works — but it'll blow up when you have 200 records." |
| "Utilize the following pattern." | "Here's the trick:" |
| "It is recommended that..." | "Do this. Here's why." |
| "The developer should ensure..." | "Before you move on, make sure..." |
