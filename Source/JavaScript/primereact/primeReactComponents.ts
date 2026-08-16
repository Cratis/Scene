// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';
import { PrimeButton, PrimeButtonGroup, PrimeSpeedDial, PrimeSplitButton } from './button';
import {
    PrimeColumn,
    PrimeDataTable,
    PrimeDataView,
    PrimeOrderList,
    PrimeOrganizationChart,
    PrimePaginator,
    PrimePickList,
    PrimeTimeline,
    PrimeTree,
    PrimeTreeTable,
    PrimeVirtualScroller,
} from './data';
import {
    PrimeAutoComplete,
    PrimeCalendar,
    PrimeCascadeSelect,
    PrimeCheckbox,
    PrimeChips,
    PrimeColorPicker,
    PrimeDropdown,
    PrimeFloatLabel,
    PrimeIconField,
    PrimeInputMask,
    PrimeInputNumber,
    PrimeInputText,
    PrimeInputTextarea,
    PrimeKnob,
    PrimeListBox,
    PrimeMultiSelect,
    PrimePassword,
    PrimeRadioButton,
    PrimeRating,
    PrimeSelectButton,
    PrimeSlider,
    PrimeToggleSwitch,
    PrimeTreeSelect,
} from './form';
import { PrimeCarousel, PrimeGalleria, PrimeImage } from './media';
import {
    PrimeBreadcrumb,
    PrimeContextMenu,
    PrimeDock,
    PrimeMegaMenu,
    PrimeMenu,
    PrimeMenubar,
    PrimePanelMenu,
    PrimeSteps,
    PrimeTabMenu,
    PrimeTieredMenu,
} from './menu';
import { PrimeInlineMessage, PrimeMessage, PrimeToast } from './messages';
import {
    PrimeAvatar,
    PrimeBadge,
    PrimeBlockUI,
    PrimeChip,
    PrimeInplace,
    PrimeProgressBar,
    PrimeProgressSpinner,
    PrimeScrollTop,
    PrimeSkeleton,
    PrimeTag,
    PrimeTerminal,
} from './misc';
import { PrimeConfirmDialog, PrimeDialog, PrimeOverlayPanel, PrimeSidebar, PrimeTooltip } from './overlay';
import {
    PrimeAccordion,
    PrimeCard,
    PrimeDivider,
    PrimeFieldset,
    PrimePanel,
    PrimeScrollPanel,
    PrimeSplitter,
    PrimeStepper,
    PrimeTabView,
    PrimeToolbar,
} from './panel';
import { PrimeAction, PrimeField, PrimeSection, PrimeSummary, PrimeText, PrimeTitle } from './screen';

/**
 * The `PrimeReact` package's component registry - every abstract name this package answers to, mapped to
 * the adapter that renders it.
 *
 * Three of these names - `text`, `button` and `card` - are deliberately the same ones `core` declares.
 * That is not a collision to be avoided but the mechanism working as intended: a `ui profile` listing
 * `core` and then `PrimeReact` resolves those names here and records that `core` was shadowed, so an
 * existing screen gets real themed components without being edited.
 *
 * Seven more - `table`, `column`, `title`, `field`, `section`, `summary` and `action` - are the names
 * Screenplay's screen vocabulary emits as directive kinds. Declaring them means a screen compiled from a
 * `.play` file renders through this package directly, rather than through a translation layer that would
 * have to be kept in step with the compiler.
 *
 * `table` and `dataTable` share one adapter on purpose: they are the same component under two names a
 * screen might reasonably use, and duplicating the implementation would let the two drift.
 */
