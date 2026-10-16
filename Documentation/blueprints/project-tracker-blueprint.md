---
title: The Project and Task Tracker blueprint
description: Projects as cards, a project page, a task board, a personal task list and a task side sheet - the screens, the navigation, the sample data and how an application adopts them.
---

`@cratis/scene.blueprint.project-tracker` is a **domain blueprint** for a team that plans work in projects and tasks, built on the
[foundation set](foundation-templates.md) the way [the CRM blueprint](crm-blueprint.md) is: it brings no shell, component or theme of its own and adds what is
particular to tracking work - four screen templates, three dialog templates, a screen set wired into navigation, and a sample-data pack. It follows Part B 3.6 of
the screen blueprints specification and is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is
green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and
dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `projects.list` | `ProjectList` | ListScreen (cards) | Each project as a card: name, owner, a progress bar, due date and status; choosing a card opens the project |
| `projects.record` | `ProjectPage` | RecordPage | Status, progress, open tasks and days left as key facts; the project's fields; its task list in the main region; members beside it; activity |
| `projects.mytasks` | `ProjectMyTasks` | ListScreen (grouped) | The user's tasks grouped by when they are due - overdue, today, this week, later - with project, priority and status; choosing a task opens it in a side sheet |
| `projects.board` | `ProjectTaskBoard` | BoardScreen | A column for each status - to do, in progress, in review, done - and a card for each task with assignee, project, due date and priority |
| (dialogs) | `ProjectQuickCreateProject`, `ProjectQuickCreateTask` | QuickCreateDialog | The few fields to start a project or a task |
| (dialog) | `ProjectTaskSheet` | SideSheet | One task in a drawer: status and people, its fields, subtasks as a checklist and the conversation; hosts a record page beside the list it came from |

The categories are all `Business / Project tracker`. Templates carry their `scopes` (Part A 4.2): the list, the board and my tasks apply at module and feature
level, the project page at feature and sub-feature level, and the dialogs at slice level.

**Not in this delivery.** The specification's *Timeline* (a Gantt-style `TimelineScreen`) is on the foundation's later-additions list (Part B 2.12) and is not
shipped; the navigation therefore lists Projects, My tasks and Board. *Swimlanes by assignee* on the board are covered under [the board](#the-board).

## Navigation

The topbar names the module, `Projects`; the module's sidebar overrides the application's and lists **Projects, My tasks** and **Board**. A screen is a
feature of the `projects` module: `projects.record` is the `record` feature. The screen set (`projectTrackerScreenDefinitions`) is the one list the manifest's
`blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a project opens its page, handing it the chosen row's id;
- choosing a task - in my tasks or in a project's task list - opens the **task side sheet** over the page, so the list stays where it was; **Close** closes it and **Open project** goes to the project;
- **New project** and **New task** open their quick-create dialogs, whose **Cancel** closes them;
- a card moves between statuses by dragging or by its own **Move to** menu, and the move is announced;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## The board

The board is the foundation `kanbanBoard`: columns count what they hold and say "Over the limit" in words when a column's limit (in progress is limited to six)
is exceeded.

## Data, not values

No template carries a row: every property that shows data is a binding to a query (`Projects`, `ProjectColumns`, `MyTasks`, `TaskBoardCards`, `TaskRecord` ...)
and the pack answers it. One pack ships, `project-tracker-en` (`en-GB`), owned by `blueprint:project-tracker`: eight projects, twenty-two tasks across four statuses
and three priorities, and a task with subtasks and a conversation. Its one-row `ProjectsSettings` shape gives every date and figure its locale.

## Using it

```ts
import { projectTrackerApplication, projectTrackerComposition, projectTrackerNavigation, projectTrackerStructure } from '@cratis/scene.blueprint.project-tracker';

const application = projectTrackerApplication();   // layouts, templates, dialogs, screens and a profile with the pack active
// <ScenePreviewHost document={application} structure={projectTrackerStructure} navigation={projectTrackerNavigation} target={{ module: 'projects' }} ... />
```
