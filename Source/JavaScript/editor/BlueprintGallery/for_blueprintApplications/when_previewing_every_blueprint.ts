// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { blueprintApplications } from '../blueprintApplications';
import { describeBlueprintGallery } from '../describeBlueprintGallery';

const cards = describeBlueprintGallery(blueprintPreviewBundles, { shell: 'Cratis.Blueprint.Default', templatePacks: [] });

describe('when previewing every blueprint of the gallery', () => {
    it('should have an application to preview for every card, so the preview button never lands on nothing', () => {
        cards.filter(card => blueprintApplications[card.package] === undefined).map(card => card.package).should.deep.equal([]);
    });

    it('should start the preview in the module the blueprint puts its first screen in', () => {
        for (const card of cards) card.screens[0].name.startsWith(`${blueprintApplications[card.package].module}.`).should.equal(true, `${card.package} starts in ${card.screens[0].name}`);
    });

    it('should draw every screen of the blueprint from the templates its package ships', () => {
        for (const card of cards) {
            const application = blueprintApplications[card.package].application();
            const shipped = new Set(application.screenTemplates.map(template => template.name));
            const manifest = blueprintPreviewBundles.find(bundle => bundle.manifest.name === card.package)!.manifest;
            const drawn = application.screens.map(screen => screen.name);
            manifest.blueprint!.screenSet!.map(screen => screen.name).forEach(name => drawn.should.include(name, `${card.package} draws ${name}`));
            manifest.screenTemplates.every(name => shipped.has(name)).should.equal(true, `${card.package} ships every template it declares`);
        }
    });

    it('should list the screens of the blueprint in the application the preview draws', () => {
        for (const card of cards) {
            const application = blueprintApplications[card.package].application();
            card.screens.map(screen => screen.name).every(name => application.screens.some(screen => screen.name === name)).should.equal(true, card.package);
        }
    });
});
