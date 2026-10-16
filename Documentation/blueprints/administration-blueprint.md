---
title: The Administration blueprint
description: Users, roles and permissions, settings and an audit log for an administrator - the screens, the navigation, the sample data and how an application adopts them.
---

`@cratis/scene.blueprint.administration` is a **domain blueprint** for the administrator of an application, built on the [foundation set](foundation-templates.md)
the way [the CRM blueprint](crm-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to administration - five screen
templates, two quick-create dialogs, a screen set wired into navigation, and a sample-data pack. It follows Part B 3.7 of the screen blueprints specification and is
held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template
check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `admin.users` | `AdministrationUserList` | ListScreen | Name, email, role, status and last active; filters by role, status and last active; row actions edit, suspend and reset password; **Invite user** |
| `admin.users.record` | `AdministrationUserPage` | RecordPage | Status, roles, open sessions and sign-ins as key facts; the profile; role assignments and sessions as related lists (a session can be signed out); account history |
| `admin.roles` | `AdministrationRoles` | MasterDetail | The roles on the left, each with how many people hold it; on the right the permission matrix of the chosen role, grouped; **New role** |
| `admin.settings` | `AdministrationSettings` | FormScreen (Settings variant) | General, branding and notifications, each section with its own Save |
| `admin.audit` | `AdministrationAuditLog` | ListScreen (read-only) | Time, actor, action and target; filters by actor, action and range; **Export** |
| (dialogs) | `AdministrationInviteUser`, `AdministrationQuickCreateRole` | QuickCreateDialog | An email, a role and a message to invite someone; a name and description to start a role |

The categories are all `Business / Administration`. Templates carry their `scopes` (Part A 4.2): the lists, roles, settings and audit log apply at module and
feature level, the user page at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `Administration`; the module's sidebar overrides the application's and lists **Users, Roles, Settings** and **Audit log**. A screen is a
feature of the `admin` module: `admin.users.record` is the `record` feature of `users`. The screen set (`administrationScreenDefinitions`) is the one list the
manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Roles and permissions

The roles list selects one row at a time and keeps the choice in the address (`rolesselected=editor`), so a link points at a role. The permission matrix binds its
`focusRole` property to the list's chosen row: while no role is chosen the matrix shows every role side by side, so roles can be compared, and choosing one shows that
role alone. Each box is a checkbox named in words for a screen reader (*Grant View roles to Viewer*), and the matrix publishes the grants as its `value` output for the
application to save.

## Behaviors

- choosing a user opens their page, handing it the chosen row's id;
- **Invite user** and **New role** open their dialogs, whose **Cancel** closes them;
- **Export** on the audit log tells the administrator the export has started;
- the toolbar search narrows a list as it is typed and the search is part of the address;
- in the settings form each section is saved on its own and nothing is saved until its section is.

## Data, not values

No template carries a row: every property that shows data is a binding to a query (`Users`, `UserColumns`, `AdministrationRoles`, `AdministrationPermissions`,
`AuditEntries`, `AdministrationSettingsValues` ...) and the pack answers it. One pack ships, `admin-default` (`en-GB`), owned by `blueprint:administration`: twelve users in
three states, five roles with their grants over ten permissions in four groups, twelve audit entries, and the settings of an organization. Its one-row `AdminSettings`
shape gives every date its locale.

## Using it

```ts
import { administrationApplication, administrationComposition, administrationNavigation, administrationStructure } from '@cratis/scene.blueprint.administration';

const application = administrationApplication();   // layouts, templates, dialogs, screens and a profile with the pack active
// <ScenePreviewHost document={application} structure={administrationStructure} navigation={administrationNavigation} target={{ module: 'admin' }} ... />
```
