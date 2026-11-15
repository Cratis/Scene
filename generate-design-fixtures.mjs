// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Generates scene-design-fixtures.json, the corpus both Scene.Design packages answer against.
//
// The cases below are the inputs: catalogue inputs, workspaces, questions, operations, screen-set steps and session events. The expected
// answers are computed by the TypeScript package, which is the reference, and written next to them. The TypeScript spec asserts the package still
// produces what the file records and the C# spec asserts Cratis.Scene.Design produces the same, so the two cannot drift apart.
//
// Build @cratis/scene.design first (`yarn build`), then run `node generate-design-fixtures.mjs`.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
    addScreenToSet, applyDesignOperations, buildDesignCatalogue, chooseVariation, createDesignContext, createScreenSet, findDanglingLinks, findScreenLinks,
    findUnreachedScreens, foldDesignSession, lowerTweak, moveScreenInSet, queryDesignCatalogue, removeScreenFromSet, resolveTweaks, seedDesignSession, withStoryline,
} from './Source/JavaScript/design/dist/esm/index.js';

const plain = value => JSON.parse(JSON.stringify(value));

const frame = () => ({
    visibility: 'Visible', isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 }, horizontalAlignment: 'Stretch', verticalAlignment: 'Stretch',
});
const element = (id, componentName, properties = {}) => ({ id, name: id, componentName, properties, slots: {}, ...frame() });
const string = (path, label, extra = {}) => ({ path, label, group: 'Content', valueType: 'string', ...extra });
const choice = (path, label, values) => ({ path, label, group: 'Look', valueType: 'enum', choices: values.map(value => ({ value, label: value })) });

// ---- What the catalogue is built from
const descriptors = [
    { component: 'test:pageHeader', displayName: 'Page header', category: 'Layout', description: 'Title of the page', properties: [string('title', 'Title', { constraints: { required: true } }), string('subtitle', 'Subtitle')] },
    {
        component: 'test:button', displayName: 'Button', category: 'Actions', description: 'Does something when pressed',
        properties: [string('label', 'Label', { constraints: { required: true } }), choice('variant', 'Variant', ['primary', 'secondary', 'danger']), { path: 'target', label: 'Target', group: 'Content', valueType: 'destination' }],
        anatomy: { parts: ['text', 'background', 'border'], variants: ['primary', 'secondary', 'danger'], states: ['hover', 'disabled', 'focus'] },
    },
    {
        component: 'test:dataList', displayName: 'Data list', category: 'Data display', description: 'Rows of a query',
        properties: [
            { path: 'query', label: 'Query', group: 'Data', valueType: 'queryReference', constraints: { resultShapes: ['collection'] } },
            { path: 'pageSize', label: 'Page size', group: 'Data', valueType: 'number', constraints: { minimum: 1, maximum: 100, integer: true } },
            string('caption', 'Caption'),
            { path: 'striped', label: 'Striped', group: 'Look', valueType: 'boolean' },
            choice('density', 'Density', ['compact', 'roomy']),
        ],
    },
    { component: 'test:statCard', displayName: 'Stat card', category: 'Data display', properties: [string('label', 'Label'), string('value', 'Value')] },
    { component: 'test:filterBuilder', displayName: 'Filter builder', category: 'Input', properties: [string('placeholder', 'Placeholder')] },
    choiceless('test:notice', 'Notice', 'Feedback'),
    { component: 'test:confirmDialog', displayName: 'Confirm dialog', category: 'Overlay', properties: [string('message', 'Message')] },
    { component: 'test:topbar', displayName: 'Top bar', category: 'Shell', properties: [string('title', 'Title')] },
];

function choiceless(component, displayName, category) {
    return { component, displayName, category, properties: [string('message', 'Message'), choice('tone', 'Tone', ['info', 'warning', 'success'])] };
}

const slot = name => ({ name });
const templates = [
    {
        name: 'ListScreen', slots: ['header', 'toolbar', 'filters', 'list'].map(slot), displayName: 'List screen', description: 'A header, a toolbar, filters and a list', metadata: { type: 'List' },
        content: { header: [element('t-header', 'test:pageHeader', { title: 'List' })], toolbar: [element('t-new', 'test:button', { label: 'New' })], filters: [element('t-filter', 'test:filterBuilder')], list: [element('t-list', 'test:dataList')] },
    },
    {
        name: 'DashboardScreen', slots: ['header', 'kpis', 'tables'].map(slot), displayName: 'Dashboard', metadata: { type: 'Dashboard' },
        content: { header: [element('d-header', 'test:pageHeader', { title: 'Dashboard' })], kpis: [element('d-stat', 'test:statCard')], tables: [element('d-table', 'test:dataList')] },
    },
    {
        name: 'FormScreen', slots: ['header', 'body', 'actions'].map(slot), displayName: 'Form screen', metadata: { type: 'Form' },
        content: { header: [element('f-header', 'test:pageHeader', { title: 'Form' })], body: [], actions: [element('f-save', 'test:button', { label: 'Save' })] },
    },
    { name: 'BlankPage', slots: [slot('main')], metadata: { type: 'Blank' }, content: { main: [] } },
    { name: 'AppShell', slots: [slot('content')], metadata: { role: 'Root' }, content: { content: [] } },
];
const outletRules = { ListScreen: { header: { components: ['test:pageHeader'], max: 1 }, list: { components: ['test:dataList', 'test:notice'], max: 1 } } };

