---
title: The Approvals blueprint
description: Requests and approvals - an approver's inbox, my requests, a new-request wizard, request pages with their approval chain and the request types an organisation offers - with navigation and sample data.
---

`@cratis/scene.blueprint.approvals` is the third **domain blueprint**: a ready-to-use requests-and-approvals application built on the
[foundation set](foundation-templates.md), shaped like the [CRM](crm-blueprint.md) and [Ticketing](ticketing-blueprint.md) blueprints. It brings no shell,
component or theme of its own and adds seven screen templates, two dialog templates, a screen set wired into navigation and two sample-data packs. It
follows Part B 3.3 of the screen blueprints specification and is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done).

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `approvals.inbox` | `ApprovalInbox` | ListScreen, **Cards** variant | The requests waiting for me as cards - type, who asked, amount, how long they have waited - with **Approve, Reject and Request changes as buttons on the card**; a card's tone says how overdue it is and the words say the same |
| `approvals.requests` | `MyRequests` | ListScreen | The requests I made, with **draft, submitted, approved, rejected** (and changes requested) as chips; a **New request** button; choosing a request opens it |
| `approvals.requests.new` | `NewRequestWizard` | WizardScreen | **Request type**, **details**, **attachments**, then **review and submit**; a step survives a refresh and a refresh never lands past a step that was not done; attachments are a file uploader |
| `approvals.requests.page` | `RequestPage` | RecordPage | Summary (status, amount, who), the **approval chain** (steps with state), the request's fields, **attachments**, and the **comments** as the page's activity; the decision buttons |
| `approvals.all` | `AllRequests` | ListScreen | Every request of the organisation with its current approver |
| `approvals.templates` | `RequestTypes` | ListScreen | The request types an organisation offers, for administrators; choosing one edits it |
| `approvals.templates.edit` | `RequestTypeEditForm` | FormScreen | A request type's name, what it asks for and its approval steps |
| (dialogs) | `DecisionDialog`, `RequestTypeQuickCreate` | QuickCreateDialog frame | **The decision dialog**: a confirmation with the decision and a comment for the requester; a short form that adds a request type |

All templates are in the category `Business / Approvals` and carry their `scopes`: the lists apply at module and feature level, the wizard, the request page
and the editor at feature and sub-feature level, and the dialogs at slice level.

## Request types as presets

Five request types ship as sample data (and so as the starting rows of the Templates screen): **Leave, Expense, Purchase, Travel and Invoice approval**, each
with the approval steps that decide it (Leave: Manager, HR; Purchase: Manager, Finance, Director; ...) and a line about what it asks for. They are rows of the
`RequestTypes` shape, not code: an organisation's own types come from its own query, and the same templates draw them.

## The approval chain

The request page draws the foundation `approvalChainStepper`, which applies the chain's own rules so the page needs none: a rejection stops the chain and the
steps after it read "Not reached"; with no step marked current the first undecided step is the current one; only one step is ever current; the overall outcome
(waiting, approved, rejected, not started) is stated in words above the steps, and the current step carries `aria-current="step"`.

## Deciding in one press

The inbox uses a small addition to the foundation list - `rowActionStyle: 'buttons'` (see [Deciding from a list](foundation-components.md#deciding-from-a-list)) -
so an approver's three decisions are buttons on the card rather than a menu, each named for its request ("Approve: Expense: Priya Nair"). Pressing one opens
`DecisionDialog` over the inbox, so a decision always carries a comment the requester will see.

## Navigation

The topbar names the module, `Approvals`; the module's sidebar overrides the application's and lists **Inbox, My requests, All requests** and **Templates**.
A screen is a feature of the `approvals` module: `approvals.requests.new` is the `new` feature of `requests`. `approvalsScreenDefinitions` is the one list the
manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are derived from.

## Behaviors

- A decision on an inbox card opens `DecisionDialog`; **Cancel** closes it.
- **New request** on My requests goes to the wizard; **Next** and **Back** move between its steps.
- Choosing a request in My requests or All requests opens the request page; choosing a request type edits it; **New request type** opens `RequestTypeQuickCreate`.
- **Export** notifies that the export has started.

## Sample data

| Pack | Locale | Currency | Content |
| --- | --- | --- | --- |
| `approvals-general` (default) | `en-GB` | GBP | Ten requests across five request types, an inbox of five, a chain of three steps, attachments and comments |
| `approvals-nordic` | `nb-NO` | NOK | The same shape in Norwegian: types, statuses, columns, filter labels and the conversation |

Both packs answer exactly the same shapes, so swapping the active pack never leaves a region empty; the one-row `ApprovalsSettings` shape carries the
`locale` and the `currency`, so the same inbox reads `£1,860` with the English pack and `1 860 kr` with the Norwegian one.

## Using it

```ts
import { approvalsApplication, approvalsComposition, approvalsNavigation, approvalsStructure } from '@cratis/scene.blueprint.approvals';

const application = approvalsApplication('approvals-nordic');
```

In a Screenplay model a screen names `template blueprint Cratis.Blueprint.Approvals ApprovalInbox version "^1.0"` and the `ui profile` activates a pack with
`active blueprint approvals-general`; the conformance fixture of the example application (`Samples/Approvals/approvals.play` in the Screenplay repository) is
declared that way.
