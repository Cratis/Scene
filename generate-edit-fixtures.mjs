// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Generates scene-edit-fixtures.json, the corpus both engines apply edits against.
//
// The cases below are the inputs: a document, an editing scope and a sequence of edits. The expected outcome of every edit is
// computed by the TypeScript engine, which is the reference, and written next to it. The TypeScript spec asserts the engine still
// produces what the file records and the C# spec asserts Cratis.Scene.Engine produces the same, so the two cannot drift apart.
//
// Build @cratis/scene.engine first (`yarn build`), then run `node generate-edit-fixtures.mjs`.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyEdit, createDescriptorCatalog } from './Source/JavaScript/engine/dist/esm/index.js';

const frame = () => ({
    visibility: 'Visible', isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 }, horizontalAlignment: 'Stretch', verticalAlignment: 'Stretch',
});
const component = (id, componentName, properties = {}, slots = {}) => ({ id, name: id, componentName, properties, slots, ...frame() });
const stack = (id, children, extra = {}) => ({ id, name: id, children, orientation: 'Vertical', spacing: 4, ...frame(), ...extra });
const wrap = (id, children, extra = {}) => ({ id, name: id, children, orientation: 'Horizontal', itemWidth: 10, ...frame(), ...extra });
const dock = (id, children, extra = {}) => ({ id, name: id, children, lastChildFill: true, ...frame(), ...extra });
const sizeClass = { width: 'Regular', height: 'Regular' };
const compactClass = { width: 'Compact', height: 'Regular' };

const string = (path, label, extra = {}) => ({ path, label, group: 'Content', valueType: 'string', ...extra });

const catalogComponents = [
    {
        component: 'test:navigationBar',
        properties: [
            {
                path: 'items', label: 'Items', group: 'Content', valueType: 'collection',
                item: {
                    label: 'Item',
                    properties: [
                        string('label', 'Label', { constraints: { required: true } }),
                        { path: 'icon', label: 'Icon', group: 'Content', valueType: 'icon' },
                        { path: 'destination', label: 'Destination', group: 'Content', valueType: 'destination' },
                    ],
                },
                constraints: { maximumItems: 6 },
            },
            string('title', 'Title', { default: 'Menu', constraints: { minimumLength: 2, maximumLength: 12, pattern: '[A-Za-z ]+' } }),
            { path: 'density', label: 'Density', group: 'Look', valueType: 'enum', choices: [{ value: 'compact', label: 'Compact' }, { value: 'roomy', label: 'Roomy' }] },
        ],
    },
    {
        component: 'test:table',
        properties: [
            {
                path: 'query', label: 'Query', group: 'Data', valueType: 'queryReference',
                constraints: { resultShapes: ['collection'] },
            },
            { path: 'pageSize', label: 'Page size', group: 'Data', valueType: 'number', constraints: { minimum: 1, maximum: 100, integer: true } },
            string('locked', 'Locked', { readOnly: true }),
            string('caption', 'Caption', { constraints: { required: true } }),
            { path: 'striped', label: 'Striped', group: 'Look', valueType: 'boolean', default: true },
            { path: 'options', label: 'Options', group: 'Look', valueType: 'object', properties: [{ path: 'dense', label: 'Dense', group: 'Look', valueType: 'boolean' }] },
            { path: 'options.dense', label: 'Dense', group: 'Look', valueType: 'boolean' },
            { path: 'tags', label: 'Tags', group: 'Look', valueType: 'json' },
            { path: 'accent', label: 'Accent', group: 'Look', valueType: 'string', acceptedBindingKinds: ['dataContext'] },
        ],
    },
    { component: 'test:text', properties: [string('text', 'Text'), string('label', 'Label')] },
    { component: 'test:button', properties: [string('label', 'Label', { constraints: { required: true } })] },
];

const documents = {};

function frameOfShell() {
    return {
        name: 'Shell',
        slots: [{ name: 'header' }, { name: 'content' }],
        arrangement: {
            root: {
                kind: 'Row', gap: 8,
                children: [{ content: component('brand', 'test:text', { text: 'Brand' }) }, { slotName: 'header' }, { slotName: 'content' }],
            },
        },
    };
}

const homeItem = { id: 'home', values: { label: 'Home', destination: { screen: 'Home' } } };

