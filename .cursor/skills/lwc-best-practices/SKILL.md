---
name: lwc-best-practices
description: Enforce Salesforce Lightning Web Component (LWC) coding best practices including component structure, reactive properties, wire adapters, event patterns, performance, accessibility, and Jest testing. Use when writing, reviewing, or refactoring LWC HTML, JS, CSS, or test files.
---

# LWC Best Practices

## Component Structure

Every component lives in `force-app/main/default/lwc/<componentName>/` and follows this file layout:

```
myComponent/
├── myComponent.html          # Template
├── myComponent.js            # Controller
├── myComponent.css           # Scoped styles
├── myComponent.js-meta.xml   # Metadata / targets
└── __tests__/
    └── myComponent.test.js   # Jest tests
```

- Component folder and files must use **camelCase** matching the component name
- Use `kebab-case` when referencing a component in HTML: `<c-my-component>`

## Reactive Properties

| Decorator | Use for |
|-----------|---------|
| `@api` | Public properties exposed to parent components or App Builder |
| `@track` | Deep reactive tracking of objects/arrays (primitives are reactive by default) |
| `@wire` | Declarative data from wire adapters (Apex, UI API) |

```js
// ❌ Bad — mutating @api props directly
this.record.Name = 'New Name';

// ✅ Good — treat @api as read-only; clone before mutating
this.localRecord = { ...this.record, Name: 'New Name' };
```

- Never mutate `@api` properties directly; copy to a local property first
- Avoid `@track` on primitives; it is only needed for objects/arrays whose nested properties need to trigger re-render

## Wire Adapters & Imperative Apex

Prefer `@wire` for read operations; use imperative calls for mutations or when conditional fetching is needed.

```js
// ✅ Declarative wire
import getContacts from '@salesforce/apex/ContactController.getContacts';

@wire(getContacts, { accountId: '$recordId' })
wiredContacts({ error, data }) {
    if (data) {
        this.contacts = data;
        this.error = undefined;
    } else if (error) {
        this.error = error;
        this.contacts = undefined;
    }
}

// ✅ Imperative for mutation
async handleSave() {
    try {
        await saveContact({ contact: this.contact });
        this.dispatchEvent(new ShowToastEvent({ title: 'Saved', variant: 'success' }));
    } catch (error) {
        this.error = error;
    }
}
```

- Always handle both `data` and `error` branches for `@wire`
- Prefix wire properties with `wired` to distinguish from derived state
- Use `refreshApex(this.wiredResult)` to re-fetch after a mutation

## Event Patterns

**Child → Parent**: dispatch a `CustomEvent` and handle in parent template.

```js
// child.js
this.dispatchEvent(new CustomEvent('recordselect', { detail: { id: this.recordId } }));
```

```html
<!-- parent.html -->
<c-child onrecordselect={handleRecordSelect}></c-child>
```

**Cross-component (siblings / distant)**: use a Lightning Message Channel (LMC) rather than reaching into the DOM.

```js
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import MY_CHANNEL from '@salesforce/messageChannel/MyChannel__c';
```

- Event names must be **all lowercase** (no camelCase, no hyphens): `recordselect`, not `recordSelect`
- Use `bubbles: true, composed: true` only when the event genuinely needs to cross shadow DOM boundaries

## Template Best Practices

- Use `if:true` / `if:false` (or `lwc:if` in API v59+) for conditional rendering; prefer CSS `display:none` only for elements that are expensive to re-mount
- Use `iterator:it={list}` when you need `first`/`last` metadata; otherwise use `for:each`
- Keep templates thin — complex logic belongs in JS getters

```html
<!-- ✅ Derived state via getter, not inline expressions -->
<template if:true={hasContacts}>
    <template for:each={contacts} for:item="contact">
        <c-contact-row key={contact.Id} record={contact}></c-contact-row>
    </template>
</template>
```

```js
// ✅ Getter for derived state
get hasContacts() {
    return this.contacts && this.contacts.length > 0;
}
```

## Error Handling & User Feedback

- Always display errors to the user; never silently swallow them
- Use `lightning/platformShowToastEvent` for operation feedback
- Render inline error messages for field-level validation

```js
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

showError(error) {
    const message = Array.isArray(error?.body)
        ? error.body.map(e => e.message).join(', ')
        : error?.body?.message ?? error?.message ?? 'Unknown error';
    this.dispatchEvent(new ShowToastEvent({ title: 'Error', message, variant: 'error' }));
}
```

## Performance

- Lazy-load child components with `lwc:if` instead of always rendering them hidden
- Debounce user-input handlers (search, filter) to avoid rapid Apex calls
- Avoid calling Apex imperatively in `connectedCallback` for data that can use `@wire`
- Limit `@wire` reactive parameters — each change triggers a new server call

## Accessibility

- Every interactive element must be keyboard-reachable (`tabindex`, `keydown` handlers for custom elements)
- Use semantic HTML (`<button>`, `<a>`) over `<div onclick>`
- Provide `aria-label` or `aria-labelledby` on icon-only buttons
- Use `lightning-*` base components where possible — they handle ARIA automatically

## Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| Component folder/files | `camelCase` | `hotelRfpPortal` |
| HTML reference | `kebab-case` with `c-` namespace | `<c-hotel-rfp-portal>` |
| `@api` properties | `camelCase` | `recordId`, `isReadOnly` |
| Custom events | all lowercase, no separator | `recordselect`, `statuschange` |
| Private properties | `camelCase`, prefix `_` if backing `@api` | `_internalValue` |
| Message channels | `PascalCase__c` | `RFPChannel__c` |

## Meta Configuration (`js-meta.xml`)

- Set `<apiVersion>` to the current org API version
- List only the `<targets>` the component actually supports
- Expose `@api` properties via `<targetConfigs>` so admins can configure them in App Builder

```xml
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>61.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__RecordPage</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordPage">
            <property name="recordId" type="String" />
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

## Jest Testing

- Co-locate tests in `__tests__/` inside the component folder
- Mock Apex imports and wire adapters using `@salesforce/sfdx-lwc-jest` utilities
- Test user interactions via `element.shadowRoot.querySelector` + dispatching events
- Assert DOM state after `Promise.resolve()` to allow the microtask queue to flush

```js
import { createElement } from 'lwc';
import MyComponent from 'c/myComponent';
import getContacts from '@salesforce/apex/ContactController.getContacts';

jest.mock('@salesforce/apex/ContactController.getContacts', () => ({ default: jest.fn() }), { virtual: true });

describe('c-my-component', () => {
    afterEach(() => { while (document.body.firstChild) document.body.removeChild(document.body.firstChild); });

    it('renders contacts', async () => {
        getContacts.mockResolvedValue([{ Id: '001', Name: 'Alice' }]);
        const el = createElement('c-my-component', { is: MyComponent });
        document.body.appendChild(el);
        await Promise.resolve();
        expect(el.shadowRoot.querySelectorAll('c-contact-row').length).toBe(1);
    });
});
```

## Additional References

- For component file location conventions, see `.cursor/rules/salesforce-scripts.mdc`
- For Apex called by wire/imperative, see `.cursor/skills/apex-best-practices/SKILL.md`
