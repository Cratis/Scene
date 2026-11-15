// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { drawEditor, type DrawnEditor } from './given/draw';

describe('when drawing the active version', () => {
    let drawn: DrawnEditor;

    beforeEach(async () => { drawn = await drawEditor(); });

    it('should title the editor and say what it belongs to', () => {
        drawn.markup.should.contain('Design system');
        drawn.markup.should.contain('Acme');
    });
    it('should say which version is the standard', () => drawn.markup.should.contain('Golden standard v1'));
    it('should offer to start a draft', () => drawn.markup.should.contain('Start a draft'));
    it('should offer the sections', () => ['Overview', 'Color', 'Type', 'Spacing &amp; radius', 'Elevation &amp; motion', 'Themes', 'Components', 'UI profile, layouts &amp; templates', 'Voice &amp; naming']
        .forEach(label => drawn.markup.should.contain(label)));
    it('should not offer the changes of a draft that is not there', () => drawn.markup.should.not.contain('Changes in draft'));
    it('should not offer what is off the standard when the host cannot find it', () => drawn.markup.should.not.contain('Off the standard'));
    it('should count what the design system holds', () => {
        drawn.markup.should.contain('Tokens');
        drawn.markup.should.contain('Components');
    });
    it('should draw the palette of the default theme in the first mode', () => drawn.markup.should.contain('aria-label="primary is #1d4ed8"'));
    it('should not say anything is hard to read when the theme shown is readable', () => drawn.markup.should.not.contain('Hard to read'));
    it('should draw the Screenplay source read-only', () => drawn.markup.should.contain('design system Acme'));
    it('should offer no switch between versions when there is no draft', () => drawn.markup.should.not.contain('Version shown'));
    it('should switch between themes and modes', () => {
        drawn.markup.should.contain('aria-label="Theme"');
        drawn.markup.should.contain('aria-label="Mode"');
    });
    it('should not ask the host to read again for state it was given', () => drawn.host.calls.map(call => call.member).should.deep.equal(['load']));
});

describe('when drawing a version that declares no design system', () => {
    it('should say it cannot be read', async () => {
        const drawn = await drawEditor({}, { state: { active: { number: 1, revision: 1, screenplay: '', outline: { platforms: [], packages: [], layouts: [], screenTemplates: [], dialogTemplates: [] } }, history: [] } });
        drawn.markup.should.contain('The design system cannot be read');
    });
});

describe('when drawing a design system with no version at all', () => {
    it('should say there is none and offer the starter', async () => {
        const drawn = await drawEditor({}, { state: { history: [] } });
        drawn.markup.should.contain('There is no design system yet');
        drawn.markup.should.contain('Start from the starter');
    });
});
