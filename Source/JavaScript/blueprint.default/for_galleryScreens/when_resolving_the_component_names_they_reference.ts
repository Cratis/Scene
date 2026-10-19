// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveComponentName } from '@cratis/scene.engine';
import { ComponentName } from '../ComponentName';
import { foundationComponentMetadata } from '../foundation';
import {
    composeScreenElement,
    distinctComponentNames,
    galleryComponentCatalog,
    galleryDialogTemplates,
    galleryProfile,
    galleryScreens,
} from '../gallery';
import { defaultBlueprintName } from '../packageName';

describe('when resolving the component names they reference', () => {
    const fromScreens = distinctComponentNames(galleryScreens.map(composeScreenElement));
    const fromDialogs = distinctComponentNames(galleryDialogTemplates.flatMap(template => Object.values(template.content ?? {}).flat()));
    const names = [...new Set([...fromScreens, ...fromDialogs])].sort();
    const resolutions = names.map(name => ({ name, resolution: resolveComponentName(name, galleryProfile, galleryComponentCatalog) }));
    const blueprintNames = new Set<string>(Object.values(ComponentName));

    it('should reference something', () => {
        names.should.not.be.empty;
    });

    it('should reference something from the dialog templates too', () => {
        fromDialogs.should.not.be.empty;
    });

    it('should resolve every referenced name against the profile', () => {
        resolutions
            .filter(entry => entry.resolution === undefined)
            .map(entry => entry.name)
            .should.be.empty;
    });

    it('should resolve this blueprint own names to this blueprint', () => {
        resolutions
            .filter(entry => blueprintNames.has(entry.name))
            .filter(entry => entry.resolution?.package !== defaultBlueprintName)
            .map(entry => entry.name)
            .should.be.empty;
    });

    it('should shadow the component libraries for the names this blueprint also declares', () => {
        const menu = resolveComponentName(ComponentName.Menu, galleryProfile, galleryComponentCatalog);
        menu!.package.should.equal(defaultBlueprintName);
        menu!.shadows.should.contain('PrimeReact');
    });

    it('should reference every shell component the blueprint registers except the ones a host places itself', () => {
        const referenced = new Set(names);
        // The bar is placed by an application's own shell (its root template), not by a gallery template.
        const placedByAHostRatherThanATemplate = [ComponentName.Mask, ComponentName.ThemeSwitcher, ComponentName.LayoutModeSwitcher, ComponentName.RightPanel, ComponentName.Bar];
        Object.values(ComponentName)
            .filter(name => !placedByAHostRatherThanATemplate.includes(name))
            // The foundation composites are content a screen places, not shell; the foundation screen templates reference them.
            .filter(name => !(name in foundationComponentMetadata))
            .filter(name => !referenced.has(name))
            .should.be.empty;
    });
});
