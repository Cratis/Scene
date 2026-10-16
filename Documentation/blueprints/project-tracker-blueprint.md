---
title: The Project and Task Tracker blueprint
description: Projects as cards, a project page, a task board, a personal task list and a task side sheet - the screens, the navigation, the sample data and how an application adopts them.
---

`@cratis/scene.blueprint.project-tracker` is a **domain blueprint** for a team that plans work in projects and tasks, built on the
[foundation set](foundation-templates.md) the way [the CRM blueprint](crm-blueprint.md) is: it brings no shell, component or theme of its own and adds what is
particular to tracking work - six screen templates, three dialog templates, a screen set wired into navigation, and a sample-data pack. It follows Part B 3.6 of
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
| `projects.board.lanes` | `ProjectTaskLanes` | BoardScreen (swimlanes) | The same board with a lane for each assignee across the same columns |
| `projects.timeline` | `ProjectTimeline` | TimelineScreen | Every project as a bar on a schedule in a lane for each owner, with progress, two milestones and what waits on what; the scale is kept in the address, and on a phone the schedule is the table |
| (dialogs) | `ProjectQuickCreateProject`, `ProjectQuickCreateTask` | QuickCreateDialog | The few fields to start a project or a task |
| (dialog) | `ProjectTaskSheet` | SideSheet | One task in a drawer: status and people, its fields, subtasks as a checklist and the conversation; hosts a record page beside the list it came from |

The categories are all `Business / Project tracker`. Templates carry their `scopes` (Part A 4.2): the list, the board and my tasks apply at module and feature
level, the project page at feature and sub-feature level, and the dialogs at slice level.

**The timeline.** `ProjectTimeline` is built on the foundation's `timelineGrid` (Part B 2.12): a project's bar runs to its due date, a milestone marks a go-live, a dependency says what waits on what, and an owner's overlapping bars are told as a conflict in words. The navigation lists Projects, My tasks, Board (with By status and By person beneath it) and Timeline.

## Navigation

The topbar names the module, `Projects`; the module's sidebar overrides the application's and lists **Projects, My tasks** and **Board** (with **By status** and **By person** beneath it). A screen is a
feature of the `projects` module: `projects.record` is the `record` feature. The screen set (`projectTrackerScreenDefinitions`) is the one list the manifest's
`blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a project opens its page, handing it the chosen row's id;
- choosing a task - in my tasks or in a project's task list - opens the **task side sheet** over the page, so the list stays where it was; **Close** closes it and **Open project** goes to the project;
- **New project** and **New task** open their quick-create dialogs, whose **Cancel** closes them;
- a card moves between statuses by dragging or by its own **Move to** menu, and the move is announced - within its lane on the board by person;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## The board

The board is the foundation `kanbanBoard`: columns count what they hold and say "Over the limit" in words when a column's limit (in progress is limited to six)
is exceeded. `ProjectTaskLanes` is the same board with `swimlane: assignee`: a lane for each person across the same columns, a task moving between statuses
within its lane. Swimlanes are an option the template sets, so a designer can switch them on or off on `ProjectTaskBoard` as well.

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
