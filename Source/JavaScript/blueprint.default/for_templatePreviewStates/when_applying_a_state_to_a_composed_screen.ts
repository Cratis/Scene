// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { TemplatePreviewState, applyTemplatePreviewState, composeScreenElement, galleryScreen, hasPreviewData, previewErrorMessage } from '../gallery';

function tables(element: unknown): Record<string, unknown>[] {
    const found: Record<string, unknown>[] = [];
    const walk = (node: { properties?: Record<string, unknown>; slots?: Record<string, unknown[]>; children?: unknown[] }) => {
        if (Array.isArray(node.properties?.rows)) found.push(node.properties!);
        Object.values(node.slots ?? {}).flat().forEach(child => walk(child as never));
        (node.children ?? []).forEach(child => walk(child as never));
    };
    walk(element as never);
    return found;
}

describe('when applying a state to a composed screen', () => {
    const screen = composeScreenElement(galleryScreen('Dashboard')!);
    const original = JSON.stringify(screen);

    it('should find data in a data template and none in a static one', () => {
        hasPreviewData(screen).should.equal(true);
        hasPreviewData(composeScreenElement(galleryScreen('ProfileSettings')!)).should.equal(false);
    });

    it('should return the authored screen unchanged when populated', () => applyTemplatePreviewState(screen, TemplatePreviewState.Populated).should.equal(screen));

    it('should state every table in the requested state', () => {
        tables(applyTemplatePreviewState(screen, TemplatePreviewState.Empty)).every(table => (table.rows as unknown[]).length === 0).should.equal(true);
        tables(applyTemplatePreviewState(screen, TemplatePreviewState.Loading)).every(table => table.loading === true).should.equal(true);
        tables(applyTemplatePreviewState(screen, TemplatePreviewState.Error)).every(table => table.error === previewErrorMessage).should.equal(true);
    });

    it('should keep everything else as authored', () => {
        const loading = applyTemplatePreviewState(screen, TemplatePreviewState.Loading) as ExternalComponent;
        loading.componentName.should.equal(screen.componentName);
        Object.keys(loading.slots).should.deep.equal(Object.keys(screen.slots));
        tables(loading).length.should.equal(tables(screen).length);
    });

    it('should not change the authored screen', () => {
        applyTemplatePreviewState(screen, TemplatePreviewState.Error);
        JSON.stringify(screen).should.equal(original);
    });
});
