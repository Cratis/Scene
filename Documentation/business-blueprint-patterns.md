---
title: Business blueprint pattern notes
description: Research notes and coverage decisions for Scene business-application blueprints.
---

## Research coverage

Representative React application templates repeatedly converge on the same business UI patterns:

| Pattern | Examples observed | Scene coverage | Decision |
| --- | --- | --- | --- |
| Application shell and navigation | MUI admin/dashboard templates, Limitless/MaterialPro, Creative Tim dashboards | `blueprint.default` AppShell, NavBar, layouts and navigation contributions | Keep as first-class blueprint shell pattern. |
| Searchable list/table | MUI CRUD dashboard, ThemeForest data-table-heavy admin templates | `DataListPage`, `ObservableDataListPage`, `Cratis.Components:dataTable` | Keep package-backed query tables and expose row identity/filter properties. |
| Master/detail | Admin CRUD starters pair a table with a details/edit region | `DataListWithDetailPage` plus typed `componentProperty` bindings | Use DataTable `selectedItem` as the canonical selection output. |
| CRUD command forms | MUI CRUD dashboard, Berry/uifort forms, ThemeForest validation/form wizard examples | `CommandForm` templates and `Cratis.Components:commandForm` | Use one native Arc form boundary for auto and manual fields. |
| Dialog/confirmation | Admin kits include destructive confirmation and editor dialogs | Dialog templates and `DestinationReference.kind = dialog` | Keep dialogs as destinations, not ad-hoc host calls. |
| Settings pages | Admin kits include account/app settings as forms in nested layouts | Workspace/editor templates | Treat as configurable workspace/editor variants. |
| Nested workspaces | Sidebar + module + feature regions are common in admin templates | hierarchical screen templates, named outlets | Model route identity separately from labels/URLs. |

No source or asset was copied from commercial templates. The research was used only to choose patterns and coverage priorities.

## Blueprint decisions

- Prefer package-backed live examples over static mockups: every template should render through registered Scene packages.
- Keep template parameters explicit: query name, command name, visible columns, table identity field, empty state, toolbar actions, destination, and responsive column layout.
- Preserve licensing/attribution metadata on packages, not individual copied assets, because Scene templates are authored from our own components.
- Accessibility expectations stay with the real component package: keyboard navigation, form labels, validation alerts and dialog semantics are verified through executable specs for the package wrappers.
