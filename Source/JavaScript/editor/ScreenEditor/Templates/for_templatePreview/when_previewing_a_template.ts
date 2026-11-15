// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplatePreviewState } from '@cratis/scene.blueprint.default';
import { screenEditorRuntimeForProfile } from '../../Runtime/screenEditorRuntimeForProfile';
import { catalogEntryOf, templatePreview } from '../templatePreview';

const runtime = screenEditorRuntimeForProfile();
const countElements = (element: unknown): number => {
    const value = element as { children?: unknown[]; slots?: Record<string, unknown[]> };
    return 1 + [...(value.children ?? []), ...Object.values(value.slots ?? {}).flat()].reduce<number>((sum, child) => sum + countElements(child), 0);
};

describe('when previewing a template a package ships a screen for', () => {
    const populated = templatePreview('MasterDetail', TemplatePreviewState.Populated, runtime.bundles, runtime.profile);
    const empty = templatePreview('MasterDetail', TemplatePreviewState.Empty, runtime.bundles, runtime.profile);

    it('should compose the screen', () => countElements(populated).should.be.greaterThan(1));
    it('should differ between populated and empty', () => JSON.stringify(populated).should.not.equal(JSON.stringify(empty)));
});

describe('when previewing a template no package ships a screen for', () => {
    it('should have no preview', () => (templatePreview('Nothing', TemplatePreviewState.Populated, runtime.bundles, runtime.profile) === undefined).should.be.true);
});

describe('when describing a template from Scene\'s catalog', () => {
    const entry = catalogEntryOf('Dashboard', runtime.designTime.host.templates)!;

    it('should name the package', () => entry.package.should.equal('Cratis.Blueprint.Default'));
    it('should carry the license', () => entry.license!.should.equal('MIT'));
    it('should say the host can run it', () => entry.compatible.should.be.true);
});