const daylight = { name: 'Daylight', isDefault: true, modes: [
    { mode: 'light', tokens: { 'color.primary': '#4338ca', 'color.on-primary': '#ffffff', 'color.surface': '#ffffff', 'radius.control': '8px' } },
    { mode: 'dark', tokens: { 'color.primary': '#818cf8', 'color.on-primary': '#111827', 'color.surface': '#111827', 'radius.control': '8px' } },
] };
const designSystem = {
    name: 'ShopDesign', modes: ['light', 'dark'],
    tokens: [
        { category: 'color', name: 'primary', description: 'primary action' }, { category: 'color', name: 'on-primary', description: 'text on a primary action' },
        { category: 'color', name: 'surface', description: 'page background' }, { category: 'radius', name: 'control', description: 'inputs and buttons' },
    ],
    components: [{ name: 'Button', parts: ['text', 'background'], variants: [{ name: 'primary', parts: { text: 'color.on-primary', background: 'color.primary' }, states: { hover: { background: 'color.primary' } } }, { name: 'secondary', parts: { text: 'color.primary', background: 'color.surface' } }] }],
    themes: [daylight],
    words: { voice: { tone: 'plain and friendly' }, naming: { action: 'verb first' } },
};
const profile = { name: 'Shop', targetPlatform: 'web', packages: ['test'], layout: 'Shell', theme: 'Daylight', root: { template: { source: 'Blueprint', id: 'AppShell', blueprint: 'test' } }, appearance: { colorScheme: 'Light' } };
const queries = [
    { id: 'q1', name: 'ListInvoices', origin: [], parameters: [{ name: 'status', type: 'string', required: false }], resultShape: 'collection', resultFields: [{ name: 'number', type: 'string' }, { name: 'amount', type: 'decimal' }] },
    { id: 'q2', name: 'GetInvoice', origin: [], parameters: [{ name: 'number', type: 'string', required: true }], resultShape: 'single', resultFields: [{ name: 'number', type: 'string' }] },
];
const baseInput = {
    designSystem, themes: [{ name: 'Scene Dark', compatibleWith: [], isDark: true }], profile, descriptors, templates, outletRules, shellComponents: [], fonts: ['inter', 'ibm-plex-sans'],
    shapes: [{ name: 'Invoice', fields: [{ name: 'number', type: 'string' }, { name: 'amount', type: 'decimal' }] }], queries,
    commands: [{ id: 'c1', name: 'PayInvoice', inputs: ['number', 'amount'] }],
    sampleData: [{ name: 'Customer', fields: [{ name: 'name', kind: 'name' }, { name: 'email', type: 'string' }] }],
};
const inputs = {
    base: baseInput,
    constrained: { ...baseInput, templateSet: ['ListScreen', 'BlankPage'] },
    bare: { descriptors, templates, outletRules: {} },
};

// ---- Workspaces to start from
const emptyDocument = { layouts: [{ name: 'Shell', slots: [slot('content')] }], screenTemplates: [], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] };
const emptyWorkspace = { document: emptyDocument, profile, screenSet: createScreenSet() };
const noProfileWorkspace = { document: emptyDocument, screenSet: createScreenSet() };
const apply = (workspace, operations, input = 'base') => applyDesignOperations(plain(workspace), operations, createDesignContext(inputs[input]));
const built = (workspace, operations, input = 'base') => plain(apply(workspace, operations, input).workspace);

const invoices = built(emptyWorkspace, [
    { op: 'addScreen', name: 'Invoices', template: 'ListScreen' },
    { op: 'addScreen', name: 'InvoiceDetails', template: 'FormScreen' },
    { op: 'insert', screen: 'Invoices', outlet: 'toolbar', component: 'test:button', id: 'new-invoice', props: { label: 'New invoice' } },
    { op: 'insert', screen: 'Invoices', outlet: 'list', component: 'test:dataList', id: 'invoice-list', props: { query: 'ListInvoices', pageSize: 20 } },
    { op: 'insert', screen: 'Invoices', outlet: 'header', component: 'test:pageHeader', id: 'invoices-header', props: { title: 'Invoices' } },
    { op: 'insert', screen: 'InvoiceDetails', outlet: 'actions', component: 'test:button', id: 'pay', props: { label: 'Pay' } },
    { op: 'link', screen: 'Invoices', element: 'new-invoice', to: 'InvoiceDetails' },
]);
const templateWorkspace = built({ document: emptyDocument, screenSet: createScreenSet() }, [
    { op: 'addTemplate', name: 'ListScreen', displayName: 'List screen', slots: [{ name: 'header' }, { name: 'list' }], type: 'List' },
    { op: 'insert', template: 'ListScreen', outlet: 'header', component: 'test:pageHeader', id: 'list-header', props: { title: 'Records' } },
], 'constrained');
const noLayoutWorkspace = { document: { ...emptyDocument, layouts: [] }, profile: { ...profile, layout: undefined }, screenSet: createScreenSet() };
const workspaces = { empty: emptyWorkspace, noProfile: noProfileWorkspace, noLayout: noLayoutWorkspace, invoices, templates: templateWorkspace };