documents.base = {
    layouts: [frameOfShell()],
    screenTemplates: [
        {
            name: 'Module', fitsSlot: 'content', slots: [{ name: 'chrome' }, { name: 'body' }],
            content: { chrome: [component('navbar', 'test:navigationBar', { items: [{ id: 'home', label: 'Home', destination: { screen: 'Home' } }] })], body: [] },
        },
        {
            name: 'Feature', fitsSlot: 'Module.body', slots: [{ name: 'main' }], content: { main: [] },
            arrangement: {
                root: {
                    kind: 'Column', gap: 8, grow: 1,
                    children: [
                        { kind: 'Row', gap: 4, children: [{ slotName: 'main' }, { content: component('toolbar', 'test:text', { text: 'Tools' }) }] },
                        {
                            kind: 'Grid', gap: 2, columns: 3, rows: 2,
                            children: [{ span: 2, content: component('wide', 'test:text') }, { content: component('narrow', 'test:text') }],
                        },
                    ],
                },
            },
        },
    ],
    dialogTemplates: [],
    screens: [
        {
            name: 'Invoices', layout: 'Shell', screenTemplate: 'Feature', forms: [], contributions: [],
            slotContent: {
                main: [
                    component('invoiceTable', 'test:table', { pageSize: 25, caption: 'Invoices' }),
                    stack('actions', [component('save', 'test:button', { label: 'Save' }), component('cancel', 'test:button', { label: 'Cancel' })], { spacing: 4 }),
                    wrap('wrapper', [component('chip', 'test:text')]),
                    dock('docked', [component('dockedText', 'test:text')]),
                    stack('spacer', [component('spacerText', 'test:text')], { spacing: 0 }),
                    component('mystery', 'test:unknown', { a: 1 }),
                    component('card', 'test:text', {}, { body: [component('cardText', 'test:text', { text: 'Hello' })] }),
                ],
            },
        },
        {
            name: 'Customers', layout: 'Shell', screenTemplate: 'Feature', forms: [], contributions: [],
            slotContent: { main: [component('customerTable', 'test:table', { caption: 'Customers' })] },
        },
    ],
    exposures: [
        {
            owner: 'Module',
            properties: [
                { component: 'navbar', path: 'items', operations: ['add', 'remove', 'reorder', 'edit-fields'], editableFields: ['label', 'destination'] },
                { component: 'navbar', path: 'title' },
            ],
        },
        {
            owner: 'Feature',
            properties: [
                { component: 'navbar', path: 'items', reExposes: 'Module', operations: ['add', 'remove'], editableFields: ['label'] },
                { component: 'navbar', path: 'title', reExposes: 'Module' },
            ],
        },
    ],
    instanceContributions: [
        { instance: 'template:Feature', component: 'navbar', path: 'items', items: [{ id: 'reports', values: { label: 'Reports' } }] },
        { instance: 'screen:Customers', component: 'navbar', path: 'title', value: 'Clients' },
    ],
};

documents.freeform = {
    layouts: [
        {
            name: 'Canvas',
            slots: [{ name: 'content' }],
            arrangement: {
                variants: [
                    {
                        sizeClass,
                        placements: [
                            { element: component('logo', 'test:text', { text: 'Logo' }), x: 0, y: 0, width: 100, height: 40 },
                            { element: stack('banner', [component('tag', 'test:text', { text: 'New' })]), x: 0, y: 50, width: 200, height: 60 },
                        ],
                    },
                    {
                        sizeClass: compactClass,
                        placements: [
                            { element: component('logo', 'test:text', { text: 'Logo' }), x: 0, y: 0, width: 60, height: 30 },
                            { element: stack('banner', [component('tag', 'test:text', { text: 'New' })]), x: 0, y: 40, width: 120, height: 50 },
                        ],
                    },
                ],
            },
        },
    ],
    screenTemplates: [],
    dialogTemplates: [{ name: 'Confirm', slots: [{ name: 'body' }], content: { body: [component('question', 'test:text', { text: 'Sure?' })] } }],
    screens: [],
    exposures: [],
    instanceContributions: [],
};

const screenScope = { kind: 'screen', name: 'Invoices' };
const customersScope = { kind: 'screen', name: 'Customers' };
const featureScope = { kind: 'screenTemplate', name: 'Feature', layout: 'Shell' };
const moduleScope = { kind: 'screenTemplate', name: 'Module', layout: 'Shell' };
const layoutScope = { kind: 'layout', name: 'Shell' };

const flow = 'screenTemplate:Feature#arrangement#flow:root';
const queries = [
    {
        id: 'q1', name: 'AllInvoices', origin: [{ kind: 'slice', id: 's1', name: 'Invoices' }],
        parameters: [{ name: 'status', type: 'string', required: true }, { name: 'page', type: 'int', required: false }],
        resultShape: 'collection', resultFields: [{ name: 'id', type: 'string', isIdentity: true }, { name: 'total', type: 'decimal' }],
    },
    { id: 'q2', name: 'OneInvoice', origin: [], parameters: [], resultShape: 'single', resultFields: [{ name: 'id', type: 'string' }] },
];
const binding = (queryId, extra = {}) => ({ queryId, query: queryId === 'q1' ? 'AllInvoices' : 'Other', arguments: [], results: [], ...extra });

const cases = [];
const add = (name, document, scope, edits, extra = {}) => cases.push({ name, document, scope, ...extra, edits: Array.isArray(edits) ? edits : [edits] });
const set = (nodeId, path, value) => ({ kind: 'setProperty', nodeId, path, value });
const reset = (nodeId, path) => ({ kind: 'resetProperty', nodeId, path });
const insert = (target, extra) => ({ kind: 'insertNode', target, ...extra });
const move = (nodeId, target, extra = {}) => ({ kind: 'moveNode', nodeId, target, ...extra });
const remove = nodeId => ({ kind: 'removeNode', nodeId });
const change = (nodeId, to, acceptLoss) => ({ kind: 'changeLayoutType', nodeId, to, ...(acceptLoss === undefined ? {} : { acceptLoss }) });
const table = 'element:invoiceTable';

