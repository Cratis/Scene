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

Both `metadata.type` and `metadata.category` are optional **strings**. Packages can add `Acme.DispatchWorkspace` or `Acme/Operations` without changing Scene. Unknown strings survive serialization and selection. Category does not grant or deny applicability: a Form may be browsed under Workspaces without becoming an application shell.

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

## Use the same rules in pickers and on apply

`validateLayoutApplicability`, `validateScreenTemplateApplicability` and `validateDialogTemplateApplicability` return actionable diagnostics without changing authored input. `filterApplicableScreenTemplates` uses the same validator and preserves browse order and definition identity. The C# equivalents are on `TemplateApplicability`.

For a ScreenTemplate declaring `fitsSlot`, pass its **immediate** containing layout or screen template. Bare slot names must exist in that container. Qualified names such as `OrdersFeature.body` must match both its name and its slot. Dots inside a container name are supported. A missing container is diagnosed rather than guessed. Use the existing recursive template resolver to determine the containing chain; these checks do not replace it.

The shared `template-applicability-fixtures.json` corpus exercises both engines independently. `scene-model-shape.json` also guards C#/TypeScript metadata parity.

## Inherited content is still locked

Metadata is a selection contract, not an edit permission. Applicability never clones inherited visuals into authored content or changes exposure declarations. Use the existing canonical editing operations and exposure validation for queries, columns and exposed component properties. A different browse category must not bypass those rules.
