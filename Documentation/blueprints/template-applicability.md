# Template types, categories and applicability

A semantic **type** says what a template does. A browse **category** says where a package wants it to appear in a picker. Neither replaces the existing layout, screen-template or dialog-template structure.

## Business-application vocabulary

The bounded vocabulary deliberately separates navigation from business content. Microsoft's [navigation basics](https://learn.microsoft.com/en-us/windows/apps/design/basics/navigation-basics) distinguish top-level navigation from navigation within a page; its [list/details pattern](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/list-details) describes browsing records and viewing the selected record. Material's [canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview) distinguish list/detail from a workspace with a supporting pane. These are complementary patterns, not names for one universal template.

| Semantic type | Existing Scene definition | Typical purpose | Suggested browse category |
| --- | --- | --- | --- |
| `ApplicationShell` | `Layout` | Persistent application navigation, header and content region | Application shells |
| `Workspace` | `ScreenTemplate` | Module/feature workspace, possibly with supporting panes | Workspaces |
| `List` | `ScreenTemplate` | Collection, filters, toolbar and selection | Lists and work queues |
| `Detail` | `ScreenTemplate` | Selected record and related information | Record details |
| `Form` | `ScreenTemplate` or `DialogTemplate` | Command input and validation | Forms |
| `Dialog` | `DialogTemplate` | Modal confirmation, detail or editing | Dialogs |

