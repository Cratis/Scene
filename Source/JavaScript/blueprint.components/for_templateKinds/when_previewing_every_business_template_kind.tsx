// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { clearBindings } from '@cratis/scene.components';
import { SceneElementView } from '@cratis/scene.react';
import { composeScreenElement, resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import { componentsBlueprintCatalog, componentsBlueprintProfile, componentsGalleryScreen } from '../gallery';
import { componentsPreviewRegistry } from '../gallery/GalleryScreenPreview';
import { componentsDialogTemplates, componentsScreenTemplates } from '../templates';

/**
 * Every business template kind the release names, with the template that implements it in this blueprint.
 * Each one is previewed as a screen through the real renderer, inside the default blueprint's shell.
 */
const kinds = {
    dashboard: 'DashboardPage',
    list: 'DataListPage',
    'master/detail': 'MasterDetailPage',
    'CRUD command form': 'CommandFormPage',
    settings: 'SettingsPage',
    'nested workspace (module)': 'DataModulePage',
    'nested workspace (slice)': 'CommandSliceSection',
};

describe('when previewing every business template kind', () => {
    beforeEach(clearBindings);
    afterEach(() => { cleanup(); clearBindings(); });

    for (const [kind, name] of Object.entries(kinds)) {
        it(`should render the ${kind} template through the renderer inside the shell`, () => {
            componentsScreenTemplates.some(template => template.name === name).should.equal(true);
            const { container } = render(<PrimeReactProvider>
                <SceneElementView registry={componentsPreviewRegistry} resolveBinding={() => undefined}
                    element={resolveElementComponentNames(composeScreenElement(componentsGalleryScreen(name)!), componentsBlueprintProfile, componentsBlueprintCatalog)} />
            </PrimeReactProvider>);

            (container.querySelector('.layout-topbar') !== null).should.equal(true);
            (container.querySelector('.layout-page-header') !== null).should.equal(true);
        });
    }

    it('should ship a dialog template', () => componentsDialogTemplates.length.should.be.greaterThan(0));

    it('should mark the settings page as a module-scoped settings form', () =>
        componentsScreenTemplates.find(template => template.name === 'SettingsPage')!.metadata!.should.deep.include({ type: 'Form', category: 'Business / Settings' }));
});