// ---- Setting and resetting properties
add('sets a number property of a local component', 'base', screenScope, set(table, 'pageSize', 50));
add('sets a property that did not have a value', 'base', customersScope, set('element:customerTable', 'pageSize', 10));
add('sets a nested property by its dotted path', 'base', screenScope, set(table, 'options.dense', true));
add('sets a nested object value', 'base', screenScope, set(table, 'options', { dense: false }));
add('sets a json property to any json value', 'base', screenScope, set(table, 'tags', { a: [1, 2, { b: null }] }));
add('sets a boolean property', 'base', screenScope, set(table, 'striped', false));
add('refuses a fractional number where a whole number is needed', 'base', screenScope, set(table, 'pageSize', 2.5));
add('refuses a number below the minimum', 'base', screenScope, set(table, 'pageSize', 0));
add('refuses a number above the maximum', 'base', screenScope, set(table, 'pageSize', 101));
add('refuses text where a number is needed', 'base', screenScope, set(table, 'pageSize', 'many'));
add('refuses a number where text is needed', 'base', screenScope, set(table, 'caption', 12));
add('refuses an empty value for a required property', 'base', screenScope, set(table, 'caption', null));
add('refuses a boolean given as text', 'base', screenScope, set(table, 'striped', 'yes'));
add('refuses a read-only property', 'base', screenScope, set(table, 'locked', 'x'));
add('refuses a property the component does not have', 'base', screenScope, set(table, 'missing', 1));
add('refuses an unknown node', 'base', screenScope, set('element:nope', 'pageSize', 1));
add('refuses to change a node inherited from a template', 'base', screenScope, set('element:navbar', 'title', 'Hello'));
add('refuses to change a node inherited from the layout', 'base', screenScope, set('element:brand', 'text', 'Hello'));
add('refuses to change a component nothing describes', 'base', screenScope, set('element:mystery', 'a', 2));
add('refuses an object value with a field that is not described', 'base', screenScope, set(table, 'options', { dense: true, extra: 1 }));
add('refuses a binding kind the property does not accept', 'base', screenScope, set(table, 'accent', { kind: 'literal', path: 'x' }));
add('accepts a binding kind the property accepts', 'base', screenScope, set(table, 'accent', { kind: 'dataContext', path: 'theme.accent' }));
add('refuses a value for a scope that cannot be found', 'base', { kind: 'screen', name: 'Missing' }, set(table, 'pageSize', 1));
add('sets a property of a text component in a slot of a component', 'base', screenScope, set('element:cardText', 'text', 'Bye'));
add('sets the label of a panel by its panel properties', 'base', screenScope, set('element:actions', 'spacing', 12));
add('refuses an enumerated panel property outside its choices', 'base', screenScope, set('element:actions', 'orientation', 'Diagonal'));
add('sets an enumerated panel property', 'base', screenScope, set('element:actions', 'orientation', 'Horizontal'));
add('sets a template property', 'base', featureScope, set('screenTemplate:Feature', 'displayName', 'Feature page'));
add('sets a property of a flow container', 'base', featureScope, set(`${flow}`, 'gap', 16));
add('refuses a negative spacing', 'base', featureScope, set(`${flow}`, 'gap', -1));
add('sets how many columns a flow node spans', 'base', featureScope, set(`${flow}.1.0`, 'span', 3));
add('refuses a span that is not a whole number', 'base', featureScope, set(`${flow}.1.0`, 'span', 1.5));
add('sets a property of a layout\'s own component', 'base', layoutScope, set('element:brand', 'text', 'Acme'));
add('sets a property of a freeform element in every variant', 'freeform', { kind: 'layout', name: 'Canvas' }, set('element:logo', 'text', 'New logo'));
add('sets a property of a component inside a freeform element in every variant', 'freeform', { kind: 'layout', name: 'Canvas' }, set('element:tag', 'text', 'Hot'));
add('sets a placement property', 'freeform', { kind: 'layout', name: 'Canvas' }, set('layout:Canvas#arrangement#freeform:0#placement:logo', 'width', 150));
add('sets a property of a dialog template\'s component', 'freeform', { kind: 'dialogTemplate', name: 'Confirm' }, set('element:question', 'text', 'Really?'));
add('resets a property to its default', 'base', screenScope, reset(table, 'pageSize'));
add('resets a property that was never set', 'base', customersScope, reset('element:customerTable', 'pageSize'));
add('resets a nested property', 'base', screenScope, [set(table, 'options.dense', true), reset(table, 'options.dense')]);
add('refuses to reset a required property that has no default', 'base', screenScope, reset(table, 'caption'));
add('resets a property of a freeform element in every variant', 'freeform', { kind: 'layout', name: 'Canvas' }, reset('element:logo', 'text'));
add('refuses to reset an inherited node', 'base', screenScope, reset('element:navbar', 'title'));
add('sets a property then takes it back', 'base', screenScope, [set(table, 'pageSize', 5), reset(table, 'pageSize'), set(table, 'pageSize', 7)]);

