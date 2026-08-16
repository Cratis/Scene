---
title: Component reference
description: Every abstract name Cratis.Components declares, the @cratis/components component behind it, and the properties and slots it reads.
---

Every name `Cratis.Components` declares, the `@cratis/components` component behind it, and the properties and
slots it reads. Registry keys are `Cratis.Components:<name>`.

A property whose value is absent or of the wrong type falls back to the component's own default rather than
being forced through — `title: 42` renders an empty title, not `"42"`. Names marked **binding** are looked up
in the [binding registry](binding-registry.md); an unresolved one renders a placeholder.

## Pages

| Name | Wraps | Properties | Slots |
|---|---|---|---|
| `page` | `Page` | `title`, `showTitle`, `panel` | `content` |
| `dataPage` | `DataPage` | **`query`** (binding), `title`, `emptyMessage`, `dataKey`, `globalFilterFields`, `clientFiltering` | `content` |
| `formElement` | `FormElement` | `icon` (icon class name) | `icon`, `content` |

`formElement` takes its addon from the `icon` slot when there is one, and from the `icon` property otherwise
— a slot is the more specific statement, so it wins.

## Data

| Name | Wraps | Properties | Slots |
|---|---|---|---|
| `dataTable` | `DataTableForQuery` | **`query`** (binding), `emptyMessage`, `dataKey`, `globalFilterFields`, `clientFiltering`, `className` | `content` |
| `table` | `DataTableForQuery` | Same as `dataTable` | `content` |
| `observableDataTable` | `DataTableForObservableQuery` | Same as `dataTable` | `content` |

Columns come from the `content` slot. `table` is the same component as `dataTable` under the bare name — see
[naming and shadowing](naming-and-shadowing.md). `observableDataTable` is a separate name because the
distinction lives in the registered proxy, not the configuration: an observable query opens a subscription
and re-renders when the read model changes.

## Forms

| Name | Wraps | Properties | Slots |
|---|---|---|---|
| `commandForm` | `AutoCommandForm` | **`command`** (binding), `exclude` | — |

`AutoCommandForm` generates its fields from the command's own property descriptors, so the form follows the
command rather than going stale when a property is added on the backend. `exclude` keeps it from generating a
second copy of anything placed by hand.

### Field types

Every field takes the same three properties, plus its own:

| Property | Meaning |
|---|---|
| `property` | **Required.** The command property this field binds to. Without it the field renders a placeholder rather than a field bound to nothing. |
| `title` | The label. Defaults to the property name, so a field is legible before anyone writes one. |
| `description` | Helper text under the input. |

| Name | Wraps | Own properties |
|---|---|---|
| `inputTextField` | `InputTextField` | `type` (`text`, `email`, `password`, `color`, `date`, `datetime-local`, `time`, `url`, `tel`, `search`), `placeholder`, `className` |
| `numberField` | `NumberField` | `placeholder`, `min`, `max`, `step`, `className` |
| `checkboxField` | `CheckboxField` | `label`, `className` |
| `textAreaField` | `TextAreaField` | `placeholder`, `rows`, `cols`, `className` |
| `dropdownField` | `DropdownField` | `options`, `optionLabel`, `optionValue`, `placeholder`, `className` |
| `sliderField` | `SliderField` | `min`, `max`, `step`, `className` |
| `calendarField` | `CalendarField` | `placeholder`, `dateFormat`, `showIcon`, `showTime`, `hourFormat` (`12`, `24`), `className` |
| `colorPickerField` | `ColorPickerField` | `inline`, `defaultColor`, `className` |
| `multiSelectField` | `MultiSelectField` | `options`, `optionLabel`, `optionValue`, `placeholder`, `display` (`comma`, `chip`), `maxSelectedLabels`, `filter`, `showClear`, `className` |
| `chipsField` | `ChipsField` | `placeholder`, `max`, `separator`, `addOnBlur`, `allowDuplicate`, `className` |
| `radioButtonField` | `RadioButtonField` | `buttonValue`, `label`, `className` |
| `radioGroupField` | `RadioGroupField` | `options`, `optionLabel`, `optionValue`, `layout` (`horizontal`, `vertical`), `className` |

`options` is a list of objects; `optionLabel` and `optionValue` name the keys to read from each, defaulting
to `label` and `value`.

