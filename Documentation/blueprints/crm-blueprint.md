---
title: The CRM blueprint
description: Leads, contacts, companies and deals for a sales team - the screens, the navigation, the sample data and how an application adopts them.
---

`@cratis/scene.blueprint.crm` is the first **domain blueprint**: a ready-to-use sales application built on the
[foundation set](foundation-templates.md). It brings no shell, component or theme of its own - every component is the
foundation's - and adds what is particular to selling: twenty screen templates, five quick-create dialogs, a screen
set wired into navigation, and two sample-data packs.

It follows Part B 3.1 of the screen blueprints specification, and it is held to the same
[definition of done](ship-your-own-blueprint.md#the-definition-of-done) as every blueprint: `verifyBlueprintPackage` is
green, every template passes the per-template check, and every screen is audited in Chromium at desktop, tablet and phone
widths in the light and dark themes, with colour contrast.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `crm.dashboard` | `CrmDashboard` | Dashboard (Executive) | Open pipeline value, won this month, conversion rate; leads by source (donut) and deals by stage (funnel); deals closing soon; my tasks |
| `crm.leads` | `CrmLeadList` | ListScreen | Name, company, owner, status, last contact; filters owner, status, source and created; row actions edit, assign, convert, delete; bulk assign and delete |
| `crm.contacts` | `CrmContactList` | ListScreen | The same columns and filters; choosing a row opens the contact |
| `crm.companies` | `CrmCompanyList` | ListScreen | The same, with the industry in place of the company; choosing a row opens the company |
| `crm.deals` | `CrmDealPipeline` | BoardScreen | A column for each stage with the value of the stage in its header; a card for each deal with name, company, value, close date and owner |
| `crm.deals.list` | `CrmDealList` | ListScreen (grouped) | The same deals as a table grouped by stage, with the value of each stage as its subtotal |
| `crm.contacts.record`, `crm.companies.record`, `crm.deals.record` | `CrmContactPage`, `CrmCompanyPage`, `CrmDealPage` | RecordPage | Key facts, tabs, the record's fields, related lists (the deals of a contact, the contacts and deals of a company), activity and next steps |
| `crm.leads.new`, `crm.contacts.new`, `crm.companies.new`, `crm.deals.new`, `crm.activities.new` and the five `.edit` screens | `Crm<Entity>CreateForm`, `Crm<Entity>EditForm` | FormScreen | Sections of validated fields; create has Save and new, edit shows the record |
| `crm.activities` | `CrmActivityList` | ListScreen | Calls, meetings, emails and tasks |
| (dialogs) | `CrmQuickCreateLead`, `…Contact`, `…Company`, `…Deal`, `…Activity` | QuickCreateDialog | The few fields needed to make one record without leaving the page; opened by the list's primary button |

The categories are all `Business / CRM`. Templates carry their `scopes` (Part A 4.2): the lists, the board and the dashboard
apply at module and feature level, the record pages and forms at feature and sub-feature level, and the dialogs at slice level,
so `applicableTemplates` offers each only where it fits and hides the blueprint where nothing of it applies.

## Navigation

The topbar names the module, `CRM`; the module's sidebar overrides the application's and lists **Dashboard, Leads, Contacts,
Companies, Deals** (with the **Pipeline** and the **List** beneath it) and **Activities**. A screen is a feature of the `crm`
module: `crm.leads.new` is the `new` feature of `leads`. The screen set (`crmScreenDefinitions`) is the one list the manifest's
`blueprint.screenSet`, the `Screen` instances (`crmScreens`), the application structure (`crmStructure`) and the navigation
(`crmNavigation`) are all derived from, and a specification holds them to it.

## Behaviors

The templates declare what pressing things does, so an application that runs them - Stage, or a host that supplies a dispatcher - gets
a working application with no code:

- the primary button of a list (**New lead**) opens the entity's quick-create dialog, whose **Cancel** closes it;
- choosing a contact, company or deal opens its record page, handing it the chosen row's id; **Edit** goes to the edit form;
- **Export** notifies that the export has started;
- a card moves between pipeline stages by dragging or by its own **Move to** menu, and the stage totals follow it.

## Data, not values

No template carries a row. Every property that shows data is a binding to a query (`Leads`, `LeadColumns`, `LeadFilterFields`,
`DealRecord`, `PipelineDeals` ...) and the sample-data pack answers it. Two packs ship, each owned by `blueprint:crm`:

| Pack | Locale | Currency | Content |
| --- | --- | --- | --- |
| `crm-enterprise-en` (default) | `en-GB` | GBP | Twelve leads, twelve contacts, eight companies, twelve deals, ten activities |
| `crm-nordic-smb` | `nb-NO` | NOK | The same shape in Norwegian: names, statuses, stages, column headers, filter labels |

Both packs answer exactly the same shapes, so swapping the active pack never leaves a region empty. The pack also carries a
one-row `CrmSettings` shape - `locale` and `currency` - that the templates bind onto every component that formats a figure or a
date, so the same dashboard reads `£1,245,000` and `24.5%` with the English pack and `1 245 000 kr` and `24,5 %` with the
Norwegian one. The pack, not the template, decides the formatting; the template's own labels (titles, button text) are English
and are overridden through each component's `strings`, as for every foundation component.

## Using it

```ts
import { crmApplication, crmComposition, crmNavigation, crmStructure } from '@cratis/scene.blueprint.crm';

const application = crmApplication('crm-nordic-smb');   // layouts, templates, dialogs, screens and a profile with the pack active
// <ScenePreviewHost document={application} structure={crmStructure} navigation={crmNavigation} target={{ module: 'crm' }} ... />
```

In a Screenplay model a `ui profile` lists the blueprint in `packages`, a screen names `template blueprint Crm CrmLeadList`, and the
profile's `sample data` section activates a pack the blueprint ships. The conformance fixture of the CRM example application is
declared that way and rendered through the CLI.
