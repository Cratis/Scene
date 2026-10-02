// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, DiagnosticCode, EditingScopeKind, SceneEditKind } from '@cratis/scene.model';
import { contextFor, createExposedDocument, createSceneDocument } from '../given/a_scene_document';
import { apply, codesOf } from './given/edits';

const moduleContext = contextFor(EditingScopeKind.ScreenTemplate, 'Module');
const featureContext = contextFor(EditingScopeKind.ScreenTemplate, 'Feature');

describe('when exposing a property', () => {
    const document = createSceneDocument();

    it('should record the exposure under its owner', () => {
        const outcome = apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'title' } }, moduleContext);
        outcome.applied.should.be.true;
        outcome.model.exposures.should.deep.equal([{ owner: 'Module', properties: [{ component: 'navbar', path: 'title' }] }]);
    });

    it('should expose a collection with the operations named', () => {
        const outcome = apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'items', operations: [CollectionOperation.Add], editableFields: ['label'] } }, moduleContext);
        outcome.applied.should.be.true;
    });

    it('should change how a property is exposed rather than repeat it', () => {
        const once = apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'title' } }, moduleContext).model;
        const twice = apply(once, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'title', label: 'Heading' } }, moduleContext).model;
        twice.exposures[0].properties.should.deep.equal([{ component: 'navbar', path: 'title', label: 'Heading' }]);
    });

    it('should refuse a property the component does not have', () => {
        codesOf(apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'bogus' } }, moduleContext)).should.deep.equal([DiagnosticCode.ExposureTargetMissing]);
    });

    it('should refuse a component the owner does not contain', () => {
        codesOf(apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'ghost', path: 'title' } }, moduleContext)).should.deep.equal([DiagnosticCode.ExposureTargetMissing]);
    });

    it('should refuse operations on something that is not a collection', () => {
        codesOf(apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'title', operations: [CollectionOperation.Add] } }, moduleContext)).should.deep.equal([DiagnosticCode.InvalidEdit]);
    });

    it('should refuse an operation that does not exist and a field the items do not have', () => {
        codesOf(apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'items', operations: ['destroy' as CollectionOperation] } }, moduleContext)).should.deep.equal([DiagnosticCode.InvalidEdit]);
        codesOf(apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'items', operations: [CollectionOperation.EditFields], editableFields: ['badge'] } }, moduleContext)).should.deep.equal([DiagnosticCode.UnknownCollectionField]);
    });

    it('should refuse to declare exposure for something other than what is being edited', () => {
        codesOf(apply(document, { kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'title' } }, featureContext)).should.deep.equal([DiagnosticCode.NodeNotEditable]);
    });

    describe('as a re-exposure', () => {
        const exposed = createExposedDocument();
        const reExpose = (operations: CollectionOperation[]) => ({
            kind: SceneEditKind.ExposeProperty as const, owner: 'Feature',
            property: { component: 'navbar', path: 'items', reExposes: 'Module', operations },
        });

        it('should pass on what the owner exposed', () => {
            const outcome = apply(exposed, reExpose([CollectionOperation.Add]), featureContext);
            outcome.applied.should.be.true;
            outcome.model.exposures.map(declaration => declaration.owner).should.deep.equal(['Module', 'Feature']);
        });

        it('should refuse to pass on more than the owner exposed', () => {
            const narrow = structuredClone(exposed);
            narrow.exposures[0].properties[0].operations = [CollectionOperation.Add];
            codesOf(apply(narrow, reExpose([CollectionOperation.Add, CollectionOperation.Remove]), featureContext)).should.deep.equal([DiagnosticCode.ExposureWidensOwner]);
        });

        it('should refuse to pass on what the owner never exposed', () => {
            codesOf(apply(document, reExpose([CollectionOperation.Add]), featureContext)).should.deep.equal([DiagnosticCode.ReExposureBroken]);
        });

        it('should refuse to claim a different owner exposed it', () => {
            const outcome = apply(exposed, { ...reExpose([CollectionOperation.Add]), property: { ...reExpose([]).property, reExposes: 'Shell' } }, featureContext);
            codesOf(outcome).should.deep.equal([DiagnosticCode.ReExposureBroken]);
        });
    });

    describe('and withdrawing it', () => {
        const exposed = createExposedDocument();

        it('should remove the exposure and the declaration once it is empty', () => {
            let current = apply(exposed, { kind: SceneEditKind.UnexposeProperty, owner: 'Module', component: 'navbar', path: 'title' }, moduleContext).model;
            current.exposures[0].properties.map(property => property.path).should.deep.equal(['items']);
            current = apply(current, { kind: SceneEditKind.UnexposeProperty, owner: 'Module', component: 'navbar', path: 'items' }, moduleContext).model;
            current.exposures.should.be.empty;
        });

        it('should keep what instances saved against it', () => {
            const saved = structuredClone(exposed);
            saved.instanceContributions.push({ instance: 'template:Feature', component: 'navbar', path: 'title', value: 'Kept' });
            apply(saved, { kind: SceneEditKind.UnexposeProperty, owner: 'Module', component: 'navbar', path: 'title' }, moduleContext).model.instanceContributions.should.have.length(1);
        });

        it('should refuse to withdraw what was never exposed', () => {
            codesOf(apply(document, { kind: SceneEditKind.UnexposeProperty, owner: 'Module', component: 'navbar', path: 'title' }, moduleContext)).should.deep.equal([DiagnosticCode.ExposureTargetMissing]);
        });
    });
});
