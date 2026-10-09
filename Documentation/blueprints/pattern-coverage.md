---
title: Business pattern coverage
description: The business UI patterns the major React template marketplaces converge on, the Scene templates that implement each one, and the prioritized decision for each.
---

Before choosing which templates the blueprints ship, we compared what the major React template marketplaces sell
for business applications. This page records that comparison: each recurring pattern, where it was observed,
the templates that implement it in Scene, and what we decided. No source, markup, image or other asset was
copied from any marketplace template. The comparison only chose patterns and priorities.

## Sources

| Marketplace | What was compared |
| --- | --- |
| [MUI Store](https://mui.com/store/) | Admin and dashboard templates: Devias Kit Pro, Minimal, Mantis, Berry, Aurora, Materio, Modernize. Their product pages list dashboards, data grids and tables, customers, orders, products, invoices, profile and account settings, sign-in and registration, and error pages. Minimal and Devias Kit Pro also list kanban, calendar, mail, chat, file manager, checkout and pricing pages. |
| [Creative Tim](https://www.creative-tim.com/templates/react) | Dashboard lines: Material Dashboard Pro React, Argon Dashboard Pro React, Soft UI Dashboard Pro React, Black, Paper, Now UI and Vision UI Dashboard Pro React, plus the Material Kit Pro marketing kits. |
| [React Themes](https://react-themes.com) | Admin dashboards (Minible, Quinte, Chrev) and vertical dashboards for restaurants, fitness, real estate and crypto, next to landing-page, website, e-commerce and portfolio categories. |
| [ThemeForest](https://themeforest.net/search/react) | Data-table-heavy admin templates, form wizards and validation examples. The search page refuses automated requests, so this row comes from the earlier manual review and was not re-checked for this record. |

## Coverage matrix

Priority 1 is a pattern the admin lines ship and every business application needs. Priority 2 is one many
applications need. Deferred patterns are recorded with the reason. "Where it appears" names only what the
marketplace pages listed when they were compared.

| Pattern | Priority | Where it appears | Default blueprint (`@cratis/scene.blueprint.default`) | Components blueprint (`@cratis/scene.blueprint.components`) | Decision |
| --- | --- | --- | --- | --- | --- |
| Application shell and navigation | 1 | Every admin dashboard line in all four | [`AppShell`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/layouts/appShell.ts) layout, [navigation contributions](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/navigation.ts) | Uses the default shell | Keep one shell with eight menu modes; screens contribute navigation rather than editing the shell. |
| Dashboard | 1 | Every admin dashboard line in all four | [`Dashboard`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/workspaceTemplates.ts) | [`DashboardPage`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/workspaceTemplates.ts) | Keep the four-figure row over two widget columns; collapse to one column at a compact width. |
| Searchable list and table | 1 | MUI Store (Mantis and Minimal data grids and tables), ThemeForest | [`CrudList`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/workspaceTemplates.ts), [`UserManagement`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/supportTemplates.ts) | [`DataListPage`, `ObservableDataListPage`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/listTemplates.ts) | Package-backed tables with empty, loading and error states; query-bound in the components blueprint. |
| Master/detail | 1 | MUI Store (Devias Kit Pro customers and orders), ThemeForest | [`MasterDetail`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/workspaceTemplates.ts), [`DetailView`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/workspaceTemplates.ts) | [`MasterDetailPage`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/workspaceTemplates.ts), [`DataListWithDetailPage`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/listTemplates.ts) | Added `MasterDetail` with a detail outlet that accepts only `Detail` screens; stacks at a compact width. Selection flows through the table's `selectedItem` output. |
| CRUD and command forms | 1 | MUI Store, ThemeForest (form wizards and validation) | [`FormPage`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/workspaceTemplates.ts) | [`CommandFormPage`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/commandTemplates.ts) | One native form boundary for automatic and manual fields; every field carries an accessible name. |
| Confirmation and dialogs | 1 | MUI Store, ThemeForest | [`ConfirmDialog`, `FormDialog`, `DetailDialog`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/dialogTemplates.ts) | [`CommandDialog`, `ConfirmDialog`, `BusyDialog`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/dialogTemplates.ts) | Dialogs are destinations that return a result to the screen that opened them, not ad hoc host calls. |
| Settings and account | 1 | MUI Store (Devias Kit Pro account settings; Mantis and Minimal profile) | [`ProfileSettings`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/supportTemplates.ts) | Uses the default template | Keep as a form workspace; it loads nothing, so it looks the same in every preview state. |
| Nested workspaces | 1 | MUI Store (Devias Kit Pro client and admin areas), ThemeForest | [`ModuleWorkspace`, `FeatureSection`, `SliceSection`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/nesting.ts) | [`DataModulePage`, `DataFeatureSection`, `CommandSliceSection`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/nesting.ts) | Module, feature and slice levels compose through `fitsSlot`; route identity stays separate from labels. |
| Authentication | 2 | MUI Store (Mantis sign-in and registration) | [`Login`, `Register`, `ForgotPassword`, `NewPassword`, `Verification`, `LockScreen`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/authTemplates.ts) | Uses the default templates | Ship in the full-page shell; the identity provider stays the application's choice. |
| Error and status pages | 2 | MUI Store (404 and 500 pages) | [`Error`, `AccessDenied`, `NotFound`, `Landing`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/statusTemplates.ts) | Uses the default templates | Ship; navigation diagnostics prevent most links to a page that does not exist. |
| Empty state | 2 | Not a listed page; designed per table | [`Empty`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/workspaceTemplates.ts) | Table empty messages | A designed first-use page, plus an empty message on every table. |
| Invoice and printable document | 2 | MUI Store (Devias Kit Pro, Minimal, Mantis invoices) | [`Invoice`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/supportTemplates.ts) | Uses the default template | Ship as a document shape distinct from a screen. |
| Documentation and help | 2 | Not a listed page; added because every application grows them | [`Documentation`, `Help`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.default/gallery/supportTemplates.ts) | Uses the default templates | Ship; every application grows them. |
| Schema and document editors | 2 | Not in the marketplaces | None | [`SchemaEditorPage`, `ObjectEditorPage`](https://github.com/Cratis/Scene/blob/main/Source/JavaScript/blueprint.components/templates/editorTemplates.ts) | Cratis-specific: editing event schemas and documents is a first-class Cratis activity. |
| Kanban and calendar | Deferred | MUI Store (Minimal, Devias Kit Pro) | None | None | Deferred until a package provides board and calendar components with keyboard support; a template made of placeholders would not be worth choosing. |
| Mail, chat and file manager | Deferred | MUI Store (Minimal, Devias Kit Pro, Mantis chat) | None | None | Deferred: these are products in their own right rather than screens of a business application. |
| E-commerce, checkout and pricing | Deferred | MUI Store (Bazaar Pro, checkout and pricing pages), Creative Tim, React Themes categories | None | None | Out of scope for business-application blueprints; a storefront blueprint can add them. |
| Landing and marketing pages | Deferred | Creative Tim (Material Kit Pro), React Themes | `Landing` covers the signed-out entry page | None | Marketing sites are outside the application blueprints. |

## Previews

Every template in the matrix renders through the real renderer with realistic seeded data. The data templates
also preview their empty, loading and error states. See [The template set](template-set.md#preview-states)
for how the states are applied and verified, and
[Template compatibility, attribution and license](template-provenance.md) for the metadata each template carries.