// ---- Query bindings
add('binds a property to a query offered by the host', 'base', screenScope, set(table, 'query', binding('q1', { arguments: [{ parameter: 'status', source: { kind: 'literal', path: 'open' } }], results: [{ target: 'rows', field: 'id' }] })), { queryCandidates: queries });
add('binds a property to a query by its name', 'base', screenScope, set(table, 'query', 'AllInvoices'), { queryCandidates: queries });
add('refuses a binding to a query the host does not offer', 'base', screenScope, set(table, 'query', binding('q9')), { queryCandidates: queries });
add('refuses a binding to a query returning a shape the property does not accept', 'base', screenScope, set(table, 'query', binding('q2')), { queryCandidates: queries });
add('refuses a binding that leaves a required parameter out', 'base', screenScope, set(table, 'query', binding('q1')), { queryCandidates: queries });
add('refuses a binding with an argument for a parameter the query does not have', 'base', screenScope, set(table, 'query', binding('q1', { arguments: [{ parameter: 'status', source: { kind: 'literal', path: 'a' } }, { parameter: 'nope', source: { kind: 'literal', path: 'b' } }] })), { queryCandidates: queries });
add('refuses a binding to a result field the query does not return', 'base', screenScope, set(table, 'query', binding('q1', { arguments: [{ parameter: 'status', source: { kind: 'literal', path: 'a' } }], results: [{ target: 'rows', field: 'nope' }] })), { queryCandidates: queries });
add('checks a query binding for shape only when the host offers no queries', 'base', screenScope, set(table, 'query', binding('q9')));
add('refuses a query binding without arguments and results', 'base', screenScope, set(table, 'query', { queryId: 'q1', query: 'AllInvoices' }), { queryCandidates: queries });
add('refuses a value that is neither a query name nor a binding', 'base', screenScope, set(table, 'query', 5), { queryCandidates: queries });

// ---- Changing layout types
add('changes a flow row into a flow column', 'base', featureScope, change(`${flow}.0`, 'flowColumn'));
add('changes a flow column into a flow grid', 'base', featureScope, change(flow, 'flowGrid'));
add('refuses to change a flow grid into a flow row when it would drop what it holds', 'base', featureScope, change(`${flow}.1`, 'flowRow'));
add('changes a flow grid into a flow row when the loss is accepted', 'base', featureScope, change(`${flow}.1`, 'flowRow', true));
add('refuses to change a flow grid into a flow column when the loss is explicitly not accepted', 'base', featureScope, change(`${flow}.1`, 'flowColumn', false));
add('refuses a conversion the layout type does not allow', 'base', featureScope, change(`${flow}.0`, 'canvas'));
add('refuses to change a flow leaf into anything', 'base', featureScope, change(`${flow}.0.1`, 'flowRow'));
add('refuses to change a node that is no layout node', 'base', featureScope, change('screenTemplate:Feature', 'flowRow'));
add('refuses to change a plain component', 'base', screenScope, change(table, 'stackPanel'));
add('refuses to change an unknown node', 'base', screenScope, change('element:nope', 'stackPanel'));
add('refuses to change an inherited layout node', 'base', screenScope, change(`${flow}.0`, 'flowColumn'));
add('refuses to change a stack panel into a wrap panel when it would drop its spacing', 'base', screenScope, change('element:actions', 'wrapPanel'));
add('changes a stack panel into a wrap panel when the loss is accepted', 'base', screenScope, change('element:actions', 'wrapPanel', true));
add('refuses to change a wrap panel into a stack panel when it would drop its item width', 'base', screenScope, change('element:wrapper', 'stackPanel'));
add('changes a wrap panel into a stack panel when the loss is accepted', 'base', screenScope, change('element:wrapper', 'stackPanel', true));
add('changes a stack panel without spacing into a wrap panel', 'base', screenScope, change('element:spacer', 'wrapPanel'));
add('changes a stack panel without spacing into a dock panel when the loss is accepted', 'base', screenScope, change('element:spacer', 'dockPanel', true));
add('changes a wrap panel into a dock panel and drops its item width when accepted', 'base', screenScope, change('element:wrapper', 'dockPanel', true));
add('refuses to change a dock panel into a stack panel when it would drop its fill', 'base', screenScope, change('element:docked', 'stackPanel'));
add('changes a dock panel into a stack panel when the loss is accepted', 'base', screenScope, change('element:docked', 'stackPanel', true));
add('changes a dock panel into a wrap panel', 'base', screenScope, change('element:docked', 'wrapPanel', true));
add('changes a freeform element\'s panel in every variant', 'freeform', { kind: 'layout', name: 'Canvas' }, change('element:banner', 'wrapPanel', true));