// ---- Catalogue questions
const queriesAsked = [
    ['lists the components', 'base', { what: 'components' }],
    ['lists the components of a category', 'base', { what: 'components', category: 'Actions' }],
    ['lists the components that fit a template', 'base', { what: 'components', fitsTemplate: 'FormScreen' }],
    ['lists the components that fit an outlet', 'base', { what: 'components', fitsTemplate: 'ListScreen', fitsOutlet: 'toolbar' }],
    ['searches the components', 'base', { what: 'components', search: 'rows' }],
    ['describes a component with the variants the design system declares', 'base', { what: 'component', name: 'test:button' }],
    ['describes a component by its bare name', 'base', { what: 'component', name: 'dataList' }],
    ['describes a component the catalogue does not have', 'base', { what: 'component', name: 'carousel' }],
    ['lists the templates', 'base', { what: 'templates' }],
    ['lists only the templates of the set', 'constrained', { what: 'templates' }],
    ['describes a template with its outlets', 'base', { what: 'template', name: 'ListScreen' }],
    ['does not describe a template outside the set', 'constrained', { what: 'template', name: 'DashboardScreen' }],
    ['lists the tokens', 'base', { what: 'tokens' }],
    ['lists the tokens of a category', 'base', { what: 'tokens', category: 'radius' }],
    ['describes a token with its values', 'base', { what: 'token', address: 'color.primary' }],
    ['lists the design system components', 'base', { what: 'designComponents' }],
    ['describes a design system component', 'base', { what: 'designComponent', name: 'Button' }],
    ['lists the themes', 'base', { what: 'themes' }],
    ['describes the profile', 'base', { what: 'profile' }],
    ['answers there is no profile', 'bare', { what: 'profile' }],
    ['reads the words', 'base', { what: 'words' }],
    ['lists the shapes', 'base', { what: 'shapes' }],
    ['describes a shape', 'base', { what: 'shape', name: 'Invoice' }],
    ['lists the queries', 'base', { what: 'queries' }],
    ['describes a query', 'base', { what: 'query', name: 'ListInvoices' }],
    ['lists the commands', 'base', { what: 'commands' }],
    ['describes a command', 'base', { what: 'command', name: 'PayInvoice' }],
];

// ---- Operations
const ops = [];
const add = (name, workspace, operations, input = 'base') => ops.push({ name, input, workspace, operations });

