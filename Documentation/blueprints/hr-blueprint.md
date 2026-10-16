---
title: The HR People and Time Off blueprint
description: A directory, employee pages, an org chart, time off and onboarding for an HR team - the screens, the navigation, the sample data and how an application adopts them.
---

`@cratis/scene.blueprint.hr` is a **domain blueprint** for the people side of a company, built on the [foundation set](foundation-templates.md) the way
[the CRM blueprint](crm-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to people - seven screen templates,
two quick-create dialogs, a screen set wired into navigation, and a Norwegian sample-data pack. It follows Part B 3.5 of the screen blueprints specification and
is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the
per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `hr.directory` | `HrEmployeeDirectory` | ListScreen (cards) | Each person as a card: photo, name, title, department and contact; choosing a card opens the employee |
| `hr.directory.record` | `HrEmployeePage` | RecordPage | The time-off balance as key facts, personal and job information, documents and time-off requests as related lists, history and open tasks |
| `hr.org` | `HrOrgChart` | (tree page) | The company as a tree of who reports to whom, with titles and report counts; the chosen person is kept in the address |
| `hr.timeoff` | `HrTimeOffList` | ListScreen | Requests with employee, type, dates, days and status; approve or decline one row or many; **Request time off** |
| `hr.timeoff.balances` | `HrTimeOffBalanceList` | ListScreen (read-only) | Entitlement, days taken and left per employee, with a progress bar for how much is used |
| `hr.onboarding` | `HrOnboardingList` | ListScreen | New hires with start date, owner and a progress bar of their checklist; choosing a row opens the checklist |
| `hr.onboarding.record` | `HrOnboardingChecklist` | RecordPage variant | Checklist sections (before the first day, the first week, the first month) with an owner and a due date for each task, and the key facts of the hire |
| (dialogs) | `HrRequestTimeOff`, `HrQuickCreateEmployee` | QuickCreateDialog | Type, dates and a note to ask for time off; the few fields to start an employee |

The categories are all `Business / HR`. Templates carry their `scopes` (Part A 4.2): the directory, the org chart and the time-off lists apply at module and
feature level, the employee page and the onboarding checklist at feature and sub-feature level, and the dialogs at slice level.

**The team calendar.** The specification pairs the time-off list with a calendar screen "once available". The calendar is on the later-additions list of the
foundation (Part B 2.12) and is not part of this delivery; the time-off list and the balances cover requests and entitlements until it exists.

## Navigation

The topbar names the module, `HR`; the module's sidebar overrides the application's and lists **Directory, Org chart, Time off** (with **Requests** and
**Balances** beneath it) and **Onboarding**. A screen is a feature of the `hr` module: `hr.directory.record` is the `record` feature of `directory`. The screen set
(`hrScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived
from, and a specification holds them to it.

## Behaviors

- choosing a card or a row opens the employee page or the onboarding checklist, handing it the chosen row's id;
- **Request time off** opens its dialog from the time-off list, the balances and an employee page, whose **Cancel** closes it;
- choosing requests on the time-off list shows a bar to approve or decline them all;
- the directory's search box narrows the cards as it is typed and the search is part of the address;
- the org chart follows the ARIA tree pattern and keeps the chosen person in the address.

## Data, not values

No template carries a row: every property that shows data is a binding to a query (`Employees`, `TimeOffRequests`, `Balances`, `OrgNodes`, `OnboardingTasks` ...) and
the pack answers it. One pack ships, `hr-nordic` (`nb-NO`, NOK), owned by `blueprint:hr`: sixteen people in six departments with a reporting line, twelve
time-off requests, balances, five new hires and a three-part checklist. Its one-row `HrSettings` shape gives every date and figure its locale, so dates read
`26. okt. 2026`. The template's own labels (titles, button text) are English and are overridden through each component's `strings`, as for every foundation component.

## Using it

```ts
import { hrApplication, hrComposition, hrNavigation, hrStructure } from '@cratis/scene.blueprint.hr';

const application = hrApplication();   // layouts, templates, dialogs, screens and a profile with the pack active
// <ScenePreviewHost document={application} structure={hrStructure} navigation={hrNavigation} target={{ module: 'hr' }} ... />
```
