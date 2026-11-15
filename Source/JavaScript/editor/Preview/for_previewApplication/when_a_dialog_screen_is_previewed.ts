// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit, type DialogTemplate, type Screen } from '@cratis/scene.model';
import { previewScreensOf } from '../previewApplication';

const screen = (name: string, extra: Partial<Screen> = {}): Screen => ({ name, layout: 'StudioScreen', slotContent: {}, ...extra } as unknown as Screen);
const quickCreate: DialogTemplate = { name: 'QuickCreateDialog', slots: [{ name: 'body' }] };

describe('when a dialog screen is previewed', () => {
    const placed = previewScreensOf([
        screen('NewProduct', { screenTemplate: 'QuickCreateDialog' }),
        screen('Drawer', { fits: [ScreenFit.Drawer] }),
        screen('Orders', { screenTemplate: 'ListScreen' }),
        screen('Legacy'),
    ], 'AppShell', [quickCreate]);
    const named = (name: string) => placed.find(candidate => candidate.name === name)!;

    it('should keep a screen built from a dialog template off the application shell', () => named('NewProduct').layout.should.not.equal('AppShell'));
    it('should put it on the neutral surface', () => named('NewProduct').layout.should.equal('FullPage'));
    it('should keep a drawer off the application shell', () => named('Drawer').layout.should.equal('FullPage'));
    it('should still put a page on the application shell', () => named('Orders').layout.should.equal('AppShell'));
    it('should still put a stored screen that never said what it fits on the application shell', () => named('Legacy').layout.should.equal('AppShell'));
    it('should leave the dialog its template', () => named('NewProduct').screenTemplate!.should.equal('QuickCreateDialog'));
});
