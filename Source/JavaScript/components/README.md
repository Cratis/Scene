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
that the *host* supplies. They are not installed in this repository, and a design surface is not a host.

Every adapter that reaches them does so through a dynamic `import()` inside `React.lazy`, wrapped in
`ArcRuntimeBoundary` (`Suspense` + the library's own `ErrorBoundary`). A screen built only from the library's
Arc-free half never pulls the Arc client in, and an unbound component never even reaches the import.

This splits the library cleanly, and the split is the library's own:

| Arc-free (static import) | Arc-bound (lazy import) |
|---|---|
| `Common`, `Dropdown`, `Filter`, `Toolbar`, `SchemaEditor`, `TimeMachine`, `ObjectContentEditor`, `ObjectNavigationalBar` | `DataPage`, `DataTables`, `CommandForm`, `CommandDialog`, `Dialogs` |

The Storybook build externalizes the Arc packages (`.storybook/main.ts`) so the lazy chunk can be emitted
with its imports left bare. No story loads that chunk, because no story registers a binding.

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
data/        dataTable, table, observableDataTable
forms/       commandForm; forms/fields/ the twelve field types
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
