// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElementView } from '@cratis/scene.react';
import { galleryComponentCatalog, galleryDialogTemplates, galleryPreviewProfile, resolveElementComponentNames } from '../gallery';
import { packageBackedRegistry, provideBrowserApis } from './given';

describe('when previewing the dialog templates', () => {
    beforeEach(provideBrowserApis);
    afterEach(cleanup);

    for (const template of galleryDialogTemplates) {
        it(`should render ${template.name} through the real packages, with a named field and an action for every choice`, () => {
            const elements = Object.values(template.content ?? {}).flat()
                .map(element => resolveElementComponentNames(element, galleryPreviewProfile, galleryComponentCatalog));
            const { container } = render(<PrimeReactProvider>
                <div role='dialog' aria-label={template.displayName}>
                    {elements.map(element => <SceneElementView key={element.id} element={element} registry={packageBackedRegistry} resolveBinding={() => undefined} />)}
                </div>
            </PrimeReactProvider>);

            (container.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
            screen.getAllByRole('button').length.should.be.greaterThan(1);
            screen.queryAllByRole('textbox').every(box => (box.getAttribute('aria-label') ?? '').length > 0).should.equal(true);
        });
    }
});
