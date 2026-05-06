# What does this project do?

**Hook:** You're looking at a project with *two completely different superpowers* living side by side — one built, one blueprinted.

---

## The 30,000-foot analogy

Imagine a hotel chain — say, Marriott — that gets thousands of businesses every year saying *"Hey, we have 5,000 employees who travel constantly. Give us a deal on room rates."* That's called an **RFP** (Request for Proposal). Someone has to collect those requests, route them to the right hotels, let each hotel bid on rates, get a manager to approve the bids, and close the deal.

Right now, that whole process is done in a creaky 20-year-old system.

**This project is the replacement.** Built on Salesforce.

But — and here's the fun part — the project also contains a completely *separate* thing: a visual org-chart tool for a Salesforce Solutions Engineering team's internal pod structure.

Two things. One repo. Let's dig in.

---

## The Two Features at a Glance

```
  ┌────────────────────────────────────────────────────────────────┐
  │                        nca project                            │
  │                                                               │
  │   ┌─────────────────────────┐   ┌───────────────────────────┐ │
  │   │     Pod Structure        │   │     Hotel RFP Engine      │ │
  │   │  (Internal Team Tool)    │   │  (Big Enterprise Feature) │ │
  │   │                         │   │                           │ │
  │   │  ✅ Fully Built          │   │  🏗️  Data model built     │ │
  │   │                         │   │  🏗️  Flows + approvals    │ │
  │   │                         │   │  🏗️  AI strategy stubbed  │ │
  │   │                         │   │  🚧  Portal UI is a stub  │ │
  │   └─────────────────────────┘   └───────────────────────────┘ │
  └────────────────────────────────────────────────────────────────┘
```

---

## Feature 1: The Pod Structure Tool

### The Analogy

Think about a whiteboard with sticky notes arranged in two rows — blue on top (the core team), orange on bottom (the support team). You can see everyone's headshot or a silhouette if there's no photo. There's a Refresh button. That's exactly what this LWC renders — **a live, data-driven org chart**.

### How the data flows

```
  ┌──────────────────────────────────────────────────────┐
  │             podStructure (LWC)                       │
  │                                                      │
  │  @wire(getPodMembers)   ◄──── fires automatically    │
  │         │                    whenever component loads│
  │         ▼                                            │
  │   splits into two groups:                            │
  │                                                      │
  │   ┌─── "Primary" ────┐   ┌─── "Secondary" ──────┐   │
  │   │  Blue cards      │   │  Orange cards         │   │
  │   │  (Core SE,       │   │  (Data/AI Arch,       │   │
  │   │   AF SE, etc.)   │   │   CSM/CSAL)           │   │
  │   └──────────────────┘   └──────────────────────-┘   │
  │                                                      │
  │   Each card: photo or SVG silhouette icon            │
  └──────────────────────────────────────────────────────┘
           ▲
           │  Apex query (ordered by Row_Type, then Sort_Order)
           │
  ┌────────┴──────────────┐
  │  PodMemberController  │
  │   getPodMembers()     │
  └───────────────────────┘
           ▲
           │
  ┌────────┴──────────────┐
  │    Pod_Member__c       │
  │  7 seed records        │
  │  (loaded by script)    │
  └───────────────────────┘
```

### The admin side

There's also a `podMemberListEditor` component — an editable data table where admins can add, edit, and delete pod members right in the UI, with inline editing, confirmation dialogs, and toast notifications.

```
┌─────────────────────────────────────────────────────────────┐
│  Q: Why two components for the same data?                   │
│                                                             │
│  A: Classic separation of concerns. `podStructure` is the  │
│     beautiful, read-only display any user sees. The         │
│     `podMemberListEditor` is the admin backstage — same     │
│     data, different audience, different purpose.            │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 2: The Hotel RFP Engine

This is the big one. Here's the full lifecycle:

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                      The RFP Lifecycle                          │
  │                                                                  │
  │  Corporate Client                                               │
  │  (e.g., Accenture)                                              │
  │       │                                                          │
  │       │  "We need hotel rates for our travelers"                 │
  │       │                                                          │
  │       ▼   (via Cvent / Lanyon / email — future MuleSoft API)    │
  │   ┌──────────┐                                                   │
  │   │  RFP__c  │  ◄──── status: Draft → In Progress → Closed      │
  │   │          │         Validation: must have Account to move     │
  │   └────┬─────┘                                                   │
  │        │                                                          │
  │        │  Record-Triggered Flow fires on creation                │
  │        │                                                          │
  │        ▼                                                          │
  │  ┌──────────────────────┐                                         │
  │  │ Property_Response__c │  ← one per hotel being considered       │
  │  │    (auto-created)    │                                         │
  │  └──────────┬───────────┘                                         │
  │             │                                                      │
  │             ▼                                                      │
  │       ┌───────────────┐                                            │
  │       │  Rate_Offer__c │  ← the hotel's actual bid                │
  │       │                │                                          │
  │       │   ▼ Approval   │  ← manager must sign off                │
  │       │   Process      │                                          │
  │       │   (locked on   │                                          │
  │       │    approval)   │                                          │
  │       └───────────────┘                                            │
  │             │                                                      │
  │             │  On "Closed Won" — future MuleSoft API              │
  │             ▼                                                      │
  │     Hilton GDS / RMS systems get the contracted rates             │
  └──────────────────────────────────────────────────────────────────┘
```

