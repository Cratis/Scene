// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDefaults } from '@primereact/types/core';
import { styles as accordion } from '@primereact/styles/accordion';
import { styles as autocomplete } from '@primereact/styles/autocomplete';
import { styles as avatar } from '@primereact/styles/avatar';
import { styles as avatarGroup } from '@primereact/styles/avatargroup';
import { styles as badge } from '@primereact/styles/badge';
import { styles as breadcrumb } from '@primereact/styles/breadcrumb';
import { styles as button } from '@primereact/styles/button';
import { styles as buttonGroup } from '@primereact/styles/buttongroup';
import { styles as card } from '@primereact/styles/card';
import { styles as carousel } from '@primereact/styles/carousel';
import { styles as checkbox } from '@primereact/styles/checkbox';
import { styles as checkboxGroup } from '@primereact/styles/checkboxgroup';
import { styles as chip } from '@primereact/styles/chip';
import { styles as compare } from '@primereact/styles/compare';
import { styles as contextMenu } from '@primereact/styles/contextmenu';
import { styles as dataTable } from '@primereact/styles/datatable';
import { styles as dataView } from '@primereact/styles/dataview';
import { styles as datePicker } from '@primereact/styles/datepicker';
import { styles as dialog } from '@primereact/styles/dialog';
import { styles as divider } from '@primereact/styles/divider';
import { styles as drawer } from '@primereact/styles/drawer';
import { styles as fieldset } from '@primereact/styles/fieldset';
import { styles as fileUpload } from '@primereact/styles/fileupload';
import { styles as floatLabel } from '@primereact/styles/floatlabel';
import { styles as fluid } from '@primereact/styles/fluid';
import { styles as gallery } from '@primereact/styles/gallery';
import { styles as iconField } from '@primereact/styles/iconfield';
import { styles as iftaLabel } from '@primereact/styles/iftalabel';
import { styles as inplace } from '@primereact/styles/inplace';
import { styles as inputColor } from '@primereact/styles/inputcolor';
import { styles as inputGroup } from '@primereact/styles/inputgroup';
import { styles as inputNumber } from '@primereact/styles/inputnumber';
import { styles as inputOtp } from '@primereact/styles/inputotp';
import { styles as inputTags } from '@primereact/styles/inputtags';
import { styles as inputText } from '@primereact/styles/inputtext';
import { styles as knob } from '@primereact/styles/knob';
import { styles as label } from '@primereact/styles/label';
import { styles as listbox } from '@primereact/styles/listbox';
import { styles as menu } from '@primereact/styles/menu';
import { styles as message } from '@primereact/styles/message';
import { styles as meterGroup } from '@primereact/styles/metergroup';
import { styles as navigationMenu } from '@primereact/styles/navigationmenu';
import { styles as organizationChart } from '@primereact/styles/organizationchart';
import { styles as overlayBadge } from '@primereact/styles/overlaybadge';
import { styles as paginator } from '@primereact/styles/paginator';
import { styles as panel } from '@primereact/styles/panel';
import { styles as password } from '@primereact/styles/inputpassword';
import { styles as popover } from '@primereact/styles/popover';
import { styles as progressBar } from '@primereact/styles/progressbar';
import { styles as progressSpinner } from '@primereact/styles/progressspinner';
import { styles as radioButton } from '@primereact/styles/radiobutton';
import { styles as radioButtonGroup } from '@primereact/styles/radiobuttongroup';
import { styles as rating } from '@primereact/styles/rating';
import { styles as scrollArea } from '@primereact/styles/scrollarea';
import { styles as select } from '@primereact/styles/select';
import { styles as sidebar, layoutStyles as sidebarLayout } from '@primereact/styles/sidebar';
import { styles as skeleton } from '@primereact/styles/skeleton';
import { styles as slider } from '@primereact/styles/slider';
import { styles as speedDial } from '@primereact/styles/speeddial';
import { styles as splitter } from '@primereact/styles/splitter';
import { styles as stepper } from '@primereact/styles/stepper';
import { styles as tabs } from '@primereact/styles/tabs';
import { styles as tag } from '@primereact/styles/tag';
import { styles as terminal } from '@primereact/styles/terminal';
import { styles as textarea } from '@primereact/styles/textarea';
import { styles as timeline } from '@primereact/styles/timeline';
import { styles as toast } from '@primereact/styles/toast';
import { styles as toaster } from '@primereact/styles/toaster';
import { styles as toggleButton } from '@primereact/styles/togglebutton';
import { styles as toggleButtonGroup } from '@primereact/styles/togglebuttongroup';
import { styles as toggleSwitch } from '@primereact/styles/toggleswitch';
import { styles as toolbar } from '@primereact/styles/toolbar';
import { styles as tooltip } from '@primereact/styles/tooltip';
import { styles as tree } from '@primereact/styles/tree';

// The names PrimeReact's motion hook uses for the enter/leave classes of an overlay or
// collapsible part. `@primereact/ui` hands these to the same primitives when it composes
// its styled components; the theme's transitions key off them.
const anchoredOverlay = 'p-anchored-overlay';
const collapsible = 'p-collapsible';
const overlayMask = 'p-overlay-mask';

// A root that carries a component's `styles`, optionally with the motion its parts animate through.
const styled = (styles: unknown, motion?: string) => ({ props: motion ? { styles, motionProps: { name: motion } } : { styles } });

