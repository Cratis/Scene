// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    FaAlignLeft, FaAngleDoubleRight, FaArrowsAltH, FaBars, FaBell, FaBolt, FaBookmark, FaBorderAll, FaCalendarAlt, FaCaretSquareDown,
    FaChartBar, FaCheckSquare, FaClock, FaClone, FaCode, FaCog, FaColumns, FaCommentDots, FaCompass, FaCreditCard, FaDatabase, FaDesktop, FaEdit, FaEllipsisH,
    FaExclamationCircle, FaExpandArrowsAlt, FaFileAlt, FaFileUpload, FaFilter, FaFont, FaGripLines, FaHeading, FaHistory, FaHourglassHalf,
    FaIdBadge, FaImage, FaImages, FaInfoCircle, FaKeyboard, FaLayerGroup, FaLink, FaList, FaListAlt, FaListOl, FaLock, FaMousePointer,
    FaObjectGroup, FaPalette, FaPercent, FaRegCheckCircle, FaRegCircle, FaRegSquare, FaSearch, FaShapes, FaSitemap, FaSlidersH, FaSpinner,
    FaStar, FaStream, FaSquare, FaTable, FaTag, FaTerminal, FaTh, FaThList, FaToggleOn, FaTools, FaTree, FaUser, FaUserCircle, FaWindowMaximize, FaWindowRestore,
    FaHashtag, FaPen, FaAlignJustify, FaStickyNote, FaStepForward, FaProjectDiagram, FaCommentAlt, FaFolderOpen, FaMask, FaPuzzlePiece,
} from 'react-icons/fa';
import type { PackageIcon } from './defaultPackageIcons';

// The icon each component is drawn with in the palette, by its bare name - the same component keeps its icon whichever package offers it.
// Each says what the component is for, so a tile can be told from its neighbours without reading it.
export const defaultComponentIcons: Readonly<Record<string, PackageIcon>> = {
    // The core package.
    text: FaAlignLeft, button: FaMousePointer, card: FaCreditCard, data: FaDatabase, action: FaBolt, section: FaObjectGroup, navigate: FaCompass,
    title: FaHeading, table: FaTable, summary: FaListAlt, field: FaKeyboard, code: FaCode, file: FaFileAlt, navigationBar: FaBars,

    // Inputs.
    inputText: FaFont, inputTextarea: FaAlignJustify, inputNumber: FaHashtag, password: FaLock, floatLabel: FaPen, iconField: FaSearch, dropdown: FaCaretSquareDown,
    multiSelect: FaListOl, listBox: FaList, selectButton: FaGripLines, checkbox: FaCheckSquare, multiStateCheckbox: FaRegCheckCircle, radioButton: FaRegCircle,
    toggleSwitch: FaToggleOn, slider: FaSlidersH, rating: FaStar, knob: FaPercent, calendar: FaCalendarAlt, colorPicker: FaPalette, chips: FaTag,
    autoComplete: FaSearch, treeSelect: FaTree, editor: FaEdit, fileUpload: FaFileUpload,

    // Buttons and actions.
    splitButton: FaAngleDoubleRight, speedDial: FaEllipsisH, buttonGroup: FaGripLines,

    // Data.
    dataTable: FaTable, dataView: FaTh, dataScroller: FaStream, tree: FaTree, treeTable: FaSitemap, timeline: FaHistory, paginator: FaArrowsAltH,
    orderList: FaListOl, pickList: FaClone, organizationChart: FaProjectDiagram, chart: FaChartBar,

    // Panels and layout helpers.
    panel: FaRegSquare, accordion: FaLayerGroup, fieldset: FaBorderAll, divider: FaGripLines, splitter: FaColumns, scrollPanel: FaExpandArrowsAlt, tabView: FaFolderOpen,
    toolbar: FaTools, stepper: FaStepForward,

    // Overlays.
    dialog: FaWindowMaximize, confirmDialog: FaExclamationCircle, overlayPanel: FaWindowRestore, sidebar: FaColumns, tooltip: FaCommentAlt,

    // Menus and navigation.
    menu: FaBars, menubar: FaBars, breadcrumb: FaAngleDoubleRight, tabMenu: FaFolderOpen, steps: FaStepForward, tieredMenu: FaSitemap, panelMenu: FaThList,
    contextMenu: FaMousePointer, megaMenu: FaTh, dock: FaGripLines,

    // Messages and media.
    message: FaCommentDots, inlineMessage: FaInfoCircle, toast: FaBell, image: FaImage, galleria: FaImages, carousel: FaImages, avatar: FaUserCircle, badge: FaBookmark,
    chip: FaTag, tag: FaTag, progressBar: FaHourglassHalf, progressSpinner: FaSpinner, skeleton: FaSquare, scrollTop: FaAngleDoubleRight, blockUI: FaMask, inplace: FaEdit,
    terminal: FaTerminal,

    // Cratis components: pages, forms and queries.
    page: FaFileAlt, dataPage: FaTable, formElement: FaListAlt, singleResult: FaIdBadge, queryInputForm: FaFilter, commandForm: FaListAlt, observableDataTable: FaTable,
    inputTextField: FaFont, numberField: FaHashtag, checkboxField: FaCheckSquare, textAreaField: FaAlignJustify, dropdownField: FaCaretSquareDown, sliderField: FaSlidersH,
    calendarField: FaCalendarAlt, colorPickerField: FaPalette, multiSelectField: FaListOl, chipsField: FaTag, radioButtonField: FaRegCircle, radioGroupField: FaRegCircle,
    confirmationDialog: FaExclamationCircle, busyIndicatorDialog: FaSpinner, commandDialog: FaWindowMaximize, stepperCommandDialog: FaStepForward, icon: FaShapes,
    errorBoundary: FaExclamationCircle, objectContentEditor: FaEdit, objectNavigationalBar: FaSitemap, schemaEditor: FaCog, timeMachine: FaClock, filterPanel: FaFilter,
    toolbarButton: FaMousePointer, toolbarGroup: FaGripLines, toolbarSeparator: FaGripLines,

    // The application shell.
    appShell: FaDesktop, fullPageShell: FaWindowMaximize, topbar: FaBars, menuItem: FaLink, footer: FaGripLines, rightPanel: FaColumns,
    configPanel: FaCog, pageHeader: FaHeading, mask: FaMask, logo: FaStickyNote, userMenu: FaUser, themeSwitcher: FaPalette, layoutModeSwitcher: FaDesktop,
    arcPageHeader: FaHeading,
};

// A name this editor does not know is still given something meaningful when it says what it is.
const guesses: readonly (readonly [RegExp, PackageIcon])[] = [
    [/dialog/i, FaWindowMaximize], [/table|grid/i, FaTable], [/menu|bar$/i, FaBars], [/chart/i, FaChartBar], [/field|input/i, FaKeyboard], [/button/i, FaMousePointer],
    [/image|media/i, FaImage], [/list/i, FaList], [/panel/i, FaRegSquare], [/message|toast/i, FaCommentDots], [/tree/i, FaTree], [/page|screen/i, FaFileAlt],
];

export const iconComponentOf = (componentName: string): PackageIcon =>
    defaultComponentIcons[componentName] ?? guesses.find(([pattern]) => pattern.test(componentName))?.[1] ?? FaPuzzlePiece;