add('adds a screen on a template', 'empty', [{ op: 'addScreen', name: 'Orders', template: 'ListScreen' }]);
add('adds a screen to the default storyline in order', 'empty', [{ op: 'addScreen', name: 'Orders', template: 'ListScreen' }, { op: 'addScreen', name: 'Basket', template: 'BlankPage' }]);
add('refuses a screen that exists', 'invoices', [{ op: 'addScreen', name: 'Invoices', template: 'ListScreen' }]);
add('refuses a template the catalogue does not have', 'empty', [{ op: 'addScreen', name: 'Orders', template: 'Carousel' }]);
add('refuses a template outside the set and offers the set', 'empty', [{ op: 'addScreen', name: 'Orders', template: 'DashboardScreen' }], 'constrained');
add('refuses a screen when the document has no layout', 'noLayout', [{ op: 'addScreen', name: 'Orders', template: 'ListScreen' }]);
add('inserts a component into an outlet', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:notice', props: { message: 'Check the amount', tone: 'warning' } }]);
add('inserts by the bare name of a component and makes the id', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'notice' }, { op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'notice' }]);
add('inserts at a position', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'actions', component: 'test:button', index: 0, props: { label: 'Cancel', variant: 'secondary' } }]);
add('refuses a component an outlet does not take and offers the outlets that do', 'invoices', [{ op: 'insert', screen: 'Invoices', outlet: 'toolbar', component: 'test:statCard' }]);
add('refuses an outlet that does not exist', 'invoices', [{ op: 'insert', screen: 'Invoices', outlet: 'sidebar', component: 'test:button' }]);
add('refuses a component past the outlet maximum', 'invoices', [{ op: 'insert', screen: 'Invoices', outlet: 'list', component: 'test:dataList' }]);
add('refuses an overlay', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:confirmDialog' }]);
add('refuses a shell component', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:topbar' }]);
add('refuses a component that is not in the catalogue', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:carousel' }]);
add('refuses an id the document uses', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:notice', id: 'pay' }]);
add('refuses free styling and proposes it to the design system', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:notice', props: { backgroundColor: 'red' } }]);
add('refuses a colour of its own and offers the component without it', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:notice', props: { message: '#ff0000' } }]);
add('refuses a variant the design system does not declare', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'actions', component: 'test:button', props: { label: 'Delete', variant: 'danger' } }]);
add('refuses an unknown property', 'invoices', [{ op: 'insert', screen: 'InvoiceDetails', outlet: 'body', component: 'test:notice', props: { glow: 1 } }]);
add('sets a property', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'pageSize', value: 50 }]);
add('sets a choice', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'density', value: 'compact' }]);
add('sets a variant the design system declares', 'invoices', [{ op: 'set', screen: 'InvoiceDetails', element: 'pay', prop: 'variant', value: 'secondary' }]);
add('refuses a number out of range', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'pageSize', value: 1000 }]);
add('refuses a value of the wrong kind', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'striped', value: 'yes' }]);
add('refuses a query that does not exist and offers the ones that do', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'query', value: 'ListInvoicez' }]);
add('refuses a choice and offers the choices', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'density', value: 'tight' }]);
add('refuses a variant of the design system and proposes it', 'invoices', [{ op: 'set', screen: 'InvoiceDetails', element: 'pay', prop: 'variant', value: 'danger' }]);
add('refuses free styling on a set and offers the variants', 'invoices', [{ op: 'set', screen: 'InvoiceDetails', element: 'pay', prop: 'background', value: 'red' }]);
add('refuses a gradient the design system does not have', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoices-header', prop: 'title', value: 'linear-gradient(red, blue)' }]);
add('refuses what the engine refuses', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'pageSize', value: 2.5 }]);
add('refuses an element that is not there', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'ghost', prop: 'title', value: 'x' }]);
add('refuses a screen that is not there', 'invoices', [{ op: 'remove', screen: 'Ghosts', element: 'pay' }]);
add('refuses a change that names no target', 'invoices', [{ op: 'remove', element: 'pay' }]);
add('refuses a change that names both targets', 'invoices', [{ op: 'remove', screen: 'Invoices', template: 'ListScreen', element: 'pay' }]);
add('removes an element', 'invoices', [{ op: 'remove', screen: 'Invoices', element: 'invoice-list' }]);
add('moves an element to another outlet', 'invoices', [{ op: 'insert', screen: 'Invoices', outlet: 'filters', component: 'test:filterBuilder', id: 'quick' }, { op: 'move', screen: 'Invoices', element: 'quick', outlet: 'filters', index: 0 }]);
add('refuses to move an element where it does not fit', 'invoices', [{ op: 'move', screen: 'Invoices', element: 'new-invoice', outlet: 'list' }]);
add('links an element to a screen', 'invoices', [{ op: 'link', screen: 'InvoiceDetails', element: 'pay', to: 'Invoices' }]);
add('refuses a link to a screen that is not there', 'invoices', [{ op: 'link', screen: 'InvoiceDetails', element: 'pay', to: 'Receipts' }]);
add('refuses a link on a component that does not navigate', 'invoices', [{ op: 'link', screen: 'Invoices', element: 'invoice-list', to: 'InvoiceDetails' }]);
add('removes a screen and warns about the links to it', 'invoices', [{ op: 'removeScreen', name: 'InvoiceDetails' }]);
add('moves a screen and reorders the default storyline', 'invoices', [{ op: 'moveScreen', name: 'InvoiceDetails', index: 0 }]);
add('refuses to remove a screen that is not there', 'invoices', [{ op: 'removeScreen', name: 'Ghost' }]);
add('changes the theme', 'invoices', [{ op: 'profile', key: 'theme', value: 'Scene Dark' }]);
add('changes the colour scheme, corners and font', 'invoices', [{ op: 'profile', key: 'colorScheme', value: 'Dark' }, { op: 'profile', key: 'corners', value: 'Round' }, { op: 'profile', key: 'font', value: 'inter' }]);
add('changes the root template and the template of new screens', 'invoices', [{ op: 'profile', key: 'rootTemplate', value: 'AppShell' }, { op: 'profile', key: 'newScreenTemplate', value: 'FormScreen' }]);
add('changes the accent to a colour the design system declares', 'invoices', [{ op: 'profile', key: 'accent', value: '#4338CA' }]);
add('refuses an accent the design system does not declare and proposes it', 'invoices', [{ op: 'profile', key: 'accent', value: '#ff00aa' }]);
add('refuses a theme that does not exist and offers the themes', 'invoices', [{ op: 'profile', key: 'theme', value: 'Neon' }]);
add('refuses a key the profile does not have', 'invoices', [{ op: 'profile', key: 'shadow', value: 'big' }]);
add('refuses a profile change when there is no profile', 'noProfile', [{ op: 'profile', key: 'theme', value: 'Daylight' }]);
add('offers variations on other templates and says what did not fit', 'invoices', [{ op: 'variations', screen: 'Invoices' }]);
add('offers variations on the templates asked for', 'invoices', [{ op: 'variations', screen: 'Invoices', templates: ['DashboardScreen', 'FormScreen'] }]);
add('offers variations only on the templates of the set', 'invoices', [{ op: 'variations', screen: 'Invoices' }], 'constrained');
add('refuses variations on a template outside the set', 'invoices', [{ op: 'variations', screen: 'Invoices', templates: ['DashboardScreen'] }], 'constrained');
add('refuses more variations than the limit', 'invoices', [{ op: 'variations', screen: 'Invoices', templates: ['DashboardScreen', 'FormScreen', 'BlankPage', 'ListScreen'] }]);
add('offers tweak controls', 'invoices', [{ op: 'tweaks', controls: [
    { label: 'Corners', kind: 'choice', address: { kind: 'profile', key: 'corners' } },
    { label: 'Accent', kind: 'hue', address: { kind: 'profile', key: 'accent' } },
    { label: 'Density', kind: 'choice', address: { kind: 'property', screen: 'Invoices', element: 'invoice-list', prop: 'density' } },
    { label: 'Primary colour', kind: 'hue', address: { kind: 'token', token: 'color.primary' } },
] }]);
add('refuses a tweak bound to nothing', 'invoices', [{ op: 'tweaks', controls: [{ label: 'Page size', kind: 'choice', address: { kind: 'property', screen: 'Invoices', element: 'invoice-list', prop: 'pageSize' } }] }]);
add('refuses too many tweak controls', 'invoices', [{ op: 'tweaks', controls: ['a', 'b', 'c', 'd', 'e', 'f'].map(label => ({ label, kind: 'choice', address: { kind: 'profile', key: 'corners' } })) }]);
add('passes a refusal through', 'invoices', [{ op: 'refuse', code: 'freeStylingNotAllowed', reason: 'No gradients', alternatives: [{ label: 'Round the corners', operations: [{ op: 'profile', key: 'corners', value: 'Round' }] }] }]);
add('refuses an operation it does not know', 'invoices', [{ op: 'explode' }]);
add('goes on after a refusal', 'invoices', [
    { op: 'insert', screen: 'Invoices', outlet: 'toolbar', component: 'test:statCard' },
    { op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'pageSize', value: 10 },
]);
add('keeps nothing of an operation the engine refused', 'invoices', [{ op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'pageSize', value: 2.5 }, { op: 'set', screen: 'Invoices', element: 'invoice-list', prop: 'caption', value: 'All' }]);

