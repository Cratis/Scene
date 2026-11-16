// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApplicationHost, ScenePreviewHost } from '@cratis/scene.blueprint.default';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { createMemorySceneHistory, IconAdapterProvider } from '@cratis/scene.react';
import { PrimeReactProvider } from '@primereact/core/config';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { createScreenEditorRuntime } from '../../ScreenEditor/Runtime/screenEditorRuntime';
import { previewApplicationOf, previewScreensOf } from '../previewApplication';
import { previewTargetOf } from '../previewTargetOf';
import { PreviewNodeKind, type PreviewScene } from '../PreviewScene';
import { parseStoredDocument } from '../../ScreenEditor/Document/upgradeStoredDocument';

// The application shell vector of the screens corpus (`screen-shell-navigation-runnable`) as `cratis render` plans it - the scene Stage serves - whose ui profile names
// only `core` and `Cratis.Components` and a root template of its own. Studio's preview must draw the shell Stage draws for it (spec 13.1: the same render in Studio preview
// and Stage): the packages every host renders with are admitted, so the shell component resolves instead of coming out as an unresolved `appShell`.
// The scene was captured from a Scene 4 server, so it is read in the slot shape the way a preview reads one (StudioIssues#1328).
const scene = parseStoredDocument<PreviewScene & { uiProfiles: never[] }>(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../given/shellScene.json'), 'utf8'));
const runtime = createScreenEditorRuntime(blueprintPreviewBundles, (scene as unknown as { uiProfiles: [never] }).uiProfiles[0]);
const application = previewApplicationOf(scene, runtime);
const inHost = (content: unknown) => createElement(PrimeReactProvider, {}, createElement(IconAdapterProvider, { registry: runtime.iconAdapters }, content as never));
const markup = (content: unknown) => renderToStaticMarkup(inHost(content) as never);
const sales = scene.structure.modules!.find(module => module.id === 'Sales')!;

const preview = markup(createElement(ScenePreviewHost, {
    document: application.document, composition: application.composition, structure: scene.structure, navigation: scene.navigation!,
    target: previewTargetOf({ id: 'a', kind: PreviewNodeKind.Module, sceneId: sales.id })!, registry: runtime.registry,
}));
const stage = markup(createElement(ApplicationHost, {
    application: { ...application.document, screens: previewScreensOf(scene.screens, runtime.profile.layout) }, composition: { logo: scene.navigation!.application.logo, ...application.composition },
    navigationModel: { structure: new ApplicationStructureIndex(scene.structure), navigation: scene.navigation! },
    registry: runtime.registry, initialScreen: 'Sales.Orders', history: createMemorySceneHistory(),
}));

describe('when previewing an application whose profile names few packages', () => {
    const inner = (html: string) => html.replace(/^.*?<div class="scene-preview-host"[^>]*>/s, '').replace(/<\/div>$/, '');

    it('should resolve every component', () => preview.should.not.contain('data-scene-unresolved-component'));
    it('should draw the application topbar items', () => ['Home', 'Sales', 'Support'].every(label => preview.includes(`>${label}<`)).should.be.true);
    it('should draw the sidebar the module overrides', () => ['Orders', 'Customers'].every(label => preview.includes(`>${label}<`)).should.be.true);
    it('should draw the toolbar button of the screen', () => preview.should.contain('New order'));
    it('should draw what Stage\'s composition and host draw for the same document', () => inner(preview).should.equal(stage));
});
