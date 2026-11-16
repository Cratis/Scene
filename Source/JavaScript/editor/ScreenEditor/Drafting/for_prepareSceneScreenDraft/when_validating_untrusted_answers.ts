// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.react';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { elementNodeId } from '@cratis/scene.engine';
import { PropertyValueType, SceneEditKind, type QueryCandidate } from '@cratis/scene.model';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createPanel } from '../../Document/createPanel';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createScreenDocument, editingScope } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { prepareSceneScreenDraft } from '../prepareSceneScreenDraft';

const runtime = createScreenEditorRuntime([corePackage, cratisComponentsPackage], { name: 'test', packages: ['core', 'Cratis.Components'], targetPlatform: 'web' });
const document = createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen'));
const original = JSON.stringify(document);
const candidate: QueryCandidate = { id: 'customers', name: 'Customers', origin: [], parameters: [], resultShape: 'collection', resultFields: [{ name: 'name', type: 'string' }] };
const context = { catalog: runtime.catalog, scope: editingScope(), queryCandidates: [candidate] };
const insert = { kind: SceneEditKind.InsertNode, target: elementNodeId('screen-root'), element: createExternalComponent('draft-table', 'Label', 'core:text') };
const binding = { queryId: 'customers', query: 'Customers', arguments: [], results: [{ target: 'name', field: 'name' }] };
const property = (value: unknown) => ({ kind: SceneEditKind.SetProperty, nodeId: elementNodeId('draft-table'), path: 'query', value });
const prepare = (edits: unknown[], candidates = [candidate]) => prepareSceneScreenDraft(document, JSON.stringify({ reply: 'Added a table', edits }), { runtime, context: { ...context, queryCandidates: candidates }, parameterlessQueryIds: ['customers'] });

const hostileBindings: [string, unknown][] = [
    ['an unknown query string', 'Missing'],
    ['existing-name shorthand', 'Customers'],
    ['an unknown ID', { ...binding, queryId: 'unknown' }],
    ['an unknown name', { ...binding, query: 'Missing' }],
    ['a mismatched actual name', { ...binding, query: 'Other' }],
    ['a literal argument', { ...binding, arguments: [{ parameter: 'id', value: '1' }] }],
    ['an unresolved source', { ...binding, arguments: [{ parameter: 'id', source: { kind: 'dataContext', path: 'missing' } }] }],
    ['an expression', { ...binding, expression: 'evil()' }],
    ['an unknown result field', { ...binding, results: [{ target: 'name', field: 'missing' }] }],
    ['missing arguments', { queryId: 'customers', query: 'Customers', results: [] }],
];

describe('when validating untrusted Scene screen draft answers', () => {
    it('should reject even a valid canonical parameterless query object after a valid insert', () => {
        const result = prepare([insert, property(binding)]);
        (result.prepared === undefined).should.be.true;
        JSON.stringify(document).should.equal(original);
    });
    for (const [name, value] of hostileBindings) {
        it(`should reject ${name} atomically`, () => {
            const result = prepare([insert, property(value)]);
            (result.prepared === undefined).should.be.true;
            JSON.stringify(document).should.equal(original);
        });
    }
    it('should reject declared required parameters despite empty arguments', () => (prepare([insert, property(binding)], [{ ...candidate, parameters: [{ name: 'id', type: 'string', required: true }] }]).prepared === undefined).should.be.true);
    it('should reject optional parameters despite empty arguments', () => (prepare([insert, property(binding)], [{ ...candidate, parameters: [{ name: 'id', type: 'string', required: false }] }]).prepared === undefined).should.be.true);
    it('should reject incompatible result shape', () => (prepare([insert, property(binding)], [{ ...candidate, resultShape: 'single' }]).prepared === undefined).should.be.true);
    for (const component of runtime.catalog.components.filter(component => component.properties.some(property => property.valueType === PropertyValueType.QueryReference))) {
        it(`should reject the query control ${component.component} even without a binding`, () => {
            (prepare([insert, { ...insert, element: createExternalComponent('query-control', 'Query', component.component) }]).prepared === undefined).should.be.true;
        });
    }
    for (const component of ['core:action', 'core:toolbarItem', 'core:sliceDialog', 'core:table', 'table', 'dataTable', 'core:data']) {
        it(`should reject unsupported executable or slot component ${component}`, () => {
            (prepare([{ ...insert, element: createExternalComponent('unsupported', 'Unsupported', component) }]).prepared === undefined).should.be.true;
        });
    }
    it('should reject a component with a slot payload even when empty', () => (prepare([{ ...insert, element: { ...insert.element, slots: { content: [] } } }]).prepared === undefined).should.be.true);
    for (const [field, value] of [['bindings', [{ query: 'customers' }]], ['slots', { content: [] }], ['actions', [{ command: 'Delete' }]], ['queries', ['customers']], ['unknown', true]] as const) {
        it(`should reject the whole answer carrying a top-level ${field} field beside valid edits`, () => {
            const result = prepareSceneScreenDraft(document, JSON.stringify({ reply: 'Added', edits: [insert], [field]: value }), { runtime, context, parameterlessQueryIds: [] });
            (result.prepared === undefined).should.be.true;
            JSON.stringify(document).should.equal(original);
        });
    }
    it('should reject a full replacement document', () => (prepareSceneScreenDraft(document, JSON.stringify({ reply: '', document, edits: [insert] }), { runtime, context, parameterlessQueryIds: [] }).prepared === undefined).should.be.true);
    it('should reject embedded binding payloads', () => (prepare([{ ...insert, element: { ...insert.element, bindings: { text: 'Customers.name' } } }]).prepared === undefined).should.be.true);
    it('should reject embedded property bypasses', () => (prepare([{ ...insert, element: { ...insert.element, properties: { query: 'Missing' } } }]).prepared === undefined).should.be.true);
    it('should reject duplicate IDs', () => (prepare([insert, insert]).prepared === undefined).should.be.true);
    it('should reject another screen target', () => (prepare([{ ...insert, target: elementNodeId('other-screen-root') }]).prepared === undefined).should.be.true);
    it('should reject extraneous insert fields', () => (prepare([{ ...insert, script: 'evil()' }]).prepared === undefined).should.be.true);
    it('should reject unknown property paths', () => (prepare([insert, { ...property('evil'), path: '__proto__.value' }]).prepared === undefined).should.be.true);
    it('should reject a late unknown edit without returning an earlier candidate', () => (prepare([insert, { kind: 'deleteNode' }]).prepared === undefined).should.be.true);
    it('should reject empty proposals', () => (prepare([]).prepared === undefined).should.be.true);
    it('should reject over 100 edits', () => (prepare(Array.from({ length: 101 }, () => insert)).prepared === undefined).should.be.true);
    it('should reject unknown component names', () => (prepare([{ ...insert, element: createExternalComponent('draft-table', 'Table', 'unknown:table') }]).prepared === undefined).should.be.true);
    it('should reject a globally known but inactive package', () => {
        const inactive = createScreenEditorRuntime([corePackage, cratisComponentsPackage], { name: 'test', packages: ['core'], targetPlatform: 'web' });
        (prepareSceneScreenDraft(document, JSON.stringify({ reply: '', edits: [{ ...insert, element: createExternalComponent('draft-table', 'Table', 'Cratis.Components:dataTable') }] }), { runtime: inactive, context, parameterlessQueryIds: ['customers'] }).prepared === undefined).should.be.true;
    });
});