// ---- Template mode
add('adds a template with slots and an arrangement', 'noProfile', [{
    op: 'addTemplate', name: 'ListScreen', displayName: 'List screen', description: 'A list', type: 'List', slots: [{ name: 'header' }, { name: 'list', optional: true }],
    arrangement: { root: { kind: 'Column', gap: 8, children: [{ slotName: 'header' }, { slotName: 'list' }] } },
}], 'base');
add('refuses a template that exists', 'templates', [{ op: 'addTemplate', name: 'ListScreen', slots: [{ name: 'main' }] }], 'constrained');
add('refuses a template with a duplicate slot', 'noProfile', [{ op: 'addTemplate', name: 'Odd', slots: [{ name: 'a' }, { name: 'a' }] }]);
add('refuses a template whose arrangement places a slot it lacks', 'noProfile', [{ op: 'addTemplate', name: 'Odd', slots: [{ name: 'a' }], arrangement: { root: { kind: 'Row', children: [{ slotName: 'b' }] } } }]);
add('refuses a template outside the set', 'noProfile', [{ op: 'addTemplate', name: 'DashboardScreen', slots: [{ name: 'main' }] }], 'constrained');
add('adds a template that is in the set', 'noProfile', [{ op: 'addTemplate', name: 'BlankPage', slots: [{ name: 'main' }] }], 'constrained');
add('inserts into a template', 'templates', [{ op: 'insert', template: 'ListScreen', outlet: 'list', component: 'test:dataList', id: 'records', props: { pageSize: 25 } }], 'constrained');
add('sets, moves and removes in a template', 'templates', [
    { op: 'set', template: 'ListScreen', element: 'list-header', prop: 'title', value: 'All records' },
    { op: 'move', template: 'ListScreen', element: 'list-header', outlet: 'list' },
    { op: 'remove', template: 'ListScreen', element: 'list-header' },
], 'constrained');
add('refuses to insert where the template has no outlet', 'templates', [{ op: 'insert', template: 'ListScreen', outlet: 'footer', component: 'test:notice' }], 'constrained');
add('refuses a change of a template outside the set and offers the set', 'templates', [{ op: 'insert', template: 'DashboardScreen', outlet: 'header', component: 'test:pageHeader' }], 'constrained');
add('adds a slot to a template', 'templates', [{ op: 'addSlot', template: 'ListScreen', slot: { name: 'footer', optional: true }, index: 1 }], 'constrained');
add('refuses a slot that exists', 'templates', [{ op: 'addSlot', template: 'ListScreen', slot: { name: 'list' } }], 'constrained');
add('removes a slot with its content', 'templates', [{ op: 'removeSlot', template: 'ListScreen', slot: 'header' }], 'constrained');
add('refuses to remove a slot the arrangement places', 'noProfile', [
    { op: 'addTemplate', name: 'Odd', slots: [{ name: 'a' }, { name: 'b' }], arrangement: { root: { kind: 'Row', children: [{ slotName: 'a' }, { slotName: 'b' }] } } },
    { op: 'removeSlot', template: 'Odd', slot: 'a' },
]);
add('refuses a slot that is not there', 'templates', [{ op: 'removeSlot', template: 'ListScreen', slot: 'ghost' }], 'constrained');
add('arranges the slots of a template', 'templates', [{ op: 'arrange', template: 'ListScreen', arrangement: { root: { kind: 'Row', gap: 4, children: [{ slotName: 'list' }, { slotName: 'header' }] } } }], 'constrained');
add('refuses an arrangement that places a slot the template lacks', 'templates', [{ op: 'arrange', template: 'ListScreen', arrangement: { root: { kind: 'Row', children: [{ slotName: 'sidebar' }] } } }], 'constrained');
add('refuses free styling in a template', 'templates', [{ op: 'set', template: 'ListScreen', element: 'list-header', prop: 'color', value: 'red' }], 'constrained');

