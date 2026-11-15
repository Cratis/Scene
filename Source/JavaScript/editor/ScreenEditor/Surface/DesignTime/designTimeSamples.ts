// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What a component shows on the surface before the author has configured it. A component dropped on a screen has no properties yet, and
// most draw nothing without them - a table without rows, a text without words. The surface draws the real component with these standing
// in for the properties the element has not set, so the author sees what it will look like. They supply content - words, rows, items - and
// never appearance: a severity, a shape or a variant is the component's own default until the author chooses one, or the surface would not
// look like the screen does in Play. They are drawn from, never written to, the
// document: an element that sets a property is drawn with its own value, and the saved screen carries only what the author set.

import { foundationSamples } from '@cratis/scene.blueprint.default';
import { GuardedActionFallbackOutcome } from '@cratis/scene.model';

// A picture that needs no network, for the components that show one.
const picture = (hue: number): string =>
    `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="hsl(${hue} 40% 40%)"/></svg>`)}`;

const nodes = [{ label: 'Documents', children: ['Work', 'Home'] }];
const menu = ['New', 'Open', { separator: true }, 'Exit'];
const rows = [{ name: 'First', description: 'Sample row' }, { name: 'Second', description: 'Sample row' }];
const status = ['Draft', 'In review', 'Published'];

export type SampleProperties = Readonly<Record<string, unknown>>;

// By the component's bare name, which is what a document stores; a name qualified by its package (`core:table`) takes precedence when a
// package draws a component of the same name differently.
export const designTimeSamples: Readonly<Record<string, SampleProperties>> = {
    // core
    'text': { text: 'Text' },
    'title': { text: 'Title', level: 2 },
    'button': { label: 'Button' },
    'action': { label: 'Action' },
    // A guarded action draws nothing until a guard decides; an empty subject and a fallback that executes make it draw its button.
    // The fallback names no command, so the button is drawn disabled and a click on the design surface dispatches nothing.
    'guarded-action': { label: 'Guarded action', item: {}, alternatives: [], otherwise: { outcome: GuardedActionFallbackOutcome.Execute } },
    'card': { title: 'Card', subtitle: 'Subtitle' },
    'section': { title: 'Section' },
    'summary': { title: 'Summary', items: [{ label: 'Status', value: 'Active' }, { label: 'Owner', value: 'Name' }] },
    'field': { label: 'Field', value: 'Value' },
    'code': { code: 'const answer = 42;', text: 'const answer = 42;' },
    'file': { label: 'File', name: 'document.pdf' },
    'navigationBar': { title: 'Navigation', items: [{ id: 'home', label: 'Home' }, { id: 'section', label: 'Section' }, { id: 'more', label: 'More' }] },
    'column': { field: 'name', header: 'Column' },
    'table': { rows },
    'core:table': { rows },

    // Inputs
    'inputText': { placeholder: 'Text' },
    'inputTextarea': { placeholder: 'Text', rows: 3 },
    'inputNumber': { value: 42 },
    'password': { placeholder: 'Password' },
    'floatLabel': { label: 'Label' },
    'iconField': { icon: 'pi pi-search', placeholder: 'Search' },
    'dropdown': { options: status, placeholder: 'Select' },
    'multiSelect': { options: status, placeholder: 'Select' },
    'listBox': { options: status },
    'selectButton': { options: ['Day', 'Week', 'Month'], value: 'Week' },
    'checkbox': { label: 'Checkbox' },
    'multiStateCheckbox': { value: null, options: [{ label: 'On', value: 'on', icon: 'pi pi-check' }, { label: 'Off', value: 'off', icon: 'pi pi-times' }], ariaLabel: 'State' },
    'radioButton': { options: ['One', 'Two'], value: 'One' },
    'toggleSwitch': { label: 'Switch' },
    'slider': { value: 35 },
    'rating': { value: 4 },
    'knob': { value: 60 },
    'calendar': { value: '2026-01-15' },
    'colorPicker': { value: '#6366f1' },
    'chips': { value: ['one', 'two'] },
    'autoComplete': { options: status },
    'treeSelect': { options: nodes },
    'editor': { value: '<p>Rich <strong>text</strong></p>' },
    'fileUpload': {},

    // Buttons
    'splitButton': { label: 'Save', items: ['Save as draft', 'Discard'] },
    'speedDial': { items: [{ label: 'Add', icon: 'pi pi-plus' }, { label: 'Edit', icon: 'pi pi-pencil' }] },
    'buttonGroup': { buttons: ['Left', 'Middle', 'Right'] },

    // Data
    'dataTable': { rows },
    'dataView': { rows },
    'dataScroller': { items: ['First', 'Second', 'Third'], rows: 3, inline: true, scrollHeight: 96 },
    'tree': { nodes },
    'treeTable': { columns: [{ field: 'name', header: 'Name' }, { field: 'type', header: 'Type' }], items: [{ label: 'Documents', data: { name: 'Documents', type: 'Folder' }, children: [{ label: 'Work', data: { name: 'Work', type: 'Folder' } }] }] },
    'timeline': { events: [{ title: 'Ordered', description: 'Order placed', date: '09:00' }, { title: 'Shipped', description: 'Left the depot', date: '14:20' }] },
    'paginator': { totalRecords: 120, pageSize: 10 },
    'orderList': { header: 'Items', items: ['First', 'Second', 'Third'] },
    'pickList': { source: ['Alpha', 'Beta'], target: ['Gamma'] },
    'organizationChart': { nodes: [{ label: 'Lead', children: ['One', 'Two'] }] },
    'chart': {
        type: 'bar',
        data: { labels: ['January', 'February', 'March'], datasets: [{ label: 'Series', data: [12, 19, 8], backgroundColor: '#6366f1' }] },
    },

    // Panels
    'panel': { header: 'Panel' },
    'accordion': { headers: ['First', 'Second'] },
    'fieldset': { legend: 'Fieldset' },
    'divider': { label: 'or' },
    'splitter': { height: 120 },
    'scrollPanel': { height: 120 },
    'tabView': { headers: ['First', 'Second'] },
    'toolbar': {},
    'stepper': { headers: ['First', 'Second'] },

    // Overlays
    'dialog': { header: 'Dialog' },
    'confirmDialog': { message: 'Are you sure?', triggerLabel: 'Confirm' },
    'overlayPanel': { triggerLabel: 'Details' },
    'sidebar': { position: 'right', triggerLabel: 'Open panel' },
    'tooltip': { text: 'Tooltip', label: 'Hover me' },

    // Menus and navigation
    'menu': { items: menu },
    'menubar': { items: [{ label: 'File', items: ['New', 'Open'] }, { label: 'Edit', items: ['Undo'] }] },
    'breadcrumb': { items: ['Home', 'Section', 'Page'] },
    'tabMenu': { items: [{ label: 'Overview', icon: 'pi pi-home' }, { label: 'Activity', icon: 'pi pi-list' }] },
    'steps': { items: ['First', 'Second', 'Third'], activeIndex: 1 },
    'tieredMenu': { items: [{ label: 'File', items: [{ label: 'Export', items: ['PDF', 'CSV'] }] }] },
    'panelMenu': { items: [{ label: 'Reports', items: ['Monthly', 'Annual'] }] },
    'contextMenu': { label: 'Right-click here', items: ['Copy', 'Paste'] },
    'megaMenu': { items: [{ label: 'Catalog', items: [{ label: 'Hardware', items: ['Laptops', 'Phones'] }] }] },
    'dock': { items: [{ label: 'Home', icon: 'pi pi-home' }, { label: 'Search', icon: 'pi pi-search' }] },

    // Messages and media
    'message': { text: 'Message' },
    'inlineMessage': { severity: 'info', text: 'Message' },
    'toast': { severity: 'success', summary: 'Saved', detail: 'The change was saved.' },
    'blockUI': { blocked: true },
    'image': { src: picture(220), alt: 'Image', width: '200' },
    'galleria': { maxWidth: 320, items: [{ src: picture(220), alt: 'One' }, { src: picture(10), alt: 'Two' }] },
    'carousel': { numVisible: 2, items: [{ title: 'First', description: 'Item' }, { title: 'Second', description: 'Item' }, { title: 'Third', description: 'Item' }] },
    'avatar': { label: 'AB' },
    'badge': { value: '8' },
    'chip': { label: 'Chip', icon: 'pi pi-user' },
    'tag': { value: 'Tag' },
    'progressBar': { value: 65 },
    'progressSpinner': { size: 40 },
    'skeleton': { width: '12rem', height: '2rem' },
    'scrollTop': { height: 140 },
    'inplace': { label: 'Click to edit' },
    'terminal': { welcomeMessage: 'Terminal', prompt: '$' },

    // Cratis components
    'page': { title: 'Page', showTitle: true, panel: true },
    'dataPage': { title: 'Data page' },
    'icon': { icon: 'pi pi-check-circle' },
    'toolbarButton': { icon: 'pi pi-plus', title: 'Button', text: '' },
    'toolbarItem': { label: 'Item' },
    'toolbarGroup': { orientation: 'horizontal' },
    'toolbarSeparator': { orientation: 'horizontal' },
    'inputTextField': { title: 'Text field' },
    'numberField': { title: 'Number field' },
    'checkboxField': { title: 'Checkbox field' },
    'textAreaField': { title: 'Text area field' },
    'dropdownField': { title: 'Dropdown field', options: status },
    'sliderField': { title: 'Slider field' },
    'calendarField': { title: 'Calendar field' },
    'colorPickerField': { title: 'Color field' },
    'multiSelectField': { title: 'Multi select field', options: status },
    'chipsField': { title: 'Chips field' },
    'radioButtonField': { title: 'Radio field', options: ['One', 'Two'] },
    'radioGroupField': { title: 'Radio group field', options: ['One', 'Two'] },
    'objectNavigationalBar': { navigationPath: ['first', 'second'] },
    'filterPanel': { label: 'Filters', filters: [{ key: 'status', label: 'Status', multi: true, options: [{ key: 'draft', label: 'Draft', count: 12 }, { key: 'done', label: 'Done', count: 4 }] }] },
    'objectContentEditor': { editMode: false, object: { name: 'Sample', amount: 42 }, schema: { type: 'object', properties: { name: { type: 'string' }, amount: { type: 'number' } } } },
    'schemaEditor': { eventTypeName: 'SampleEvent', canEdit: false, schema: { title: 'SampleEvent', type: 'object', properties: { name: { type: 'string' } } } },
    'confirmationDialog': { title: 'Confirm', message: 'Are you sure?' },
    'busyIndicatorDialog': { title: 'Working', message: 'Please wait' },

    // The application shell: these take their own properties, not the PrimeReact component of the same name.
    'Cratis.Blueprint.Default:breadcrumb': { items: [{ label: 'Home' }, { label: 'Section' }, { label: 'Page' }] },
    'Cratis.Blueprint.Default:menu': { title: 'Menu', label: 'Main' },
    'Cratis.Blueprint.Default:menuItem': { label: 'Menu item', icon: 'pi pi-home' },
    'Cratis.Blueprint.Default:rightPanel': { title: 'Panel' },
    'Cratis.Blueprint.Default:sidebar': { title: 'Sidebar' },
    'pageHeader': { title: 'Page title' },

    // The foundation components (stat card, filter builder, activity feed, ...) bring the content that populates them: Scene's own, so the surface
    // draws what its stories and specifications draw.
    ...Object.fromEntries(Object.entries(foundationSamples).map(([component, sample]) => [component, sample.properties])),
    'arcPageHeader': { title: 'Page title' },
    'logo': { text: 'Logo' },
    'footer': { text: 'Footer' },
    'topbar': { title: 'Application' },
    'userMenu': { name: 'User' },
};

// Components that are declarations: they say something about the screen and draw nothing, whatever their properties. They get a compact
// chip on the surface so they can be seen, selected, moved and removed.
export const declarationComponents: ReadonlySet<string> = new Set(['data', 'navigate', 'errorBoundary', 'toolbarSeparator']);

export const bareNameOf = (componentName: string): string => componentName.slice(componentName.lastIndexOf(':') + 1);

// The sample for a component: by the key it was registered under first, since packages reuse names; then by name alone.
export const sampleOf = (registryKey: string, componentName: string): SampleProperties | undefined =>
    designTimeSamples[registryKey] ?? designTimeSamples[componentName] ?? designTimeSamples[bareNameOf(componentName)];

// The properties to draw an element with: the sample for its component under whatever the element set itself.
export function withSampleProperties(registryKey: string, componentName: string, properties: Readonly<Record<string, unknown>> | undefined): Record<string, unknown> {
    const sample = sampleOf(registryKey, componentName);
    const own = properties ?? {};
    if (!sample) return { ...own };

    const merged: Record<string, unknown> = { ...sample };
    // A property the author set is theirs, even when what they set is empty: an emptied table is drawn empty, not refilled with sample rows.
    for (const [key, value] of Object.entries(own)) if (value !== undefined) merged[key] = value;
    return merged;
}

// The properties of an element that are being drawn from the sample because the author has set nothing there. These are the words an author
// sees on the surface that the document does not have, so the surface says so.
export function sampleKeysInUse(registryKey: string, componentName: string, properties: Readonly<Record<string, unknown>> | undefined): string[] {
    const sample = sampleOf(registryKey, componentName);
    return sample ? Object.keys(sample).filter(key => properties?.[key] === undefined) : [];
}
