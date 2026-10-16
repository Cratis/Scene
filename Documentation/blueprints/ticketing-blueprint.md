---
title: The Ticketing blueprint
description: A support desk - dashboard, ticket queue and board, ticket pages with quick actions, a public portal form and a knowledge base - with navigation and sample data.
---

`@cratis/scene.blueprint.ticketing` is the second **domain blueprint**: a ready-to-use help desk built on the
[foundation set](foundation-templates.md), shaped like the [CRM blueprint](crm-blueprint.md). It brings no shell, component or theme of its own
and adds nine screen templates, six dialog templates, a screen set wired into navigation and two sample-data packs. It follows Part B 3.2 of the
screen blueprints specification and is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done).

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `support.dashboard` | `SupportDashboard` | Dashboard | Open tickets, overdue, average first response; open tickets by priority (donut) and by assignee (bars); the overdue tickets; my next steps |
| `support.queue` | `TicketQueue` | ListScreen | ID, subject, requester, **priority and status as chips**, assignee, age; filters by status, priority, assignee and created; saved views **Unassigned, Mine, Overdue**; choosing a ticket opens it |
| `support.queue.board` | `TicketBoard` | BoardScreen | A column for each status (New, Open, Pending, Resolved) with a card for each ticket; a ticket moves by dragging or by its Move-to menu |
| `support.queue.ticket` | `TicketPage` | RecordPage | The **conversation** as the page's activity, the ticket's **properties in the aside**, and the quick actions **Assign, Change status, Escalate and Merge**, each opening its dialog |
| `support.queue.new` | `TicketCreateForm` | FormScreen | An agent opens a ticket for a customer: subject, requester, priority, channel, assignee, team, description |
| `support.queue.portal` | `TicketPortalForm` | FormScreen (full-page layout) | The **public-facing** form of a portal: no application chrome, a notice that says what happens next, and only what a customer can say |
| `support.mine` | `MyTickets` | ListScreen | The signed-in agent's tickets |
| `support.customers` | `CustomerList` | ListScreen | Name, organisation, plan, open tickets and last contact |
| `support.knowledge` | `KnowledgeBase` | MasterDetail | A search box and the tree of categories and articles on the left, the chosen article on the right; a navigation stack on a phone |
| (dialogs) | `TicketQuickCreate`, `CustomerQuickCreate`, `AssignTicket`, `ChangeTicketStatus`, `EscalateTicket`, `MergeTickets` | QuickCreateDialog frame | A short form with its own commit verb (Create, Assign, Change status, Escalate, Merge) |

All templates are in the category `Business / Ticketing` and carry their `scopes`: the dashboard, queue, board, lists and knowledge base apply at module
and feature level, the ticket page and forms at feature and sub-feature level (the portal form at every level, since it is also a whole application's front
door), and the dialogs at slice level.

## Navigation

The topbar names the module, `Support`; the module's sidebar overrides the application's and lists **Dashboard, Queue** (with **List** and **Board** beneath it),
**My tickets, Customers** and **Knowledge base**. A screen is a feature of the `support` module: `support.queue.board` is the `board` feature of `queue`. As in
the CRM blueprint, `ticketingScreenDefinitions` is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the
navigation are derived from.

## Behaviors

- **New ticket** on a list or the board opens `TicketQuickCreate`; **Cancel** closes it.
- Choosing a row of the queue or of My tickets opens the ticket page.
- The four quick actions of a ticket page open `AssignTicket`, `ChangeTicketStatus`, `EscalateTicket` and `MergeTickets` over the page.
- **Still need help?** in the knowledge base goes to the public form.
- **Export** notifies that the export has started.

## Knowledge base and the tree

The tree is the foundation `orgTree`, which builds a tree from flat rows of `id`, `label`, `title` and `parentId` and follows the ARIA tree pattern (one tab
stop; arrows move, expand and collapse; Home and End jump; Enter selects). A category is a row with no parent; an article is a row whose parent is its
category. The chosen id is kept in the address under `article`, so a refresh or a shared link opens the same article.

## Sample data

| Pack | Locale | Content |
| --- | --- | --- |
| `ticketing-helpdesk` (default) | `en-GB` | Twelve tickets, eight customers, a conversation, five knowledge-base articles in three categories |
| `ticketing-service-desk-de` | `de-DE` | The same shape in German: statuses, priorities, columns, filter labels, conversation and articles |

Both packs answer exactly the same shapes, so swapping the active pack never leaves a region empty. The one-row `SupportSettings` shape carries the `locale`
the figures and dates are formatted in, so the average first response reads `2.4` with the English pack and `2,4` with the German one.

## Using it

```ts
import { ticketingApplication, ticketingComposition, ticketingNavigation, ticketingStructure } from '@cratis/scene.blueprint.ticketing';

const application = ticketingApplication('ticketing-service-desk-de');
```

In a Screenplay model a screen names `template blueprint Cratis.Blueprint.Ticketing TicketQueue version "^1.0"` and the `ui profile` activates a pack with
`active blueprint ticketing-helpdesk`; the conformance fixture of the help-desk example application (`Samples/Ticketing/ticketing.play` in the Screenplay
repository) is declared that way.
