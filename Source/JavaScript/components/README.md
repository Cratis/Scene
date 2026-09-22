# @cratis/scene.components

The Scene package that exposes [`@cratis/components`](https://www.npmjs.com/package/@cratis/components) — the
Cratis React component library — as resolvable Scene components.

User-facing documentation lives in [`Documentation/components-package/`](../../../Documentation/components-package/index.md).
This file is the contributor's note: how the package is laid out, and why the load-bearing decisions were
made the way they were.

## The constraint everything is shaped around

Most of `@cratis/components` is **Arc-bound**. `DataPage`, `DataTableForQuery`,
`DataTableForObservableQuery`, `AutoCommandForm`, `CommandDialog` and `StepperCommandDialog` all take a
*query or command class constructor* and talk to a live backend through `@cratis/arc.react`.

A Scene `ExternalComponent` carries a `properties` bag of plain values and named `slots`. There is no way to
put a TypeScript class in one, and there should not be — a `.play` document is text, compiled by Stage and
read back by Studio, and nothing in that round trip can carry a class.

So an adapter cannot conjure a query class out of a property string. The only honest seam is that the thing
in the screen *is a name*, and a name needs somewhere to become a class.

### The binding registry

`bindings/bindingRegistry.ts`:

```typescript
registerQuery(name: string, queryClass: BoundConstructor): void
registerQueries(bindings: Record<string, BoundConstructor>): void
resolveQuery(name: string): BoundConstructor | undefined

registerCommand(name: string, commandClass: BoundConstructor): void
registerCommands(bindings: Record<string, BoundConstructor>): void
resolveCommand(name: string): BoundConstructor | undefined

registeredQueryNames(): string[]
registeredCommandNames(): string[]
clearBindings(): void
```

A host — Stage's generated application, or Studio's preview when it is wired to a real backend — registers
the real generated Arc proxies under the names screens refer to them by. Adapters look them up at render
time through `resolveElementBinding`, which reads `properties.query` or `properties.command` depending on the
`BindingKind`.

Design notes:

- **Queries and commands are separate namespaces.** They are opposite halves of CQRS and a screen means
  exactly one at each site; letting one satisfy the other would turn a modeling mistake into a runtime one.
- **`BoundConstructor` is `new (...args: never[]) => object`,** not an Arc type. Scene deliberately does not
  depend on Arc. Whether a registered class really is a query is checkable where the host registers it, with
  the real Arc types in scope — which is where that check belongs.
- **Re-registering a name replaces it**, so a host can re-register on hot reload.
- **`clearBindings()` exists** because module-level state is right for a host that registers once and wrong
  for Studio switching projects, or for a spec that must not inherit the previous one's registrations.

### A missing binding is a placeholder, never a throw

`resolveQuery` returns `undefined`, and every Arc-bound adapter renders `MissingBinding`:

```text
Unresolved query binding 'AllInvoices' on Cratis.Components:dataTable
Missing query binding on Cratis.Components:dataTable
```

Two messages, because they are two different mistakes — one needs the host to register the name, the other
needs the screen edited. The presentation deliberately matches `UnresolvedComponent` in `@cratis/scene.react`.

Studio's design-time preview usually has nothing registered at all and must still show a usable layout: one
unbound table costs one dashed box, not the whole screen.

### Arc is loaded lazily

`@cratis/arc`, `@cratis/arc.react` and `@cratis/fundamentals` are peer dependencies of `@cratis/components`
that the *host* supplies. This package also declares Arc and Arc React as optional peers and pins
22.16.1 as development dependencies for native integration tests. A design surface is not a host.

Every adapter that reaches them does so through a dynamic `import()` inside `React.lazy`, wrapped in
`ArcRuntimeBoundary` (`Suspense` + the library's own `ErrorBoundary`). A screen built only from the library's
Arc-free half never pulls the Arc client in, and an unbound component never even reaches the import.

This splits the library cleanly, and the split is the library's own:

| Arc-free (static import) | Arc-bound (lazy import) |
|---|---|
| `Common`, `Dropdown`, `Filter`, `Toolbar`, `SchemaEditor`, `TimeMachine`, `ObjectContentEditor`, `ObjectNavigationalBar` | `DataPage`, `DataTables`, `CommandForm`, `CommandDialog`, `Dialogs` |

The Storybook build externalizes the Arc packages (`.storybook/main.ts`) so the lazy chunk can be emitted
with its imports left bare. No story loads that chunk, because no story registers a binding.

## Optional single-result view (read-only)

`Cratis.Components:singleResult` is a narrow adapter for an optional **single model**, not a collection.
For example, a host registers its generated `ProjectName` proxy and supplies these ExternalComponent
properties (the identifier comes from the host's committed input, never a guessed project):

```typescript
registerQuery('ProjectName', ProjectName);
const properties = {
    query: 'ProjectName',
    queryArguments: Object.freeze({ projectId: committedProjectId }),
    enabled: true,
    resultField: 'name',
};
```

Use the actual own-field name of the generated model. `resultField` selects exactly one own data field:
no dotted-path traversal, getters, inherited members, expressions, JSON display or result-binding DSL.
Strings, finite numbers and booleans render as escaped text, including `0`, `false` and empty strings.
An absent/non-scalar field is a visible failure, not a missing model. A successful null/undefined model
is `Not found`; unsuccessful, unauthorized, invalid and exception envelopes are `Unable to load result`.
Idle, loading and failure states never display server exception messages or stacks.

`enabled` defaults to false and must be exactly true; the element must also be enabled. The host owns
input controls, validation feedback and committing/replacing immutable `queryArguments` objects. Even
parameterless queries require an explicit `{}`. Missing bindings take precedence over all other checks
and never import Arc. Disabled or malformed adapter properties do not import the lazy runtime either.
Native Arc `perform` owns required-parameter and generated-validator checks before HTTP; Scene adds no
business validation and forwards the argument object by identity.

The private lazy runtime creates a fresh native proxy per request generation, configures all four Arc
context connection/header values, and aborts on replacement or unmount. It also ignores late completion
when cancellation is ignored, masks previous results on the input-changing render, and responds to
header-callback identity and `queryVersion` changes. Hosts must replace the callback or bump the version
when credentials change invisibly inside a stable callback. There is no shared cache, command-triggered
refresh, polling, retry button, or observable-query subscription.

Published Arc 22.16.1 itself normalizes top-level falsy primitive payloads to null in `QueryResult`.
This adapter therefore promises scalar **fields of models**, not top-level primitive queries; it does
not fork Arc deserialization to recover those payloads. `isReady: false` is a failure for this one-shot
view rather than an invented retry protocol. Enumerable proxies are rejected before execution.

Tests use a real `QueryFor` subclass with unmodified `perform`, native validation and only the HTTP
boundary replaced. Separate lazy-boundary doubles test Arc-free gating, not native client correctness.
They do not prove a generated server route or backend persistence. The opt-in `queryInputForm` below
adds form-local editable input/commit semantics; Scene #39 remains open for broader binding and acceptance.
No default profile, generator or schema changed.

## Query input form (opt-in)

`Cratis.Components:queryInputForm` composes controlled native web string inputs with the **existing**
`SingleResultRuntime`. Its package-local `QueryInput` declarations name exact parameters, labels,
required state and optional whole-string patterns. It validates on submit, freezes a fresh committed
snapshot, cancels/hides obsolete results on edit and supports repeat submit. There is no query while
editing, fake command context, new executor, core schema, default identifier or inferred route.

Published Components `InputTextField` is wrapped with `asCommandFormField` and consumes command context;
it is not an exported independent controlled input. Native labelled text inputs are deliberately used
instead. The existing command-field adapters and command-slot behavior are unchanged.

`registerQueryIdentity(name, sourceIdentity, proxy)` is the explicit opt-in collision-aware API:
identical identities replace on hot reload; different sources with the same name are ambiguous.
`queryInputForm` subscribes to exact-binding changes. Legacy `registerQuery` keeps its last-write-wins
semantics and is authoritative for legacy `resolveQuery` when present. Otherwise a unique identity-only
registration also serves existing tables and `singleResult`; multiple identities show their unresolved
placeholder without selecting a candidate. Existing adapters re-resolve on host render.
`registeredQueryNames` includes the sorted union of both namespaces. Strict `resolveExactQuery` still
counts mixed candidates as ambiguous: Stage should emit one identity registration per source, not also
register the same name through `registerQueries`.

At the existing lazy runtime boundary, form declarations must map exactly to scalar `String` or `Guid`
proxy descriptors. Unsupported/missing/duplicate descriptors fail before HTTP; no coercion is performed.
The canonical generated Guid proxy shape is tested unchanged. Native Arc validates required arguments
and proxy rules, but does not automatically validate GUID format: declare an explicit pattern if needed.
The lazy runtime uses the optional Fundamentals peer already required by Arc; no Components peer-floor
change is required.

The [public contract](../../../Documentation/components-package/query-input-form.md) documents the exact
payload and Stage consumption pattern. Tests render through real `SceneElementView`, unmodified native
Arc `QueryFor.perform` and only substituted HTTP, including validation, stale requests and unmount.
They are not generated/browser acceptance; the DOM suite dispatches submit rather than simulating a
browser's implicit Enter algorithm.

## Naming and shadowing

Bare names are `lowerCamelCase` and abstract — `dataTable`, not `DataTableForQuery` — registered under
`componentRegistryKey('Cratis.Components', name)`.

`table` and `dialog` deliberately reuse names `core` and `PrimeReact` declare. A profile listing
`core`, `PrimeReact`, `Cratis.Components` in that order resolves both here and records the others as
shadowed. Both replacements are better for a Cratis application: `DataTableForQuery` performs the query
rather than being handed rows, and the Cratis `Dialog` resolves its result through Arc's dialog context.

**`card` is deliberately not declared.** `@cratis/components` ships no card; the nearest thing is `Page`'s
`panel` chrome, whose `.panel` class the consuming application defines. Shadowing `card` with that would make
the name resolve to something worse — an override is only justified when the replacement is better for every
screen that already writes the name.

`dataTable` and `table` are the same adapter under two names, so adopting the package does not require
rewriting screens.

## Token bridge

`theme/sceneTokenBridge.css`, exported as `@cratis/scene.components/styles`, maps Scene's `--scene-*` tokens
onto the `--cratis-*` names `@cratis/components` reads:

```css
--cratis-surface-card: var(--scene-surface-card, var(--p-content-background, var(--surface-card)));
/*                         ^ Scene theme           ^ PrimeReact v11         ^ v10 legacy */
```

It extends the library's own fallback chain rather than replacing it, so a partial theme leaves the rest as
the PrimeReact theme had it. The rules are scoped to `[data-scene-theme-root], [data-scene-theme]` — never
`:root`, where `--scene-*` does not exist and every mapping would resolve to nothing.

The vocabulary is thirteen tokens, verified against `theme/themePresets.ts` in `@cratis/scene.primereact` so
both packages write themes in one language: `primary.color`, `primary.contrastColor`, `surface.background`,
`surface.card`, `surface.border`, `surface.hover`, `surface.overlay`, `text.color`, `text.mutedColor`,
`highlight.background`, `highlight.color`, `content.borderRadius`, `focus.ring`.

## Deliberately not covered

- **`PivotViewer`** — drags in `pixi.js`, a full WebGL renderer, into every bundle that lists this package,
  for a faceted browser that has nothing to show at design time. An application that wants it imports it
  directly.
- **`card`** — see above.
- **`column`** — a column is a configuration element, not a rendered component: it declares `field`,
  `header`, `sortable` and `filter`, and the table reads those off its children. Columns therefore come
  through the `content` slot, and declaring a name here would add a registry entry for something no
  screen resolves on its own. Note that the *ownership* of `Column` moved in PrimeReact 11 — `primereact/column`
  was removed and `@cratis/components` now ships its own (`@cratis/components/DataTables`, re-exported from
  `DataPage`) — so if a `column` name is ever wanted, this is the package that would have the component
  behind it. The decision not to declare one is unchanged; only the reason for it is different.
- **Event handlers** — Scene has no action-binding seam yet. Where a callback drives a component's own
  visible state the adapter holds it (`useEditableCopy`), so the breadcrumb, schema editor and time machine
  behave like themselves; where it would reach outside, the adapter exposes nothing rather than a handler
  that quietly does nothing.
- **`calendarField` date bounds** — would arrive as strings and have to be parsed here; a range that silently
  misparses is worse than none. That rule belongs in the command's validator.

## Layout

```
bindings/    the registry, BindingKind, BoundConstructor, MissingBinding, ArcRuntimeBoundary
pages/       page, dataPage, formElement
data/        dataTable, table, observableDataTable, singleResult
forms/       commandForm, queryInputForm; forms/fields/ the twelve field types
dialogs/     dialog, confirmationDialog, busyIndicatorDialog, commandDialog, stepperCommandDialog
common/      icon, tooltip, dropdown, errorBoundary
editors/     objectContentEditor, objectNavigationalBar, schemaEditor, timeMachine, filterPanel
toolbar/     toolbar, toolbarButton, toolbarGroup, toolbarSeparator
theme/       sceneTokenBridge.css
properties.ts            narrow readers for the property bag
cratisComponents.ts      the component registry
cratisComponentsPackage.ts   the manifest and bundle
```

Adapters are prefixed `Scene` (`ScenePage`, `SceneDataTable`) because the wrapped components carry the same
names — `Page`, `DataPage`, `Dialog` — and both live in the same file.

## Property reading

`properties.ts` is the only place a property-bag value is narrowed, and nothing casts. Each helper answers
the same way: the value when it really is of the asked-for type, `undefined` otherwise, so an adapter reads a
property and applies its own default in one expression.

`stringProperty`, `booleanProperty`, `numberProperty`, `arrayProperty`, `stringArrayProperty`,
`objectArrayProperty`, `objectProperty`, `unionProperty`.

`unionProperty(properties, 'orientation', ['vertical', 'horizontal'] as const)` is what turns an authored
string into one of a component's string-literal union props without an assertion.

## Gates

```bash
npx tsc -b                 # from the repository root
yarn build
yarn test
yarn lint:ci
yarn build-storybook
```

Two workarounds used to live in this folder for upstream problems that `@cratis/components` 3.0.0 and
PrimeReact 11 removed the cause of. Both are gone, and neither should come back without new evidence:

- `.storybook/main.ts` no longer forces `cssMinify: 'esbuild'`. It was there because
  `@cratis/components@2.9.0` shipped `dist/esm/TimeMachine/Properties.css` with `//` line comments, which
  are not CSS, and Vite's default lightningcss minifier rejects a whole bundle over one invalid file.
  3.0.0 takes CSS out of the JavaScript module graph entirely: there are no per-component stylesheets any
  more, only `styles.css`, `tokens.css` and `theme.css` at the package root, and all three minify cleanly
  under lightningcss.
- `vite.config.mts` no longer inlines `@cratis/components` and `primereact` for Vitest. That existed
  because both were published as ESM using directory imports (`primereact/api`), which Node's own resolver
  rejects. `primereact/api` does not exist in version 11 at all; PrimeReact's `exports` map now resolves
  `./*` to a concrete `./*/index.mjs`, and every `@cratis/components` subpath points at a real file, so
  Node loads them natively and Vitest can externalize them as it does every other dependency.
