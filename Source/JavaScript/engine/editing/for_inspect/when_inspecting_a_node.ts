// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    CollectionOperation, DiagnosticCode, EditingScopeKind, EditTarget, LayoutType, ProvenanceKind, SceneEditKind, SceneNodeKind, ValueSource,
} from '@cratis/scene.model';
import { applyEdit, flowNodeId, inspect, placementNodeId } from '../index';
import { canvasSlot, createLayoutDocument, deepFreeze, homeContext, mainSlot, pageContext } from '../given/a_layout_document';
import { contextFor, createExposedDocument, createReExposedDocument } from '../given/a_scene_document';

describe('when inspecting a node', () => {
    const layout = deepFreeze(createLayoutDocument());

    describe('the scope owns', () => {
        const inspection = inspect(layout, 'element:g', pageContext())!;

        it('should say what it is and where it sits', () => {
            inspection.kind.should.equal(SceneNodeKind.Element);
            inspection.typeId.should.equal('test:table');
            inspection.parentId!.should.equal('element:stack');
        });

        it('should call it local', () => {
            inspection.provenance.kind.should.equal(ProvenanceKind.Local);
        });

        it('should offer every property for editing on the node', () => {
            inspection.properties.map(property => property.descriptor.path).should.deep.equal(['query', 'pageSize', 'locked']);
            const pageSize = inspection.properties.find(property => property.descriptor.path === 'pageSize')!;
            pageSize.editable.should.be.true;
            pageSize.editTarget!.should.equal(EditTarget.Node);
        });

        it('should keep a read-only property read-only', () => {
            const locked = inspection.properties.find(property => property.descriptor.path === 'locked')!;
            locked.editable.should.be.false;
            locked.reason!.should.contain('read-only');
        });

        it('should be removable', () => {
            inspection.removable.should.be.true;
        });

        it('should show the stored value and the effective one', () => {
            const edited = applyEdit(layout, { kind: SceneEditKind.SetProperty, nodeId: 'element:g', path: 'pageSize', value: 40 }, pageContext()).model;
            const pageSize = inspect(edited, 'element:g', pageContext())!.properties.find(property => property.descriptor.path === 'pageSize')!;
            (pageSize.currentValue as number).should.equal(40);
            (pageSize.effectiveValue as number).should.equal(40);
            pageSize.source.should.equal(ValueSource.Local);
        });

        it('should fall back to the default when nothing is stored', () => {
            const title = inspect(createExposedDocument(), 'element:navbar', contextFor(EditingScopeKind.ScreenTemplate, 'Module'))!.properties.find(property => property.descriptor.path === 'title')!;
            (title.currentValue === undefined).should.be.true;
            (title.effectiveValue as string).should.equal('Menu');
            title.source.should.equal(ValueSource.Default);
        });
    });

    describe('a layout node', () => {
        it('should carry the layout type\'s capabilities', () => {
            const inspection = inspect(layout, flowNodeId(mainSlot, 'root', [0]), pageContext())!;
            inspection.typeId.should.equal(LayoutType.FlowRow);
            inspection.capabilities!.convertibleTo.should.have.members([LayoutType.FlowColumn, LayoutType.FlowGrid]);
            inspection.properties.map(property => property.descriptor.path).should.have.members(['gap', 'grow', 'span']);
        });

        it('should describe a panel by its shape', () => {
            const inspection = inspect(layout, 'element:stack', pageContext())!;
            inspection.typeId.should.equal(LayoutType.StackPanel);
            inspection.properties.map(property => property.descriptor.path).should.include.members(['orientation', 'spacing', 'opacity']);
        });

        it('should not be removable when it is the root of a flow', () => {
            inspect(layout, flowNodeId(mainSlot, 'root', []), pageContext())!.removable.should.be.false;
        });

        it('should describe a placement\'s position and size', () => {
            const inspection = inspect(layout, placementNodeId(canvasSlot, 0, 'freeStack'), pageContext())!;
            inspection.properties.map(property => property.descriptor.path).should.deep.equal(['x', 'y', 'width', 'height']);
            (inspection.properties[2].effectiveValue as number).should.equal(100);
        });
    });

    describe('the scope inherits', () => {
        const inspection = inspect(layout, 'element:g', homeContext())!;

        it('should say where it comes from', () => {
            inspection.provenance.should.deep.equal({ kind: ProvenanceKind.Inherited, source: 'Page' });
        });

        it('should make every property read-only and say why', () => {
            inspection.properties.every(property => !property.editable && property.editTarget === undefined).should.be.true;
            inspection.properties[0].reason!.should.contain('Page');
        });

        it('should not be removable', () => {
            inspection.removable.should.be.false;
        });

        it('should call a node the scope itself fills local', () => {
            inspect(layout, 'element:j', homeContext())!.provenance.kind.should.equal(ProvenanceKind.Local);
        });
    });

    describe('an inherited node with exposed properties', () => {
        const featureContext = contextFor(EditingScopeKind.ScreenTemplate, 'Feature');
        const exposed = createExposedDocument();
        const inspection = inspect(exposed, 'element:navbar', featureContext)!;
        const property = (path: string) => inspection.properties.find(candidate => candidate.descriptor.path === path)!;

        it('should be configurable, not just inherited', () => {
            inspection.provenance.should.deep.equal({ kind: ProvenanceKind.ConfigurableInherited, source: 'Module' });
        });

        it('should make exposed properties editable through the instance', () => {
            property('title').editable.should.be.true;
            property('title').editTarget!.should.equal(EditTarget.Instance);
            property('items').editTarget!.should.equal(EditTarget.Instance);
        });

        it('should say which collection operations are allowed', () => {
            property('items').operations!.should.have.members([CollectionOperation.Add, CollectionOperation.Remove, CollectionOperation.Reorder, CollectionOperation.EditFields]);
        });

        it('should keep a property that was not exposed read-only', () => {
            property('density').editable.should.be.false;
            property('density').reason!.should.contain('Module');
        });

        it('should list the owner\'s item as fixed', () => {
            property('items').items!.map(item => [item.id, item.editable]).should.deep.equal([['home', false]]);
        });

        it('should show contributions in the effective value and mark the scope\'s own items editable', () => {
            let document = applyEdit(exposed, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Billing' }, featureContext).model;
            document = applyEdit(document, { kind: SceneEditKind.AddCollectionItem, component: 'navbar', path: 'items', item: { id: 'mine', values: { label: 'Mine' } } }, featureContext).model;

            const updated = inspect(document, 'element:navbar', featureContext)!;
            const title = updated.properties.find(candidate => candidate.descriptor.path === 'title')!;
            (title.effectiveValue as string).should.equal('Billing');
            title.source.should.equal(ValueSource.Instance);
            (title.currentValue === undefined).should.be.true;
            updated.properties.find(candidate => candidate.descriptor.path === 'items')!.items!.map(item => [item.id, item.editable])
                .should.deep.equal([['home', false], ['mine', true]]);
        });

        it('should not offer a screen what the nested template did not pass on', () => {
            const screen = inspect(exposed, 'element:navbar', contextFor(EditingScopeKind.Screen, 'Invoices'))!;
            screen.provenance.kind.should.equal(ProvenanceKind.Inherited);
            screen.properties.every(candidate => !candidate.editable).should.be.true;
        });

        it('should offer the screen what the nested template re-exposed, narrowed', () => {
            const screen = inspect(createReExposedDocument(), 'element:navbar', contextFor(EditingScopeKind.Screen, 'Invoices'))!;
            screen.provenance.kind.should.equal(ProvenanceKind.ConfigurableInherited);
            screen.properties.find(candidate => candidate.descriptor.path === 'items')!.operations!.should.have.members([CollectionOperation.Add, CollectionOperation.EditFields]);
        });
    });

    describe('that cannot be described', () => {
        it('should return nothing for a node that does not exist', () => {
            (inspect(layout, 'element:nope', pageContext()) === undefined).should.be.true;
        });

        it('should say when nothing describes a component', () => {
            const document = structuredClone(layout);
            (document.screenTemplates[0].content!.side[1] as unknown as { componentName: string }).componentName = 'test:mystery';
            const inspection = inspect(document, 'element:i', pageContext())!;
            inspection.properties.should.be.empty;
            inspection.diagnostics.map(diagnostic => diagnostic.code).should.deep.equal([DiagnosticCode.MissingComponentDescriptor]);
        });

        it('should report a scope that does not exist', () => {
            const inspection = inspect(layout, 'element:g', { ...pageContext(), scope: { kind: EditingScopeKind.Screen, name: 'Nope' } })!;
            inspection.diagnostics.map(diagnostic => diagnostic.code).should.deep.equal([DiagnosticCode.UnknownScope]);
            inspection.provenance.kind.should.equal(ProvenanceKind.Inherited);
        });
    });
});