// ---- Inserting nodes
add('inserts an element into a slot', 'base', screenScope, insert('screen:Invoices#slot:main', { element: component('extra', 'test:text', { text: 'Extra' }) }));
add('inserts an element at a position in a slot', 'base', screenScope, insert('screen:Invoices#slot:main', { index: 0, element: component('first', 'test:text') }));
add('inserts an element into a slot that has no content yet', 'base', customersScope, insert('screen:Customers#slot:main', { index: 1, element: component('second', 'test:text') }));
add('inserts an element into a panel', 'base', screenScope, insert('element:actions', { element: component('help', 'test:button', { label: 'Help' }) }));
add('inserts an element into a panel at a position', 'base', screenScope, insert('element:actions', { index: 1, element: component('help', 'test:button', { label: 'Help' }) }));
add('inserts an element into a slot of a component', 'base', screenScope, insert('element:card', { slot: 'body', element: component('cardExtra', 'test:text') }));
add('inserts an element into a component slot that did not exist', 'base', screenScope, insert('element:card', { slot: 'footer', element: component('cardFooter', 'test:text') }));
add('refuses to insert into a component without saying which slot', 'base', screenScope, insert('element:card', { element: component('lost', 'test:text') }));
add('inserts an element into a flow container as a leaf', 'base', featureScope, insert(flow, { element: component('flowExtra', 'test:text') }));
add('inserts a flow node into a flow container', 'base', featureScope, insert(`${flow}.0`, { index: 0, flowNode: { content: component('flowLeafExtra', 'test:text') } }));
add('inserts a flow container into a flow container', 'base', featureScope, insert(flow, { flowNode: { kind: 'Row', gap: 1, children: [{ content: component('nestedLeaf', 'test:text') }] } }));
add('refuses to insert a flow node into a slot', 'base', screenScope, insert('screen:Invoices#slot:main', { flowNode: { content: component('x', 'test:text') } }));
add('refuses to insert into a flow leaf', 'base', featureScope, insert(`${flow}.0.1`, { element: component('x', 'test:text') }));
add('refuses to insert into a slot leaf', 'base', featureScope, insert(`${flow}.0.0`, { element: component('x', 'test:text') }));
add('refuses to insert an element and a flow node together', 'base', featureScope, insert(flow, { element: component('x', 'test:text'), flowNode: { content: component('y', 'test:text') } }));
add('refuses to insert nothing', 'base', featureScope, insert(flow, {}));
add('refuses an element id that is already used', 'base', screenScope, insert('screen:Invoices#slot:main', { element: component('invoiceTable', 'test:text') }));
add('refuses an element whose children reuse an id', 'base', screenScope, insert('screen:Invoices#slot:main', { element: stack('fresh', [component('save', 'test:text')]) }));
add('refuses an element that uses an id twice inside itself', 'base', screenScope, insert('screen:Invoices#slot:main', { element: stack('fresh', [component('twice', 'test:text'), component('twice', 'test:text')]) }));
add('refuses a position outside the list', 'base', screenScope, insert('screen:Invoices#slot:main', { index: 99, element: component('late', 'test:text') }));
add('refuses a negative position', 'base', screenScope, insert('screen:Invoices#slot:main', { index: -1, element: component('early', 'test:text') }));
add('refuses to insert into an unknown node', 'base', screenScope, insert('element:nope', { element: component('x', 'test:text') }));
add('refuses to insert into an inherited node', 'base', screenScope, insert('screenTemplate:Module#slot:body', { element: component('x', 'test:text') }));
add('refuses to insert into a slot a layout declares', 'base', layoutScope, insert('layout:Shell#slot:content', { element: component('x', 'test:text') }));
add('refuses to insert into a component that holds one element', 'base', screenScope, insert(table, { element: component('x', 'test:text') }));
add('refuses to insert into a node that takes no children', 'base', screenScope, insert('screen:Invoices', { element: component('x', 'test:text') }));
add('inserts an element into a freeform element\'s panel in every variant', 'freeform', { kind: 'layout', name: 'Canvas' }, insert('element:banner', { element: component('badge', 'test:text') }));
add('inserts and removes an element again', 'base', screenScope, [insert('screen:Invoices#slot:main', { element: component('temp', 'test:text') }), remove('element:temp')]);

// ---- Moving nodes
add('moves an element to another position in the same slot', 'base', screenScope, move('element:mystery', 'screen:Invoices#slot:main', { index: 0 }));
add('moves an element to the end of the same slot', 'base', screenScope, move('element:invoiceTable', 'screen:Invoices#slot:main'));
add('moves an element into a panel', 'base', screenScope, move('element:mystery', 'element:actions', { index: 1 }));
add('moves an element out of a panel into a slot', 'base', screenScope, move('element:save', 'screen:Invoices#slot:main'));
add('moves an element into a flow container as a leaf', 'base', featureScope, move('element:toolbar', `${flow}.1`));
add('moves a flow node within its container', 'base', featureScope, move(`${flow}.1.0`, `${flow}.1`));
add('moves a flow node into another container', 'base', featureScope, move(`${flow}.1.0`, `${flow}.0`, { index: 0 }));
add('refuses to move a flow node into a slot', 'base', screenScope, move(`${flow}.0`, 'screen:Invoices#slot:main'));
add('refuses to move a node into itself', 'base', screenScope, move('element:actions', 'element:actions'));
add('refuses to move a node into something inside it', 'base', screenScope, move('element:actions', 'element:save'));
add('refuses to move into a position outside the list', 'base', screenScope, move('element:mystery', 'screen:Invoices#slot:main', { index: 50 }));
add('refuses to move an unknown node', 'base', screenScope, move('element:nope', 'screen:Invoices#slot:main'));
add('refuses to move into an unknown node', 'base', screenScope, move('element:mystery', 'element:nope'));
add('refuses to move an inherited node', 'base', screenScope, move('element:navbar', 'screen:Invoices#slot:main'));
add('refuses to move a slot', 'base', screenScope, move('screen:Invoices#slot:main', 'screen:Invoices#slot:main'));
add('refuses to move into an inherited node', 'base', screenScope, move('element:mystery', 'screenTemplate:Module#slot:body'));
add('moves a component into a slot of another component', 'base', screenScope, move('element:mystery', 'element:card', { slot: 'body' }));

