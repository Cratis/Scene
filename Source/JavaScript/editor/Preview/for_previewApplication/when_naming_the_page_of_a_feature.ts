// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';
import { previewScreensOf } from '../previewApplication';

const screen = (name: string, path?: string[]): Screen => ({ name, layout: 'StudioScreen', slotContent: {}, forms: [], contributions: [], ...(path ? { path } : {}) });

describe('when naming the page of a feature for the preview host', () => {
    const screens = [screen('Admin__Operations', ['Control', 'Operations']), screen('Support__Operations', ['Control', 'Operations']), screen('Home'), screen('Admin__Returns', ['Control', 'Operations', 'Returns'])];
    const offered = previewScreensOf(screens);

    it('should keep every screen under its own name, which everything that refers to it uses', () => screens.every(own => offered.some(candidate => candidate.name === own.name)).should.be.true);
    it('should offer a screen under the qualified id of its feature', () => offered.map(candidate => candidate.name).should.include('Control.Operations'));
    it('should offer a screen of a sub-feature under the whole path', () => offered.map(candidate => candidate.name).should.include('Control.Operations.Returns'));
    it('should take the first screen of a feature for its page', () => offered.find(candidate => candidate.name === 'Control.Operations')!.path!.should.deep.equal(['Control', 'Operations']));
    it('should make a page of the feature only once', () => offered.filter(candidate => candidate.name === 'Control.Operations').length.should.equal(1));
    it('should offer nothing for a screen that has no place', () => offered.length.should.equal(screens.length + 2));
    it('should show a screen on the editor\'s layout in the shell the profile selects', () => previewScreensOf(screens, 'AppShell').find(candidate => candidate.name === 'Home')!.layout.should.equal('AppShell'));
    it('should leave a screen on a shell where it is', () => previewScreensOf([{ ...screen('Login'), layout: 'FullPage' }], 'AppShell')[0].layout.should.equal('FullPage'));
    it('should leave a screen on the editor\'s layout when the profile selects no shell', () => previewScreensOf(screens)[0].layout.should.equal('StudioScreen'));
    it('should not take the name of a screen that already has it', () => previewScreensOf([screen('Control.Operations'), screen('Admin__Operations', ['Control', 'Operations'])]).length.should.equal(2));
});