// ---- Variations chosen, and tweaks lowered
const chosenCases = [['Invoices', 'DashboardScreen']];
const choosing = chosenCases.map(([screen, template]) => {
    const context = createDesignContext(inputs.base);
    const candidate = apply(invoices, [{ op: 'variations', screen, templates: [template] }]).outcomes[0].variations[0];
    return { name: `makes ${template} the layout of ${screen}`, input: 'base', workspace: 'invoices', screen, template, expected: plain(chooseVariation(plain(invoices), context, plain(candidate))) };
});
const tweakValues = [
    ['lowers a profile tweak to a profile operation', { label: 'Corners', kind: 'choice', address: { kind: 'profile', key: 'corners' } }, 'Round'],
    ['lowers an element tweak to a set operation', { label: 'Density', kind: 'choice', address: { kind: 'property', screen: 'Invoices', element: 'invoice-list', prop: 'density' } }, 'compact'],
    ['lowers a numeric element tweak to a number', { label: 'Page size', kind: 'choice', address: { kind: 'property', template: 'ListScreen', element: 'x', prop: 'pageSize' } }, '25'],
    ['lowers a token tweak to a proposal', { label: 'Primary colour', kind: 'hue', address: { kind: 'token', token: 'color.primary' } }, '#123456'],
];
const tweakCases = tweakValues.map(([name, control, value]) => ({ name, control, value, expected: plain(lowerTweak(control, value)) }));
const resolvedControls = [{ label: 'Corners', kind: 'choice', address: { kind: 'profile', key: 'corners' }, options: ['Sharp', 'Round', 'Zigzag'] }, { label: 'Density', kind: 'choice', address: { kind: 'property', screen: 'Invoices', element: 'invoice-list', prop: 'density' } },
        { label: 'Nothing', kind: 'choice', address: { kind: 'property', screen: 'Invoices', element: 'ghost', prop: 'density' } }, { label: 'Accent', kind: 'hue', address: { kind: 'profile', key: 'accent' } }];
const resolvedTweaks = plain(resolveTweaks(resolvedControls, plain(invoices), createDesignContext(inputs.base)));

// ---- Screen sets
const sets = [];
const setCase = (name, initial, steps) => {
    let set = createScreenSet(initial);
    for (const step of steps) {
        if (step.fn === 'add') set = addScreenToSet(set, step.name, step.index);
        else if (step.fn === 'remove') set = removeScreenFromSet(set, step.name);
        else if (step.fn === 'move') set = moveScreenInSet(set, step.name, step.index);
        else set = withStoryline(set, step.storyline);
    }
    sets.push({ name, initial, steps, expected: plain(set) });
};
setCase('creates a set with the default storyline', ['A', 'B', 'C'], []);
setCase('adds a screen at the end', ['A'], [{ fn: 'add', name: 'B' }]);
setCase('adds a screen at a position', ['A', 'B'], [{ fn: 'add', name: 'X', index: 1 }]);
setCase('keeps a screen that is already there where it is', ['A', 'B'], [{ fn: 'add', name: 'A', index: 1 }]);
setCase('removes a screen from every storyline', ['A', 'B', 'C'], [{ fn: 'with', storyline: { name: 'Pay', steps: ['A', 'C'] } }, { fn: 'remove', name: 'C' }]);
setCase('moves a screen and reorders the default storyline only', ['A', 'B', 'C'], [{ fn: 'with', storyline: { name: 'Pay', steps: ['C', 'A'] } }, { fn: 'move', name: 'C', index: 0 }]);
setCase('clamps a move to the set', ['A', 'B', 'C'], [{ fn: 'move', name: 'A', index: 9 }]);
setCase('drops steps of a storyline that name no screen', ['A', 'B'], [{ fn: 'with', storyline: { name: 'Odd', steps: ['A', 'Z', 'B'], title: 'Odd one' } }]);
setCase('does not let the default storyline be replaced', ['A', 'B'], [{ fn: 'with', storyline: { name: 'Default', steps: ['B'] } }]);
const linkCases = [
    { name: 'finds the links between screens', workspace: 'invoices' },
    { name: 'finds the links to screens that were removed', workspace: 'invoices', afterOperations: [{ op: 'removeScreen', name: 'InvoiceDetails' }] },
].map(fixture => {
    const workspace = fixture.afterOperations ? built(invoices, fixture.afterOperations) : plain(invoices);
    return { ...fixture, expected: { links: plain(findScreenLinks(workspace.document)), dangling: plain(findDanglingLinks(workspace.document, workspace.screenSet)), unreached: findUnreachedScreens(workspace.document, workspace.screenSet) } };
});

