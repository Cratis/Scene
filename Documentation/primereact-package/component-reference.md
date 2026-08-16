---
title: Component reference
description: Every abstract component name the PrimeReact package declares, the PrimeReact 10 component behind it, and what is deliberately not covered.
---

87 abstract names across ten families. Every name is `lowerCamelCase`; every registry key is
`PrimeReact:<name>`.

## Form

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `inputText` | `InputText` | `primereact/inputtext` |
| `inputTextarea` | `InputTextarea` | `primereact/inputtextarea` |
| `inputNumber` | `InputNumber` | `primereact/inputnumber` |
| `password` | `Password` | `primereact/password` |
| `inputMask` | `InputMask` | `primereact/inputmask` |
| `floatLabel` | `FloatLabel` + `InputText` | `primereact/floatlabel`, `primereact/inputtext` |
| `iconField` | `IconField` + `InputIcon` + `InputText` | `primereact/iconfield`, `primereact/inputicon`, `primereact/inputtext` |
| `dropdown` | `Dropdown` | `primereact/dropdown` |
| `multiSelect` | `MultiSelect` | `primereact/multiselect` |
| `listBox` | `ListBox` | `primereact/listbox` |
| `selectButton` | `SelectButton` | `primereact/selectbutton` |
| `checkbox` | `Checkbox` | `primereact/checkbox` |
| `radioButton` | `RadioButton` | `primereact/radiobutton` |
| `toggleSwitch` | `InputSwitch` | `primereact/inputswitch` |
| `slider` | `Slider` | `primereact/slider` |
| `rating` | `Rating` | `primereact/rating` |
| `knob` | `Knob` | `primereact/knob` |
| `calendar` | `Calendar` | `primereact/calendar` |
| `colorPicker` | `ColorPicker` | `primereact/colorpicker` |
| `chips` | `Chips` | `primereact/chips` |
| `autoComplete` | `AutoComplete` | `primereact/autocomplete` |
| `treeSelect` | `TreeSelect` | `primereact/treeselect` |
| `cascadeSelect` | `CascadeSelect` | `primereact/cascadeselect` |

`radioButton` renders the whole group from its `options`, sharing one `name` so the browser enforces
exclusivity — a lone radio button is never what a screen means, the choice is the group.

`autoComplete` filters the authored `options` case-insensitively. PrimeReact asks the host for suggestions
through `completeMethod` because in a real application that is a server call, and a Scene element cannot
express one.

## Button

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `button` | `Button` | `primereact/button` |
| `splitButton` | `SplitButton` | `primereact/splitbutton` |
| `speedDial` | `SpeedDial` | `primereact/speeddial` |
| `buttonGroup` | `ButtonGroup` + `Button` | `primereact/buttongroup`, `primereact/button` |

`button` deliberately shares its name with `core` — see
[Understanding name resolution](./understanding-name-resolution.md).

## Data

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `dataTable` | `DataTable` + `Column` | `primereact/datatable`, `primereact/column` |
| `table` | `DataTable` + `Column` (the same adapter as `dataTable`) | `primereact/datatable`, `primereact/column` |
| `column` | `Column` | `primereact/column` |
| `dataView` | `DataView` | `primereact/dataview` |
| `tree` | `Tree` | `primereact/tree` |
| `treeTable` | `TreeTable` + `Column` | `primereact/treetable`, `primereact/column` |
| `timeline` | `Timeline` | `primereact/timeline` |
| `paginator` | `Paginator` | `primereact/paginator` |
| `orderList` | `OrderList` | `primereact/orderlist` |
| `pickList` | `PickList` | `primereact/picklist` |
| `organizationChart` | `OrganizationChart` | `primereact/organizationchart` |
| `virtualScroller` | `VirtualScroller` | `primereact/virtualscroller` |

A table works out its columns in order of how explicitly the screen stated them: nested `column` children
first, then a `columns` property, then the keys of the first row. That last step matters more than it looks
— a table given rows and no column configuration is the most common thing an author writes first, and
inferring the columns means it renders their data instead of an empty grid.

> [!NOTE]
> `column` renders nothing on its own. That is PrimeReact's own semantics — a bare `<Column/>` outside a
> `DataTable` renders nothing either. When nested under `dataTable` or `table`, the table reads its
> `field`, `header` and `sortable` off the **model** rather than the rendered node, because PrimeReact
> identifies its columns by React element type and a Scene adapter wrapping one would not be recognized.

