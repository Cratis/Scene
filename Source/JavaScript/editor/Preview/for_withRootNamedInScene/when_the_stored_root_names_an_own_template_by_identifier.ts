// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource, type UiProfile } from '@cratis/scene.model';
import { withRootNamedInScene } from '../previewApplication';

const profile = (root?: UiProfile['root']): UiProfile => ({ name: 'Storefront', targetPlatform: 'web', packages: [], ...(root ? { root } : {}) });
const own = (id: string, options?: Record<string, unknown>): UiProfile['root'] => ({ template: { source: TemplateReferenceSource.Own, id }, ...(options ? { options } : {}) });
const scene = (compiledRoot: string) => ({ layouts: [], screenTemplates: [{ name: 'StorefrontShell', slots: [{ name: 'content' }] }], uiProfiles: [profile(own(compiledRoot))] });

describe('when the stored root names an own template by identifier', () => {
    const stored = own('b8b0d8fa-de41-47d0-9285-949075ca964c', { navigationMode: 'static' });
    const resolved = withRootNamedInScene(profile(stored), scene('StorefrontShell'));

    it('should use the root the model compiled to, which names the template', () => resolved.root!.template.id.should.equal('StorefrontShell'));
    it('should keep the options the application chose', () => resolved.root!.options!.should.deep.equal({ navigationMode: 'static' }));
});

describe('when the stored root names a template of the document by name', () => {
    const stored = own('StorefrontShell');

    it('should keep the stored root', () => withRootNamedInScene(profile(stored), scene('StorefrontShell')).root!.should.equal(stored));
});

describe('when the stored root is a blueprint\'s', () => {
    const stored: UiProfile['root'] = { template: { source: TemplateReferenceSource.Blueprint, id: 'b8b0d8fa-de41-47d0-9285-949075ca964c', blueprint: 'Cratis.Blueprint.Default' } };

    it('should keep the stored root', () => withRootNamedInScene(profile(stored), scene('StorefrontShell')).root!.should.equal(stored));
});

describe('when the model compiled to no root that names a template of the document', () => {
    const stored = own('b8b0d8fa-de41-47d0-9285-949075ca964c');

    it('should keep the stored root', () => withRootNamedInScene(profile(stored), scene('Elsewhere')).root!.should.equal(stored));
});