// ---- Sessions
const subject = { kind: 'story', id: 'story-1' };
const started = { type: 'DesignSessionStarted', sessionId: 's1', subject, mode: 'screens', startedBy: 'ada' };
const rev = (revisionId, screen, text, extra = {}) => ({ type: 'ScreenRevisionRecorded', revisionId, screen, text, operations: [], author: 'ada', ...extra });
const sessions = [];
const sessionCase = (name, events) => sessions.push({ name, events, expected: plain(foldDesignSession(events) ?? null) });
sessionCase('starts a session on a subject', [started]);
sessionCase('starts a session on any kind of subject', [{ ...started, subject: { kind: 'designSystem', id: 'ds-1' }, mode: 'templates' }]);
sessionCase('starts a session with the templates it may use', [{ ...started, templateSet: ['ListScreen', 'FormScreen'] }]);
sessionCase('ignores events before the session started', [rev('r1', 'Invoices', 'screen Invoices')]);
sessionCase('ignores a second start', [started, { ...started, sessionId: 's2', startedBy: 'grace' }]);
sessionCase('records a revision as the current one of a new screen', [started, rev('r1', 'Invoices', 'screen Invoices', { prompt: 'an invoice list', designSystemVersion: '3' })]);
sessionCase('makes each revision the next current one and keeps the basis', [started, rev('r1', 'Invoices', 'a'), rev('r2', 'Invoices', 'b', { operations: [{ op: 'set', screen: 'Invoices', element: 'x', prop: 'p', value: 1 }] }), rev('r3', 'Invoices', 'c', { basisRevisionId: 'r1' })]);
sessionCase('records one revision per screen of a turn', [started, rev('r1', 'Invoices', 'a', { turnId: 't1' }), rev('r2', 'InvoiceDetails', 'b', { turnId: 't1' })]);
sessionCase('ignores a revision id it has', [started, rev('r1', 'Invoices', 'a'), rev('r1', 'Invoices', 'other')]);
sessionCase('reverts to an earlier revision with a new revision', [started, rev('r1', 'Invoices', 'a', { designSystemVersion: '1' }), rev('r2', 'Invoices', 'b'), { type: 'ScreenReverted', revisionId: 'r3', screen: 'Invoices', toRevisionId: 'r1', author: 'grace', turnId: 't2' }]);
sessionCase('ignores a revert to a revision it does not have', [started, rev('r1', 'Invoices', 'a'), { type: 'ScreenReverted', revisionId: 'r2', screen: 'Invoices', toRevisionId: 'nope', author: 'grace' }]);
sessionCase('ignores a revert to a revision of another screen', [started, rev('r1', 'Invoices', 'a'), rev('r2', 'Other', 'b'), { type: 'ScreenReverted', revisionId: 'r3', screen: 'Invoices', toRevisionId: 'r2', author: 'grace' }]);
sessionCase('takes a screen out and keeps its revisions', [started, rev('r1', 'Invoices', 'a'), rev('r2', 'Other', 'b'), { type: 'ScreenRemovedFromDesign', screen: 'Invoices' }]);
sessionCase('reorders the screens', [started, rev('r1', 'A', 'a'), rev('r2', 'B', 'b'), rev('r3', 'C', 'c'), { type: 'ScreensReordered', screens: ['C', 'Z', 'A', 'C'] }]);
sessionCase('proposes variations', [started, rev('r1', 'Invoices', 'a'), { type: 'VariationsProposed', groupId: 'g1', screen: 'Invoices', prompt: 'other layouts', candidates: [{ id: 'c1', text: 'one' }, { id: 'c2', text: 'two' }] }]);
sessionCase('chooses a variation as the next revision and keeps the others', [started, rev('r1', 'Invoices', 'a'), { type: 'VariationsProposed', groupId: 'g1', screen: 'Invoices', prompt: 'other layouts', candidates: [{ id: 'c1', text: 'one' }, { id: 'c2', text: 'two' }] }, { type: 'VariationChosen', groupId: 'g1', candidateId: 'c2', revisionId: 'r2', author: 'grace', turnId: 't3' }]);
sessionCase('ignores a second choice from a group', [started, rev('r1', 'Invoices', 'a'), { type: 'VariationsProposed', groupId: 'g1', screen: 'Invoices', candidates: [{ id: 'c1', text: 'one' }] }, { type: 'VariationChosen', groupId: 'g1', candidateId: 'c1', revisionId: 'r2', author: 'grace' }, { type: 'VariationChosen', groupId: 'g1', candidateId: 'c1', revisionId: 'r3', author: 'grace' }]);
sessionCase('ignores a choice of a candidate that is not there', [started, { type: 'VariationsProposed', groupId: 'g1', screen: 'Invoices', candidates: [{ id: 'c1', text: 'one' }] }, { type: 'VariationChosen', groupId: 'g1', candidateId: 'zz', revisionId: 'r2', author: 'grace' }]);
sessionCase('proposes tweaks that stay until dismissed', [started, { type: 'TweaksProposed', screen: 'Invoices', tweaks: [
    { id: 'k1', label: 'Corners', kind: 'choice', address: { kind: 'profile', key: 'corners' }, options: ['Sharp', 'Round'] },
    { id: 'k2', label: 'Primary', kind: 'hue', address: { kind: 'token', token: 'color.primary' } },
] }, { type: 'TweakDismissed', tweakId: 'k1' }]);
sessionCase('adds comments anchored to an element or a position', [started, { type: 'CommentAdded', commentId: 'm1', screen: 'Invoices', elementId: 'invoice-list', text: 'Too wide', author: 'ada' }, { type: 'CommentAdded', commentId: 'm2', screen: 'Invoices', position: { x: 10, y: 20 }, text: 'Add a logo', author: 'grace' }]);
sessionCase('resolves and reopens a comment', [started, { type: 'CommentAdded', commentId: 'm1', screen: 'Invoices', elementId: 'x', text: 'Too wide', author: 'ada' }, { type: 'CommentResolved', commentId: 'm1' }, { type: 'CommentAdded', commentId: 'm2', screen: 'Invoices', text: 'More', author: 'ada' }, { type: 'CommentResolved', commentId: 'm2' }, { type: 'CommentReopened', commentId: 'm2' }]);
sessionCase('changes and lifts the templates a session may use', [{ ...started, templateSet: ['ListScreen'] }, { type: 'DesignTemplateSetChanged', templateSet: ['ListScreen', 'FormScreen'] }, { type: 'DesignTemplateSetChanged' }]);
sessionCase('designs templates for a design system', [{ ...started, subject: { kind: 'designSystem', id: 'ds-1' }, mode: 'templates', templateSet: ['ListScreen'] }, rev('r1', 'ListScreen', 'screen template ListScreen', { prompt: 'a list template' })]);