`organizationChart` renders empty when no nodes are authored. PrimeReact's own `OrganizationChart` reads
the root node's `expanded` flag without checking there is a root and throws on an empty value; an element
whose data has not been authored yet is an ordinary state on a screen under construction, and taking the
whole screen down for it would be the wrong failure.

## Panel

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `card` | `Card` | `primereact/card` |
| `panel` | `Panel` | `primereact/panel` |
| `accordion` | `Accordion` + `AccordionTab` | `primereact/accordion` |
| `fieldset` | `Fieldset` | `primereact/fieldset` |
| `divider` | `Divider` | `primereact/divider` |
| `splitter` | `Splitter` + `SplitterPanel` | `primereact/splitter` |
| `scrollPanel` | `ScrollPanel` | `primereact/scrollpanel` |
| `tabView` | `TabView` + `TabPanel` | `primereact/tabview` |
| `toolbar` | `Toolbar` | `primereact/toolbar` |
| `stepper` | `Stepper` + `StepperPanel` + `Button` | `primereact/stepper`, `primereact/stepperpanel`, `primereact/button` |

`accordion`, `tabView`, `splitter` and `stepper` all pair a `headers` property with the `content` slot by
position — a screen puts as many children in the slot as it lists headers. This is for the same reason
`column` is read from the model: PrimeReact identifies these sections by React element type.

`stepper` renders its own Back and Next buttons. PrimeReact's `Stepper` advances only when something calls
`nextCallback`/`prevCallback` on its ref, and a stepper that cannot step is not a stepper.

`toolbar` takes `start`, `center` and `end` slots rather than properties, because what goes in them is other
components — buttons, a search field, a menu — not values.

## Overlay

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `dialog` | `Dialog` + `Button` | `primereact/dialog`, `primereact/button` |
| `confirmDialog` | `ConfirmDialog` + `Button` | `primereact/confirmdialog`, `primereact/button` |
| `overlayPanel` | `OverlayPanel` + `Button` | `primereact/overlaypanel`, `primereact/button` |
| `sidebar` | `Sidebar` + `Button` | `primereact/sidebar`, `primereact/button` |
| `tooltip` | `Tooltip` | `primereact/tooltip` |

Each of these renders its own trigger. An overlay is only interesting while it is open, and "the user
closed it" is state a Scene element has nowhere to record — so the adapter owns visibility locally and keeps
a way back. Without the trigger, dismissing a previewed dialog would leave a permanently blank spot.

## Menu

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `menu` | `Menu` | `primereact/menu` |
| `menubar` | `Menubar` | `primereact/menubar` |
| `breadcrumb` | `BreadCrumb` | `primereact/breadcrumb` |
| `tabMenu` | `TabMenu` | `primereact/tabmenu` |
| `steps` | `Steps` | `primereact/steps` |
| `tieredMenu` | `TieredMenu` | `primereact/tieredmenu` |
| `panelMenu` | `PanelMenu` | `primereact/panelmenu` |
| `contextMenu` | `ContextMenu` | `primereact/contextmenu` |
| `megaMenu` | `MegaMenu` | `primereact/megamenu` |
| `dock` | `Dock` | `primereact/dock` |

All ten read the same nested `{ label, icon, url, disabled, separator, items }` model to any depth, so one
authored menu can be shown as a menubar, a tiered menu or a dock without being restructured.

## Messages

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `message` | `Message`, full width | `primereact/message` |
| `inlineMessage` | `Message`, sized to content | `primereact/message` |
| `toast` | `Toast` | `primereact/toast` |

`message` and `inlineMessage` share one PrimeReact component but mean different things on a screen — one is
about a region, the other about the field beside it — and the width is the difference a reader sees.

`toast` shows its message once on mount from the element's own properties. PrimeReact's `Toast` is purely
imperative and renders nothing until someone calls `show`; a Scene element cannot make that call, so the
element reads as "this screen announces this" rather than as a component that renders nothing.

## Media

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `image` | `Image` | `primereact/image` |
| `galleria` | `Galleria` | `primereact/galleria` |
| `carousel` | `Carousel` | `primereact/carousel` |

`galleria` and `carousel` ship no default item template, so each adapter supplies one built from the fields
the element names. Without it every item renders empty and the component looks broken rather than
unconfigured.

