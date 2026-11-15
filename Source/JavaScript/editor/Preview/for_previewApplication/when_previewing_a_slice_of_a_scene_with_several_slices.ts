// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ScenePreviewHost } from '@cratis/scene.blueprint.default';
import type { ApplicationStructure, Screen } from '@cratis/scene.model';
import { IconAdapterProvider } from '@cratis/scene.react';
import { PrimeReactProvider } from '@primereact/core/config';
import { screenEditorRuntimeForProfile } from '../../ScreenEditor/Runtime/screenEditorRuntimeForProfile';
import { previewApplicationOf } from '../previewApplication';
import { previewTargetOf } from '../previewTargetOf';
import { PreviewNodeKind, type PreviewScene } from '../PreviewScene';

// Previewing a slice loads exactly that slice plus what it structurally needs (Cratis/StudioIssues#815, Cratis/Scene#207): the screens the slice owns and
// the screens nobody owns, never the screens another slice owns - an identity on the `owner` the scene names, not a match on names.
const given = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../given/previewScene.json'), 'utf8')) as PreviewScene;
const dashboard = 'Control.Operations.Dashboard';
const returns = 'Control.Operations.Returns';
const runtime = screenEditorRuntimeForProfile(undefined);

const titled = (screen: Screen, name: string, owner: string | undefined, text: string): Screen => {
    const copy = structuredClone(screen);
    const title = copy.slotContent.content.find(element => element.id === 'orders-title');
    (title as unknown as { properties: Record<string, unknown> }).properties.text = text;
    return { ...copy, name, ...(owner === undefined ? {} : { owner }) };
};

const structure = structuredClone(given.structure) as ApplicationStructure;
structure.modules[0].features[0].slices.push({ id: 'Returns', name: 'Returns', kind: 'StateView' } as never);
const base = given.screens[0];
const scene: PreviewScene = {
    ...given,
    structure,
    screens: [
        titled(base, 'Admin__Dashboard', dashboard, 'Dashboard heading'),
        titled(base, 'Admin__Returns', returns, 'Returns heading'),
        titled(base, 'Application__Home', undefined, 'Application heading'),
    ],
};

const previewOf = (sliceId: string) => {
    const application = previewApplicationOf(scene, runtime);
    return renderToStaticMarkup(createElement(PrimeReactProvider, {}, createElement(IconAdapterProvider, { registry: runtime.iconAdapters },
        createElement(ScenePreviewHost, {
            document: application.document, composition: application.composition, structure: scene.structure,
            target: previewTargetOf({ id: 'a', kind: PreviewNodeKind.Slice, sceneId: sliceId })!, registry: runtime.registry,
        }) as never)) as never);
};

describe('when previewing a slice of a scene with several slices', () => {
    const forDashboard = previewOf(dashboard);
    const forReturns = previewOf(returns);

    it('should draw the screen the slice owns', () => forDashboard.should.contain('Dashboard heading'));
    it('should not draw the screen another slice owns', () => forDashboard.should.not.contain('Returns heading'));
    it('should draw the screen the other slice owns when that slice is previewed', () => forReturns.should.contain('Returns heading'));
    it('should not draw the first slice\'s screen when the other is previewed', () => forReturns.should.not.contain('Dashboard heading'));
    it('should still draw the shell around the slice', () => forDashboard.should.contain('<main'));
});
