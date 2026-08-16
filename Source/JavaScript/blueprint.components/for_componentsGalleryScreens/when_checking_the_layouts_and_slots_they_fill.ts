// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout } from '@cratis/scene.model';
import { defaultBlueprint, shellComponentForLayout } from '@cratis/scene.blueprint.default';
import { componentsBlueprint } from '../componentsBlueprint';
import { componentsGalleryScreens } from '../gallery';

/**
 * A gallery screen names a layout this package does not provide, which is the whole point of the
 * dependency: it fills the default blueprint's `AppShell`. So the layout every one of them has to be
 * checked against is that blueprint's, and a slot filled under a name the shell never reads renders
 * nothing at all and reports nothing either.
 */
describe('when checking the layouts and slots they fill', () => {
    const layouts = defaultBlueprint.layouts ?? [];
    const layoutsByName = new Map<string, Layout>(layouts.map(layout => [layout.name, layout]));
    const templateNames = (componentsBlueprint.screenTemplates ?? []).map(template => template.name);

    it('should have at least one screen to check', () => {
        componentsGalleryScreens.should.not.be.empty;
    });

    for (const screen of componentsGalleryScreens) {
        describe(`and the screen is '${screen.name}'`, () => {
            const layout = layoutsByName.get(screen.layout);

            it('should name a layout the blueprint it depends on provides', () => {
                (layout !== undefined).should.be.true;
            });

            it('should fill only slots that layout declares', () => {
                const declared = new Set((layout?.slots ?? []).map(slot => slot.name));
                Object.keys(screen.slotContent)
                    .filter(name => !declared.has(name))
                    .should.be.empty;
            });

            it('should fill the content slot, which is the only one every layout declares', () => {
                (screen.slotContent.content?.length ?? 0).should.be.greaterThan(0);
            });

            it('should name a screen template this blueprint provides', () => {
                templateNames.should.contain(screen.screenTemplate);
            });

            it('should render in a shell the blueprint it depends on provides', () => {
                (shellComponentForLayout(screen.layout) !== undefined).should.be.true;
            });

            it('should contribute its navigation, so the menu is the same on every screen', () => {
                screen.contributions.should.not.be.empty;
            });
        });
    }
});