export const primeReactComponents: ComponentRegistry = {
    [componentRegistryKey('PrimeReact', 'inputText')]: PrimeInputText,
    [componentRegistryKey('PrimeReact', 'inputTextarea')]: PrimeInputTextarea,
    [componentRegistryKey('PrimeReact', 'inputNumber')]: PrimeInputNumber,
    [componentRegistryKey('PrimeReact', 'password')]: PrimePassword,
    [componentRegistryKey('PrimeReact', 'inputMask')]: PrimeInputMask,
    [componentRegistryKey('PrimeReact', 'floatLabel')]: PrimeFloatLabel,
    [componentRegistryKey('PrimeReact', 'iconField')]: PrimeIconField,
    [componentRegistryKey('PrimeReact', 'dropdown')]: PrimeDropdown,
    [componentRegistryKey('PrimeReact', 'multiSelect')]: PrimeMultiSelect,
    [componentRegistryKey('PrimeReact', 'listBox')]: PrimeListBox,
    [componentRegistryKey('PrimeReact', 'selectButton')]: PrimeSelectButton,
    [componentRegistryKey('PrimeReact', 'checkbox')]: PrimeCheckbox,
    [componentRegistryKey('PrimeReact', 'radioButton')]: PrimeRadioButton,
    [componentRegistryKey('PrimeReact', 'toggleSwitch')]: PrimeToggleSwitch,
    [componentRegistryKey('PrimeReact', 'slider')]: PrimeSlider,
    [componentRegistryKey('PrimeReact', 'rating')]: PrimeRating,
    [componentRegistryKey('PrimeReact', 'knob')]: PrimeKnob,
    [componentRegistryKey('PrimeReact', 'calendar')]: PrimeCalendar,
    [componentRegistryKey('PrimeReact', 'colorPicker')]: PrimeColorPicker,
    [componentRegistryKey('PrimeReact', 'chips')]: PrimeChips,
    [componentRegistryKey('PrimeReact', 'autoComplete')]: PrimeAutoComplete,
    [componentRegistryKey('PrimeReact', 'treeSelect')]: PrimeTreeSelect,
    [componentRegistryKey('PrimeReact', 'cascadeSelect')]: PrimeCascadeSelect,

    [componentRegistryKey('PrimeReact', 'button')]: PrimeButton,
    [componentRegistryKey('PrimeReact', 'splitButton')]: PrimeSplitButton,
    [componentRegistryKey('PrimeReact', 'speedDial')]: PrimeSpeedDial,
    [componentRegistryKey('PrimeReact', 'buttonGroup')]: PrimeButtonGroup,

    [componentRegistryKey('PrimeReact', 'dataTable')]: PrimeDataTable,
    [componentRegistryKey('PrimeReact', 'table')]: PrimeDataTable,
    [componentRegistryKey('PrimeReact', 'column')]: PrimeColumn,
    [componentRegistryKey('PrimeReact', 'dataView')]: PrimeDataView,
    [componentRegistryKey('PrimeReact', 'tree')]: PrimeTree,
    [componentRegistryKey('PrimeReact', 'treeTable')]: PrimeTreeTable,
    [componentRegistryKey('PrimeReact', 'timeline')]: PrimeTimeline,
    [componentRegistryKey('PrimeReact', 'paginator')]: PrimePaginator,
    [componentRegistryKey('PrimeReact', 'orderList')]: PrimeOrderList,
    [componentRegistryKey('PrimeReact', 'pickList')]: PrimePickList,
    [componentRegistryKey('PrimeReact', 'organizationChart')]: PrimeOrganizationChart,
    [componentRegistryKey('PrimeReact', 'virtualScroller')]: PrimeVirtualScroller,

    [componentRegistryKey('PrimeReact', 'card')]: PrimeCard,
    [componentRegistryKey('PrimeReact', 'panel')]: PrimePanel,
    [componentRegistryKey('PrimeReact', 'accordion')]: PrimeAccordion,
    [componentRegistryKey('PrimeReact', 'fieldset')]: PrimeFieldset,
    [componentRegistryKey('PrimeReact', 'divider')]: PrimeDivider,
    [componentRegistryKey('PrimeReact', 'splitter')]: PrimeSplitter,
    [componentRegistryKey('PrimeReact', 'scrollPanel')]: PrimeScrollPanel,
    [componentRegistryKey('PrimeReact', 'tabView')]: PrimeTabView,
    [componentRegistryKey('PrimeReact', 'toolbar')]: PrimeToolbar,
    [componentRegistryKey('PrimeReact', 'stepper')]: PrimeStepper,

    [componentRegistryKey('PrimeReact', 'dialog')]: PrimeDialog,
    [componentRegistryKey('PrimeReact', 'confirmDialog')]: PrimeConfirmDialog,
    [componentRegistryKey('PrimeReact', 'overlayPanel')]: PrimeOverlayPanel,
    [componentRegistryKey('PrimeReact', 'sidebar')]: PrimeSidebar,
    [componentRegistryKey('PrimeReact', 'tooltip')]: PrimeTooltip,

    [componentRegistryKey('PrimeReact', 'menu')]: PrimeMenu,
    [componentRegistryKey('PrimeReact', 'menubar')]: PrimeMenubar,
    [componentRegistryKey('PrimeReact', 'breadcrumb')]: PrimeBreadcrumb,
    [componentRegistryKey('PrimeReact', 'tabMenu')]: PrimeTabMenu,
    [componentRegistryKey('PrimeReact', 'steps')]: PrimeSteps,
    [componentRegistryKey('PrimeReact', 'tieredMenu')]: PrimeTieredMenu,
    [componentRegistryKey('PrimeReact', 'panelMenu')]: PrimePanelMenu,
    [componentRegistryKey('PrimeReact', 'contextMenu')]: PrimeContextMenu,
    [componentRegistryKey('PrimeReact', 'megaMenu')]: PrimeMegaMenu,
    [componentRegistryKey('PrimeReact', 'dock')]: PrimeDock,

    [componentRegistryKey('PrimeReact', 'message')]: PrimeMessage,
    [componentRegistryKey('PrimeReact', 'inlineMessage')]: PrimeInlineMessage,
    [componentRegistryKey('PrimeReact', 'toast')]: PrimeToast,

    [componentRegistryKey('PrimeReact', 'image')]: PrimeImage,
    [componentRegistryKey('PrimeReact', 'galleria')]: PrimeGalleria,
    [componentRegistryKey('PrimeReact', 'carousel')]: PrimeCarousel,

    [componentRegistryKey('PrimeReact', 'avatar')]: PrimeAvatar,
    [componentRegistryKey('PrimeReact', 'badge')]: PrimeBadge,
    [componentRegistryKey('PrimeReact', 'chip')]: PrimeChip,
    [componentRegistryKey('PrimeReact', 'tag')]: PrimeTag,
    [componentRegistryKey('PrimeReact', 'progressBar')]: PrimeProgressBar,
    [componentRegistryKey('PrimeReact', 'progressSpinner')]: PrimeProgressSpinner,
    [componentRegistryKey('PrimeReact', 'skeleton')]: PrimeSkeleton,
    [componentRegistryKey('PrimeReact', 'scrollTop')]: PrimeScrollTop,
    [componentRegistryKey('PrimeReact', 'blockUI')]: PrimeBlockUI,
    [componentRegistryKey('PrimeReact', 'inplace')]: PrimeInplace,
    [componentRegistryKey('PrimeReact', 'terminal')]: PrimeTerminal,

    [componentRegistryKey('PrimeReact', 'text')]: PrimeText,
    [componentRegistryKey('PrimeReact', 'title')]: PrimeTitle,
    [componentRegistryKey('PrimeReact', 'field')]: PrimeField,
    [componentRegistryKey('PrimeReact', 'section')]: PrimeSection,
    [componentRegistryKey('PrimeReact', 'summary')]: PrimeSummary,
    [componentRegistryKey('PrimeReact', 'action')]: PrimeAction,
};
