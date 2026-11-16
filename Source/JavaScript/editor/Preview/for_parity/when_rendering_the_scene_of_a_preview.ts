// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApplicationHost, ScenePreviewHost } from '@cratis/scene.blueprint.default';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import type { NavigationModel } from '@cratis/scene.model';
import { createMemorySceneHistory, IconAdapterProvider } from '@cratis/scene.react';
import { PrimeReactProvider } from '@primereact/core/config';
import { screenEditorRuntimeForProfile } from '../../ScreenEditor/Runtime/screenEditorRuntimeForProfile';
import { previewApplicationOf, previewScreensOf } from '../previewApplication';
import { previewTargetOf } from '../previewTargetOf';
import { PreviewNodeKind, type PreviewScene } from '../PreviewScene';

// The scene the server sends for a board (written by the C# specification `and_the_scene_is_shared_with_the_editor`, spec REN1) is drawn two ways: by the preview
// host Studio mounts, and by Stage's own composition and host, given the same document the way Stage's frontend gives it. What the person sees in the
// preview is what Stage shows for the same document (PRV9, REN2) - there is no second reading of the model in Studio.
const scene = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../given/previewScene.json'), 'utf8')) as PreviewScene;
const runtime = screenEditorRuntimeForProfile(undefined);
const application = previewApplicationOf(scene, runtime);
const feature = scene.structure.modules![0].features![0];
const noNavigation: NavigationModel = { application: { outlets: [] }, modules: [] };
const page = `${scene.structure.modules![0].id}.${feature.id}`;

// The breadcrumb of Scene 4.5x is a PrimeReact component and needs the provider, as in the running editor.
const inHost = (content: unknown) => createElement(PrimeReactProvider, {}, createElement(IconAdapterProvider, { registry: runtime.iconAdapters }, content as never));
const markup = (content: unknown) => renderToStaticMarkup(inHost(content) as never);

const preview = markup(createElement(ScenePreviewHost, {
    document: application.document, composition: application.composition, structure: scene.structure, target: previewTargetOf({ id: 'a', kind: PreviewNodeKind.Feature, sceneId: page })!, registry: runtime.registry,
}));
const stage = markup(createElement(ApplicationHost, {
    application: { ...application.document, screens: previewScreensOf(scene.screens, runtime.profile.layout) }, composition: { logo: noNavigation.application.logo, ...application.composition },
    navigationModel: { structure: new ApplicationStructureIndex(scene.structure), navigation: noNavigation },
    registry: runtime.registry, initialScreen: page, history: createMemorySceneHistory(),
}));

describe('when rendering the scene of a preview', () => {
    const inner = (html: string) => html.replace(/^.*?<div class="scene-preview-host"[^>]*>/s, '').replace(/<\/div>$/, '');

    it('should have drawn the page of the feature', () => preview.should.contain('data-scene-id="screen-' + page + '"'));
    it('should have drawn what the preview host drew in the shell the profile selects', () => preview.should.contain('<main'));
    it('should draw exactly what Stage\'s composition and host draw for the same document', () => inner(preview).should.equal(stage));
});