// ---- Removing nodes
add('removes an element from a slot', 'base', screenScope, remove('element:mystery'));
add('removes an element from a panel', 'base', screenScope, remove('element:cancel'));
add('removes an element and what is in it', 'base', screenScope, remove('element:actions'));
add('removes the element a flow leaf holds together with the leaf', 'base', featureScope, remove('element:toolbar'));
add('removes a flow node', 'base', featureScope, remove(`${flow}.1`));
add('removes a freeform element from every variant', 'freeform', { kind: 'layout', name: 'Canvas' }, remove('element:logo'));
add('refuses to remove a slot', 'base', screenScope, remove('screen:Invoices#slot:main'));
add('refuses to remove an unknown node', 'base', screenScope, remove('element:nope'));
add('refuses to remove an inherited node', 'base', screenScope, remove('element:navbar'));
add('refuses to remove a screen', 'base', screenScope, remove('screen:Invoices'));
add('removes a component inside a freeform element from every variant', 'freeform', { kind: 'layout', name: 'Canvas' }, remove('element:tag'));
add('removes an element from a dialog template', 'freeform', { kind: 'dialogTemplate', name: 'Confirm' }, remove('element:question'));

// ---- Instance values
add('sets what the scope contributes to an exposed property', 'base', screenScope, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'Billing' });
add('sets it again over what was contributed before', 'base', customersScope, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'Clients area' });
add('refuses a contributed value that does not fit', 'base', screenScope, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 5 });
add('refuses a contributed value that is too short', 'base', screenScope, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'A' });
add('refuses a contributed value that does not match the pattern', 'base', screenScope, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'Menu 2' });
add('refuses a contributed value that is too long', 'base', screenScope, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'A very long menu title' });
add('refuses a value for a property that is not exposed', 'base', screenScope, { kind: 'setInstanceValue', component: 'navbar', path: 'density', value: 'roomy' });
add('refuses a value for a component that is not there', 'base', screenScope, { kind: 'setInstanceValue', component: 'ghost', path: 'title', value: 'Boo' });
add('refuses to set a collection as a value', 'base', screenScope, { kind: 'setInstanceValue', component: 'navbar', path: 'items', value: [] });
add('refuses to edit as another instance', 'base', screenScope, { kind: 'setInstanceValue', instance: 'screen:Customers', component: 'navbar', path: 'title', value: 'Billing' });
add('accepts the instance of the scope by name', 'base', screenScope, { kind: 'setInstanceValue', instance: 'screen:Invoices', component: 'navbar', path: 'title', value: 'Billing' });
add('refuses to contribute when the scope cannot be found', 'base', { kind: 'screen', name: 'Missing' }, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'Boo' });
add('sets what a template contributes to what a layout or template above exposed', 'base', featureScope, { kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'Features' });
add('resets what the scope contributed', 'base', customersScope, { kind: 'resetInstanceValue', component: 'navbar', path: 'title' });
add('resets what the scope never contributed', 'base', screenScope, { kind: 'resetInstanceValue', component: 'navbar', path: 'title' });
add('refuses to reset what is not exposed', 'base', screenScope, { kind: 'resetInstanceValue', component: 'navbar', path: 'density' });
add('sets a contributed value then resets it', 'base', screenScope, [{ kind: 'setInstanceValue', component: 'navbar', path: 'title', value: 'Billing' }, { kind: 'resetInstanceValue', component: 'navbar', path: 'title' }]);

