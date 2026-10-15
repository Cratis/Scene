// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { afterEach, beforeAll } from 'vitest';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { defaultBlueprint } from '../defaultBlueprint';
import { GalleryScreenPreview, TemplatePreviewState } from '../gallery';
import { violationsIn } from '../for_foundation/given';
import { foundationScreenTemplates } from '../foundation/templates';
import { provideBrowserApis } from '../for_templatePreviewStates/given';
import { foundationPack, foundationTemplateNames, queriesOf } from './given';

const registry = mergePackageRegistries([corePackage, defaultBlueprint]);
const preview = (name: string, state = TemplatePreviewState.Populated, pack: typeof foundationPack | undefined = foundationPack) =>
    render(<PrimeReactProvider><GalleryScreenPreview screenName={name} state={state} registry={registry} pack={pack} /></PrimeReactProvider>);

// Part B 6: previewable, preview data as a sample-data pack (not inline), keyboard and screen reader usable.
describe('when previewing each foundation template', () => {
    beforeAll(provideBrowserApis);
    afterEach(cleanup);

    for (const name of foundationTemplateNames) {
        describe(name, () => {
            it('should render through the real engine without an unresolved component', () => {
                const { container } = preview(name);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('[data-scene-id]') === null).should.equal(false);
            });

            it('should draw the data of the sample-data pack, which is the only place it lives', () => {
                const { container } = preview(name);
                const text = container.textContent!;
                const drawn = ['Northgate Ltd', 'Revenue', 'Account details', 'Acme renewal', 'Accounts', 'Details'].filter(value => text.includes(value));
                drawn.length.should.be.greaterThan(0);
            });

            it('should leave no accessibility violation in the populated state', async () => {
                const { container } = preview(name);
                (await violationsIn(container)).should.deep.equal([]);
            });

            it('should render without a pack, drawing the empty regions instead of failing', () => {
                const { container } = preview(name, TemplatePreviewState.Populated, undefined);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('[data-scene-id]') === null).should.equal(false);
            });
        });
    }

    it('should name only queries the pack answers', () => {
        const answered = new Set(foundationPack.sets.map(set => set.shape));
        foundationScreenTemplates.flatMap(template => queriesOf(template).filter(query => !answered.has(query)).map(query => `${template.name}:${query}`)).should.deep.equal([]);
    });

    it('should carry no rows of its own in any template', () => {
        foundationScreenTemplates.flatMap(template => JSON.stringify(template.content).match(/"(rows|cards|entries|items)":\[\{/g) ?? []).should.deep.equal([]);
    });

    it('should draw the list, the board and the form with the pack\'s rows', () => {
        preview('ListScreen');
        screen.getByText('Northgate Ltd');
        cleanup();
        preview('BoardScreen');
        screen.getByText('Acme renewal');
        cleanup();
        preview('FormScreen');
        screen.getByLabelText(/Name/);
    });
});