`metadata.type` and `metadata.category` are **strings**; the category is required for blueprint templates (see [Category is required](#category-is-required)). Packages can add `Acme.DispatchWorkspace` or `Acme/Operations` without changing Scene. Unknown strings survive serialization and selection. Category does not grant or deny applicability: a Form may be browsed under Workspaces without becoming an application shell.

## Scope rules

`TemplateScope` identifies Application, Module, Feature, Subfeature or Slice. Subfeature means any recursively nested feature, not a fixed depth.

- A Layout is applicable only at Application scope; `ApplicationShell` uses this existing role.
- A ScreenTemplate or DialogTemplate is applicable at non-application scopes by default. Packages can narrow this with `metadata.scopes`.
- An omitted scopes list preserves legacy behavior. An explicitly empty list means no applicable scope.
- Explicit scopes never override structural role. A ScreenTemplate marked `ApplicationShell` is invalid even if it declares Slice scope; a Layout declaring Slice scope is also invalid.
- The built-in `Dialog` type requires a DialogTemplate. Workspace/List/Detail/Form are not Layout types. Custom types inherit the definition's structural rules.
- No template selection is valid: an outlet may compose child content without a template. Nothing is scaffolded or substituted in this case.

A reusable feature workspace could declare:

```typescript
metadata: {
    type: 'Workspace',
    category: 'Business workspaces',
    scopes: [TemplateScope.Module, TemplateScope.Feature, TemplateScope.Subfeature],
}
```

## Category is required

Every template carries a category. `describeTemplateCatalog` (C# `TemplateCatalog.Describe`) reports a template without one - `metadata.category` missing or blank - as:

- an **error** in `problems` when the template ships in a `Blueprint` package: `Template 'X' declares no category` (diagnostic code `templateCategoryMissing`, `templateCategoryMissingCode`), which makes the entry incompatible;
- a **warning** in `warnings` when the template is an own template (any other package kind). Studio prompts for the category when it creates one.

An unknown category string is accepted and preserved. Both shipped blueprints categorise every template - `Foundation / <type>` for the structural templates in `blueprint.default` and `Business / <domain>` in `blueprint.components` - and their specs fail on a missing category.

## Slice kinds

`SliceKind` is `StateChange`, `StateView` or `Automation`. `metadata.sliceKinds` narrows which slice kinds a template applies to when the target scope is Slice. An Automation slice presents nothing, so no template applies to it. A target slice with no stated kind is filtered by scope only.

## Applicable templates for a target

`applicableTemplates(library, target)` (C# `ApplicableTemplates.Compute`) is the one place that decides what a template picker offers. No host - Studio included - re-implements these rules.

```typescript
const offered = applicableTemplates(
    { own: workspaceTemplates, blueprints: [crm, helpdesk] },
    { scope: TemplateScope.Feature, container: moduleWorkspace, chain: ['ModuleWorkspace'] },
);
// offered.own        -> [{ category: 'List', templates: [...] }, ...]
// offered.blueprints -> [{ blueprint: 'crm', version: '1.4.2', categories: [{ category: 'Board', templates: [...] }] }]
```

- `library.own` holds the templates the user created, `library.blueprints` the packages that ship templates.
- `target.scope` is the hierarchy level; `target.sliceKind` the kind of slice for Slice; `target.container` the layout or template whose slots the template must fit; `target.chain` the templates already chosen above, which are not offered again.
- Own templates come first, grouped by category in browse order, uncategorized last. A **blueprint with no applicable template is omitted**, never returned empty.
- Each template carries the `reference` that selects it (see [Template references](template-provenance.md#template-references-and-the-version-pin)).

It composes the validators above, `resolveScreenTemplates` (a template must find exactly one home in the container and cannot nest inside itself - the chain) and the defaults of each level. The defaults apply when a template declares no `scopes`; declared `scopes` and `sliceKinds` always override them, and category never implies a scope.

| Target | Offered by default | Typical categories |
| --- | --- | --- |
| Application | Layouts and screen templates with `metadata.role: Root` (the shell candidates a UI profile's `root` can name) | Shell, Auth |
| Module | Screen templates fitting a slot of the shell layout | Workspace, Dashboard |
| Feature | Screen templates whose `fitsSlot` matches a slot of the parent template | List, Board, Detail, Dashboard, Form |
| Subfeature | Page templates and panels | Detail, List |
| Slice, state change | Dialog templates, and screen templates declaring `StateChange` | Dialog, Form, Wizard |
| Slice, state view | Screen templates declaring the Slice scope or `StateView` | List, Detail |

A screen template that declares `sliceKinds` without `scopes` defaults to the Slice scope. The per-level defaults are part of `applicableTemplates` and the `validate*ForTarget` functions (C# `ApplicableTemplates.Validate`), which give the reason a template does not apply at a target. The lower-level `validate*Applicability` functions below keep their legacy defaults.

A root-role template never fits a slot, is offered only at the Application scope and is never a dialog template; see
[The root template](root-template.md#the-root-role). The *new screen* default of a profile (`defaults.newScreenTemplate`) is filtered by the same rules as any
picker at the scope of the new screen.

## Use the same rules in pickers and on apply

`validateLayoutApplicability`, `validateScreenTemplateApplicability` and `validateDialogTemplateApplicability` return actionable diagnostics without changing authored input. `filterApplicableScreenTemplates` uses the same validator and preserves browse order and definition identity. The C# equivalents are on `TemplateApplicability`.

For a ScreenTemplate declaring `fitsSlot`, pass its **immediate** containing layout or screen template. Bare slot names must exist in that container. Qualified names such as `OrdersFeature.body` must match both its name and its slot. Dots inside a container name are supported. A missing container is diagnosed rather than guessed. Use the existing recursive template resolver to determine the containing chain; these checks do not replace it.

The shared `template-applicability-fixtures.json` corpus exercises both engines independently: every level above, explicit `scopes` overriding the defaults, slot nesting hiding a template, a blueprint with nothing applicable being hidden, the slice-kind split, category missing as an error or warning, and version-pinned references. `scene-model-shape.json` also guards C#/TypeScript metadata parity.

## Inherited content is still locked

Metadata is a selection contract, not an edit permission. Applicability never clones inherited visuals into authored content or changes exposure declarations. Use the existing canonical editing operations and exposure validation for queries, columns and exposed component properties. A different browse category must not bypass those rules.