// ---- Collection items
const item = (id, label, extra = {}) => ({ id, values: { label, ...extra } });
add('adds an item to an exposed collection', 'base', screenScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('invoices', 'Invoices') });
add('adds an item at a position', 'base', screenScope, [{ kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('a', 'A') }, { kind: 'addCollectionItem', component: 'navbar', path: 'items', index: 0, item: item('b', 'B') }]);
add('adds an item on top of what the scope already contributed', 'base', featureScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('docs', 'Docs', { destination: { screen: 'Docs' } }) });
add('refuses an item without an id', 'base', screenScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: { id: '', values: { label: 'X' } } });
add('refuses an item whose id the owner already uses', 'base', screenScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('home', 'Again') });
add('refuses an item whose id another level already uses', 'base', screenScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('reports', 'Again') });
add('refuses an item with a field that is not exposed for editing', 'base', screenScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('x', 'X', { destination: { screen: 'Y' } }) });
add('refuses an item with a field that does not exist', 'base', featureScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('x', 'X', { nope: 1 }) });
add('refuses an item without a required field', 'base', featureScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: { id: 'x', values: {} } });
add('refuses an item with a field value that does not fit', 'base', featureScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('x', 5) });
add('refuses an item at a position outside the list', 'base', screenScope, { kind: 'addCollectionItem', component: 'navbar', path: 'items', index: 3, item: item('x', 'X') });
add('refuses to go over the most items a collection allows', 'base', featureScope, [1, 2, 3, 4, 5, 6].map(number => ({ kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item(`i${number}`, `I${number}`) })));
add('refuses to add to a collection that is not exposed', 'base', screenScope, { kind: 'addCollectionItem', component: 'navbar', path: 'title', item: item('x', 'X') });
add('refuses to add to something that is no collection', 'base', featureScope, { kind: 'addCollectionItem', component: 'navbar', path: 'title', item: item('x', 'X') });
add('removes an item the scope added', 'base', screenScope, [{ kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('x', 'X') }, { kind: 'removeCollectionItem', component: 'navbar', path: 'items', itemId: 'x' }]);
add('removes an item another instance contributed from the scope that owns it', 'base', featureScope, { kind: 'removeCollectionItem', component: 'navbar', path: 'items', itemId: 'reports' });
add('refuses to remove an item the owner fixed', 'base', featureScope, { kind: 'removeCollectionItem', component: 'navbar', path: 'items', itemId: 'home' });
add('refuses to remove an item another instance contributed', 'base', screenScope, { kind: 'removeCollectionItem', component: 'navbar', path: 'items', itemId: 'reports' });
add('refuses to remove an item that is not there', 'base', screenScope, { kind: 'removeCollectionItem', component: 'navbar', path: 'items', itemId: 'ghost' });
add('refuses to reorder when the exposure does not allow it', 'base', screenScope, [{ kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('x', 'X') }, { kind: 'reorderCollectionItem', component: 'navbar', path: 'items', itemId: 'x', index: 0 }]);
add('reorders the items the scope contributed', 'base', featureScope, [
    { kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('a', 'A') },
    { kind: 'reorderCollectionItem', component: 'navbar', path: 'items', itemId: 'a', index: 0 },
]);
add('refuses to reorder to a position outside the list', 'base', featureScope, { kind: 'reorderCollectionItem', component: 'navbar', path: 'items', itemId: 'reports', index: 4 });
add('refuses to reorder an item that is not there', 'base', featureScope, { kind: 'reorderCollectionItem', component: 'navbar', path: 'items', itemId: 'ghost', index: 0 });
add('changes one field of an item the scope contributed', 'base', featureScope, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'reports', field: 'label', value: 'Reporting' });
add('changes a field that was not set yet', 'base', featureScope, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'reports', field: 'destination', value: { screen: 'Reports' } });
add('refuses to change a field that is not exposed for editing', 'base', screenScope, [{ kind: 'addCollectionItem', component: 'navbar', path: 'items', item: item('x', 'X') }, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'x', field: 'destination', value: { screen: 'Y' } }]);
add('refuses to change a field that does not exist', 'base', featureScope, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'reports', field: 'nope', value: 1 });
add('refuses to change a field to a value that does not fit', 'base', featureScope, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'reports', field: 'label', value: 7 });
add('clears a field of an item', 'base', featureScope, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'reports', field: 'label', value: null });
add('refuses to change an item the owner fixed', 'base', featureScope, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'home', field: 'label', value: 'Start' });
add('refuses to change an item that is not there', 'base', featureScope, { kind: 'editCollectionItem', component: 'navbar', path: 'items', itemId: 'ghost', field: 'label', value: 'Boo' });

