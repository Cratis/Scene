// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../defaultDesignSystemEditorStrings';
import type { DesignSystemPreview, ScreenPreview } from '../DesignSystemPreview';
import { pairFor, previewHeadline, screenStatus } from '../previewing';

const strings = defaultDesignSystemEditorStrings.preview;

const screen = (name: string, different: boolean, broken: boolean): ScreenPreview => ({
    screen: `layout:${name}`,
    name,
    different,
    broken,
    problems: broken ? ['a token is gone'] : [],
    images: [
        { version: 'active', mode: 'light', image: `/${name}-active-light.png` },
        { version: 'draft', mode: 'light', image: `/${name}-draft-light.png` },
        { version: 'draft', mode: 'dark', image: `/${name}-draft-dark.png` },
    ],
});

const preview = (screens: ScreenPreview[], problem = ''): DesignSystemPreview => ({
    different: screens.filter(candidate => candidate.different).length,
    broken: screens.filter(candidate => candidate.broken).length,
    screens,
    problem,
});

describe('when reading a preview', () => {
    describe('and the headline is written', () => {
        it('should say how many screens look different and how many break', () =>
            previewHeadline(preview([screen('A', true, false), screen('B', true, true), screen('C', false, false)]), strings).should.equal('2 of 3 screens look different, 1 breaks.'));
        it('should say it for one screen', () => previewHeadline(preview([screen('A', true, false)]), strings).should.equal('1 of 1 screen looks different, none breaks.'));
        it('should say nothing looks different', () => previewHeadline(preview([screen('A', false, false), screen('B', false, false)]), strings).should.equal('No screen looks different, none breaks.'));
        it('should say how many break when several do', () => previewHeadline(preview([screen('A', true, true), screen('B', true, true)]), strings).should.contain('2 break'));
        it('should give the reason when nothing could be drawn', () => previewHeadline(preview([], 'The browser service is down.'), strings).should.equal('The browser service is down.'));
        it('should say there is nothing to draw when there is no reason', () => previewHeadline(preview([]), strings).should.equal('There are no screens to draw.'));
    });

    describe('and a screen is read', () => {
        it('should say a broken screen breaks', () => screenStatus(screen('A', true, true)).should.equal('breaks'));
        it('should say a screen that draws differently differs', () => screenStatus(screen('A', true, false)).should.equal('differs'));
        it('should say a screen that draws as before is the same', () => screenStatus(screen('A', false, false)).should.equal('same'));
        it('should find the active and the draft picture in a mode', () => {
            const pair = pairFor(screen('A', true, false), 'light');
            [pair.active!.image, pair.draft!.image].should.deep.equal(['/A-active-light.png', '/A-draft-light.png']);
        });
        it('should find no picture that was not drawn', () => (pairFor(screen('A', true, false), 'dark').active === undefined).should.be.true);
        it('should find the picture of the other mode', () => pairFor(screen('A', true, false), 'dark').draft!.image.should.equal('/A-draft-dark.png'));
    });
});