// A part that only needs its motion name — its classes come from the root's `styles`.
const motion = (name: string) => ({ props: { motionProps: { name } } });

// PrimeReact 11's own component styles, keyed by primitive component name, ready to hand to `PrimeReactProvider` as `defaults`.
//
// Scene's PrimeReact package draws with the `primereact/*` primitives, which render structural markup (`data-scope`, `data-part`) and
// no class names at all: the `p-*` classes and the CSS the theme preset drives live in `@primereact/styles/*`, and `@primereact/ui/*` is
// the two glued together. A screen drawn under a provider without these is the right markup with no look - a button that is plain text,
// a card with no surface, a field with no box - which is exactly what Play does not look like, because Stage hands the provider these
// styles. The editor draws the screen with the same registry Play does, so it needs the same styles, and this is them.
//
// Every entry keys the primitive's root name, because the parts read their class names from the root's styles. The overlay and
// collapsible parts that animate are also listed, with the motion name the theme's transitions expect.
export const screenEditorPrimeReactDefaults: ComponentDefaults = {
    'Accordion.Root': styled(accordion, collapsible),
    'AutoComplete.Root': styled(autocomplete),
    'AutoComplete.Popup': motion(anchoredOverlay),
    'Avatar.Root': styled(avatar),
    'AvatarGroup': styled(avatarGroup),
    'Badge': styled(badge),
    'Breadcrumb.Root': styled(breadcrumb),
    'Button': styled(button),
    'ButtonGroup': styled(buttonGroup),
    'Card.Root': styled(card),
    'Carousel.Root': styled(carousel),
    'Checkbox.Root': styled(checkbox),
    'CheckboxGroup': styled(checkboxGroup),
    'Chip.Root': styled(chip),
    'Compare.Root': styled(compare),
    'ContextMenu.Root': styled(contextMenu),
    'ContextMenu.Popup': motion(anchoredOverlay),
    'DataTable.Root': styled(dataTable),
    'DataView.Root': styled(dataView),
    'DatePicker.Root': styled(datePicker),
    'DatePicker.Popup': motion(anchoredOverlay),
    'Dialog.Root': styled(dialog),
    'Dialog.Backdrop': motion(overlayMask),
    'Dialog.Popup': motion('p-dialog'),
    'Divider': styled(divider),
    'Drawer.Root': styled(drawer),
    'Drawer.Backdrop': motion(overlayMask),
    'Drawer.Popup': motion('p-drawer'),
    'Fieldset.Root': styled(fieldset, collapsible),
    'FileUpload.Root': styled(fileUpload),
    'FloatLabel': styled(floatLabel),
    'Fluid': styled(fluid),
    'Gallery.Root': styled(gallery),
    'IconField.Root': styled(iconField),
    'IftaLabel': styled(iftaLabel),
    'Inplace.Root': styled(inplace),
    'InputColor.Root': styled(inputColor),
    'InputGroup.Root': styled(inputGroup),
    'InputNumber.Root': styled(inputNumber),
    'InputOtp.Root': styled(inputOtp),
    'InputPassword': styled(password),
    'InputTags.Root': styled(inputTags),
    'InputText': styled(inputText),
    'Knob.Root': styled(knob),
    'Label': styled(label),
    'Listbox.Root': styled(listbox),
    'Menu.Root': styled(menu),
    'Menu.Popup': motion(anchoredOverlay),
    'Message.Root': styled(message),
    'MeterGroup.Root': styled(meterGroup),
    'NavigationMenu': styled(navigationMenu),
    'OrganizationChart.Root': styled(organizationChart),
    'OverlayBadge': styled(overlayBadge),
    'Paginator.Root': styled(paginator),
    'Panel.Root': styled(panel, collapsible),
    'Popover.Root': styled(popover),
    'Popover.Popup': motion(anchoredOverlay),
    'ProgressBar.Root': styled(progressBar),
    'ProgressSpinner.Root': styled(progressSpinner),
    'RadioButton.Root': styled(radioButton),
    'RadioButtonGroup': styled(radioButtonGroup),
    'Rating.Root': styled(rating),
    'ScrollArea.Root': styled(scrollArea),
    'Select.Root': styled(select),
    'Select.Popup': motion(anchoredOverlay),
    'Sidebar.Root': styled(sidebar),
    'Sidebar.Layout': styled(sidebarLayout),
    'Sidebar.Backdrop': motion(overlayMask),
    'Skeleton': styled(skeleton),
    'Slider.Root': styled(slider),
    'SpeedDial.Root': styled(speedDial),
    'Splitter.Root': styled(splitter),
    'Stepper.Root': styled(stepper, collapsible),
    'Tabs.Root': styled(tabs),
    'Tag': styled(tag),
    'Terminal.Root': styled(terminal),
    'Textarea': styled(textarea),
    'Timeline.Root': styled(timeline),
    'Toast.Root': styled(toast),
    'Toaster.Root': styled(toaster),
    'ToggleButton.Root': styled(toggleButton),
    'ToggleButtonGroup': styled(toggleButtonGroup),
    'ToggleSwitch.Root': styled(toggleSwitch),
    'Toolbar.Root': styled(toolbar),
    'Tooltip.Root': styled(tooltip),
    'Tooltip.Popup': motion('p-tooltip'),
    'Tree.Root': styled(tree),
};
