---
title: Component reference
description: Every abstract component name the PrimeReact package declares, the adapter that implements it, and what backs it in PrimeReact 11.
---

**89** abstract names across eleven families. Every name is `lowerCamelCase`; every registry key is
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
| `multiStateCheckbox` | `form/PrimeMultiStateCheckbox.tsx` | **Cratis-owned** native accessible control |
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
| `editor` | `editor/PrimeEditor.tsx` | **Cratis-owned**; Quill supplied by the host, see [Rich text and Quill](#rich-text-and-quill) |

## File

| Name | Adapter | Backed by |
| --- | --- | --- |
| `fileUpload` | `file/PrimeFileUpload.tsx` | `primereact/fileupload`; host upload handler and origin policy, see [File upload](#file-upload) |

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
| `dataScroller` | `data/PrimeDataScroller.tsx` | **Cratis-owned** progressive list, see [Data scroller and tree table](#data-scroller-and-tree-table) |
| `tree` | `data/PrimeTree.tsx` | `primereact/tree` |
| `treeTable` | `data/PrimeTreeTable.tsx` | **Cratis-owned** ARIA tree grid, see [Data scroller and tree table](#data-scroller-and-tree-table) |
| `timeline` | `data/PrimeTimeline.tsx` | `primereact/timeline` |
| `paginator` | `data/PrimePaginator.tsx` | `primereact/paginator` |
| `orderList` | `data/PrimeOrderList.tsx` | `@primereact/headless/orderlist` (headless) |
| `pickList` | `data/PrimePickList.tsx` | `@primereact/headless/picklist` (headless) |
| `organizationChart` | `data/PrimeOrganizationChart.tsx` | `primereact/organizationchart` |

## Chart

| Name | Adapter | Backed by |
| --- | --- | --- |
| `chart` | `chart/PrimeChart.tsx` | `chart.js` optional peer + **Cratis-owned** lifecycle adapter |

Hosts that render `chart` must install `chart.js@^4.5.1`; it is an optional peer only for hosts that never
render one. The component accepts the canonical string Chart.js types, the numeric values and Pascal case names
from the earlier .NET chart enum, and reports any other type instead of drawing a different chart.

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
| `virtualScroller` | `dataTable`'s own scrolling for long lists |

## Rich text and Quill

The `editor` control never imports `quill`. The package root has no reference to it, so an application that
renders no rich text builds without `quill` installed. Editing is something the host switches on:

```tsx
import 'quill/dist/quill.snow.css';
import { QuillLoaderProvider } from '@cratis/scene.primereact';
import { loadQuill } from '@cratis/scene.primereact/quill';

<QuillLoaderProvider loader={loadQuill}>{screen}</QuillLoaderProvider>
```

A host that does this installs `quill@^2.0.3` (an optional peer dependency, needed only because that entry point
imports it) and Quill's stylesheet. `loadQuill` is just `() => import('quill')`, so a host can also pass its own
loader. Define the loader at module level: the editor is rebuilt when it changes.

Without a loader, or when it fails, the editor shows its content read-only and says why. It never shows an
editable-looking control that cannot edit.

Authored HTML is untrusted data and is never injected as markup, whether it is shown read-only or loaded into
Quill. It goes through an allowlist first: paragraphs, headings, lists, quotes, code, the basic inline
formats, links to `http`, `https`, `mailto`, `tel` or a relative address, and base64 PNG, JPEG, GIF or WebP
images. Script, style, SVG, frames and forms are removed with their content; event handlers, `style`, `srcdoc`
and every other URL scheme are dropped. A remote image is not shown, because rendering it would contact a server
the author named. Where there is no DOM (server rendering, and the first client render so hydration matches) the
content is shown as plain text. The value on the element is never changed.

Edits are runtime state. `change` behaviors run when the user edits, but the new HTML is not written back to the
document or a binding. `readOnly: true` and `isEnabled: false` both stop editing.

## File upload

`fileUpload` posts files only where the host allows. The authored `url` is untrusted: it must be a relative
address or have the page's own origin, use `http` or `https`, and carry no user information, whitespace or
backslashes. Any other address is refused, shown as an alert, and blocks uploading - the host's handler included.

```tsx
<FileUploadHandlerProvider
    handler={async (files, url) => { /* the host owns the effect */ }}
    allowedOrigins={['https://files.example.com']}>
    {screen}
</FileUploadHandlerProvider>
```

Both props are optional. `allowedOrigins` names the other origins an address may use. Without a `handler` the
control posts the files itself with `fetch`: cookies go to the page's own origin only (a request to an allowed
other origin carries no credentials), and a redirect fails the upload instead of being followed. The handler
receives only an address the policy accepted.

Nothing is requested when the control mounts. `multiple: false` is enforced for the file input and for drag and
drop before any file is accepted. One upload runs at a time, a failure is shown and the selection is kept so it
can be retried, and a disabled element disables the picker, the upload button and the drop zone. `mode` accepts
`advanced`, `basic` and `auto`, the ordinals `0` to `2` and the Pascal case names of the original enum; anything
else is reported. The descriptor lists the same three forms as choices, so a stored value is never flagged invalid while it still draws.

## Data scroller and tree table

`dataScroller` and `treeTable` read their data natively:

- `dataScroller` `items` are strings, numbers or records (a record is titled by its `label`, `title`, `name`,
  `text` or `header` field and its other fields follow, readably). Child elements authored in the `items` (or
  `content`) slot are entries too. `inline: true` scrolls inside the control, `scrollHeight` pixels tall (320 when
  omitted); `inline: false` loads as the page scrolls the end of the list into view. "Load more" remains for the
  keyboard.
- `treeTable` `items` are nodes: strings, numbers, or records with `key` (a string or a number), `label`, `data`,
  `children`, `expanded` and `selectable`. Columns come from nested `column` elements, a `columns` property
  (objects with `field` and `header`, or plain field names) or the fields of the first row, as for `dataTable`.
  `selectionMode` accepts `none`, `single`, `multiple` and `checkbox`, the ordinals `0` to `3` and the Pascal case
  names. `selection` accepts a key, an array of keys or `{ key }` objects, or PrimeReact's key map. In checkbox
  mode a parent checks and unchecks its subtree and shows a partial state. The table is an ARIA `treegrid` with
  arrow-key navigation.

Both follow their authored properties: a changed `selection`, `rows` or `items` is applied, while an unrelated edit
leaves what the user did alone. Both show an empty-state message (`emptyLabel`).

### Legacy elements are not converted at runtime

In the original model `ItemsControl.Items` and `TreeTable.Columns` held UI elements, not data. Scene has no
runtime adapter for those. An entry that is a serialized legacy element (it carries `_derivedTypeId`) is refused
visibly rather than listed as if its fields were rows. The production prototypes carry these collections empty,
so nothing existing is affected; a non-empty one must be converted before it reaches Scene. A migration tool
converts it to the canonical slots:

| Legacy | Canonical |
| --- | --- |
| `DataScroller.Items[i]` (a UI element) | The converted element, in order, as `slots.items[i]` of the `dataScroller` element. `properties.items` holds no element. |
| `TreeTable.Columns[i]` (a UI element) | A `column` element with the column's `field`, `header` and `sortable`, in order, as `slots.columns[i]`. |
| `TreeTable.Items[i]` (a UI element) | No canonical form. There is no legacy node type to map and no element can be a row, so a non-empty collection must be refused, not converted. |

A converter must validate the result at full fidelity: every legacy element accounted for exactly once, order
and element ids preserved, each converted element's type present in the package manifest, and nothing left behind
in `properties.items` or `properties.columns`. A collection it cannot map completely is a refusal in the offline
plan.

Also worth knowing: `column` renders nothing on its own. That is deliberate — since PrimeReact 11 removed
`primereact/column`, `column` is a Cratis-owned declaration component that returns `null`, and the table
reads its `field`/`header`/`sortable` off the _model_ (`element.slots`) rather than the rendered node.
Nesting a `column` element under `dataTable` or `table` is what gives it meaning.