// ---- Exposure
add('exposes a property of a component the template owns', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'density' } });
add('exposes a property under a label of its own', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'density', label: 'Row height' } });
add('exposes a collection with the operations it allows', 'base', moduleScope, [
    { kind: 'unexposeProperty', owner: 'Module', component: 'navbar', path: 'items' },
    { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'items', operations: ['add', 'replace'], editableFields: ['label'] } },
]);
add('exposes a property again, replacing what was declared', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'title', label: 'Heading' } });
add('exposes a property for an owner that had declared nothing', 'base', layoutScope, { kind: 'exposeProperty', owner: 'Shell', property: { component: 'brand', path: 'text' } });
add('refuses to expose for an owner that is not being edited', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Feature', property: { component: 'navbar', path: 'density' } });
add('refuses to expose a component the owner does not have', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'ghost', path: 'title' } });
add('refuses to expose a property the component does not have', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'nope' } });
add('refuses operations on a property that is no collection', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'density', operations: ['add'] } });
add('refuses editable fields on a property that is no collection', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'density', editableFields: ['label'] } });
add('refuses editable fields the items do not have', 'base', moduleScope, { kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'items', operations: ['add'], editableFields: ['nope'] } });
add('re-exposes less of what an owner exposed', 'base', featureScope, { kind: 'exposeProperty', owner: 'Feature', property: { component: 'navbar', path: 'title', reExposes: 'Module' } });
add('re-exposes a collection with fewer operations', 'base', featureScope, { kind: 'exposeProperty', owner: 'Feature', property: { component: 'navbar', path: 'items', reExposes: 'Module', operations: ['add'], editableFields: ['label'] } });
add('refuses to re-expose more operations than the owner exposed', 'base', featureScope, [
    { kind: 'exposeProperty', owner: 'Feature', property: { component: 'navbar', path: 'items', reExposes: 'Module', operations: ['add', 'replace'] } },
]);
add('refuses to re-expose more fields than the owner exposed', 'base', featureScope, { kind: 'exposeProperty', owner: 'Feature', property: { component: 'navbar', path: 'items', reExposes: 'Module', operations: ['add'], editableFields: ['label', 'icon'] } });
add('refuses to re-expose something the named owner did not expose', 'base', featureScope, { kind: 'exposeProperty', owner: 'Feature', property: { component: 'navbar', path: 'density', reExposes: 'Module' } });
add('refuses to re-expose from an owner that is not the one that exposed it', 'base', featureScope, { kind: 'exposeProperty', owner: 'Feature', property: { component: 'navbar', path: 'title', reExposes: 'Shell' } });
add('withdraws an exposure', 'base', moduleScope, { kind: 'unexposeProperty', owner: 'Module', component: 'navbar', path: 'title' });
add('withdraws one of an owner\'s exposures', 'base', featureScope, { kind: 'unexposeProperty', owner: 'Feature', component: 'navbar', path: 'items' });
add('withdraws the last exposure of an owner and its declaration', 'base', featureScope, [
    { kind: 'unexposeProperty', owner: 'Feature', component: 'navbar', path: 'items' },
    { kind: 'unexposeProperty', owner: 'Feature', component: 'navbar', path: 'title' },
]);
add('refuses to withdraw what is not exposed', 'base', moduleScope, { kind: 'unexposeProperty', owner: 'Module', component: 'navbar', path: 'density' });
add('refuses to withdraw for an owner that is not being edited', 'base', moduleScope, { kind: 'unexposeProperty', owner: 'Feature', component: 'navbar', path: 'items' });
add('refuses to withdraw from an owner that declared nothing', 'base', layoutScope, { kind: 'unexposeProperty', owner: 'Shell', component: 'brand', path: 'text' });
add('exposes then withdraws again', 'base', moduleScope, [{ kind: 'exposeProperty', owner: 'Module', property: { component: 'navbar', path: 'density' } }, { kind: 'unexposeProperty', owner: 'Module', component: 'navbar', path: 'density' }]);

// ---- Edits on a layout and with a scope the chain cannot place
add('removes a flow leaf of a layout', 'base', layoutScope, remove('element:brand'));
add('edits a template whose layout cannot be found', 'base', { kind: 'screenTemplate', name: 'Feature', layout: 'Nope' }, set('element:toolbar', 'text', 'X'));
add('edits a template without naming its layout when the document has only one', 'base', { kind: 'screenTemplate', name: 'Feature' }, set('element:toolbar', 'text', 'X'));

// ---- Run the reference engine
const catalog = createDescriptorCatalog(catalogComponents);
const result = { description: 'Shared corpus of Scene edits: a document, an editing scope and a sequence of edits, with the outcome of each. Both @cratis/scene.engine (applyEdit) and Cratis.Scene.Engine (EditApplier) apply every case and must produce exactly these outcomes. Generated by generate-edit-fixtures.mjs from the TypeScript engine, which is the reference.', components: catalogComponents, documents, cases: [] };
const plain = value => JSON.parse(JSON.stringify(value));

for (const fixture of cases) {
    let current = plain(documents[fixture.document]);
    const steps = [];
    const context = { catalog, scope: fixture.scope, ...(fixture.queryCandidates ? { queryCandidates: fixture.queryCandidates } : {}) };
    for (const edit of fixture.edits) {
        const outcome = applyEdit(current, plain(edit), context);
        steps.push({ edit, applied: outcome.applied, diagnostics: plain(outcome.diagnostics) });
        current = plain(outcome.model);
    }

    // Only the parts of the document the edits changed are recorded; everything else is the starting document's.
    const start = documents[fixture.document];
    const changed = Object.fromEntries(Object.keys(start).filter(section => JSON.stringify(start[section]) !== JSON.stringify(current[section])).map(section => [section, current[section]]));
    result.cases.push({ ...fixture, steps, expectedChanges: changed });
}

// One line per case keeps the file reviewable and small; the rest is indented.
const text = JSON.stringify({ ...result, cases: '@cases@' }, null, 2).replace('"@cases@"', `[\n${result.cases.map(fixture => `    ${JSON.stringify(fixture)}`).join(',\n')}\n  ]`);
writeFileSync(join(import.meta.dirname, 'scene-edit-fixtures.json'), `${text}\n`);
console.log(`${result.cases.length} cases, ${result.cases.reduce((count, fixture) => count + fixture.steps.length, 0)} edits`);
