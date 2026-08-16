---
title: The PrimeReact 11 migration
description: What the port from PrimeReact 10 to 11 changed in this package - the renames, the names that lost their component, and what was built, converted or dropped for each.
---

This package targets PrimeReact **11.1.0**. This page is the record of the port from 10.9.8 — what moved,
what disappeared, and what was decided for each name that lost its component.

> [!IMPORTANT]
> **PrimeReact 11 is not MIT.** The relicensing is the single most consequential part of this upgrade and
> it is not a theming detail. See [Licensing](#licensing) at the foot of this page before adopting it.

## The trap, first

> [!CAUTION]
> **`Sidebar` is not `Sidebar`.** PrimeReact 10's `Sidebar` — a panel that slides in from an edge of the
> viewport — is `Drawer` in v11. Separately, v11 introduces a **brand-new, unrelated `Sidebar`** for
> application-shell navigation.
>
> A port that follows the name rather than the behavior silently swaps a slide-in overlay for a static
> shell element. **It compiles.** Nothing fails until someone opens the screen.

The abstract name this package declares is `sidebar`, and it means the overlay. It maps to v11's
`Drawer`, in `overlay/PrimeSidebar.tsx`. The same trap was live in `@cratis/scene.blueprint.default`, whose
`shell/ConfigPanel.tsx` used the v10 `Sidebar` — and which was made nastier still by a *local* component
of the same name in the same folder. Both are on `primereact/drawer`.

## What the surface looks like now

PrimeReact 11 ships **80** modules where 10.9.8 shipped 117. Measured against the 87 `primereact/*` paths
this package imported:

| Outcome | Count |
| --- | --- |
| Survives under the same name | 45 |
| Renamed | 13 |
| Survives only as a headless hook | 2 |
| Gone with no equivalent anywhere | 20 |
| Infrastructure module, removed | 6 |

The manifest declared **87** abstract names before the port and declares **83** after.

## Renames

Each of these is an import change in a single adapter file. The abstract name does not move — that is the
point of having one.

| Abstract name | PrimeReact 10 | PrimeReact 11 |
| --- | --- | --- |
| `dropdown` | `Dropdown` | `Select` |
| `calendar` | `Calendar` | `DatePicker` |
| `overlayPanel` | `OverlayPanel` | `Popover` |
| `sidebar` | `Sidebar` | `Drawer` |
| `toggleSwitch` | `InputSwitch` | `ToggleSwitch` |
| `tabView` | `TabView` + `TabPanel` | `Tabs` |
| `inputTextarea` | `InputTextarea` | `Textarea` |
| `password` | `Password` | `InputPassword` |
| `chips` | `Chips` | `InputTags` |
| `colorPicker` | `ColorPicker` | `InputColor` |
| `galleria` | `Galleria` | `Gallery` |
| `scrollPanel` | `ScrollPanel` | `ScrollArea` |
| `selectButton` | `SelectButton` | `ToggleButtonGroup` |

Note how many abstract names already matched the v11 name — `toggleSwitch`, `selectButton`. That is not
luck. A Scene name follows what a component *is*, not what one library calls it this major version, so the
abstract vocabulary tends to survive a rename that the library's own does not.

A rename is rarely only an import, because **v11 is compositional**. `primereact/select` exports
`Select.Root` / `Trigger` / `Value` / `Portal` / `Positioner` / `Popup` / `List` / `Option` and you
assemble them:

```tsx
import { Select } from 'primereact/select';

<Select.Root value={value} options={options} optionLabel='label' optionValue='value'
             onValueChange={(event) => setValue(event.value)}>
    <Select.Trigger>
        <Select.Value placeholder='Select' />
        <Select.Arrow />
    </Select.Trigger>
    <Select.Portal>
        <Select.Positioner>
            <Select.Popup>
                <Select.List />
            </Select.Popup>
        </Select.Positioner>
    </Select.Portal>
</Select.Root>
```

## Names that lost their component

Twenty of the modules this package imported are gone from v11 with no rename and no equivalent. Every one
was decided deliberately; none was left declared-but-unimplemented.

### Built as Cratis-owned components

The component is gone, the abstract name is worth keeping, so this package now owns a small
implementation. Each is a real component in this package's source, not a stub.

| Abstract name | Built as | Notes |
| --- | --- | --- |
| `menubar` | `menu/Menubar.tsx` | Follows the pattern `@cratis/components` used for its own `ActionMenubar`. |
| `megaMenu` | `menu/MegaMenu.tsx` | A menubar whose panel lays children out in columns. |
| `tieredMenu` | `menu/TieredMenu.tsx` | Vertical menu with submenus opening to the side. |
| `panelMenu` | `menu/PanelMenu.tsx` | Accordion-style vertical menu. |
| `tabMenu` | `menu/TabMenu.tsx` | Tab-styled horizontal navigation. |
| `steps` | `menu/Steps.tsx` | Read-only numbered progress indicator, distinct from the interactive `stepper`. |
| `dock` | `menu/Dock.tsx` | Icon dock anchored to an edge. |
| `splitButton` | `button/SplitButton.tsx` | Primary action plus a popover menu. |
| `confirmDialog` | `overlay/ConfirmDialog.tsx` | Composed from v11's `Dialog` + `Button`. The v10 imperative `confirmDialog()` service API is not carried over. |
| `column` | `data/Column.tsx` | A declaration the table reads. v10 extras (`editor`, `frozen`, `footer`, `colSpan`, `expander`) are not carried over. |
| `treeSelect` | `form/TreeSelect.tsx` | `Popover` + `Tree`. Single selection only; no checkbox multi-select, no filtering. |
| `blockUI` | `misc/BlockUI.tsx` | Overlay with `aria-busy`. |
| `scrollTop` | `misc/ScrollTop.tsx` | Threshold button; removes its scroll listener on unmount. |
| `image` | `media/Image.tsx` | `<img>` with optional click-to-preview. |

### Converted to headless hooks

`orderlist` and `picklist` survive in `@primereact/headless` but ship no presentation, so this package
renders them.

| Abstract name | Hook |
| --- | --- |
| `orderList` | `useOrderList` from `@primereact/headless/orderlist` |
| `pickList` | `usePickList` from `@primereact/headless/picklist` |

### Re-expressed over another component

| Abstract name | Now | Notes |
| --- | --- | --- |
| `multiSelect` | `Select` with `multiple` | v11's `Select` does take a `multiple` prop (`SelectRootProps`, `@primereact/types` 11.1.0). v11 renders the selection through its value slot, so v10's `display` / `maxSelectedLabels` comma-and-chip modes and label collapse are gone. |

### Dropped from the manifest

Four names no longer exist in this package. `validatePackageBundle` still passes because they were removed
from the manifest and the registry together.

| Dropped name | Why | Use instead |
| --- | --- | --- |
| `cascadeSelect` | Removed from v11 with no equivalent and no headless hook. A faithful replacement is a substantial component in its own right. | `dropdown` with grouped options, or `treeSelect` for a hierarchy. |
| `inputMask` | Exists in neither `primereact/*` nor `@primereact/headless/*`. | `inputText` with validation. |
| `treeTable` | Removed from v11 with no equivalent and no headless hook. | `tree` for hierarchy, `dataTable` for tabular data. |
| `virtualScroller` | Removed from v11 with no equivalent. | `dataTable`'s own scrolling for long lists. |

### Infrastructure modules

Six imports were not components at all and are gone from v11: `api`, `menuitem`, `treenode`, `resources`,
`images` and `stepperpanel`.

Two of them carried **types** ten adapters shared, so those types are Scene's now:

- `MenuItem` — was `primereact/menuitem`, now `MenuItem.ts` in this package.
- `TreeNode` — was `primereact/treenode`, now `TreeNode.ts` in this package.

Owning them is the better arrangement rather than a consolation: the authored `{ label, icon, items }`
shape is Scene's vocabulary — it is what a `.play` file writes — and never needed to be defined by
whichever component library happened to render it. It also means a Cratis-owned replacement for a removed
PrimeReact menu takes the same items the PrimeReact-backed ones do.

## Theming was rebuilt, not ported

This was the long pole of the migration, and nothing of the v10 mechanism survived.

**PrimeReact 11 ships zero CSS.** There is no `primereact/resources` directory: no
`resources/themes/<name>/theme.css`, no `resources/primereact.css`. A look comes from a `@primeuix/themes`
preset handed to `PrimeReactProvider`, which `@primeuix/styled` turns into `--p-*` custom properties at
runtime.

What that removed from this package:

- `applyPrimeReactTheme` — swapped the theme `<link>` element. Gone; there is no stylesheet to swap.
- `primeReactThemeStylesheet` — resolved a theme name to a CSS path. Gone; replaced by
  `primeReactThemePreset`, which resolves a theme name to a preset **object**.

`usePrimeReactTheme` survives by name and is considerably less machinery: it returns the configuration
`PrimeReactProvider` needs, and switching theme is re-rendering a provider rather than locating a `<link>`,
rewriting one path segment of its URL and swapping in a replacement element. Nothing is fetched, so there
is no unstyled flash on switch and no way for a theme to 404.

```tsx
const [theme, setTheme] = useState(primeReactTheme('lara-light-blue'));
const configuration = usePrimeReactTheme(theme);

return (
    <PrimeReactProvider value={configuration}>
        <SceneThemeProvider theme={theme}>{children}</SceneThemeProvider>
    </PrimeReactProvider>
);
```

The catalog changed shape too — 25 v10 themes became 24 built on four preset families. See
[Theme reference](./theme-reference.md) for the full list, the attribution table, and the themes that did
not survive.

### The token bridge got simpler

`primeReactTheme.css` is the seam between Scene's `--scene-*` tokens and PrimeReact's own, and the port
made it **smaller**.

In v10 the right-hand side of each mapping was whatever the theme's SCSS happened to call it, so the bridge
had to know an ad-hoc vocabulary: `--primary-color` but `--primary-color-text`, `--surface-ground` but
`--surface-card`, `--highlight-bg` but `--highlight-text-color`, `--text-color-secondary`,
`--border-radius`. Those names shared no scheme and could only be learned by reading compiled stylesheets.

In v11 `@primeuix/styled` emits one flat, systematic `--p-*` namespace derived from the preset's token
paths, so every mapping is the same mechanical `token.path` → `--p-token-path` transformation:

```css
:root {
    --scene-primary-color: var(--p-primary-color);
    --scene-surface-card: var(--p-content-background);
    --scene-text-muted-color: var(--p-text-muted-color);
    /* … */
}
```

This is the mechanism the bridge always assumed. It just finally exists.

## Licensing

PrimeReact 10 was MIT. PrimeReact 11 is not, and neither is anything around it:

| Package | v10 | v11 |
| --- | --- | --- |
| `primereact` | MIT | PrimeUI commercial |
| `primeicons` | MIT (7.x) | PrimeUI commercial (8.x) |
| `@primereact/core`, `@primereact/headless` | — | PrimeUI commercial |
| `@primeuix/themes`, `@primeuix/styled` | — | PrimeUI commercial |

**A key is required regardless of how you style.** The check runs in `PrimeReactProvider` on mount, with an
empty dependency array and no condition on `unstyled`, on `theme`, or on `NODE_ENV`. Without a valid key
you get a console warning and a fixed *"Invalid PrimeUI License"* banner, in development **and**
production.

- **[Community License](https://primeui.dev/licenses/community)** — free for individuals, students,
  non-profits and non-commercial open source. For organizations: under $1M USD annual gross revenue, fewer
  than 5 developers, fewer than 10 employees, under $3M USD outside funding. Up to 4 developers, renewed
  annually.
- **[Commercial License](https://primeui.dev/licenses/commercial)** — per developer, perpetual, one year of
  updates.

If you publish a library or tool others build with, read v11's restrictions clause — *"Redistributing the
software so that third parties can develop with it requires a separate OEM License"* — and check your
position with PrimeTek. Nothing here is legal advice.

`@cratis/components` 2.x remains on PrimeReact 10 and is fully MIT, for projects where a commercial
dependency is not acceptable.
