// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout } from '@cratis/scene.model';
import { defaultBlueprint } from '../defaultBlueprint';
import { galleryScreens } from '../gallery';
import { shellComponentForLayout } from '../layouts';

describe('when checking the layouts and slots they fill', () => {
    const layouts = defaultBlueprint.layouts ?? [];
    const layoutsByName = new Map<string, Layout>(layouts.map(layout => [layout.name, layout]));

    it('should have at least one screen to check', () => {
        galleryScreens.should.not.be.empty;
    });

    for (const screen of galleryScreens) {
        describe(`and the screen is '${screen.name}'`, () => {
            const layout = layoutsByName.get(screen.layout);

            it('should name a layout this blueprint provides', () => {
                (layout !== undefined).should.be.true;
            });

            it('should fill only slots the layout declares', () => {
                const declared = new Set((layout?.slots ?? []).map(slot => slot.name));
                const filled = Object.keys(screen.slotContent);
                filled.filter(name => !declared.has(name)).should.be.empty;
            });

            it('should fill the content slot, which is the only one every layout declares', () => {
                (screen.slotContent.content?.length ?? 0).should.be.greaterThan(0);
            });

            it('should name a screen template this blueprint provides', () => {
                (defaultBlueprint.screenTemplates ?? []).map(template => template.name).should.contain(screen.screenTemplate);
            });

            it('should render in a shell this blueprint provides', () => {
                (shellComponentForLayout(screen.layout) !== undefined).should.be.true;
            });
        });
    }
});
