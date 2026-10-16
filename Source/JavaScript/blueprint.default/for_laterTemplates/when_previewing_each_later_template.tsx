// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { afterEach, beforeAll } from 'vitest';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { defaultBlueprint } from '../defaultBlueprint';
import { GalleryScreenPreview, TemplatePreviewState } from '../gallery';
import { violationsIn } from '../for_foundation/given';
import { laterScreenTemplates } from '../foundation/templates';
import { provideBrowserApis } from '../for_templatePreviewStates/given';
import { foundationPack } from '../for_foundationTemplates/given';

const registry = mergePackageRegistries([corePackage, defaultBlueprint]);
const preview = (name: string, pack: typeof foundationPack | undefined = foundationPack) =>
    render(<PrimeReactProvider><GalleryScreenPreview screenName={name} state={TemplatePreviewState.Populated} registry={registry} pack={pack} /></PrimeReactProvider>);

// Part B 6 for the later additions: previewable through the real engine, data only from a pack, usable by keyboard and screen reader.
describe('when previewing each later foundation template', () => {
    beforeAll(provideBrowserApis);
    afterEach(cleanup);

    for (const { name } of laterScreenTemplates) {
        describe(name, () => {
            it('should render through the real engine without an unresolved component', () => {
                const { container } = preview(name);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('[data-scene-id]') === null).should.equal(false);
            });

            it('should leave no accessibility violation', async () => {
                const { container } = preview(name);
                (await violationsIn(container)).should.deep.equal([]);
            });

            it('should render without a pack, drawing the empty regions instead of failing', () => {
                const { container } = preview(name, undefined);
                container.textContent!.should.not.contain('Unresolved');
            });
        });
    }

    it('should draw the calendar of the pack\'s events', () => {
        preview('CalendarScreen');
        screen.getByRole('heading', { name: /March 2026/ });
    });

    it('should draw the timeline, the inbox and the settings from the pack', () => {
        preview('TimelineScreen');
        screen.getAllByText('Design').length.should.be.greaterThan(0);
        cleanup();
        preview('InboxScreen');
        screen.getAllByText('Leave request: Ada Lovelace').length.should.be.greaterThan(0);
        cleanup();
        preview('SettingsScreen');
        screen.getByRole('navigation', { name: 'Settings sections' });
        screen.getAllByRole('button', { name: /Save/ }).length.should.be.greaterThan(0);
    });

    it('should offer the report as a file and as figures', () => {
        preview('ReportViewer');
        ['Export as CSV', 'Export as PDF', 'Print'].forEach(name => screen.getByRole('button', { name }));
        screen.getByText('Total value');
    });

    it('should start the import at the upload step with its progress', () => {
        preview('ImportWizard');
        screen.getAllByText('Upload').length.should.be.greaterThan(0);
        screen.getAllByText('Review and confirm').length.should.be.greaterThan(0);
    });

    it('should name the person on the profile and offer its sections as tabs', () => {
        preview('ProfileScreen');
        screen.getAllByText('Ada Lovelace').length.should.be.greaterThan(0);
        screen.getByRole('tab', { name: 'Security' });
    });
});
