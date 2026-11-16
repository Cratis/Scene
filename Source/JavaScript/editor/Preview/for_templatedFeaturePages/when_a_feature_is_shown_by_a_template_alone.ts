// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diagnosePreview, PreviewProblemCode } from '@cratis/scene.blueprint.default';
import type { Layout, Screen } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { createScreenEditorRuntime } from '../../ScreenEditor/Runtime/screenEditorRuntime';
import { previewApplicationOf } from '../previewApplication';
import { previewTargetOf } from '../previewTargetOf';
import { PreviewNodeKind, type PreviewScene } from '../PreviewScene';
import { templatedFeaturePages } from '../templatedFeaturePages';

const profile = (JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../given/shellScene.json'), 'utf8')) as { uiProfiles: [never] }).uiProfiles[0];
const slice = (id: string) => ({ id, name: id, kind: 'StateView' }) as never;
const feature = (name: string, features: never[] = []) => ({ id: name, name, features, slices: [slice(`${name}List`)] }) as never;
const authored = { name: 'Reports', layout: 'AppShell', slotContent: {}, forms: [], contributions: [], path: ['Eventstore', 'Reports'] } as unknown as Screen;

const sceneOf = (screens: Screen[], templateReferences: PreviewScene['templateReferences']): PreviewScene => ({
    layouts: [{ name: 'AppShell' }] as unknown as Layout[],
    screenTemplates: [],
    dialogTemplates: [],
    screens,
    structure: { modules: [{ id: 'Eventstore', name: 'Eventstore', features: [feature('Eventtypes'), feature('Observers'), feature('Reports')] }] },
    templateReferences,
}) as PreviewScene;

describe('when a feature is shown by a template its module assigns', () => {
    const pages = templatedFeaturePages(sceneOf([authored], [{ scope: 'module', owner: 'Eventstore', reference: { source: 'Own', id: 'WorkspaceScreen' } as never }]));

    it('should make a page for each feature without a screen', () => pages.map(page => page.name).should.deep.equal(['Eventstore.Eventtypes', 'Eventstore.Observers']));
    it('should build the page from the module\'s template', () => pages.every(page => page.screenTemplate === 'WorkspaceScreen').should.be.true);
    it('should say where the page lives', () => pages[0].path!.should.deep.equal(['Eventstore', 'Eventtypes']));
    it('should leave the feature with a screen of its own alone', () => pages.some(page => page.name.endsWith('Reports')).should.be.false);
});

describe('when a feature assigns a template of its own', () => {
    const pages = templatedFeaturePages(sceneOf([], [
        { scope: 'module', owner: 'Eventstore', reference: { source: 'Own', id: 'WorkspaceScreen' } as never },
        { scope: 'feature', owner: 'Eventstore.Observers', reference: { source: 'Own', id: 'ObserverList' } as never },
    ]));

    it('should use the feature\'s template for it', () => pages.find(page => page.name === 'Eventstore.Observers')!.screenTemplate!.should.equal('ObserverList'));
    it('should use the module\'s for the others', () => pages.find(page => page.name === 'Eventstore.Eventtypes')!.screenTemplate!.should.equal('WorkspaceScreen'));
});

describe('when no template is assigned', () => {
    it('should make no page', () => templatedFeaturePages(sceneOf([], [])).should.be.empty);
});

describe('when previewing a feature shown by a template alone', () => {
    const given = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../given/shellScene.json'), 'utf8')) as PreviewScene;
    const scene: PreviewScene = { ...given, screens: [], templateReferences: [{ scope: 'module', owner: 'Support', reference: { source: 'Blueprint', id: 'TicketCreateForm' } as never }] };
    const application = previewApplicationOf(scene, createScreenEditorRuntime(blueprintPreviewBundles, profile));
    const codes = diagnosePreview({
        document: application.document, composition: application.composition, structure: scene.structure, navigation: scene.navigation!,
        target: previewTargetOf({ id: 'Tickets', kind: PreviewNodeKind.Feature, sceneId: 'Support.Tickets' })!,
    }).problems.map(problem => problem.code);

    it('should have a page for the feature', () => application.document.screens.some(screen => screen.name === 'Support.Tickets').should.be.true);
    it('should not say the screen is missing', () => codes.should.not.include(PreviewProblemCode.ScreenMissing));
});