## Misc

| Name | PrimeReact 10 component | Import |
| --- | --- | --- |
| `avatar` | `Avatar` | `primereact/avatar` |
| `badge` | `Badge` | `primereact/badge` |
| `chip` | `Chip` | `primereact/chip` |
| `tag` | `Tag` | `primereact/tag` |
| `progressBar` | `ProgressBar` | `primereact/progressbar` |
| `progressSpinner` | `ProgressSpinner` | `primereact/progressspinner` |
| `skeleton` | `Skeleton` | `primereact/skeleton` |
| `scrollTop` | `ScrollTop` | `primereact/scrolltop` |
| `blockUI` | `BlockUI` | `primereact/blockui` |
| `inplace` | `Inplace` + `InplaceDisplay` + `InplaceContent` | `primereact/inplace` |
| `terminal` | `Terminal` | `primereact/terminal` |

`progressBar` follows whether a `value` was given at all: progress you cannot measure is exactly what
indeterminate mode is for, so an element with no value animates rather than sitting at zero.

`terminal` accepts input and answers nothing until the hosting application subscribes to PrimeReact's
`TerminalService`. Responding to a command is application behavior, not something a Scene element can
express — this is the honest shape of a terminal with no backend, not a broken one.

## Screen

Screenplay's screen vocabulary, plus `text`.

| Name | Renders | PrimeReact 10 component |
| --- | --- | --- |
| `text` | a themed `<span>` | (none — written directly) |
| `title` | a real `<h1>`–`<h6>` at the authored level | (none — written directly) |
| `field` | a labeled value bound by `aria-labelledby` | (none — written directly) |
| `section` | a real `<section>` with a heading and a rule | `Divider` |
| `summary` | a description list of label/value pairs | `Card` |
| `action` | a button whose intent maps to a severity | `Button` |

`title` clamps its level to 1–6. Heading level is the document outline a screen reader navigates by, so it
is not a styling choice — and an out-of-range value must degrade to a valid heading, not an invalid tag.

`action` maps intent to severity in one place:

| `intent` | PrimeReact `severity` |
| --- | --- |
| `primary` | (default) |
| `secondary` | `secondary`, outlined |
| `destructive`, `danger` | `danger` |
| `positive`, `success` | `success` |

## Reading properties

Element properties arrive as untyped JSON. Every adapter narrows through the same readers, so a wrongly
typed property behaves exactly like a missing one instead of reaching PrimeReact and failing there:

```ts
import { arrayProperty, booleanProperty, numberProperty, optionsProperty, stringProperty } from '@cratis/scene.primereact';

stringProperty(element, 'label');                 // string | undefined
stringProperty(element, 'label', 'Save');         // string
booleanProperty(element, 'disabled', false);      // boolean
numberProperty(element, 'rows', 4);               // number
arrayProperty(element, 'items');                  // unknown[] - never undefined
optionsProperty(element, 'options');              // SelectOption[]
```

`optionsProperty` accepts both shapes an author might reasonably write — `['Draft', 'Published']` and
`[{ label: 'Draft', value: 'draft' }]` — and flattens them to one type. `numberProperty` rejects `NaN`
alongside non-numbers: it is a number by `typeof` but never a usable size, count or bound.

## Interactive state

PrimeReact's inputs are controlled, and a Scene element has nowhere to put "what the user has typed so far"
— `properties` is authored design-time configuration. Every interactive adapter therefore holds that state
locally, seeded from its properties. The consequence is deliberate: a preview is genuinely typeable rather
than frozen, and the value stays local to the rendered component rather than being pushed back into the
model.

## Deliberately not covered

| Component | Why |
| --- | --- |
| `chart` | PrimeReact's `Chart` is a thin wrapper over Chart.js and does nothing without `chart.js` installed and a full Chart.js configuration object. Adding a charting library as a dependency of a component-mapping package is out of scope, and charting deserves its own Scene package with its own vocabulary. |
| `editor` | `Editor` wraps Quill and needs `quill` installed. Same reasoning — a rich-text editor is a product decision, not a mapping. |

Both are genuinely useful, and both are omissions rather than oversights. A profile needing them should
activate a package that owns that dependency.

## Next

See [Theme reference](./theme-reference.md) for the themes, or
[Migrating to PrimeReact 11](./primereact-11-migration.md) for what changes when the version moves.
