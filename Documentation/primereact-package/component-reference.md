---
title: Component reference
description: Every abstract component name the PrimeReact package declares, the adapter that implements it, and what backs it in PrimeReact 11.
---

**83** abstract names across ten families. Every name is `lowerCamelCase`; every registry key is
`PrimeReact:<name>`.

The **Backed by** column is generated from the adapters' own imports — followed one level into a sibling
component, so a name that delegates still reports what it really builds on. It cannot drift from what the
code does. Three kinds of entry appear:

- a `primereact/*` module — the name maps onto a real PrimeReact 11 component;
- a `@primereact/headless/*` hook marked **(headless)** — v11 ships the behavior but no presentation, so
  this package renders it;
- **Cratis-owned** — PrimeReact 11 removed the component outright and this package implements it. Such a
  name may still list `primereact/*` modules: an owned replacement is usually composed from surviving v11
  primitives (`confirmDialog` is built from `Dialog` and `Button`). See
  [the migration record](./primereact-11-migration.md#names-that-lost-their-component).

## Form

| Name | Adapter | Backed by |
| --- | --- | --- |
| `inputText` | `form/PrimeInputText.tsx` | `primereact/inputtext` |
| `inputTextarea` | `form/PrimeInputTextarea.tsx` | `primereact/textarea` |
| `inputNumber` | `form/PrimeInputNumber.tsx` | `primereact/inputnumber` |
| `password` | `form/PrimePassword.tsx` | `primereact/inputpassword` |
| `floatLabel` | `form/PrimeFloatLabel.tsx` | `primereact/floatlabel`, `primereact/inputtext` |
| `iconField` | `form/PrimeIconField.tsx` | `primereact/iconfield`, `primereact/inputtext` |
| `dropdown` | `form/PrimeDropdown.tsx` | `primereact/select` |
| `multiSelect` | `form/PrimeMultiSelect.tsx` | `primereact/select` |
| `listBox` | `form/PrimeListBox.tsx` | `primereact/listbox` |
| `selectButton` | `form/PrimeSelectButton.tsx` | `primereact/togglebutton`, `primereact/togglebuttongroup` |
| `checkbox` | `form/PrimeCheckbox.tsx` | `primereact/checkbox` |
| `radioButton` | `form/PrimeRadioButton.tsx` | `primereact/radiobutton` |
| `toggleSwitch` | `form/PrimeToggleSwitch.tsx` | `primereact/toggleswitch` |
| `slider` | `form/PrimeSlider.tsx` | `primereact/slider` |
| `rating` | `form/PrimeRating.tsx` | `primereact/rating` |
| `knob` | `form/PrimeKnob.tsx` | `primereact/knob` |
| `calendar` | `form/PrimeCalendar.tsx` | `primereact/datepicker`, `primereact/inputtext` |
| `colorPicker` | `form/PrimeColorPicker.tsx` | `primereact/inputcolor` |
| `chips` | `form/PrimeChips.tsx` | `primereact/inputtags` |
| `autoComplete` | `form/PrimeAutoComplete.tsx` | `primereact/autocomplete` |
| `treeSelect` | `form/PrimeTreeSelect.tsx` | `primereact/popover`, `primereact/tree` + **Cratis-owned** |

## Button

| Name | Adapter | Backed by |
| --- | --- | --- |
| `button` | `button/PrimeButton.tsx` | `primereact/button` |
| `splitButton` | `button/PrimeSplitButton.tsx` | `primereact/button`, `primereact/popover` + **Cratis-owned** |
| `speedDial` | `button/PrimeSpeedDial.tsx` | `primereact/speeddial` |
| `buttonGroup` | `button/PrimeButtonGroup.tsx` | `primereact/button`, `primereact/buttongroup` |

## Data

| Name | Adapter | Backed by |
| --- | --- | --- |
| `dataTable` | `data/PrimeDataTable.tsx` | `primereact/datatable` |
| `table` | `data/PrimeDataTable.tsx` | `primereact/datatable` |
| `column` | `data/PrimeColumn.tsx` | **Cratis-owned** |
| `dataView` | `data/PrimeDataView.tsx` | `primereact/dataview`, `primereact/paginator` |
| `tree` | `data/PrimeTree.tsx` | `primereact/tree` |
| `timeline` | `data/PrimeTimeline.tsx` | `primereact/timeline` |
| `paginator` | `data/PrimePaginator.tsx` | `primereact/paginator` |
| `orderList` | `data/PrimeOrderList.tsx` | `@primereact/headless/orderlist` (headless) |
| `pickList` | `data/PrimePickList.tsx` | `@primereact/headless/picklist` (headless) |
| `organizationChart` | `data/PrimeOrganizationChart.tsx` | `primereact/organizationchart` |

## Panel

| Name | Adapter | Backed by |
| --- | --- | --- |
| `card` | `panel/PrimeCard.tsx` | `primereact/card` |
| `panel` | `panel/PrimePanel.tsx` | `primereact/panel` |
| `accordion` | `panel/PrimeAccordion.tsx` | `primereact/accordion` |
| `fieldset` | `panel/PrimeFieldset.tsx` | `primereact/fieldset` |
| `divider` | `panel/PrimeDivider.tsx` | `primereact/divider` |
| `splitter` | `panel/PrimeSplitter.tsx` | `primereact/splitter` |
| `scrollPanel` | `panel/PrimeScrollPanel.tsx` | `primereact/scrollarea` |
| `tabView` | `panel/PrimeTabView.tsx` | `primereact/tabs` |
| `toolbar` | `panel/PrimeToolbar.tsx` | `primereact/toolbar` |
| `stepper` | `panel/PrimeStepper.tsx` | `primereact/button`, `primereact/stepper` |

## Overlay

| Name | Adapter | Backed by |
| --- | --- | --- |
| `dialog` | `overlay/PrimeDialog.tsx` | `primereact/button`, `primereact/dialog` |
| `confirmDialog` | `overlay/PrimeConfirmDialog.tsx` | `primereact/button`, `primereact/dialog` + **Cratis-owned** |
| `overlayPanel` | `overlay/PrimeOverlayPanel.tsx` | `primereact/button`, `primereact/popover` |
| `sidebar` | `overlay/PrimeSidebar.tsx` | `primereact/button`, `primereact/drawer` |
| `tooltip` | `overlay/PrimeTooltip.tsx` | `primereact/tooltip` |

## Menu

| Name | Adapter | Backed by |
| --- | --- | --- |
| `menu` | `menu/PrimeMenu.tsx` | `primereact/menu` |
| `menubar` | `menu/PrimeMenubar.tsx` | **Cratis-owned** |
| `breadcrumb` | `menu/PrimeBreadcrumb.tsx` | `primereact/breadcrumb` |
| `tabMenu` | `menu/PrimeTabMenu.tsx` | **Cratis-owned** |
| `steps` | `menu/PrimeSteps.tsx` | **Cratis-owned** |
| `tieredMenu` | `menu/PrimeTieredMenu.tsx` | **Cratis-owned** |
| `panelMenu` | `menu/PrimePanelMenu.tsx` | `primereact/accordion` + **Cratis-owned** |
| `contextMenu` | `menu/PrimeContextMenu.tsx` | `primereact/contextmenu` |
| `megaMenu` | `menu/PrimeMegaMenu.tsx` | **Cratis-owned** |
| `dock` | `menu/PrimeDock.tsx` | **Cratis-owned** |

## Messages

| Name | Adapter | Backed by |
| --- | --- | --- |
| `message` | `messages/PrimeMessage.tsx` | `primereact/message` |
| `inlineMessage` | `messages/PrimeInlineMessage.tsx` | `primereact/message` |
| `toast` | `messages/PrimeToast.tsx` | `primereact/toast`, `primereact/toaster` |

## Media

| Name | Adapter | Backed by |
| --- | --- | --- |
| `image` | `media/PrimeImage.tsx` | `primereact/dialog` + **Cratis-owned** |
| `galleria` | `media/PrimeGalleria.tsx` | `primereact/gallery` |
| `carousel` | `media/PrimeCarousel.tsx` | `primereact/carousel` |

## Misc

| Name | Adapter | Backed by |
| --- | --- | --- |
| `avatar` | `misc/PrimeAvatar.tsx` | `primereact/avatar` |
| `badge` | `misc/PrimeBadge.tsx` | `primereact/badge` |
| `chip` | `misc/PrimeChip.tsx` | `primereact/chip` |
| `tag` | `misc/PrimeTag.tsx` | `primereact/tag` |
| `progressBar` | `misc/PrimeProgressBar.tsx` | `primereact/progressbar` |
| `progressSpinner` | `misc/PrimeProgressSpinner.tsx` | `primereact/progressspinner` |
| `skeleton` | `misc/PrimeSkeleton.tsx` | `primereact/skeleton` |
| `scrollTop` | `misc/PrimeScrollTop.tsx` | `primereact/button` + **Cratis-owned** |
| `blockUI` | `misc/PrimeBlockUI.tsx` | **Cratis-owned** |
| `inplace` | `misc/PrimeInplace.tsx` | `primereact/inplace` |
| `terminal` | `misc/PrimeTerminal.tsx` | `primereact/terminal` |

## Screen directives

| Name | Adapter | Backed by |
| --- | --- | --- |
| `text` | `screen/PrimeText.tsx` | _renders plain markup_ |
| `title` | `screen/PrimeTitle.tsx` | _renders plain markup_ |
| `field` | `screen/PrimeField.tsx` | _renders plain markup_ |
| `section` | `screen/PrimeSection.tsx` | `primereact/divider` |
| `summary` | `screen/PrimeSummary.tsx` | `primereact/card` |
| `action` | `screen/PrimeAction.tsx` | `primereact/button` |

## Names that are no longer declared

Four names were dropped in the PrimeReact 11 migration, because v11 removed the component with no
equivalent and no headless hook to rebuild it from. `validatePackageBundle` still passes — they were
removed from the manifest and the registry together.

| Dropped name | Use instead |
| --- | --- |
| `cascadeSelect` | `dropdown` with grouped options, or `treeSelect` for a hierarchy |
| `inputMask` | `inputText` with validation |
| `treeTable` | `tree` for hierarchy, `dataTable` for tabular data |
| `virtualScroller` | `dataTable`'s own scrolling for long lists |

## Not covered

| Component | Why |
| --- | --- |
| `chart` | PrimeReact's `Chart` is a thin wrapper over Chart.js and does nothing without `chart.js` installed and a full Chart.js configuration object. Adding a charting library as a dependency of a component-mapping package is out of scope; charting deserves its own Scene package with its own vocabulary. |
| `editor` | `Editor` wraps Quill and needs `quill` installed. Same reasoning — a rich-text editor is a product decision, not a mapping. |

Both are genuinely useful and both are deliberate omissions, not oversights. A profile needing them should
activate a package that owns that dependency.

Also worth knowing: `column` renders nothing on its own. That is deliberate — since PrimeReact 11 removed
`primereact/column`, `column` is a Cratis-owned declaration component that returns `null`, and the table
reads its `field`/`header`/`sortable` off the *model* (`element.slots`) rather than the rendered node.
Nesting a `column` element under `dataTable` or `table` is what gives it meaning.