```json
{
    "property": "status",
    "title": "Status",
    "options": [
        { "label": "Draft", "value": "draft" },
        { "label": "Approved", "value": "approved" }
    ]
}
```

## Dialogs

| Name | Wraps | Properties | Slots |
|---|---|---|---|
| `dialog` | `Dialog` | `title`, `visible`, `width`, `resizable`, `isValid`, `isBusy`, `okLabel`, `cancelLabel`, `className` | `content` |
| `confirmationDialog` | `ConfirmationDialog` | — | — |
| `busyIndicatorDialog` | `BusyIndicatorDialog` | `title`, `message` | — |
| `commandDialog` | `CommandDialog` | **`command`** (binding), `title`, `visible`, `width`, `resizable`, `okLabel`, `cancelLabel`, `className` | `content` |
| `stepperCommandDialog` | `StepperCommandDialog` | **`command`** (binding), `title`, `visible`, `width`, `linear`, `orientation`, `okLabel`, `nextLabel`, `previousLabel`, `showCancel`, `cancelLabel` | `content` |

`visible` defaults to `true` — a dialog placed on a screen is being placed to be seen; a host that controls
visibility sets the property explicitly.

`confirmationDialog` takes no properties by design. It is not a dialog a screen configures; it is the host
that renders whatever confirmation the running application asked for through Arc's dialog service. Place it
once, near the root.

Prefer `commandDialog` over composing `dialog` with `commandForm`: a hand-composed pair has no way to keep
the dialog open on a rejected command without reimplementing the protocol.

## Common

| Name | Wraps | Properties | Slots |
|---|---|---|---|
| `icon` | `IconDisplay` | `icon`, `className` | — |
| `tooltip` | `Tooltip` | `content`, `position` (`top`, `right`, `bottom`, `left`), `disabled` | `content` |
| `dropdown` | `Dropdown` | `options`, `optionLabel`, `optionValue`, `placeholder`, `disabled`, `showClear`, `filter`, `className` | — |
| `errorBoundary` | `ErrorBoundary` | — | `content` |

`icon` normalizes the shorthand forms people write — `pi-check` on its own, or a bare name — into the class
PrimeIcons expects. `dropdown` is the standalone control; use `dropdownField` inside a `commandForm`.

## Editors

| Name | Wraps | Properties | Slots |
|---|---|---|---|
| `objectContentEditor` | `ObjectContentEditor` | `object`, `schema`, `editMode`, `className` | — |
| `objectNavigationalBar` | `ObjectNavigationalBar` | `navigationPath`, `className` | — |
| `schemaEditor` | `SchemaEditor` | `schema`, `eventTypeName`, `canEdit`, `canNotEditReason`, `editMode`, `className` | — |
| `timeMachine` | `TimeMachine` | `versions`, `currentVersionIndex`, `scrollSensitivity` | — |
| `filterPanel` | `FilterPanel` | `label`, `filters`, `searchPlaceholder` | `content` |

`versions` entries take `id`, `label`, `timestamp` (ISO string or epoch number) and `content`; entries
missing any of the first three are dropped. `filters` entries take `key`, `label`, `type`, `multi`,
`options`, `searchable`, `searchPlaceholder` and `buckets`; entries without a `key` and a `label` are
dropped.

`filterPanel` renders its own toggle button as well as the panel, because `FilterPanel` is a portal anchored
to a button and cannot be placed on its own. `label` names that button and defaults to `Filters`.

## Toolbar

| Name | Wraps | Properties | Slots |
|---|---|---|---|
| `toolbar` | `Toolbar` | `orientation` (`vertical`, `horizontal`), `draggable` | `content` |
| `toolbarButton` | `ToolbarButton` | `icon`, `text`, `title`, `active`, `tooltipPosition` | — |
| `toolbarGroup` | `ToolbarGroup` | `slotName`, `orientation` | `content` |
| `toolbarSeparator` | `ToolbarSeparator` | `orientation` | — |

`draggable` belongs on the toolbar rather than each button — it is a property of the palette, and setting it
per button is how you end up with a palette that is half draggable. `toolbarButton`'s `title` is both the
tooltip and the accessible name, and defaults to `text` so an icon-only button is never nameless.

## Where to go next

- [The binding registry](binding-registry.md) — how the binding properties resolve.
- [What this package does not cover](coverage.md) — the deliberate omissions.
