// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, ExternalComponent, QueryBinding, SceneEditKind } from '@cratis/scene.model';
import { applyEdit, flowNodeId } from '../index';
import { createLayoutDocument, homeContext, mainSlot, pageContext } from '../given/a_layout_document';
import { apply, codesOf } from './given/edits';

describe('when setting a property', () => {
    const document = createLayoutDocument();
    const column = flowNodeId(mainSlot, 'root', []);

    it('should set a property on a node the scope owns', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetProperty, nodeId: column, path: 'gap', value: 16 }, pageContext());
        outcome.applied.should.be.true;
        (outcome.model.screenTemplates[0].slots[0].arrangement as unknown as { root: { gap: number } }).root.gap.should.equal(16);
    });

    it('should not touch the document it was given', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetProperty, nodeId: column, path: 'gap', value: 16 }, pageContext());
        (outcome.model === document).should.be.false;
        (document.screenTemplates[0].slots[0].arrangement as unknown as { root: { gap: number } }).root.gap.should.equal(8);
    });

    it('should set a component property in its bag', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:g', path: 'pageSize', value: 50 }, pageContext());
        outcome.applied.should.be.true;
        const stack = outcome.model.screenTemplates[0].content!.side[0] as unknown as { children: ExternalComponent[] };
        (stack.children[0].properties.pageSize as number).should.equal(50);
    });

    it('should apply to every size-class copy of a freeform element', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:f', path: 'pageSize', value: 5 }, pageContext());
        outcome.applied.should.be.true;
        const variants = (outcome.model.screenTemplates[0].slots[1].arrangement as unknown as { variants: { placements: { element: { children: ExternalComponent[] } }[] }[] }).variants;
        variants.map(variant => variant.placements[0].element.children[0].properties.pageSize).should.deep.equal([5, 5]);
    });

    it('should refuse a value that breaks a constraint and hand back the same document', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetProperty, nodeId: column, path: 'gap', value: -1 }, pageContext());
        outcome.applied.should.be.false;
        codesOf(outcome).should.deep.equal([DiagnosticCode.InvalidValue]);
    });

    it('should return the very same document object when refusing', () => {
        const input = structuredClone(document);
        const outcome = applyEdit(input, { kind: SceneEditKind.SetProperty, nodeId: column, path: 'gap', value: 'wide' }, pageContext());
        (outcome.model === input).should.be.true;
    });

    it('should refuse a property the node does not have', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetProperty, nodeId: column, path: 'colour', value: 'red' }, pageContext())).should.deep.equal([DiagnosticCode.UnknownProperty]);
    });

    it('should refuse a read-only property', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:g', path: 'locked', value: 'x' }, pageContext())).should.deep.equal([DiagnosticCode.ReadOnlyProperty]);
    });

    it('should refuse a node that does not exist', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:nope', path: 'x', value: 1 }, pageContext())).should.deep.equal([DiagnosticCode.UnknownNode]);
    });

    it('should refuse to change a node the scope inherits', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:g', path: 'pageSize', value: 50 }, homeContext());
        codesOf(outcome).should.deep.equal([DiagnosticCode.NodeNotEditable]);
    });

    it('should check a query binding against the host\'s candidates', () => {
        const binding: QueryBinding = { queryId: 'q1', query: 'Invoices', arguments: [], results: [] };
        const candidate = { id: 'q1', name: 'Invoices', origin: [], parameters: [], resultShape: 'single' as const, resultFields: [] };
        const refused = apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:g', path: 'query', value: binding }, pageContext({ queryCandidates: [candidate] }));
        codesOf(refused).should.deep.equal([DiagnosticCode.IncompatibleResultShape]);

        const accepted = apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:g', path: 'query', value: binding }, pageContext({ queryCandidates: [{ ...candidate, resultShape: 'collection' }] }));
        accepted.applied.should.be.true;
    });

    it('should say when nothing describes the component', () => {
        const unknown = structuredClone(document);
        (unknown.screenTemplates[0].content!.side[1] as ExternalComponent).componentName = 'test:mystery';
        codesOf(apply(unknown, { kind: SceneEditKind.SetProperty, nodeId: 'element:i', path: 'x', value: 1 }, pageContext())).should.deep.equal([DiagnosticCode.MissingComponentDescriptor]);
    });

    it('should reset a property to its default by removing the stored value', () => {
        const withValue = apply(document, { kind: SceneEditKind.SetProperty, nodeId: 'element:g', path: 'pageSize', value: 50 }, pageContext()).model;
        const outcome = apply(withValue, { kind: SceneEditKind.ResetProperty, nodeId: 'element:g', path: 'pageSize' }, pageContext());
        outcome.applied.should.be.true;
        const stack = outcome.model.screenTemplates[0].content!.side[0] as unknown as { children: ExternalComponent[] };
        ('pageSize' in stack.children[0].properties).should.be.false;
    });
});
