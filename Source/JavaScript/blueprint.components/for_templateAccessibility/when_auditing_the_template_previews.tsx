// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import axe from 'axe-core';
import { clearBindings } from '@cratis/scene.components';
import { SceneElementView } from '@cratis/scene.react';
import { composeScreenElement, resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import { componentsBlueprintCatalog, componentsBlueprintProfile, componentsGalleryScreen } from '../gallery';
import { componentsPreviewRegistry } from '../gallery/GalleryScreenPreview';

/**
 * The business templates of the components blueprint, each audited with axe-core's WCAG A and AA rules for the
 * DOM it renders inside the shell. Colour contrast and page-level landmark rules need a real layout and a whole
 * page, so jsdom cannot judge them and they are not asserted here.
 */
const templates = ['DashboardPage', 'DataListPage', 'MasterDetailPage', 'CommandFormPage', 'SettingsPage', 'DataModulePage', 'CommandSliceSection'];

const rules = { runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } };

describe('when auditing the template previews for accessibility', () => {
    beforeEach(clearBindings);
    afterEach(() => { cleanup(); clearBindings(); });

    for (const name of templates) {
        it(`should leave the ${name} template without accessibility violations`, async () => {
            const { container } = render(<PrimeReactProvider>
                <SceneElementView registry={componentsPreviewRegistry} resolveBinding={() => undefined}
                    element={resolveElementComponentNames(composeScreenElement(componentsGalleryScreen(name)!), componentsBlueprintProfile, componentsBlueprintCatalog)} />
            </PrimeReactProvider>);
            (container.querySelector('.layout-page-header') !== null).should.equal(true);
            const result = await axe.run(container, rules);
            result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`).should.deep.equal([]);
        });
    }
});
