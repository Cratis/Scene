// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, TemplateRole } from '@cratis/scene.model';
import { BlueprintCatalogEntry, BlueprintSource, describeBlueprintCatalog } from '../index';

const source = {
    manifest: {
        name: 'x', version: '1.0.0', kind: PackageKind.Blueprint, dependencies: [], components: [], layouts: ['Shell'], screenTemplates: ['Frame', 'Page'], dialogTemplates: [], themes: [],
        blueprint: { domain: 'x', description: 'x', thumbnail: 'thumbnails/x.svg', screenSet: [] },
    },
    layouts: [{ name: 'Shell', slots: [{ name: 'sidebar' }, { name: 'content' }] }],
    screenTemplates: [
        { name: 'Frame', slots: [{ name: 'rail' }, { name: 'main' }], metadata: { role: TemplateRole.Root, primaryOutlet: 'main' } },
        { name: 'Page', fitsSlot: 'content', slots: [{ name: 'body' }] },
    ],
    files: [],
} as unknown as BlueprintSource;

describe('when describing the shells of a blueprint', () => {
    let entry: BlueprintCatalogEntry;
    const template = (name: string) => entry.templates.find(candidate => candidate.name === name)!;

    beforeEach(() => (entry = describeBlueprintCatalog([source])[0]));

    it('should list the outlets of a layout', () => template('Shell').outlets!.should.deep.equal(['sidebar', 'content']));
    it('should list the outlets of a root screen template', () => template('Frame').outlets!.should.deep.equal(['rail', 'main']));
    it('should carry the primary outlet of a root screen template', () => template('Frame').primaryOutlet!.should.equal('main'));
    it('should carry the root role', () => template('Frame').role!.should.equal('Root'));
    it('should not list outlets for an ordinary screen template', () => (template('Page').outlets === undefined).should.be.true);
    it('should not carry a role for a layout', () => (template('Shell').role === undefined).should.be.true);
});