const source = foldDesignSession([started, rev('r1', 'Invoices', 'a', { designSystemVersion: '2' }), rev('r2', 'Invoices', 'b', { designSystemVersion: '2' }), rev('r3', 'Details', 'd'), { ...rev('r4', 'Gone', 'g') }, { type: 'ScreenRemovedFromDesign', screen: 'Gone' }, { type: 'DesignTemplateSetChanged', templateSet: ['ListScreen'] }]);
const seeds = [{
    name: 'seeds a session from the current screens of another',
    source: plain(source),
    seed: { sessionId: 'issue-1-design', subject: { kind: 'issue', id: 'issue-1' }, startedBy: 'grace' },
    expectedEvents: plain(seedDesignSession(source, { sessionId: 'issue-1-design', subject: { kind: 'issue', id: 'issue-1' }, startedBy: 'grace' })),
}].map(seed => ({ ...seed, expected: plain(foldDesignSession(seed.expectedEvents)) }));

// A workspace an operation left as it was is recorded as unchanged, which keeps the corpus small.
const recorded = (start, result) => JSON.stringify(result.workspace) === JSON.stringify(plain(start))
    ? { outcomes: result.outcomes, changed: result.changed, workspaceUnchanged: true }
    : result;

// ---- Run the reference package
const catalogues = Object.keys(inputs).map(name => ({ name: `builds the ${name} catalogue`, input: name, expected: plain(buildDesignCatalogue(inputs[name])) }));
const result = {
    description: 'Shared corpus of Scene Design: the catalogue built from an input and the questions it answers, design operations applied to a workspace (the outcome of each, the Scene edits they lowered to and the workspace after), screen sets, and design sessions folded from events. Both @cratis/scene.design and Cratis.Scene.Design answer every case and must produce exactly these answers. Generated by generate-design-fixtures.mjs from the TypeScript package, which is the reference.',
    inputs,
    workspaces: plain(workspaces),
    catalogues,
    questions: queriesAsked.map(([name, input, query]) => ({ name: `${name}`, input, query, expected: plain(queryDesignCatalogue(buildDesignCatalogue(inputs[input]), query)) })),
    operations: ops.map(fixture => ({ ...fixture, expected: recorded(workspaces[fixture.workspace], plain(apply(workspaces[fixture.workspace], fixture.operations, fixture.input))) })),
    variationChoices: choosing,
    tweaks: { lowered: tweakCases, resolved: { workspace: 'invoices', input: 'base', controls: resolvedControls, expected: resolvedTweaks } },
    screenSets: sets,
    screenLinks: linkCases,
    sessions,
    seeds,
};

const lines = (name, items) => `  "${name}": [\n${items.map(item => `    ${JSON.stringify(item)}`).join(',\n')}\n  ]`;
const head = Object.entries(result).filter(([, value]) => !Array.isArray(value)).map(([name, value]) => `  ${JSON.stringify(name)}: ${JSON.stringify(value, null, 2).replace(/\n/g, '\n  ')}`);
const tail = Object.entries(result).filter(([, value]) => Array.isArray(value)).map(([name, value]) => lines(name, value));
writeFileSync(join(import.meta.dirname, 'scene-design-fixtures.json'), `{\n${[...head, ...tail].join(',\n')}\n}\n`);
console.log(`${result.catalogues.length} catalogues, ${result.questions.length} questions, ${result.operations.length} operation cases, ${result.screenSets.length} screen sets, ${result.sessions.length} sessions`);