### The AI layer

There's a **Next Best Action / Agentforce** recommendation strategy called `Rate_Guidance_Strategy`. Here's the idea:

```
  ┌─────────────────────────────────────────────────────────┐
  │  Property_Response__c record (a hotel's response)       │
  │                                                         │
  │  Agentforce strategy runs:                              │
  │    1. Calls RateGuidanceAction (Apex — not built yet)   │
  │    2. Gets back a Rate_Guidance_Score                   │
  │    3. Filters: only show if score > 80                  │
  │    4. Surfaces a "Next Best Action" recommendation      │
  │       to the sales rep: "This rate offer is strong."   │
  └─────────────────────────────────────────────────────────┘
```

Think of it as a hotel pricing advisor whispering in the sales rep's ear.

---

## The Countdown Timer — the fun one

This is a standalone LWC used as a **waiting-room display** for Marriott. Imagine a big screen in a meeting room while Salesforce is loading.

```
  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │     MARRIOTT                                     │
  │                                                  │
  │         ⏱  05:43                                │
  │         [████████████░░░░] ◄── gold fading to   │
  │                               burgundy as time   │
  │                               runs out           │
  │                                                  │
  │  "The Ritz-Carlton offers personalized service   │
  │   at over 100 locations worldwide."              │
  │   (rotates every 15 seconds)                    │
  │                                                  │
  │         Powered by Agentforce 🤖                 │
  │                                                  │
  └──────────────────────────────────────────────────┘
```

The messages come from `FAQ_Countdown_Message__c` records — one per Marriott brand (Ritz-Carlton, W Hotels, Sheraton, Westin...) loaded by a seed script.

---

## Sharpen Your Pencil

Before reading on — the RFP engine has a validation rule. What do you think it blocks?

```
Rule name: Require_Account_for_SUBMISSION
Trigger: RFP__c status changes to "In Progress"
```

Think about it...

↓  
↓  
↓  

It blocks you from moving an RFP forward if there's no Account (corporate client) linked to it. No client, no deal. Makes sense — you can't negotiate hotel rates for nobody.

---

## Watch It!

The `hotelRfpPortal` LWC (the Experience Cloud portal that hotel operators would use to view and respond to RFPs) is **just a stub right now**. It renders a welcome message and logs to the console. The requirements doc describes a massive feature for 35,000+ hotel operators — that UI is future work.

---

## What's built vs. what's blueprinted

```
  ✅ Fully working:
     • Pod Structure org chart + admin editor
     • Countdown timer with Marriott branding
     • RFP data model (5 custom objects)
     • Auto-routing flow (creates Property_Response on new RFP)
     • Rate Offer approval process
     • Agentforce recommendation strategy (filter logic done)
     • Validation rule on RFP

  🏗️  Stubbed / documented but not coded yet:
     • RateGuidanceAction Apex (the AI scoring logic)
     • Hotel RFP portal UI (Experience Cloud)
     • MuleSoft inbound API (ingest from Cvent/Lanyon)
     • MuleSoft outbound API (push rates to GDS/RMS)
     • RFP Question answers (GBTA questions data entry)
```

---

## What your brain just learned

- This is a **Salesforce DX project** with two business domains in one repo
- The **Pod Structure** feature is a fully built internal org-chart tool with display + admin components wired to Apex
- The **Hotel RFP Engine** models a real hospitality negotiation lifecycle from RFP intake → hotel response → rate bidding → manager approval → rate publishing
- **Agentforce** is the AI layer, scoring rate offers and surfacing Next Best Action recommendations
- **MuleSoft** is planned as the integration layer connecting Cvent/Lanyon on one end and Hilton's GDS/RMS systems on the other — but it's documented, not coded yet
- The **countdown timer** is a standalone Marriott-branded waiting room display, powered by rotating brand messages stored as custom records
