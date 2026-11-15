// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultBlueprint, defaultLayouts, diagnosePreview, PreviewProblemCode } from '@cratis/scene.blueprint.default';
import type { Layout, Screen, ScreenTemplate } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { createScreenEditorRuntime } from '../../ScreenEditor/Runtime/screenEditorRuntime';
import { previewApplicationOf } from '../previewApplication';
import { previewTargetOf } from '../previewTargetOf';
import { PreviewNodeKind, type PreviewScene } from '../PreviewScene';

const given = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../given/shellScene.json'), 'utf8')) as PreviewScene & { uiProfiles: never[] };
const profile = (given as unknown as { uiProfiles: [never] }).uiProfiles[0];
const template = (name: string, ...slots: string[]): ScreenTemplate => ({ name, slots: slots.map(slot => ({ name: slot })) } as unknown as ScreenTemplate);
const bundleOf = (templates: ScreenTemplate[], layouts: Layout[] = []) => ({ ...blueprintPreviewBundles[0], screenTemplates: templates, layouts } as unknown as ScenePackageBundle);

// The scene of the Ticketing demo: the screen of the `Support.Tickets` feature is built from a template only a domain blueprint provides.
const sceneWith = (screenTemplate: string, layout = 'AppShell', slotContent: Screen['slotContent'] = {}): PreviewScene => ({
    ...given,
    screens: given.screens.map(screen => screen.name === 'TicketScreen' ? { ...screen, screenTemplate, layout, slotContent } as unknown as Screen : screen),
});
const runtimeOf = (bundles: ScenePackageBundle[]) => createScreenEditorRuntime(bundles, profile);
const problemsOf = (scene: PreviewScene, bundles: ScenePackageBundle[]) => {
    const application = previewApplicationOf(scene, runtimeOf(bundles));
    const support = scene.structure.modules!.find(module => module.id === 'Support')!;
    const tickets = support.features!.find(feature => feature.id === 'Tickets')!;
    return diagnosePreview({
        document: application.document, composition: application.composition, structure: scene.structure, navigation: scene.navigation!,
        target: previewTargetOf({ id: tickets.id, kind: PreviewNodeKind.Feature, sceneId: 'Support.Tickets' })!,
    }).problems.map(problem => problem.code);
};

describe('when previewing a screen built from a template only a domain blueprint provides', () => {
    const scene = sceneWith('TicketCreateForm');
    const application = previewApplicationOf(scene, runtimeOf(blueprintPreviewBundles));

    it('should not refuse the screen for a missing template', () => problemsOf(scene, blueprintPreviewBundles).should.not.include(PreviewProblemCode.TemplateMissing));
    it('should offer the template to the host as a blueprint template', () => application.composition.blueprintTemplates!.map(candidate => candidate.name).should.include('TicketCreateForm'));
    it('should keep the template out of the templates the document declares itself', () => application.document.screenTemplates.map(candidate => candidate.name).should.not.include('TicketCreateForm'));
});

describe('when previewing a screen built from a template of the Default blueprint', () => {
    const scene = sceneWith('ListScreen');
    const application = previewApplicationOf(scene, runtimeOf([bundleOf([template('Unrelated', 'body')])]));

    it('should still find the Default blueprint template once the blueprint templates are given', () => problemsOf(scene, [bundleOf([template('Unrelated', 'body')])]).should.not.include(PreviewProblemCode.TemplateMissing));
    it('should offer every template of the Default blueprint', () => application.composition.blueprintTemplates!.map(candidate => candidate.name).should.include.members((defaultBlueprint.screenTemplates ?? []).map(candidate => candidate.name)));
    it('should offer the layouts of the Default blueprint', () => application.composition.blueprintLayouts!.map(candidate => candidate.name).should.include.members(defaultLayouts.map(candidate => candidate.name)));
    it('should keep the Default blueprint templates out of the templates the document declares itself', () => application.document.screenTemplates.map(candidate => candidate.name).should.not.include('ListScreen'));
});

describe('when two blueprints provide a template of the same name', () => {
    const first = template('Shared', 'first-slot');
    const second = template('Shared', 'second-slot');
    const application = previewApplicationOf(sceneWith('Shared'), runtimeOf([bundleOf([first]), bundleOf([second])]));
    const shared = (application.composition.blueprintTemplates ?? []).filter(candidate => candidate.name === 'Shared');

    it('should offer the name once', () => shared.should.have.length(1));
    it('should offer the template of the blueprint that comes first', () => shared[0].slots.map(slot => slot.name).should.deep.equal(['first-slot']));
    it('should leave the slots the screen does not fill empty by the same template', () => Object.keys(application.document.screens.find(screen => screen.name === 'TicketScreen')!.slotContent).should.deep.equal(['first-slot']));
});

describe('when a blueprint provides a layout', () => {
    const own = { name: 'DomainShell', slots: [] } as unknown as Layout;
    const application = previewApplicationOf(sceneWith('ListScreen', 'DomainShell'), runtimeOf([bundleOf([], [own, { ...own }])]));

    it('should offer the layout to the host', () => application.composition.blueprintLayouts!.filter(layout => layout.name === 'DomainShell').should.have.length(1));
    it('should keep the layouts of the Default blueprint', () => application.composition.blueprintLayouts!.map(layout => layout.name).should.include.members(defaultLayouts.map(layout => layout.name)));
    it('should keep the layout out of the layouts the document declares itself', () => application.document.layouts.map(layout => layout.name).should.not.include('DomainShell'));
});

describe('when a screen names a template that no blueprint and no document provides', () => {
    it('should still refuse the screen for a missing template', () => problemsOf(sceneWith('NoSuchTemplate'), blueprintPreviewBundles).should.include(PreviewProblemCode.TemplateMissing));
});

describe('when the document declares a template a blueprint also provides', () => {
    const own = template('TicketCreateForm', 'own-slot');
    const scene = { ...sceneWith('TicketCreateForm'), screenTemplates: [own] };
    const application = previewApplicationOf(scene, runtimeOf(blueprintPreviewBundles));

    it('should keep the template of the document as the document\'s', () => application.document.screenTemplates.should.include(own));
    it('should leave the slots of the template of the document, not the blueprint\'s, empty', () => Object.keys(application.document.screens.find(screen => screen.name === 'TicketScreen')!.slotContent).should.deep.equal(['own-slot']));
});
